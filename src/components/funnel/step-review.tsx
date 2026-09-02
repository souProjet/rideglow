"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { Dictionary } from "@/i18n";
import type { Locale } from "@/i18n/config";
import { getBike, getKit } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import { useConfigurator, useTotals } from "@/lib/store";

export function StepReview({
  t,
  locale,
  soldOut,
}: {
  t: Dictionary;
  locale: Locale;
  soldOut: ReadonlySet<string>;
}) {
  const bikeId = useConfigurator((s) => s.bikeId);
  const kitId = useConfigurator((s) => s.kitId);
  const addonIds = useConfigurator((s) => s.addonIds);
  const goTo = useConfigurator((s) => s.goTo);
  const totals = useTotals();

  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);
  // Skus the checkout route refused after this page had already loaded. Merged
  // with what /api/stock said so both paths render the same warning.
  const [raced, setRaced] = useState<ReadonlySet<string>>(() => new Set());

  const bike = getBike(bikeId);
  const kit = getKit(kitId);

  const blocked = (sku: string) => soldOut.has(sku) || raced.has(sku);
  const unavailable = [
    ...(blocked(`kit:${kitId}`) ? [t.kits.items[kitId].name] : []),
    ...addonIds.filter((id) => blocked(`addon:${id}`)).map((id) => t.kits.addons[id].name),
  ];

  async function pay() {
    setPending(true);
    setFailed(false);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ bikeId, kitId, addonIds, locale }),
      });
      // 409 means something went out of stock while this page was open. It is
      // not an error to retry, so it gets the availability warning rather than
      // the payment one.
      if (response.status === 409) {
        const body = (await response.json()) as { soldOut?: string[] };
        setRaced(new Set(body.soldOut ?? []));
        setPending(false);
        return;
      }
      if (!response.ok) throw new Error(`Checkout responded ${response.status}`);
      const { url } = (await response.json()) as { url?: string };
      if (!url) throw new Error("Checkout returned no redirect URL");
      window.location.href = url;
    } catch {
      // Leave the visitor on their configuration; nothing has been charged.
      setFailed(true);
      setPending(false);
    }
  }

  if (!bike || !kit) return null;

  const rows = [
    { label: t.review.bike, value: t.bikes.items[bike.id].name, onEdit: () => goTo("bike") },
    { label: t.review.kit, value: t.kits.items[kit.id].name, onEdit: () => goTo("kit") },
    {
      label: t.review.addons,
      value: addonIds.length
        ? addonIds.map((id) => t.kits.addons[id].name).join(", ")
        : t.review.noAddons,
      onEdit: () => goTo("kit"),
    },
  ];

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h2 className="type-display text-[1.75rem]">{t.review.title}</h2>
        <p className="text-[0.9375rem] leading-relaxed text-chalk-dim">{t.review.lede}</p>
      </header>

      <dl className="border-t border-line">
        {rows.map((row) => (
          <div key={row.label} className="flex items-baseline gap-4 border-b border-line py-4">
            <dt className="type-eyebrow w-24 shrink-0">{row.label}</dt>
            <dd className="flex-1 text-[0.9375rem] text-chalk">{row.value}</dd>
            <button
              type="button"
              onClick={row.onEdit}
              className="shrink-0 text-[0.75rem] text-chalk-dim underline underline-offset-4 transition-colors hover:text-glow"
            >
              {t.funnel.back}
            </button>
          </div>
        ))}
      </dl>

      <div className="space-y-2.5">
        <div className="flex justify-between text-[0.9375rem] text-chalk-dim">
          <span>{t.review.subtotal}</span>
          <span data-numeric>{formatPrice(totals.subtotalCents, locale)}</span>
        </div>
        <div className="flex justify-between text-[0.9375rem] text-chalk-dim">
          <span>{t.review.shipping}</span>
          <span data-numeric>
            {totals.freeShipping
              ? t.review.freeShipping
              : formatPrice(totals.shippingCents, locale)}
          </span>
        </div>
        <div className="flex items-baseline justify-between border-t border-line pt-3 text-[1.25rem] font-semibold text-chalk">
          <span>{t.review.total}</span>
          <span data-numeric>{formatPrice(totals.totalCents, locale)}</span>
        </div>
      </div>

      <div className="space-y-3">
        {unavailable.length > 0 && (
          <p
            role="alert"
            className="rounded-card border border-line-bright p-3 text-[0.8125rem] text-chalk-dim"
          >
            {t.review.soldOut} <span className="text-chalk">{unavailable.join(", ")}</span>
          </p>
        )}
        <Button onClick={pay} disabled={pending || unavailable.length > 0} className="w-full">
          {pending ? t.review.paying : `${t.review.pay} ${formatPrice(totals.totalCents, locale)}`}
        </Button>
        {failed && (
          <p role="alert" className="text-[0.8125rem] text-glow-2">
            {t.review.error}
          </p>
        )}
      </div>

      <ul className="grid gap-2 border-t border-line pt-5">
        {Object.values(t.review.reassurance).map((line) => (
          <li key={line} className="flex items-start gap-2.5 text-[0.8125rem] text-chalk-dim">
            <span aria-hidden className="mt-1.5 size-1 shrink-0 rounded-full bg-glow" />
            {line}
          </li>
        ))}
      </ul>
    </div>
  );
}
