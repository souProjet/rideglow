import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@/app/globals.css";
import { archivo, martianMono } from "@/lib/fonts";

export const metadata: Metadata = {
  title: "RideGlow: back-office",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" className={`${archivo.variable} ${martianMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
