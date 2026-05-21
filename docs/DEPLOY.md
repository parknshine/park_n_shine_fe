# Park & Shine — Deployment Guide

Aplikasi ini adalah Next.js monorepo dengan 4 surface yang dibedakan via subdomain:

| Domain | Surface |
|--------|---------|
| `park-shine.sg` / `www.park-shine.sg` | Landing Page |
| `app.park-shine.sg` | Customer Web App |
| `crew.park-shine.sg` | Crew Operator App |
| `admin.park-shine.sg` | Admin Console |

---

## Pilihan Platform

| | Vercel | GCP Cloud Run | GCP VM (Self-hosted) |
|--|--------|--------------|----------------------|
| Setup | Paling mudah | Sedang | Kompleks |
| Subdomain routing | Via custom domains | Via Load Balancer | Via Nginx (sudah ada) |
| Docker | Tidak perlu | Wajib | Wajib |
| Biaya | Gratis s/d limit, lalu per-usage | Pay-per-request | Fixed VM cost |
| Cocok untuk | Prototype / staging | Production scalable | Production self-hosted |

---

## Option A — Vercel

### Prasyarat
- Akun Vercel
- Domain `park-shine.sg` sudah dibeli dan nameserver bisa diubah

### Langkah-langkah

#### 1. Import Project
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy dari root project
vercel
```

Atau import langsung dari GitHub di dashboard `vercel.com/new`.

#### 2. Set Environment Variables
Di Vercel dashboard → Settings → Environment Variables:
```
NEXT_PUBLIC_API_URL=https://api.park-shine.sg
```

#### 3. Tambah Custom Domains
Di Vercel dashboard → Settings → Domains, tambahkan semua domain:

```
park-shine.sg
www.park-shine.sg
app.park-shine.sg
crew.park-shine.sg
admin.park-shine.sg
```

Vercel akan menampilkan DNS record yang perlu ditambahkan di registrar domain Anda.

#### 4. Konfigurasi DNS di Registrar
Tambahkan record berikut (nilai dari Vercel dashboard):

```
Type    Name     Value
A       @        76.76.21.21
CNAME   www      cname.vercel-dns.com
CNAME   app      cname.vercel-dns.com
CNAME   crew     cname.vercel-dns.com
CNAME   admin    cname.vercel-dns.com
```

#### 5. Verifikasi
```bash
# Semua subdomain harus resolve ke Vercel
curl -I https://park-shine.sg
curl -I https://app.park-shine.sg
curl -I https://crew.park-shine.sg
curl -I https://admin.park-shine.sg
```

### Catatan Vercel
- SSL otomatis dihandle Vercel (Let's Encrypt)
- Subdomain routing sudah berjalan via `src/middleware.ts` — tidak ada konfigurasi tambahan di Vercel
- `output: "standalone"` di `next.config.ts` tidak digunakan di Vercel (Vercel menggunakan build output-nya sendiri); ini aman dibiarkan
- `nginx.conf` tidak dipakai di Vercel

---

## Option B — GCP Cloud Run

Menggunakan Docker image yang sudah ada di `Dockerfile`. Satu container melayani semua subdomain; routing dilakukan oleh GCP Load Balancer.

### Prasyarat
- Akun GCP dengan billing aktif
- `gcloud` CLI terinstall: `gcloud auth login`
- Docker terinstall
- Domain `park-shine.sg` dengan akses DNS

### Langkah-langkah

#### 1. Setup GCP Project
```bash
# Set project
gcloud config set project YOUR_PROJECT_ID

# Enable services
gcloud services enable \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  compute.googleapis.com
```

#### 2. Buat Artifact Registry
```bash
gcloud artifacts repositories create park-n-shine \
  --repository-format=docker \
  --location=asia-southeast1 \
  --description="Park & Shine container registry"
```

#### 3. Build & Push Docker Image
```bash
# Auth Docker ke GCP
gcloud auth configure-docker asia-southeast1-docker.pkg.dev

# Build image
docker build -t asia-southeast1-docker.pkg.dev/YOUR_PROJECT_ID/park-n-shine/app:latest .

