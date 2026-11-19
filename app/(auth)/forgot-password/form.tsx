"use client";

import Link from "next/link";
import { useActionState } from "react";
import { requestPasswordReset } from "../actions";
import { SubmitButton } from "@/components/submit-button";
import { FormMessage } from "@/components/form-message";
import type { FormState } from "@/lib/types";

export function ForgotForm() {
  const [state, action] = useActionState<FormState, FormData>(requestPasswordReset, {});
  return (
    <form action={action} className="space-y-4" noValidate>
      <FormMessage state={state} />
      <div>
        <label htmlFor="email" className="label">
          E-mail da conta
        </label>
        <input id="email" name="email" type="email" autoComplete="email" required className="input" />
      </div>
      <SubmitButton pendingLabel="Enviando…" className="btn w-full">
        Enviar link
      </SubmitButton>
      <p className="text-center text-sm">
        <Link href="/login" className="text-accent hover:underline">
          Voltar para entrar
        </Link>
      </p>
    </form>
  );
}
