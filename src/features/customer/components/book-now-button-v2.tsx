"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BookNowModal } from "@/features/customer/components/book-now-modal";

interface BookNowButtonV2Props {
  qrId: string;
}

export function BookNowButtonV2({ qrId }: Readonly<BookNowButtonV2Props>) {
  const [open, setOpen] = useState(false);
  const captureHref = `/q/${qrId}/book/capture`;

  return (
    <>
      <Button
        size="lg"
        className="w-full rounded-full"
        onClick={() => setOpen(true)}
      >
        Book a Wash
      </Button>
      <BookNowModal
        captureHref={captureHref}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}
