import { type NextRequest, NextResponse } from "next/server";
import { DEFAULT_LOCALE, isLocale, LOCALES, matchLocale } from "@/i18n/config";

/**
 * Next 16 renamed the middleware convention to `proxy`. This one does exactly
 * one job: make sure every marketing URL carries a locale segment, so pages can
 * stay statically rendered per locale.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const hasLocale = LOCALES.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );
  if (hasLocale) return NextResponse.next();

  const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value;
  const locale = isLocale(cookieLocale)
    ? cookieLocale
    : matchLocale(request.headers.get("accept-language"));

  const url = new URL(`/${locale}${pathname === "/" ? "" : pathname}${search}`, request.url);
  const response = NextResponse.redirect(url);
  if (locale !== DEFAULT_LOCALE || cookieLocale) {
    response.cookies.set("NEXT_LOCALE", locale, { maxAge: 60 * 60 * 24 * 365, path: "/" });
  }
  return response;
}

export const config = {
  // Everything except API routes, the back-office, Next internals and files.
  matcher: ["/((?!api|admin|_next/static|_next/image|favicon.ico|models|.*\\..*).*)"],
};
