"use client";

import { useActionState } from "react";
import { setNewPassword } from "../actions";
import { SubmitButton } from "@/components/submit-button";
import { FormMessage } from "@/components/form-message";
import type { FormState } from "@/lib/types";

export function ResetForm() {
  const [state, action] = useActionState<FormState, FormData>(setNewPassword, {});
  return (
    <form action={action} className="space-y-4" noValidate>
      <FormMessage state={state} />
      <div>
        <label htmlFor="password" className="label">
          Nova senha
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={10}
          className="input"
        />
        <p className="mt-1 text-xs text-slate-500">Mínimo de 10 caracteres, com letras e números.</p>
      </div>
      <div>
        <label htmlFor="confirm" className="label">
          Repita a nova senha
        </label>
        <input id="confirm" name="confirm" type="password" autoComplete="new-password" required className="input" />
      </div>
      <SubmitButton className="btn w-full">Salvar senha</SubmitButton>
    </form>
  );
}
