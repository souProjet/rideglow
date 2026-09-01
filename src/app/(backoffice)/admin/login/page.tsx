"use client";

import { useActionState } from "react";
import { signIn } from "@/app/(backoffice)/admin/actions";

export default function LoginPage() {
  const [error, formAction, pending] = useActionState(signIn, null);

  return (
    <main className="grid min-h-svh place-items-center px-5">
      <form action={formAction} className="w-full max-w-sm space-y-5">
        <div className="space-y-2">
          <p className="type-eyebrow">RideGlow</p>
          <h1 className="type-display text-[1.5rem]">Back-office</h1>
        </div>

        <label className="block space-y-2">
          <span className="text-[0.8125rem] text-chalk-dim">Mot de passe</span>
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="w-full rounded-card border border-line bg-ink-raised px-4 py-3 text-chalk outline-none focus:border-glow"
          />
        </label>

        {error && (
          <p role="alert" className="text-[0.8125rem] text-glow-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-card bg-glow px-6 py-3 text-[0.8125rem] font-semibold uppercase tracking-[0.1em] text-ink disabled:opacity-50"
        >
          {pending ? "Vérification" : "Entrer"}
        </button>
      </form>
    </main>
  );
}
