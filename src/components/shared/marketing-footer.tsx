import Link from "next/link";

type ActivePage = "support" | "privacy-policy" | "terms" | "contact";

interface MarketingFooterProps {
  activePage?: ActivePage;
}

const links: { label: string; href: string; page: ActivePage }[] = [
  { label: "Privacy Policy", href: "/privacy-policy", page: "privacy-policy" },
  { label: "Terms", href: "/terms", page: "terms" },
  { label: "Contact", href: "/contact", page: "contact" },
];

export function MarketingFooter({ activePage }: MarketingFooterProps) {
  return (
    <footer className="bg-[#1a1a1a] border-t border-[#333] mt-auto">
      <div className="max-w-341.5 mx-auto px-4 md:px-12 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <span
          className="text-[#636363] text-sm"
          style={{ fontFamily: "var(--font-inter), sans-serif" }}
        >
          © 2026 Park &amp; Shine. All rights reserved.
        </span>
        <div className="flex gap-6">
          {links.map(({ label, href, page }) => (
            <Link
              key={page}
              href={href}
              className="text-sm transition-colors hover:text-white"
              style={{
                fontFamily: "var(--font-inter), sans-serif",
                color: activePage === page ? "#ffffff" : "#9ca3af",
                fontWeight: activePage === page ? 600 : 400,
              }}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
