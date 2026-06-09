import type { ReactNode } from "react";
import Image from "next/image";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { WhatsAppSupportWidget } from "@/features/customer/components";
import { HeaderBackButton, LanguageSwitcher } from "@/components/shared";
import { getWhatsAppNumber } from "@/lib/get-whatsapp-number";

interface CustomerLayoutProps {
  children: ReactNode;
}

export default async function CustomerLayout({
  children,
}: CustomerLayoutProps) {
  const whatsappNumber = await getWhatsAppNumber();
  return (
    <NuqsAdapter>
      <header className='fixed inset-x-0 top-0 z-40 border-b border-border bg-background/90 backdrop-blur-sm'>
        <div className='mx-auto flex h-14 max-w-md items-center justify-between px-4'>
          <div className='flex items-center gap-2.5'>
            <HeaderBackButton />
            <Image
              src='/icons/icon.svg'
              alt='Park & Shine logo'
              width={28}
              height={28}
              className='shrink-0'
            />
            <span className='text-base font-bold text-foreground'>
              Park & Shine
            </span>
          </div>
          <LanguageSwitcher />
        </div>
      </header>

      <div className='pt-14'>
        {children}
      </div>

      {whatsappNumber && (
        <WhatsAppSupportWidget
          phoneNumber={whatsappNumber}
          label='Hubungi dukungan via WhatsApp'
          message='Halo Park & Shine, saya butuh bantuan dengan booking saya.'
        />
      )}
    </NuqsAdapter>
  );
}
