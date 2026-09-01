import Link from "next/link";
import type { Dictionary } from "@/i18n";
import type { Locale } from "@/i18n/config";

export function SiteFooter({ locale, t }: { locale: Locale; t: Dictionary }) {
  const links = [
    { href: `/${locale}/mentions-legales`, label: t.footer.legalNotice },
    { href: `/${locale}/cgv`, label: t.footer.terms },
    { href: `/${locale}/confidentialite`, label: t.footer.privacy },
    { href: "mailto:contact@rideglow.example", label: t.footer.contact },
  ];

  return (
    <footer className="border-t border-line bg-ink">
      <div className="mx-auto flex max-w-[86rem] flex-col gap-8 px-5 py-12 sm:px-8 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm space-y-3">
          <p className="type-display text-[0.9375rem]">RideGlow</p>
          <p className="text-[0.8125rem] leading-relaxed text-chalk-dim">{t.footer.disclaimer}</p>
        </div>

        <nav aria-label={t.footer.legalNotice} className="flex flex-wrap gap-x-8 gap-y-3">
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
      </div>

      <div className="mx-auto max-w-[86rem] border-t border-line/60 px-5 py-6 sm:px-8">
        <p className="text-[0.6875rem] uppercase tracking-[0.14em] text-chalk-dim" data-numeric>
          © {new Date().getFullYear()} RideGlow — {t.footer.rights}
        </p>
      </div>
    </footer>
  );
}
