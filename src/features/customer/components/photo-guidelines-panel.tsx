import Image from "next/image";
import { CheckCircle, CircleCheck, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n";

interface AvoidExample {
  src: string;
  label: string;
  blur?: boolean;
}

interface PhotoGuidelinesPanelProps {
  goodSrc: string;
  avoidExamples: [AvoidExample, AvoidExample, AvoidExample];
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
      <div className='flex gap-2.5'>
        {/* Good Example */}
        <div className='flex w-[38%] shrink-0 flex-col gap-2 rounded-lg border border-border bg-white p-2.5 shadow-sm'>
          <div className='flex items-center gap-1.5'>
            <CheckCircle className='h-3.5 w-3.5 shrink-0 text-green-600' />
            <span className='text-xs font-semibold text-green-700'>
              {t("booking.capture.guidelines.goodExample")}
            </span>
          </div>
          <div className='relative h-28 w-full overflow-hidden rounded-lg'>
            <Image
              src={goodSrc}
              alt='Good example'
              fill
              sizes='150px'
              className='object-cover'
            />
          </div>
        </div>

        {/* Avoid Examples */}
        <div className='flex flex-1 flex-col gap-2 rounded-lg border border-border bg-white p-2.5 shadow-sm'>
          <span className='text-xs font-semibold text-red-600'>
            {t("booking.capture.guidelines.avoidExamples")}
          </span>
          <div className='flex gap-2'>
            {avoidExamples.map((ex) => (
              <div
                key={ex.label}
                className='flex flex-1 flex-col items-center gap-1.5'
              >
                <div
                  className={cn(
                    "relative h-20 w-full overflow-hidden rounded-lg",
                    ex.blur && "blur-sm",
                  )}
                >
                  <Image
                    src={ex.src}
                    alt={ex.label}
                    fill
                    sizes='100px'
                    className='object-cover'
                  />
                </div>
                <span className='text-center text-[10px] text-muted-foreground'>
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
