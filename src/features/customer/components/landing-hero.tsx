import Image from "next/image";

interface LandingHeroProps {
  siteName: string;
}

export function LandingHero({ siteName }: LandingHeroProps) {
  return (
    <div className="space-y-5">
      <div className="inline-flex items-center rounded-full bg-amber-400 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-white">
        Cuci Mobil Tanpa Perlu Keluar Parkir
      </div>

      <h1 className="text-4xl font-bold leading-tight tracking-tight text-foreground">
        Mobil Bersih,
        <br />
        Tanpa Keluar
        <br />
        Parkiran.
      </h1>

      <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-sm font-medium text-foreground">
        <span className="h-2 w-2 rounded-full bg-primary" />
        {siteName}
      </div>

      <div className="overflow-hidden rounded-2xl">
        <Image
          src="/park-shine-hero.jpeg"
          alt="Keluarga bahagia di parkiran dengan mobil bersih"
          width={600}
          height={400}
          className="w-full object-cover"
          priority
        />
      </div>
    </div>
  );
}
