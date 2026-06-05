import { Pencil } from "lucide-react";
import { Input } from "@/components/ui/input";

interface OcrEditFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function OcrEditField({
  id,
  label,
  value,
  onChange,
  placeholder,
}: OcrEditFieldProps) {
  return (
    <div className="space-y-1.5 p-3 bg-card rounded-lg">
      <label
        htmlFor={id}
        className="text-xs font-medium text-muted-foreground"
      >
        {label}
      </label>
      <Input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        suffix={<Pencil className='h-4 w-4 text-muted-foreground' />}
        className='font-mono font-semibold uppercase tracking-wider bg-card'
      />
    </div>
  );
}
