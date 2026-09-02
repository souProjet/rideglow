import Link from "next/link";

/**
 * The logo is a six-LED strip: the product's own vocabulary, and it inherits
 * `--glow`, so the wordmark changes color with the mode the visitor picked.
 */
export function Wordmark({ href }: { href: string }) {
  return (
    <Link href={href} className="group flex items-center gap-3" aria-label="RideGlow">
      {/* Hidden below sm. The strip and the CTA together needed 375px of a
          320px content box on a 360px phone, and the wordmark is the half that
          still reads as the brand without it. */}
      <span className="hidden items-center gap-[3px] sm:flex" aria-hidden>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <span
            key={i}
            className="size-[5px] rounded-full bg-glow transition-opacity duration-500"
            style={{ opacity: 0.28 + i * 0.145 }}
          />
        ))}
      </span>
      <span className="type-display text-[0.9375rem] tracking-[0.02em]">RideGlow</span>
    </Link>
  );
}