# Push
docker push asia-southeast1-docker.pkg.dev/YOUR_PROJECT_ID/park-n-shine/app:latest
```

#### 4. Deploy ke Cloud Run
```bash
gcloud run deploy park-n-shine \
  --image asia-southeast1-docker.pkg.dev/YOUR_PROJECT_ID/park-n-shine/app:latest \
  --platform managed \
  --region asia-southeast1 \
  --port 3000 \
  --set-env-vars NEXT_PUBLIC_API_URL=https://api.park-shine.sg \
  --allow-unauthenticated \
  --min-instances 1 \
  --max-instances 10 \
  --memory 512Mi \
  --cpu 1
```

Cloud Run akan memberikan URL default seperti:
`https://park-n-shine-xxxxxxxx-as.a.run.app`

#### 5. Setup Custom Domains dengan Load Balancer

Karena Cloud Run perlu satu load balancer untuk routing multi-subdomain:

```bash
# 1. Reserve static IP
gcloud compute addresses create park-n-shine-ip \
  --global

# Catat IP yang didapat
gcloud compute addresses describe park-n-shine-ip --global

# 2. Buat NEG (Network Endpoint Group) untuk Cloud Run
gcloud compute network-endpoint-groups create park-n-shine-neg \
  --region=asia-southeast1 \
  --network-endpoint-type=serverless \
  --cloud-run-service=park-n-shine

# 3. Buat backend service
gcloud compute backend-services create park-n-shine-backend \
  --global \
  --load-balancing-scheme=EXTERNAL_MANAGED

gcloud compute backend-services add-backend park-n-shine-backend \
  --global \
  --network-endpoint-group=park-n-shine-neg \
  --network-endpoint-group-region=asia-southeast1

# 4. Buat URL map
gcloud compute url-maps create park-n-shine-urlmap \
  --default-service park-n-shine-backend

# 5. Provisioning SSL certificate (managed)
gcloud compute ssl-certificates create park-n-shine-ssl \
  --domains=park-shine.sg,www.park-shine.sg,app.park-shine.sg,crew.park-shine.sg,admin.park-shine.sg \
  --global

# 6. Buat HTTPS proxy
gcloud compute target-https-proxies create park-n-shine-https-proxy \
  --ssl-certificates=park-n-shine-ssl \
  --url-map=park-n-shine-urlmap

# 7. Buat forwarding rule
gcloud compute forwarding-rules create park-n-shine-https-rule \
  --global \
  --load-balancing-scheme=EXTERNAL_MANAGED \
  --address=park-n-shine-ip \
  --target-https-proxy=park-n-shine-https-proxy \
  --ports=443

# 8. HTTP → HTTPS redirect
gcloud compute url-maps import park-n-shine-http-redirect \
  --global \
  --source /dev/stdin << 'EOF'
name: park-n-shine-http-redirect
defaultUrlRedirect:
  redirectResponseCode: MOVED_PERMANENTLY_DEFAULT
  httpsRedirect: true
EOF

gcloud compute target-http-proxies create park-n-shine-http-proxy \
  --url-map=park-n-shine-http-redirect

gcloud compute forwarding-rules create park-n-shine-http-rule \
  --global \
  --load-balancing-scheme=EXTERNAL_MANAGED \
  --address=park-n-shine-ip \
  --target-http-proxy=park-n-shine-http-proxy \
  --ports=80
```

#### 6. Konfigurasi DNS
Arahkan semua domain ke static IP yang sudah dibuat:

```
Type    Name     Value
A       @        <STATIC_IP>
A       www      <STATIC_IP>
A       app      <STATIC_IP>
A       crew     <STATIC_IP>
A       admin    <STATIC_IP>
```

SSL certificate managed GCP akan aktif otomatis setelah DNS propagasi (bisa 15–60 menit).

#### 7. Verifikasi
```bash
# Cek status SSL certificate
gcloud compute ssl-certificates describe park-n-shine-ssl --global

# Test endpoint
curl -I https://park-shine.sg
curl -I https://app.park-shine.sg
```

### Catatan Cloud Run
- `nginx.conf` tidak dipakai — routing subdomain ditangani oleh GCP Load Balancer yang meneruskan `Host` header ke container
- Middleware `src/middleware.ts` membaca `Host` header untuk detect subdomain — ini sudah berjalan otomatis
- `--min-instances 1` mencegah cold start; turunkan ke `0` jika ingin hemat biaya

