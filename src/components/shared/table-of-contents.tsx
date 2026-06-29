"use client";

import { useEffect, useState } from "react";

interface Section {
  id: string;
  label: string;
}

interface TableOfContentsProps {
  sections: Section[];
}

export function TableOfContents({ sections }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveId(id);
        },
        { rootMargin: "-20% 0px -70% 0px" }
      );

      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, [sections]);

  return (
    <nav className="hidden md:block sticky top-24 self-start">
      <p
        className="text-xs uppercase tracking-widest text-[#636363] mb-4"
        style={{ fontFamily: "var(--font-inter), sans-serif", fontWeight: 600 }}
      >
        On this page
      </p>
      <div className="border-l-2 border-[#e8e8e8] pl-4 flex flex-col gap-2">
        {sections.map(({ id, label }) => {
          const isActive = activeId === id;
          return (
            <a
              key={id}
              href={`#${id}`}
              className="text-sm transition-colors"
              style={{
                fontFamily: "var(--font-inter), sans-serif",
                color: isActive ? "#024ad8" : "#636363",
                fontWeight: isActive ? 600 : 400,
                borderLeft: isActive ? "2px solid #024ad8" : "2px solid transparent",
                marginLeft: "-18px",
                paddingLeft: "16px",
              }}
            >
              {label}
            </a>
          );
        })}
      </div>
    </nav>
  );
}
