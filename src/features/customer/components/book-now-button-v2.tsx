import Link from "next/link";
import { Button } from "@/components/ui/button";

interface BookNowButtonV2Props {
  qrId: string;
}

export function BookNowButtonV2({ qrId }: BookNowButtonV2Props) {
  return (
    <Button size="lg" className="w-full rounded-full" asChild>
      <Link href={`/q/${qrId}/book/capture`}>Book a Wash</Link>
    </Button>
  );
}
