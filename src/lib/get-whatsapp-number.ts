const ENV_FALLBACK = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";

export async function getWhatsAppNumber(): Promise<string> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
    const res = await fetch(`${apiUrl}/v1/settings`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return ENV_FALLBACK;
    const json = await res.json();
    return (json.data?.whatsappNumber as string) || ENV_FALLBACK;
  } catch {
    return ENV_FALLBACK;
  }
}
