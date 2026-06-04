"use client";

import type * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";
import type { ButtonVariant, ButtonSize } from "@/types";

const variantClasses: Record<ButtonVariant, string> = {
  default: "bg-[linear-gradient(180deg,var(--primary-bright),var(--primary))] text-primary-foreground shadow-[var(--shadow-soft)] hover:-translate-y-0.5 active:translate-y-0",
  outline: "border border-border bg-transparent text-foreground shadow-sm hover:bg-muted",
  ghost: "bg-transparent text-foreground hover:bg-muted",
  destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
};

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "prefix"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Renders the button as its child element (Radix `asChild` pattern) */
  asChild?: boolean;
  /** Element rendered before the button label (icon, badge, etc.) */
  prefix?: React.ReactNode;
  /** Element rendered after the button label (icon, badge, etc.) */
  suffix?: React.ReactNode;
  ref?: React.Ref<HTMLButtonElement>;
}

export function Button({
  className,
  variant = "default",
  size = "md",
  asChild = false,
  prefix,
  suffix,
  children,
  ref,
  ...props
}: ButtonProps) {
  const baseClass = cn(
    "inline-flex cursor-pointer items-center justify-center gap-2 rounded-full font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:text-inherit",
    variantClasses[variant],
    sizeClasses[size],
    className
  );

  if (asChild) {
    return (
      <Slot ref={ref} className={baseClass} {...props}>
        {children}
      </Slot>
    );
  }

  return (
    <button ref={ref} className={baseClass} {...props}>
      {prefix && <span className="shrink-0">{prefix}</span>}
      {children}
      {suffix && <span className="shrink-0">{suffix}</span>}
    </button>
  );
}
