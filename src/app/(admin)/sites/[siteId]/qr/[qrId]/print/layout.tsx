import type { ReactNode } from "react";

// Print page uses its own bare layout — no admin sidebar/navbar
export default function PrintLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
