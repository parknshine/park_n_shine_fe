import * as React from "react";
import { cn } from "@/lib/utils";

export type BadgeVariant = "default" | "secondary" | "outline" | "destructive" | "success" | "warning";

const variantClasses: Record<BadgeVariant, string> = {
  default:     "bg-primary text-primary-foreground",
  secondary:   "bg-muted text-muted-foreground",
  outline:     "border border-border bg-transparent text-foreground",
  destructive: "bg-destructive/10 text-destructive border border-destructive/20",
  success:     "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
  warning:     "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
