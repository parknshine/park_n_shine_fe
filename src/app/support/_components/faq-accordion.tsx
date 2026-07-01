"use client";

import { useState } from "react";

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqAccordionProps {
  items: FaqItem[];
}

export function FaqAccordion({ items }: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="flex flex-col gap-3">
      {items.map(({ question, answer }, index) => {
        const isOpen = openIndex === index;
        return (
          <div
            key={question}
            className={`rounded-xl border border-[#e8e8e8] transition-shadow ${isOpen ? "shadow-[0_2px_8px_rgba(26,26,26,0.08)]" : ""}`}
          >
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              className="w-full flex items-center justify-between px-6 py-5 text-left"
            >
              <span
                className="text-[#1a1a1a] text-base"
                style={{ fontFamily: "var(--font-inter), sans-serif", fontWeight: 600 }}
              >
                {question}
              </span>
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                className="shrink-0 ml-4 transition-transform duration-200"
                style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
              >
                <path
                  d="M5 7.5L10 12.5L15 7.5"
                  stroke="#636363"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <div
              className="grid transition-[grid-template-rows] duration-200"
              style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
            >
              <div className="overflow-hidden">
                <p
                  className="px-6 pb-5 text-[#3d3d3d] text-base leading-6.5 text-justify"
                  style={{ fontFamily: "var(--font-inter), sans-serif", fontWeight: 400 }}
                >
                  {answer}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
