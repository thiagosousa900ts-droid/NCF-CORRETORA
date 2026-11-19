"use client";

import { useActionState } from "react";
import { saveOperator } from "./actions";
import { SubmitButton } from "@/components/submit-button";
import { FormMessage } from "@/components/form-message";
import { Field } from "@/components/field";
import type { FormState } from "@/lib/types";

export type OperatorValues = {
  id?: string;
  name: string;
  ans_registry: string;
  availability: string;
  contacts: string;
  notes: string;
};

export const EMPTY_OPERATOR: OperatorValues = {
  name: "",
  ans_registry: "",
  availability: "disponivel",
  contacts: "",
  notes: "",
};

export function OperatorForm({
  values,
  canEdit,
  logoUrl,
}: {
  values: OperatorValues;
  canEdit: boolean;
  logoUrl: string | null;
}) {
  const [state, action] = useActionState<FormState, FormData>(saveOperator, {});
  return (
    <form action={action} className="card space-y-4 p-6">
      {values.id && <input type="hidden" name="id" value={values.id} />}
      <FormMessage state={state} />
      <fieldset disabled={!canEdit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="name" label="Nome da operadora">
            <input id="name" name="name" defaultValue={values.name} required className="input" />
          </Field>
          <Field id="ans_registry" label="Registro ANS">
            <input id="ans_registry" name="ans_registry" defaultValue={values.ans_registry} className="input" />
          </Field>
          <Field id="availability" label="Disponibilidade">
            <select id="availability" name="availability" defaultValue={values.availability} className="input">
              <option value="disponivel">Disponível</option>
              <option value="indisponivel">Indisponível</option>
              <option value="suspensa">Suspensa</option>
            </select>
          </Field>
          <Field id="logo" label="Logotipo" hint="PNG, JPG ou WebP, até 2 MB.">
            <div className="flex items-center gap-3">
              {logoUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoUrl} alt="Logotipo atual" className="max-h-10 w-auto rounded border border-slate-200 bg-white p-1" />
              )}
              <input id="logo" name="logo" type="file" accept="image/png,image/jpeg,image/webp" className="text-sm" />
            </div>
          </Field>
        </div>
        <Field id="contacts" label="Contatos comerciais" hint="Um por linha. Ex.: Maria Souza — maria@operadora.com — (11) 99999-0000">
          <textarea id="contacts" name="contacts" rows={3} defaultValue={values.contacts} className="input" />
        </Field>
        <Field id="notes" label="Observações">
          <textarea id="notes" name="notes" rows={3} defaultValue={values.notes} className="input" />
        </Field>
      </fieldset>
      {canEdit ? (
        <SubmitButton>{values.id ? "Salvar operadora" : "Cadastrar operadora"}</SubmitButton>
      ) : (
        <p className="text-sm text-slate-600">Somente administradores alteram operadoras.</p>
      )}
    </form>
  );
}
