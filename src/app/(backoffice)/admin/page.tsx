import { redirect } from "next/navigation";
import { signOut } from "@/app/(backoffice)/admin/actions";
import { ShipForm } from "@/app/(backoffice)/admin/ship-form";
import { isSignedIn } from "@/lib/admin-auth";
import { listOrders, type Order } from "@/lib/db";
import { formatPrice } from "@/lib/format";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<Order["status"], string> = {
  paid: "À expédier",
  shipped: "Expédiée",
  refunded: "Remboursée",
};

function Address({ order }: { order: Order }) {
  const lines = [
    order.shipping_name,
    order.shipping_line1,
    order.shipping_line2,
    [order.shipping_postal_code, order.shipping_city].filter(Boolean).join(" "),
    order.shipping_country,
  ].filter(Boolean);

  return (
    <address className="not-italic text-[0.8125rem] leading-relaxed text-chalk-dim">
      {lines.map((line) => (
        <span key={line} className="block">
          {line}
        </span>
      ))}
    </address>
  );
}

export default async function AdminPage() {
  if (!(await isSignedIn())) redirect("/admin/login");

  let orders: Order[] = [];
  let dbError: string | null = null;
  try {
    orders = await listOrders();
  } catch (error) {
    dbError = error instanceof Error ? error.message : "Base de données injoignable.";
  }

  const toShip = orders.filter((o) => o.status === "paid").length;

  return (
    <main className="mx-auto max-w-5xl px-5 py-12 sm:px-8">
      <header className="flex items-baseline justify-between gap-6 border-b border-line pb-6">
        <div className="space-y-1">
          <h1 className="type-display text-[1.5rem]">Commandes</h1>
          <p className="type-eyebrow" data-numeric>
            {toShip} à expédier · {orders.length} au total
          </p>
        </div>
        <form action={signOut}>
          <button
            type="submit"
            className="text-[0.75rem] text-chalk-dim underline underline-offset-4 hover:text-chalk"
          >
            Se déconnecter
          </button>
        </form>
      </header>

      {dbError && (
        <p
          role="alert"
          className="mt-8 rounded-card border border-line p-4 text-[0.875rem] text-glow-2"
        >
          {dbError} Vérifiez <code>DATABASE_URL</code> et que <code>db/schema.sql</code> est
          appliqué.
        </p>
      )}

      {!dbError && orders.length === 0 && (
        <p className="mt-10 text-[0.9375rem] text-chalk-dim">
          Aucune commande pour l'instant. Les commandes arrivent ici dès que le webhook Stripe est
          branché.
        </p>
      )}

      <ul className="mt-8 space-y-px">
        {orders.map((order) => (
          <li key={order.id} className="border border-line bg-ink-raised p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-1">
                <p className="text-[0.9375rem] font-medium text-chalk" data-numeric>
                  {order.id.slice(-12).toUpperCase()}
                </p>
                <p className="text-[0.8125rem] text-chalk-dim">
                  {order.email ?? "—"} · {order.bike_id} / {order.kit_id}
                  {order.addon_ids.length > 0 && ` + ${order.addon_ids.join(", ")}`}
                </p>
                <p className="text-[0.75rem] text-chalk-dim" data-numeric>
                  {new Date(order.created_at).toLocaleString("fr-FR")}
                </p>
              </div>

              <div className="text-right">
                <p className="text-[1.0625rem] font-semibold text-chalk" data-numeric>
                  {formatPrice(order.amount_total_cents, "fr")}
                </p>
                <p className="type-eyebrow">{STATUS_LABEL[order.status]}</p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-end justify-between gap-4 border-t border-line pt-4">
              <Address order={order} />
              {order.status === "paid" ? (
                <ShipForm orderId={order.id} />
              ) : (
                order.tracking_number && (
                  <p className="text-[0.8125rem] text-chalk-dim" data-numeric>
                    Suivi {order.tracking_number}
                  </p>
                )
              )}
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
