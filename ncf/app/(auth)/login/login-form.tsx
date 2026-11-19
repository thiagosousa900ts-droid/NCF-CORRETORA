"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login } from "../actions";
import { SubmitButton } from "@/components/submit-button";
import { FormMessage } from "@/components/form-message";
import type { FormState } from "@/lib/types";

export function LoginForm({ notice }: { notice?: string }) {
  const [state, action] = useActionState<FormState, FormData>(login, {});
  return (
    <form action={action} className="space-y-4" noValidate>
      {notice && <p className="alert-error">{notice}</p>}
      <FormMessage state={state} />
      <div>
        <label htmlFor="email" className="label">
          E-mail
        </label>
        <input id="email" name="email" type="email" autoComplete="email" required className="input" />
      </div>
      <div>
        <label htmlFor="password" className="label">
          Senha
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="input"
        />
      </div>
      <SubmitButton pendingLabel="Entrando…" className="btn w-full">
        Entrar
      </SubmitButton>
      <p className="text-center text-sm">
        <Link href="/forgot-password" className="text-accent hover:underline">
          Esqueci minha senha
        </Link>
      </p>
    </form>
  );
}
