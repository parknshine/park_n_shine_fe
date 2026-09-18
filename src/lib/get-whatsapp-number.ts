import { serverApiBaseUrl } from "@/lib/server-api-base-url";

const ENV_FALLBACK = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";

export async function getWhatsAppNumber(): Promise<string> {
  try {
    const res = await fetch(`${serverApiBaseUrl()}/v1/settings`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return ENV_FALLBACK;
    const json = await res.json();
    return (json.data?.whatsappNumber as string) || ENV_FALLBACK;
  } catch {
    return ENV_FALLBACK;
  }
}
