"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("admin-token");
    router.replace(token ? "/dashboard" : "/admin/login");
  }, [router]);

  return null;
}
