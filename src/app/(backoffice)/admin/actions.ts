"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { checkPassword, endSession, isSignedIn, startSession } from "@/lib/admin-auth";
import { markShipped } from "@/lib/db";
import { sendShippingEmail } from "@/lib/email";

export async function signIn(_prev: string | null, formData: FormData): Promise<string | null> {
  const password = formData.get("password");
  if (typeof password !== "string" || !checkPassword(password)) {
    return "Mot de passe incorrect.";
  }
  await startSession();
  redirect("/admin");
}

export async function signOut(): Promise<void> {
  await endSession();
  redirect("/admin/login");
}

export async function shipOrder(_prev: string | null, formData: FormData): Promise<string | null> {
  // Server actions are public POST endpoints; the layout's redirect does not
  // protect them, so every action re-checks the session itself.
  if (!(await isSignedIn())) return "Session expirée.";

  const id = formData.get("orderId");
  const tracking = formData.get("tracking");
  if (typeof id !== "string" || typeof tracking !== "string" || !tracking.trim()) {
    return "Numéro de suivi manquant.";
  }

  const order = await markShipped(id, tracking.trim());
  if (!order) return "Commande introuvable.";

  // The parcel is already flagged as shipped in the ledger. A bounced email
  // must not undo that, so it is reported rather than thrown.
  try {
    await sendShippingEmail(order);
  } catch (error) {
    console.error(`[admin] shipping email failed for ${id}`, error);
    revalidatePath("/admin");
    return "Expédition enregistrée, mais l'e-mail n'est pas parti.";
  }

  revalidatePath("/admin");
  return null;
}
