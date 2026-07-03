"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "@/i18n";
import { cn } from "@/lib/utils";

/**
 * Shared input styling for the customer auth screens (login, register,
 * forgot/reset password). Centralised here so every auth surface uses the
 * same field treatment without re-declaring the class string in each page.
 */
export const AUTH_INPUT_CLASS =
  "h-[52px] rounded-[14px] border-[1.5px] border-[rgba(111,120,125,0.18)] bg-white/70 text-[15px] focus:border-[#1db1f1] focus:ring-[rgba(29,177,241,0.14)]";

export interface PasswordInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "prefix" | "type"> {
  /** Visible label rendered above the field (already-localised copy). */
  label: string;
  /** Marks the field as invalid: applies a red border and `aria-invalid`. */
  invalid?: boolean;
  /** ID of an element describing the error, wired to `aria-describedby`. */
  errorDescribedBy?: string;
}

/**
 * Password field with a show/hide toggle. Replaces ~25 lines of duplicated
 * markup (input + relative wrapper + eye button) that previously appeared in
 * login, reset-password and auth/action. The toggle's accessible label is
 * translated via i18next.
 */
export const PasswordInput = React.forwardRef<
  HTMLInputElement,
  PasswordInputProps
>(function PasswordInput(
  {
    label,
    id,
    invalid,
    errorDescribedBy,
    autoComplete = "current-password",
    placeholder = "••••••••",
    className,
    ...props
  },
  ref,
) {
  const { t } = useTranslation("customer");
  const [show, setShow] = React.useState(false);

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id} className="text-[13px] font-bold">
        {label}
      </Label>
      <div className="relative">
        <Input
          id={id}
          ref={ref}
          type={show ? "text" : "password"}
          autoComplete={autoComplete}
          placeholder={placeholder}
          aria-invalid={invalid || undefined}
          aria-describedby={errorDescribedBy}
          className={cn(
            AUTH_INPUT_CLASS,
            "pr-12",
            invalid && "border-red-400",
            className,
          )}
          {...props}
        />
        <button
          type="button"
          aria-label={t(show ? "auth.hidePassword" : "auth.showPassword")}
          onClick={() => setShow((s) => !s)}
          className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-black/5"
        >
          {show ? (
            <EyeOff className="h-5 w-5" strokeWidth={1.8} />
          ) : (
            <Eye className="h-5 w-5" strokeWidth={1.8} />
          )}
        </button>
      </div>
    </div>
  );
});
