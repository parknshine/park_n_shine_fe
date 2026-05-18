import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "prefix"> {
  /** Element rendered inside the left edge of the input (icon, text, etc.) */
  prefix?: React.ReactNode;
  /** Element rendered inside the right edge of the input (icon, text, etc.) */
  suffix?: React.ReactNode;
  /** Extra class names applied to the outer wrapper */
  wrapperClassName?: string;
  /** Helper text displayed below the input */
  helperText?: string;
  /** Error message displayed below the input; also applies error styles */
  errorMessage?: string;
}

const baseClass =
  "flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50";

const errorClass =
  "border-destructive focus:ring-destructive";

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = "text",
      prefix,
      suffix,
      wrapperClassName,
      helperText,
      errorMessage,
      required,
      id,
      ...props
    },
    ref
  ) => {
    const hasAdornment = prefix !== undefined || suffix !== undefined;
    const hasBelow = helperText || errorMessage;

    const inputEl = (
      <input
        id={id}
        type={type}
        ref={ref}
        required={required}
        aria-invalid={!!errorMessage}
        aria-describedby={
          hasBelow ? `${id}-helper` : undefined
        }
        className={cn(
          baseClass,
          errorMessage && errorClass,
          hasAdornment && prefix !== undefined && "pl-9",
          hasAdornment && suffix !== undefined && "pr-9",
          className
        )}
        {...props}
      />
    );

    return (
      <div className={cn("flex flex-col gap-1", wrapperClassName)}>
        {hasAdornment ? (
          <div className="relative">
            {prefix !== undefined && (
              <div className="pointer-events-none absolute left-0 top-0 flex h-10 items-center pl-3 text-muted-foreground [&_svg]:h-4 [&_svg]:w-4">
                {prefix}
              </div>
            )}

            {inputEl}

            {suffix !== undefined && (
              <div className="absolute right-0 top-0 flex h-10 items-center pr-3 text-muted-foreground [&_svg]:h-4 [&_svg]:w-4">
                {suffix}
              </div>
            )}
          </div>
        ) : (
          inputEl
        )}

        {(errorMessage || helperText) && (
          <p
            id={id ? `${id}-helper` : undefined}
            className={cn(
              "text-xs",
              errorMessage ? "text-destructive" : "text-muted-foreground"
            )}
          >
            {errorMessage ?? helperText}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
