"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface BookNowButtonV2Props {
  qrId: string;
}

export function BookNowButtonV2({ qrId }: BookNowButtonV2Props) {
  const router = useRouter();
  return (
    <Button
      size="lg"
      className="w-full rounded-full"
      onClick={() => router.push(`/q/${qrId}/book/capture`)}
    >
      Book a Wash
    </Button>
  );
}
