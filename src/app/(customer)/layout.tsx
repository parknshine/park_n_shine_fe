import type { ReactNode } from "react";
import Image from "next/image";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { WhatsAppSupportWidget } from "@/features/customer/components";
import { LanguageSwitcher } from "@/components/shared";

interface CustomerLayoutProps {
  children: ReactNode;
}

const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "6281234567890";

export default function CustomerLayout({ children }: CustomerLayoutProps) {
  return (
    <NuqsAdapter>
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-md items-center justify-between px-4">
          <div className="flex items-center gap-2.5">
            <Image
              src="/icons/icon.svg"
              alt="Park & Shine logo"
              width={28}
              height={28}
              className="shrink-0"
            />
            <span className="text-base font-bold text-foreground">
              Park & Shine
            </span>
          </div>
          <LanguageSwitcher />
        </div>
      </header>

      {children}

      <WhatsAppSupportWidget
        phoneNumber={WHATSAPP_NUMBER}
        label="Hubungi dukungan via WhatsApp"
        message="Halo Park & Shine, saya butuh bantuan dengan booking saya."
      />
    </NuqsAdapter>
  );
}
