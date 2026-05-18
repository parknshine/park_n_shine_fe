import * as React from "react";
import { Info, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export type AlertVariant = "default" | "success" | "warning" | "destructive";

const variantClasses: Record<AlertVariant, string> = {
  default:     "border-border bg-muted text-foreground",
  success:     "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300",
  warning:     "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300",
  destructive: "border-destructive/20 bg-destructive/10 text-destructive",
};

const AlertIcon: Record<AlertVariant, React.ElementType> = {
  default:     Info,
  success:     CheckCircle2,
  warning:     AlertTriangle,
  destructive: XCircle,
};

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
}

function Alert({ className, variant = "default", children, ...props }: AlertProps) {
  const Icon = AlertIcon[variant];
  return (
    <div
      role="alert"
      className={cn(
        "flex gap-3 rounded-xl border p-4",
        variantClasses[variant],
        className
      )}
      {...props}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="flex-1 text-sm">{children}</div>
    </div>
  );
}

const AlertTitle = ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn("mb-1 font-semibold leading-none tracking-tight", className)} {...props} />
);
AlertTitle.displayName = "AlertTitle";

const AlertDescription = ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn("text-sm opacity-90", className)} {...props} />
);
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription };
