import type { ReactNode } from "react";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { WhatsAppSupportWidget } from "@/features/customer/components";
import { CustomerBottomNav } from "@/features/customer/components/customer-bottom-nav";
import { HeaderBackButton, LanguageSwitcher } from "@/components/shared";
import { getWhatsAppNumber } from "@/lib/get-whatsapp-number";

interface CustomerLayoutProps {
  children: ReactNode;
}

export default async function CustomerLayout({
  children,
}: Readonly<CustomerLayoutProps>) {
  const whatsappNumber = await getWhatsAppNumber();
  return (
    <NuqsAdapter>
      {/* Floating back button */}
      <div className='fixed left-4 top-4 z-40'>
        <HeaderBackButton />
      </div>

      {/* Floating language switcher */}
      <div className='fixed right-4 top-4 z-40'>
        <LanguageSwitcher />
      </div>

      <div className='pt-14 pb-16 max-w-md mx-auto'>
        {children}
      </div>

      <CustomerBottomNav />

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