---

## Option C — GCP VM (Self-hosted dengan Docker + Nginx)

Gunakan `Dockerfile` dan `nginx.conf` yang sudah ada.

### Prasyarat
- GCP VM (e2-small minimum, Ubuntu 22.04 LTS)
- Docker & Docker Compose terinstall
- Domain dengan akses DNS

### Langkah-langkah

#### 1. Buat VM di GCP
```bash
gcloud compute instances create park-n-shine-vm \
  --zone=asia-southeast1-b \
  --machine-type=e2-small \
  --image-family=ubuntu-2204-lts \
  --image-project=ubuntu-os-cloud \
  --boot-disk-size=20GB \
  --tags=http-server,https-server

# Buka port 80 dan 443
gcloud compute firewall-rules create allow-http-https \
  --allow tcp:80,tcp:443 \
  --target-tags=http-server,https-server
```

#### 2. Install Docker di VM
```bash
# SSH ke VM
gcloud compute ssh park-n-shine-vm --zone=asia-southeast1-b

# Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker
```

#### 3. Siapkan docker-compose.yml
Buat file `docker-compose.yml` di VM:

```yaml
services:
  nextjs:
    image: asia-southeast1-docker.pkg.dev/YOUR_PROJECT_ID/park-n-shine/app:latest
    restart: always
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=https://api.park-shine.sg
    expose:
      - "3000"
    networks:
      - app-network

  nginx:
    image: nginx:alpine
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
      - ./certbot/conf:/etc/letsencrypt:ro
      - ./certbot/www:/var/www/certbot:ro
    depends_on:
      - nextjs
    networks:
      - app-network

  certbot:
    image: certbot/certbot
    volumes:
      - ./certbot/conf:/etc/letsencrypt
      - ./certbot/www:/var/www/certbot
    entrypoint: >
      sh -c "trap exit TERM;
             while :; do
               certbot renew --quiet;
               sleep 12h & wait $${!};
             done"

networks:
  app-network:
    driver: bridge
```

#### 4. Setup SSL dengan Certbot

Update `nginx.conf` sementara untuk challenge HTTP sebelum SSL aktif, lalu jalankan:

```bash
# Minta certificate
docker run --rm \
  -v ./certbot/conf:/etc/letsencrypt \
  -v ./certbot/www:/var/www/certbot \
  certbot/certbot certonly --webroot \
  --webroot-path=/var/www/certbot \
  -d park-shine.sg -d www.park-shine.sg \
  -d app.park-shine.sg -d crew.park-shine.sg \
  -d admin.park-shine.sg \
  --email admin@park-shine.sg \
  --agree-tos --no-eff-email
```

#### 5. Deploy
```bash
# Pull image terbaru dan jalankan
docker compose pull
docker compose up -d

# Cek status
docker compose ps
docker compose logs -f nextjs
```

#### 6. Update Deployment
```bash
# Build dan push image baru (dari local machine)
docker build -t asia-southeast1-docker.pkg.dev/YOUR_PROJECT_ID/park-n-shine/app:latest .
docker push asia-southeast1-docker.pkg.dev/YOUR_PROJECT_ID/park-n-shine/app:latest

# Di VM: pull dan restart
docker compose pull && docker compose up -d
```

---

## Environment Variables

Wajib diset di semua platform:

```bash
NEXT_PUBLIC_API_URL=https://api.park-shine.sg   # URL backend API
```

Opsional:
```bash
NODE_ENV=production                              # Otomatis di Vercel/Cloud Run
NEXT_TELEMETRY_DISABLED=1                        # Sudah di-set di Dockerfile
```

---

## DNS Checklist

Sebelum deploy, pastikan semua record ini sudah dikonfigurasi:

- [ ] `park-shine.sg` → IP / Vercel
- [ ] `www.park-shine.sg` → IP / Vercel
- [ ] `app.park-shine.sg` → IP / Vercel
- [ ] `crew.park-shine.sg` → IP / Vercel
- [ ] `admin.park-shine.sg` → IP / Vercel
- [ ] SSL certificate aktif untuk semua domain

Cek propagasi DNS: `dig park-shine.sg` atau gunakan `dnschecker.org`.
