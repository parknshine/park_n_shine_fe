"use client";

import { useState } from "react";

interface AccordionItem {
  readonly id: string;
  readonly title: string;
  readonly content: React.ReactNode;
}

export function ContentAccordion({ items }: { readonly items: readonly AccordionItem[] }) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="border-t border-[#e8e8e8]">
      {items.map((item) => {
        const isOpen = openId === item.id;
        return (
          <div key={item.id} id={item.id} className="border-b border-[#e8e8e8]">
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? null : item.id)}
              className="w-full flex items-center justify-between py-5 text-left gap-4 cursor-pointer"
            >
              <span
                className="text-[#1a1a1a] text-base md:text-[17px]"
                style={{ fontFamily: "var(--font-manrope), sans-serif", fontWeight: 500 }}
              >
                {item.title}
              </span>
              <svg
                className={`shrink-0 text-[#636363] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M5 7.5L10 12.5L15 7.5"
                  stroke="currentColor"
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
                <div
                  className="pb-5 text-[#3d3d3d] text-base leading-6.5 flex flex-col gap-3"
                  style={{ fontFamily: "var(--font-inter), sans-serif" }}
                >
                  {item.content}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
