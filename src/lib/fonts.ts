import { Archivo, Martian_Mono } from "next/font/google";

/**
 * Archivo carries a width axis, which is the whole point: headings run at
 * wdth 118 for the plated, motorsport-fairing register, body text sits at the
 * normal width. One family, two voices.
 */
export const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
  variable: "--font-archivo",
});

/** Utility face for anything measurable: prices, amperage, LED counts. */
export const martianMono = Martian_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-martian",
});
