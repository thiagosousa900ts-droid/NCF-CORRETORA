"use client";

import { useActionState } from "react";
import { changePassword, updateProfile } from "./actions";
import { SubmitButton } from "@/components/submit-button";
import { FormMessage } from "@/components/form-message";
import type { FormState } from "@/lib/types";

export function ProfileForm({ fullName, phone, email }: { fullName: string; phone: string; email: string }) {
  const [state, action] = useActionState<FormState, FormData>(updateProfile, {});
  return (
    <form action={action} className="card space-y-4 p-6">
      <h2 className="text-lg font-semibold text-slate-900">Seus dados</h2>
      <FormMessage state={state} />
      <div>
        <label htmlFor="email" className="label">
          E-mail
        </label>
        <input id="email" value={email} readOnly className="input bg-slate-50 text-slate-500" />
      </div>
      <div>
        <label htmlFor="full_name" className="label">
          Nome
        </label>
        <input id="full_name" name="full_name" defaultValue={fullName} required className="input" />
      </div>
      <div>
        <label htmlFor="phone" className="label">
          Telefone
        </label>
        <input id="phone" name="phone" defaultValue={phone} autoComplete="tel" className="input" />
      </div>
      <SubmitButton>Salvar dados</SubmitButton>
    </form>
  );
}

export function PasswordForm() {
  const [state, action] = useActionState<FormState, FormData>(changePassword, {});
  return (
    <form action={action} className="card space-y-4 p-6">
      <h2 className="text-lg font-semibold text-slate-900">Alterar senha</h2>
      <FormMessage state={state} />
      <div>
        <label htmlFor="password" className="label">
          Nova senha
        </label>
        <input id="password" name="password" type="password" autoComplete="new-password" required className="input" />
        <p className="mt-1 text-xs text-slate-500">Mínimo de 10 caracteres, com letras e números.</p>
      </div>
      <div>
        <label htmlFor="confirm" className="label">
          Repita a nova senha
        </label>
        <input id="confirm" name="confirm" type="password" autoComplete="new-password" required className="input" />
      </div>
      <SubmitButton>Alterar senha</SubmitButton>
    </form>
  );
}
