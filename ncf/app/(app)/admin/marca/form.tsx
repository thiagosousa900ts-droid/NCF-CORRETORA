"use client";

import { useActionState } from "react";
import { saveBrand } from "./actions";
import { SubmitButton } from "@/components/submit-button";
import { FormMessage } from "@/components/form-message";
import { Field } from "@/components/field";
import type { FormState, OrgSettings } from "@/lib/types";

export function BrandForm({
  orgName,
  settings,
  logoUrl,
}: {
  orgName: string;
  settings: OrgSettings;
  logoUrl: string | null;
}) {
  const [state, action] = useActionState<FormState, FormData>(saveBrand, {});
  const s = settings;
  return (
    <form action={action} className="space-y-6">
      <FormMessage state={state} />

      <section className="card space-y-4 p-6">
        <h2 className="text-lg font-semibold text-slate-900">Identidade</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="org_name" label="Nome da corretora">
            <input id="org_name" name="org_name" defaultValue={orgName} required className="input" />
          </Field>
          <Field id="trade_name" label="Nome comercial" hint="Aparece no menu e nas apresentações.">
            <input id="trade_name" name="trade_name" defaultValue={s.trade_name ?? ""} className="input" />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field id="primary_color" label="Cor principal">
            <input id="primary_color" name="primary_color" type="color" defaultValue={s.primary_color} className="h-10 w-full cursor-pointer rounded-md border border-slate-300 bg-white p-1" />
          </Field>
          <Field id="secondary_color" label="Cor secundária">
            <input id="secondary_color" name="secondary_color" type="color" defaultValue={s.secondary_color} className="h-10 w-full cursor-pointer rounded-md border border-slate-300 bg-white p-1" />
          </Field>
          <Field id="accent_color" label="Cor de destaque">
            <input id="accent_color" name="accent_color" type="color" defaultValue={s.accent_color} className="h-10 w-full cursor-pointer rounded-md border border-slate-300 bg-white p-1" />
          </Field>
        </div>
        <Field id="logo" label="Logotipo" hint="PNG, JPG ou WebP, até 2 MB. Deixe vazio para manter o atual.">
          <div className="flex items-center gap-4">
            {logoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt="Logotipo atual" className="max-h-12 w-auto rounded border border-slate-200 bg-white p-1" />
            )}
            <input id="logo" name="logo" type="file" accept="image/png,image/jpeg,image/webp" className="text-sm" />
          </div>
        </Field>
      </section>

      <section className="card space-y-4 p-6">
        <h2 className="text-lg font-semibold text-slate-900">Contato</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="contact_email" label="E-mail">
            <input id="contact_email" name="contact_email" type="email" defaultValue={s.contact_email ?? ""} className="input" />
          </Field>
          <Field id="contact_phone" label="Telefone">
            <input id="contact_phone" name="contact_phone" defaultValue={s.contact_phone ?? ""} className="input" />
          </Field>
          <Field id="website" label="Site">
            <input id="website" name="website" defaultValue={s.website ?? ""} className="input" />
          </Field>
          <Field id="address" label="Endereço">
            <input id="address" name="address" defaultValue={s.address ?? ""} className="input" />
          </Field>
        </div>
      </section>

      <section className="card space-y-4 p-6">
        <h2 className="text-lg font-semibold text-slate-900">Apresentações e acesso</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="default_validity_days" label="Validade padrão das propostas (dias)">
            <input id="default_validity_days" name="default_validity_days" type="number" min={1} max={365} defaultValue={s.default_validity_days} className="input" />
          </Field>
          <Field id="max_users" label="Limite de usuários ativos">
            <input id="max_users" name="max_users" type="number" min={1} max={500} defaultValue={s.max_users} className="input" />
          </Field>
        </div>
        <Field id="intro_text" label="Texto de abertura">
          <textarea id="intro_text" name="intro_text" rows={3} defaultValue={s.intro_text ?? ""} className="input" />
        </Field>
        <Field id="closing_text" label="Texto de encerramento">
          <textarea id="closing_text" name="closing_text" rows={3} defaultValue={s.closing_text ?? ""} className="input" />
        </Field>
        <Field id="legal_disclaimer" label="Aviso sobre as condições" hint="Incluído em todas as apresentações.">
          <textarea id="legal_disclaimer" name="legal_disclaimer" rows={2} defaultValue={s.legal_disclaimer} required className="input" />
        </Field>
      </section>

      <SubmitButton>Salvar configurações</SubmitButton>
    </form>
  );
}
