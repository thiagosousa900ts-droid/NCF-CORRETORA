"use client";

import { useActionState, useState } from "react";
import { createClientAction, updateClientAction, setClientArchived, addInteraction } from "./actions";
import { SubmitButton } from "@/components/submit-button";
import { FormMessage } from "@/components/form-message";
import { DataList, Field } from "@/components/field";
import { AGE_BANDS, CHANNEL_LABEL, CONTRACT_TYPES, UFS } from "@/lib/constants";
import type { FormState } from "@/lib/types";

export type ClientValues = {
  id?: string;
  name: string;
  person_type: "pf" | "pj";
  document: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  lives_count: string;
  desired_contract_type: string;
  pj_contract_kind: string;
  notes: string;
  owner_id: string;
  bands: Record<string, number>;
};

export const EMPTY_CLIENT: ClientValues = {
  name: "",
  person_type: "pf",
  document: "",
  email: "",
  phone: "",
  city: "",
  state: "",
  lives_count: "",
  desired_contract_type: "",
  pj_contract_kind: "",
  notes: "",
  owner_id: "",
  bands: {},
};

export function ClientForm({
  values,
  owners,
  canChooseOwner,
}: {
  values: ClientValues;
  owners: { id: string; name: string }[];
  canChooseOwner: boolean;
}) {
  const isEdit = Boolean(values.id);
  const [state, action] = useActionState<FormState, FormData>(isEdit ? updateClientAction : createClientAction, {});
  const [personType, setPersonType] = useState(values.person_type);

  return (
    <form action={action} className="space-y-6">
      {values.id && <input type="hidden" name="id" value={values.id} />}
      <FormMessage state={state} />

      <section className="card space-y-4 p-6">
        <h2 className="text-lg font-semibold text-slate-900">Identificação</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="name" label={personType === "pj" ? "Razão social" : "Nome do cliente"} className="sm:col-span-2">
            <input id="name" name="name" defaultValue={values.name} required className="input" />
          </Field>
          <Field id="person_type" label="Tipo">
            <select
              id="person_type"
              name="person_type"
              value={personType}
              onChange={(e) => setPersonType(e.target.value as "pf" | "pj")}
              className="input"
            >
              <option value="pf">Pessoa física</option>
              <option value="pj">Pessoa jurídica</option>
            </select>
          </Field>
          <Field id="document" label={personType === "pj" ? "CNPJ" : "CPF"} hint="Opcional. Só números ou com pontuação.">
            <input id="document" name="document" defaultValue={values.document} inputMode="numeric" className="input" />
          </Field>
          <Field id="email" label="E-mail">
            <input id="email" name="email" type="email" defaultValue={values.email} className="input" />
          </Field>
          <Field id="phone" label="Telefone">
            <input id="phone" name="phone" defaultValue={values.phone} autoComplete="off" className="input" />
          </Field>
          <Field id="city" label="Município">
            <input id="city" name="city" defaultValue={values.city} className="input" />
          </Field>
          <Field id="state" label="UF">
            <select id="state" name="state" defaultValue={values.state} className="input">
              <option value="">—</option>
              {UFS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </section>

      <section className="card space-y-4 p-6">
        <h2 className="text-lg font-semibold text-slate-900">Contratação pretendida</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="desired_contract_type" label="Tipo de contratação">
            <input
              id="desired_contract_type"
              name="desired_contract_type"
              list="contract-types"
              defaultValue={values.desired_contract_type}
              className="input"
            />
            <DataList id="contract-types" options={CONTRACT_TYPES} />
          </Field>
          {personType === "pj" ? (
            <Field id="pj_contract_kind" label="Contrato PJ">
              <select id="pj_contract_kind" name="pj_contract_kind" defaultValue={values.pj_contract_kind} className="input">
                <option value="">—</option>
                <option value="pme">PME</option>
                <option value="empresarial">Empresarial</option>
              </select>
            </Field>
          ) : (
            <input type="hidden" name="pj_contract_kind" value="" />
          )}
          <Field id="lives_count" label="Quantidade de beneficiários" hint="Se preencher as faixas etárias, o total é calculado por elas.">
            <input id="lives_count" name="lives_count" type="number" min={0} defaultValue={values.lives_count} className="input" />
          </Field>
          {canChooseOwner && (
            <Field id="owner_id" label="Corretor responsável">
              <select id="owner_id" name="owner_id" defaultValue={values.owner_id} className="input">
                <option value="">Eu mesmo</option>
                {owners.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>
            </Field>
          )}
        </div>

        <fieldset>
          <legend className="label">Faixas etárias (quantidade de vidas)</legend>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {AGE_BANDS.map((faixa, i) => (
              <div key={faixa}>
                <label htmlFor={`band_${i}`} className="mb-1 block text-xs text-slate-600">
                  {faixa}
                </label>
                <input
                  id={`band_${i}`}
                  name={`band_${i}`}
                  type="number"
                  min={0}
                  defaultValue={values.bands[faixa] ?? ""}
                  className="input"
                />
              </div>
            ))}
          </div>
        </fieldset>

        <Field
          id="notes"
          label="Observações comerciais"
          hint="Não registre histórico clínico, diagnósticos ou outras informações de saúde."
        >
          <textarea id="notes" name="notes" rows={3} defaultValue={values.notes} className="input" />
        </Field>
      </section>

      <SubmitButton>{isEdit ? "Salvar cliente" : "Cadastrar cliente"}</SubmitButton>
    </form>
  );
}

export function ArchiveForm({ id, archived }: { id: string; archived: boolean }) {
  const [state, action] = useActionState<FormState, FormData>(setClientArchived, {});
  return (
    <form action={action} className="flex items-center gap-3">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="archive" value={archived ? "false" : "true"} />
      <SubmitButton className={archived ? "btn-secondary" : "btn-danger"} pendingLabel="Aguarde…">
        {archived ? "Reativar cliente" : "Arquivar cliente"}
      </SubmitButton>
      <FormMessage state={state} />
    </form>
  );
}

export function InteractionForm({ clientId }: { clientId: string }) {
  const [state, action] = useActionState<FormState, FormData>(addInteraction, {});
  return (
    <form action={action} className="space-y-3 border-b border-slate-100 p-6">
      <input type="hidden" name="client_id" value={clientId} />
      <FormMessage state={state} />
      <div className="grid gap-3 sm:grid-cols-[180px_1fr]">
        <Field id="channel" label="Canal">
          <select id="channel" name="channel" defaultValue="" className="input">
            <option value="">—</option>
            {Object.entries(CHANNEL_LABEL).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </Field>
        <Field id="summary" label="Resumo do atendimento">
          <textarea id="summary" name="summary" rows={2} required className="input" />
        </Field>
      </div>
      <SubmitButton pendingLabel="Registrando…" className="btn-secondary">
        Registrar atendimento
      </SubmitButton>
    </form>
  );
}
