"use client";

import { usePathname } from "next/navigation";
import { switchLocalePath } from "@/i18n/locale-path";
import { routing, type Locale } from "@/i18n/routing";
import { cn } from "@/lib/cn";

const labels: Record<Locale, string> = { es: "ES", en: "EN", uk: "UA" };

export function LanguageSwitcher({
  label,
  locale,
}: {
  label: string;
  locale: Locale;
}) {
  const pathname = usePathname();

  return (
    <nav
      aria-label={label}
      className="flex items-center gap-1 text-[10px] tracking-[.16em] uppercase"
    >
      {routing.locales.map((target, index) => (
        <span key={target} className="flex items-center gap-1">
          {index > 0 ? (
            <span aria-hidden="true" className="text-dim">
              ·
            </span>
          ) : null}
          <a
            href={switchLocalePath(pathname, locale, target)}
            lang={target}
            hrefLang={target}
            aria-current={target === locale ? "page" : undefined}
            onClick={(event) => {
              event.currentTarget.search = window.location.search;
              event.currentTarget.hash = window.location.hash;
            }}
            className={cn(
              "touch-manipulation px-1 py-2 transition-colors duration-300 hover:text-ink",
              target === locale ? "text-acc" : "text-mut",
            )}
          >
            {labels[target]}
          </a>
        </span>
      ))}
    </nav>
  );
}
