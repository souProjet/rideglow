"use client";

import { useActionState } from "react";
import { setStockLevel } from "@/app/(backoffice)/admin/actions";
import type { Sku } from "@/lib/catalog";

export function StockForm({ sku, onHand }: { sku: Sku; onHand: number | null }) {
  const [error, formAction, pending] = useActionState(setStockLevel, null);

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="sku" value={sku} />
      <input
        name="onHand"
        type="number"
        step={1}
        // Uncontrolled on purpose: the field is re-rendered from the server
        // after each save, and typing over it should not fight the store.
        defaultValue={onHand ?? ""}
        placeholder="Non suivi"
        aria-label={`Stock ${sku}`}
        className="w-28 rounded-card border border-line bg-ink px-3 py-2 text-right text-[0.8125rem] text-chalk outline-none focus:border-glow"
        data-numeric
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-card border border-line px-3 py-2 text-[0.75rem] font-semibold uppercase tracking-[0.08em] text-chalk-dim transition-colors hover:border-glow hover:text-glow disabled:opacity-50"
      >
        {pending ? "…" : "Enregistrer"}
      </button>
      {error && (
        <span role="alert" className="text-[0.75rem] text-glow-2">
          {error}
        </span>
      )}
    </form>
  );
}
