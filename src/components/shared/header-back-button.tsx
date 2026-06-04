"use client";

import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

const BACK_PAGES = [
  /^\/book\/location$/,
  /^\/book\/capture$/,
  /^\/book\/confirm$/,
  /^\/q\/[^/]+\/book\/capture$/,
  /^\/q\/[^/]+\/book\/confirm$/,
  /^\/q\/[^/]+\/capture$/,
  /^\/q\/[^/]+\/confirm$/,
];

export function HeaderBackButton() {
  const pathname = usePathname();
  const router = useRouter();

  if (!BACK_PAGES.some((re) => re.test(pathname))) return null;

  function handleBack() {
    if (pathname === "/book/location") {
      router.push("/");
    } else {
      router.back();
    }
  }

  return (
    <button
      type="button"
      onClick={handleBack}
      aria-label="Kembali"
      className="-ml-1 flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      <ArrowLeft className="h-5 w-5" />
    </button>
  );
}
