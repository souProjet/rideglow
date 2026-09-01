"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LOCALES, type Locale } from "@/i18n/config";

/** Swaps the locale segment in place, so the visitor stays on the same page. */
export function LocaleSwitch({ locale }: { locale: Locale }) {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-1 text-[0.6875rem]" data-numeric>
      {LOCALES.map((target, i) => {
        const active = target === locale;
        const href = pathname.replace(new RegExp(`^/${locale}(?=/|$)`), `/${target}`);
        return (
          <span key={target} className="flex items-center gap-1">
            {i > 0 && <span className="text-line-bright">/</span>}
            <Link
              href={href}
              hrefLang={target}
              aria-current={active ? "true" : undefined}
              className={`uppercase transition-colors ${
                active ? "text-chalk" : "text-chalk-dim hover:text-chalk"
              }`}
            >
              {target}
            </Link>
          </span>
        );
      })}
    </div>
  );
}
