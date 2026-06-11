"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { Loader2, Mail, Send, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAdminEmail } from "@/features/admin/hooks";
import type { EmailTemplateType, BroadcastRecipient } from "@/features/admin/hooks";

type Tab = "single" | "broadcast";

const TEMPLATE_OPTIONS: { value: EmailTemplateType; label: string }[] = [
  { value: "promotional", label: "Promosi / Diskon" },
  { value: "loyalty", label: "Loyalty Reward" },
  { value: "service-update", label: "Update Layanan" },
  { value: "custom", label: "Custom HTML" },
];

// Fields shown per template type
function TemplateDataFields({
  templateType,
  data,
  onChange,
}: Readonly<{
  templateType: EmailTemplateType;
  data: Record<string, string>;
  onChange: (key: string, value: string) => void;
}>) {
  if (templateType === "promotional") {
    return (
      <div className="space-y-3">
        <Field label="Headline *" id="headline" value={data.headline ?? ""} onChange={(v) => onChange("headline", v)} placeholder="Diskon 20% Khusus Kamu!" />
        <Field label="Sub-headline" id="subheadline" value={data.subheadline ?? ""} onChange={(v) => onChange("subheadline", v)} placeholder="Berlaku hingga 30 Juni 2026" />
        <TextareaField label="Body *" id="body" value={data.body ?? ""} onChange={(v) => onChange("body", v)} placeholder="Deskripsi promo..." />
        <Field label="Label Tombol" id="ctaLabel" value={data.ctaLabel ?? ""} onChange={(v) => onChange("ctaLabel", v)} placeholder="Pesan Sekarang" />
        <Field label="URL Tombol" id="ctaUrl" value={data.ctaUrl ?? ""} onChange={(v) => onChange("ctaUrl", v)} placeholder="https://parknshine.com" />
        <Field label="URL Gambar (opsional)" id="imageUrl" value={data.imageUrl ?? ""} onChange={(v) => onChange("imageUrl", v)} placeholder="https://..." />
      </div>
    );
  }
  if (templateType === "loyalty") {
    return (
      <div className="space-y-3">
        <Field label="Judul Reward *" id="rewardTitle" value={data.rewardTitle ?? ""} onChange={(v) => onChange("rewardTitle", v)} placeholder="Selamat! Kamu Dapat Reward" />
        <TextareaField label="Deskripsi Reward *" id="rewardDescription" value={data.rewardDescription ?? ""} onChange={(v) => onChange("rewardDescription", v)} placeholder="Deskripsi reward..." />
        <Field label="Poin Didapat" id="pointsEarned" value={data.pointsEarned ?? ""} onChange={(v) => onChange("pointsEarned", v)} placeholder="50" type="text" inputMode="numeric" />
        <Field label="Total Poin" id="pointsTotal" value={data.pointsTotal ?? ""} onChange={(v) => onChange("pointsTotal", v)} placeholder="250" type="text" inputMode="numeric" />
        <Field label="Label Tombol" id="ctaLabel" value={data.ctaLabel ?? ""} onChange={(v) => onChange("ctaLabel", v)} placeholder="Tukar Reward" />
        <Field label="URL Tombol" id="ctaUrl" value={data.ctaUrl ?? ""} onChange={(v) => onChange("ctaUrl", v)} placeholder="https://parknshine.com" />
      </div>
    );
  }
  if (templateType === "service-update") {
    return (
      <div className="space-y-3">
        <Field label="Judul Update *" id="updateTitle" value={data.updateTitle ?? ""} onChange={(v) => onChange("updateTitle", v)} placeholder="Fitur Baru Tersedia!" />
        <TextareaField label="Body Update *" id="updateBody" value={data.updateBody ?? ""} onChange={(v) => onChange("updateBody", v)} placeholder="Kami telah merilis..." />
        <TextareaField label="Highlights (satu per baris)" id="highlights" value={data.highlights ?? ""} onChange={(v) => onChange("highlights", v)} placeholder={"Fitur A\nFitur B\nFitur C"} />
        <Field label="Label Tombol" id="ctaLabel" value={data.ctaLabel ?? ""} onChange={(v) => onChange("ctaLabel", v)} placeholder="Pelajari Lebih Lanjut" />
        <Field label="URL Tombol" id="ctaUrl" value={data.ctaUrl ?? ""} onChange={(v) => onChange("ctaUrl", v)} placeholder="https://parknshine.com" />
      </div>
    );
  }
  // custom
  return (
    <TextareaField label="HTML *" id="html" value={data.html ?? ""} onChange={(v) => onChange("html", v)} placeholder="<p>Email HTML kustom...</p>" rows={8} />
  );
}

function Field({ label, id, value, onChange, placeholder, type = "text", inputMode }: Readonly<{ label: string; id: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"] }>) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type={type} inputMode={inputMode} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}

function TextareaField({ label, id, value, onChange, placeholder, rows = 3 }: Readonly<{ label: string; id: string; value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }>) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Textarea id={id} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={rows} />
    </div>
  );
}

function buildTemplateData(templateType: EmailTemplateType, data: Record<string, string>): Record<string, unknown> {
  if (templateType === "service-update") {
    return {
      ...data,
      highlights: data.highlights ? data.highlights.split("\n").filter(Boolean) : undefined,
      pointsEarned: undefined,
      pointsTotal: undefined,
    };
  }
  if (templateType === "loyalty") {
    return {
      ...data,
      pointsEarned: data.pointsEarned ? Number(data.pointsEarned) : undefined,
      pointsTotal: data.pointsTotal ? Number(data.pointsTotal) : undefined,
    };
  }
  return data;
}

