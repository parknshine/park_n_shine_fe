"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useTranslation } from "@/i18n";

// Mirrors backend StrongPasswordSchema (AdminSchema.ts)
const PASSWORD_RULES = [
  { key: "usersPage.password.minLength", test: (pw: string) => pw.length >= 8 },
  { key: "usersPage.password.lowercase", test: (pw: string) => /[a-z]/.test(pw) },
  { key: "usersPage.password.uppercase", test: (pw: string) => /[A-Z]/.test(pw) },
  { key: "usersPage.password.number", test: (pw: string) => /[0-9]/.test(pw) },
];

export function isPasswordValid(pw: string) {
  return PASSWORD_RULES.every((r) => r.test(pw));
}

export function PasswordField({
  id,
  value,
  onChange,
  required = true,
}: Readonly<{
  id: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}>) {
  const [show, setShow] = useState(false);
  return (
    <div className='relative'>
      <Input
        id={id}
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className='pr-10'
      />
      <button
        type='button'
        onClick={() => setShow((v) => !v)}
        className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
        tabIndex={-1}
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
      </button>
    </div>
  );
}

export function PasswordRules({ password }: Readonly<{ password: string }>) {
  const { t } = useTranslation("admin");
  if (!password) return null;
  return (
    <ul className='space-y-0.5 text-xs'>
      {PASSWORD_RULES.map(({ key, test }) => {
        const ok = test(password);
        return (
          <li key={key} className={ok ? "text-green-600" : "text-destructive"}>
            {ok ? "✓" : "✗"} {t(key)}
          </li>
        );
      })}
    </ul>
  );
}
