import { AlertTriangle } from "lucide-react";

interface QrErrorStateProps {
  message: string;
}

export function QrErrorState({ message }: QrErrorStateProps) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="h-8 w-8 text-destructive" />
      </div>
      <div className="space-y-1">
        <p className="font-semibold text-foreground">Tidak Dapat Melanjutkan</p>
        <p className="max-w-xs text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}
