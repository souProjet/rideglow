"use client";

import { useActionState } from "react";
import { shipOrder } from "@/app/(backoffice)/admin/actions";

export function ShipForm({ orderId }: { orderId: string }) {
  const [error, formAction, pending] = useActionState(shipOrder, null);

  return (
    <form action={formAction} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="orderId" value={orderId} />
      <input
        name="tracking"
        required
        placeholder="Numéro de suivi"
        aria-label="Numéro de suivi"
        className="w-48 rounded-card border border-line bg-ink-raised px-3 py-2 text-[0.8125rem] text-chalk outline-none focus:border-glow"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-card border border-glow px-3 py-2 text-[0.75rem] font-semibold uppercase tracking-[0.08em] text-glow transition-colors hover:bg-glow hover:text-ink disabled:opacity-50"
      >
        {pending ? "…" : "Expédier"}
      </button>
      {error && (
        <span role="alert" className="text-[0.75rem] text-glow-2">
          {error}
        </span>
      )}
    </form>
  );
}
