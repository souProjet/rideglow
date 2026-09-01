import Link from "next/link";

export default function NotFound() {
  return (
    <section className="grid min-h-svh place-items-center px-5 text-center">
      <div className="space-y-4">
        <p className="type-eyebrow" data-numeric>
          404
        </p>
        <h1 className="type-display text-[clamp(1.6rem,4vw,2.4rem)]">Page introuvable</h1>
        <Link
          href="/"
          className="inline-block text-[0.875rem] text-glow underline underline-offset-4"
        >
          Retour au showroom
        </Link>
      </div>
    </section>
  );
}