function parseRecipients(raw: string): BroadcastRecipient[] {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [email, name] = line.split(",").map((s) => s.trim());
      return name ? { email, name } : { email };
    });
}

function SingleEmailForm() {
  const { sendEmail, isSending } = useAdminEmail();
  const [to, setTo] = useState("");
  const [toName, setToName] = useState("");
  const [subject, setSubject] = useState("");
  const [templateType, setTemplateType] = useState<EmailTemplateType>("promotional");
  const [templateData, setTemplateData] = useState<Record<string, string>>({});

  function handleDataChange(key: string, value: string) {
    setTemplateData((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSend() {
    if (!to || !subject) {
      toast.error("Email penerima dan subjek wajib diisi");
      return;
    }
    try {
      const payload =
        templateType === "custom"
          ? { to, subject, templateType, html: templateData.html }
          : { to, ...(toName ? { toName } : {}), subject, templateType, templateData: buildTemplateData(templateType, templateData) };

      await sendEmail(payload);
      toast.success("Email berhasil dikirim!");
      setTo(""); setToName(""); setSubject("");
      setTemplateData({});
    } catch {
      toast.error("Gagal mengirim email. Pastikan Maileroo sudah dikonfigurasi.");
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Email Penerima *" id="to" value={to} onChange={setTo} placeholder="customer@example.com" type="email" />
        <Field label="Nama Penerima" id="toName" value={toName} onChange={setToName} placeholder="John Doe" />
      </div>
      <Field label="Subjek *" id="subject" value={subject} onChange={setSubject} placeholder="Promo spesial untuk kamu!" />
      <div className="space-y-1.5">
        <Label>Template</Label>
        <Select value={templateType} onValueChange={(v) => { setTemplateType(v as EmailTemplateType); setTemplateData({}); }}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TEMPLATE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <TemplateDataFields templateType={templateType} data={templateData} onChange={handleDataChange} />
      <Button onClick={handleSend} disabled={isSending} className="w-full">
        {isSending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
        {isSending ? "Mengirim..." : "Kirim Email"}
      </Button>
    </div>
  );
}

function BroadcastForm() {
  const { broadcastEmail, isBroadcasting } = useAdminEmail();
  const [recipientsRaw, setRecipientsRaw] = useState("");
  const [subject, setSubject] = useState("");
  const [templateType, setTemplateType] = useState<EmailTemplateType>("promotional");
  const [templateData, setTemplateData] = useState<Record<string, string>>({});

  const recipients = parseRecipients(recipientsRaw);

  function handleDataChange(key: string, value: string) {
    setTemplateData((prev) => ({ ...prev, [key]: value }));
  }

  async function handleBroadcast() {
    if (recipients.length === 0 || !subject) {
      toast.error("Daftar penerima dan subjek wajib diisi");
      return;
    }
    try {
      const payload =
        templateType === "custom"
          ? { recipients, subject, templateType, html: templateData.html }
          : { recipients, subject, templateType, templateData: buildTemplateData(templateType, templateData) };

      const result = await broadcastEmail(payload);
      toast.success(`Email berhasil dikirim ke ${result.recipientCount} penerima`);
      setRecipientsRaw(""); setSubject("");
      setTemplateData({});
    } catch {
      toast.error("Gagal broadcast email. Pastikan Maileroo sudah dikonfigurasi.");
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="recipients">
          Daftar Penerima *
          <span className="ml-2 text-xs font-normal text-muted-foreground">
            satu per baris · format: <code className="bg-muted px-1 rounded text-xs">email,nama</code> atau email saja
          </span>
        </Label>
        <Textarea
          id="recipients"
          value={recipientsRaw}
          onChange={(e) => setRecipientsRaw(e.target.value)}
          placeholder={"customer1@example.com,Budi\ncustomer2@example.com"}
          rows={5}
        />
        {recipients.length > 0 && (
          <p className="text-xs text-muted-foreground">{recipients.length} penerima terdeteksi</p>
        )}
      </div>
      <Field label="Subjek *" id="bc-subject" value={subject} onChange={setSubject} placeholder="Promo spesial untuk semua pelanggan!" />
      <div className="space-y-1.5">
        <Label>Template</Label>
        <Select value={templateType} onValueChange={(v) => { setTemplateType(v as EmailTemplateType); setTemplateData({}); }}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TEMPLATE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <TemplateDataFields templateType={templateType} data={templateData} onChange={handleDataChange} />
      <Button onClick={handleBroadcast} disabled={isBroadcasting} className="w-full">
        {isBroadcasting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Users className="mr-2 h-4 w-4" />}
        {isBroadcasting ? "Mengirim..." : `Broadcast ke ${recipients.length > 0 ? recipients.length : "..."} Penerima`}
      </Button>
    </div>
  );
}

export default function EmailPage() {
  const [tab, setTab] = useState<Tab>("single");

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Email Marketing</h1>
        <p className="text-sm text-muted-foreground">
          Kirim email promosi, loyalty reward, atau update layanan ke pelanggan.
        </p>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 rounded-lg border border-border bg-muted p-1 w-fit">
        <button
          onClick={() => setTab("single")}
          className={`flex items-center gap-2 rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
            tab === "single" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Mail className="h-3.5 w-3.5" />
          Kirim Satuan
        </button>
        <button
          onClick={() => setTab("broadcast")}
          className={`flex items-center gap-2 rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
            tab === "broadcast" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Users className="h-3.5 w-3.5" />
          Broadcast
        </button>
      </div>

      <div className="rounded-lg border border-border p-5">
        {tab === "single" ? <SingleEmailForm /> : <BroadcastForm />}
      </div>
    </div>
  );
}
