import Link from "next/link";

/**
 * The logo is a six-LED strip: the product's own vocabulary, and it inherits
 * `--glow`, so the wordmark changes colour with the mode the visitor picked.
 */
export function Wordmark({ href }: { href: string }) {
  return (
    <Link href={href} className="group flex items-center gap-3" aria-label="RideGlow">
      <span className="flex items-center gap-[3px]" aria-hidden>
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
