import Link from "next/link";
import { LocaleSwitch } from "@/components/site/locale-switch";
import { Wordmark } from "@/components/site/wordmark";
import type { Dictionary } from "@/i18n";
import type { Locale } from "@/i18n/config";

export function SiteHeader({ locale, t }: { locale: Locale; t: Dictionary }) {
  const links = [
    { href: `/${locale}#modes`, label: t.nav.modes },
    { href: `/${locale}#kit`, label: t.nav.kit },
    { href: `/${locale}#specs`, label: t.nav.specs },
  ];

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-line/60 bg-ink/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[86rem] items-center justify-between gap-4 px-5 sm:gap-6 sm:px-8">
        <Wordmark href={`/${locale}`} />

        <nav aria-label="Sections" className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[0.8125rem] text-chalk-dim transition-colors hover:text-chalk"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-5">
          <LocaleSwitch locale={locale} />
          <Link
            href={`/${locale}/configurateur`}
            className="rounded-card border border-glow px-4 py-2 text-[0.75rem] font-semibold uppercase tracking-[0.1em] text-glow transition-colors hover:bg-glow hover:text-ink"
          >
            {t.nav.configure}
          </Link>
        </div>
      </div>
    </header>
  );
}
