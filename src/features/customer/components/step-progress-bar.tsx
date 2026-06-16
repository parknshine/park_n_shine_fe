interface StepProgressBarProps {
  current: number;
  total: number;
  label: string;
}

export function StepProgressBar({ current, total, label }: Readonly<StepProgressBarProps>) {
  return (
    <div className="px-4 pb-4 pt-3 flex items-center justify-between gap-3">
      <div className="flex flex-1 gap-1.5">
        {Array.from({ length: total }, (_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i < current ? "bg-primary" : "bg-muted"
            }`}
          />
        ))}
      </div>
      <span className="text-xs font-semibold text-muted-foreground shrink-0">{label}</span>
    </div>
  );
}
