import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "ghost";

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-card px-6 py-3.5 text-[0.8125rem] font-semibold uppercase tracking-[0.1em] transition-[background-color,color,box-shadow,transform] duration-200 ease-[var(--ease-out-expo)] disabled:pointer-events-none disabled:opacity-45";

const VARIANTS: Record<Variant, string> = {
  // The primary action is literally lit in the colour the visitor selected.
  primary:
    "bg-glow text-ink shadow-[0_0_0_0_var(--glow-soft)] hover:shadow-[0_0_36px_-4px_var(--glow-soft)] hover:brightness-110 active:translate-y-px",
  ghost: "border border-line text-chalk hover:border-glow hover:text-glow active:translate-y-px",
};

type Props = {
  variant?: Variant;
  href?: string;
  children: ReactNode;
  className?: string;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children">;

export function Button({ variant = "primary", href, children, className = "", ...rest }: Props) {
  const classes = `${BASE} ${VARIANTS[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" className={classes} {...rest}>
      {children}
    </button>
  );
}
