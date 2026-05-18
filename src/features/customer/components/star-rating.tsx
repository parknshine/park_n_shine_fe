"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number;
  onChange: (value: number) => void;
  label?: string;
}

export function StarRating({ value, onChange, label = "Beri penilaian" }: StarRatingProps) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex flex-col items-center gap-3">
      {label && (
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
      )}
      <div className="flex gap-2" role="group" aria-label={label}>
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= (hovered || value);
          return (
            <button
              key={star}
              type="button"
              aria-label={`${star} bintang`}
              aria-pressed={star === value}
              className="rounded-full p-1 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onClick={() => onChange(star)}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
            >
              <Star
                className={cn(
                  "h-9 w-9 transition-colors",
                  isFilled
                    ? "fill-accent text-accent"
                    : "fill-transparent text-muted-foreground"
                )}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
