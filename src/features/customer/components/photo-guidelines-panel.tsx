import Image from "next/image";
import { CheckCircle, CircleCheck, Info, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n";

interface AvoidExample {
  src: string;
  label: string;
  blur?: boolean;
  dark?: boolean;
  obstructed?: boolean;
}

interface PhotoGuidelinesPanelProps {
  goodSrc: string;
  avoidExamples: [AvoidExample, AvoidExample, AvoidExample, AvoidExample];
  checklistItems?: string[];
}

export function PhotoGuidelinesPanel({
  goodSrc,
  avoidExamples,
  checklistItems,
}: Readonly<PhotoGuidelinesPanelProps>) {
  const { t } = useTranslation("customer");
  return (
    <div className='rounded-xl border border-border bg-[#f8f9f9] px-4 pt-3 pb-5 shadow-sm space-y-4'>
      {/* Header */}
      <div className='flex items-center gap-1.5'>
        <span className='text-sm font-semibold text-foreground'>
          {t("booking.capture.guidelines.title")}
        </span>
        <Info className='h-3.5 w-3.5 shrink-0 text-muted-foreground' />
      </div>

      {/* Photo examples */}
      <div className='space-y-2.5'>
        {/* Good Example */}
        <div className='flex items-center gap-3 rounded-lg border border-green-200 bg-white p-2.5 shadow-sm'>
          <div className='relative h-16 w-20 shrink-0 overflow-hidden rounded-lg'>
            <Image
              src={goodSrc}
              alt='Good example'
              fill
              sizes='80px'
              className='object-cover'
            />
          </div>
          <div className='flex items-center gap-1.5'>
            <CheckCircle className='h-3.5 w-3.5 shrink-0 text-green-600' />
            <span className='text-xs font-semibold text-green-700'>
              {t("booking.capture.guidelines.goodExample")}
            </span>
          </div>
        </div>

        {/* Avoid Examples */}
        <div className='rounded-lg border border-red-200 bg-white p-2.5 shadow-sm'>
          <div className='mb-2 flex items-center gap-1.5'>
            <XCircle className='h-3.5 w-3.5 shrink-0 text-red-500' />
            <span className='text-xs font-semibold text-red-600'>
              {t("booking.capture.guidelines.avoidExamples")}
            </span>
          </div>
          <div className='grid grid-cols-4 gap-2'>
            {avoidExamples.map((ex) => (
              <div key={ex.label} className='flex flex-col items-center gap-1'>
                <div
                  className={cn(
                    "relative aspect-square w-full overflow-hidden rounded-lg border border-red-100",
                    ex.blur && "blur-sm",
                  )}
                >
                  <Image
                    src={ex.src}
                    alt={ex.label}
                    fill
                    sizes='100px'
                    className={cn(
                      "object-cover",
                      ex.dark && "brightness-[0.35] contrast-125 saturate-75",
                    )}
                  />
                  {ex.dark && (
                    <div className='pointer-events-none absolute inset-0 bg-black/40' />
                  )}
                  {ex.obstructed && (
                    <div className='pointer-events-none absolute -bottom-4 -left-4 h-16 w-20 rounded-tr-[70%] bg-neutral-900/95 shadow-[4px_-4px_10px_rgba(0,0,0,0.35)]' />
                  )}
                </div>
                <span className='text-center text-[10px] leading-tight text-muted-foreground'>
                  {ex.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Checklist */}
      {checklistItems && checklistItems.length > 0 && (
        <div className='grid grid-cols-2 gap-x-6 gap-y-2.5'>
          {checklistItems.map((item) => (
            <div key={item} className='flex items-center gap-2'>
              <CircleCheck className='h-4 w-4 shrink-0 text-green-600' />
              <span className='text-xs text-[#5a666d]'>{item}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
