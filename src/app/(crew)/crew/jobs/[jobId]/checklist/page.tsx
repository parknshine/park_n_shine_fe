import { Construction } from "lucide-react";

export function ChecklistPage() {
  return (
    <main className="flex min-h-[calc(100dvh-44px)] flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
        <Construction className="h-7 w-7 text-muted-foreground" aria-hidden="true" />
      </div>
      <div className="space-y-1">
        <p className="text-base font-semibold text-foreground">
          Checklist Cuci
        </p>
        <p className="text-sm text-muted-foreground">
          Fitur ini akan tersedia di Sprint 6.
        </p>
      </div>
    </main>
  );
}

export default ChecklistPage;
