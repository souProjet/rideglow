import { Resend } from "resend";
import type { Order } from "@/lib/db";

let client: Resend | null = null;

function getResend(): Resend {
  if (!client) {
    const key = process.env.RESEND_API_KEY;
    if (!key) throw new Error("RESEND_API_KEY is not set");
    client = new Resend(key);
  }
  return client;
}

/**
 * The one email we send ourselves. Stripe already sends the receipt, so this
 * covers the gap Stripe cannot: the parcel is moving, here is the number.
 */
export async function sendShippingEmail(order: Order): Promise<void> {
  if (!order.email) throw new Error(`Order ${order.id} has no email address`);
  const from = process.env.ORDER_EMAIL_FROM;
  if (!from) throw new Error("ORDER_EMAIL_FROM is not set");

  const reference = order.id.slice(-12).toUpperCase();

  await getResend().emails.send({
    from,
    to: order.email,
    subject: `Votre kit RideGlow est parti — ${reference}`,
    text: [
      `Bonjour,`,
      ``,
      `Votre kit RideGlow a quitté l'atelier.`,
      ``,
      `Référence   : ${reference}`,
      `Suivi       : ${order.tracking_number}`,
      ``,
      `Comptez deux à cinq jours ouvrés. La notice de pose est dans le carton,`,
      `et l'application se télécharge sur l'App Store et Google Play.`,
      ``,
      `Une question ? Répondez simplement à cet e-mail.`,
      ``,
      `RideGlow`,
    ].join("\n"),
  });
}
