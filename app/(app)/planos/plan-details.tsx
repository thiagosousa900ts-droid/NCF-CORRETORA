"use client";

import { useActionState } from "react";
import { addFeature, addNetworkEntry, deleteFeature, deleteNetworkEntry } from "./actions";
import { SubmitButton } from "@/components/submit-button";
import { FormMessage } from "@/components/form-message";
import { Field } from "@/components/field";
import { ValidationBadge } from "@/components/validation-badge";
import { NETWORK_TYPE_LABEL, UFS, VALIDATION_LABEL, type NetworkType, type ValidationStatus } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import type { FormState } from "@/lib/types";

export type FeatureRow = {
  id: string;
  name: string;
  description: string | null;
  validation_status: ValidationStatus;
  source: string | null;
  reference_date: string | null;
};

export type NetworkRow = {
  id: string;
  entry_type: NetworkType;
  name: string;
  city: string | null;
  state: string | null;
  notes: string | null;
  validation_status: ValidationStatus;
  source: string | null;
  reference_date: string | null;
};

function ValidationFields({ prefix }: { prefix: string }) {
  return (
    <>
      <Field id={`${prefix}_status`} label="Situação">
        <select id={`${prefix}_status`} name="validation_status" defaultValue="pendente_validacao" className="input">
          {Object.entries(VALIDATION_LABEL).map(([k, label]) => (
            <option key={k} value={k}>
              {label}
            </option>
          ))}
        </select>
      </Field>
      <Field id={`${prefix}_source`} label="Fonte">
        <input id={`${prefix}_source`} name="source" className="input" />
      </Field>
      <Field id={`${prefix}_date`} label="Data de referência">
        <input id={`${prefix}_date`} name="reference_date" type="date" className="input" />
      </Field>
    </>
  );
}

function DeleteButton({ action, planId, id, label }: { action: typeof deleteFeature; planId: string; id: string; label: string }) {
  const [state, run] = useActionState<FormState, FormData>(action, {});
  return (
    <form action={run} className="flex items-center gap-2">
      <input type="hidden" name="plan_id" value={planId} />
      <input type="hidden" name="id" value={id} />
      <SubmitButton className="btn-danger" pendingLabel="Removendo…">
        {label}
      </SubmitButton>
      {state.error && <span className="text-sm text-red-700">{state.error}</span>}
    </form>
  );
}

export function FeaturesSection({ planId, rows, canEdit }: { planId: string; rows: FeatureRow[]; canEdit: boolean }) {
  const [state, action] = useActionState<FormState, FormData>(addFeature, {});
  return (
    <section className="card" aria-label="Benefícios do produto">
      <h2 className="px-6 pt-6 text-lg font-semibold text-slate-900">Benefícios do produto</h2>
      {canEdit && (
        <form action={action} className="space-y-3 border-b border-slate-100 p-6">
          <input type="hidden" name="plan_id" value={planId} />
          <FormMessage state={state} />
          <div className="grid gap-3 sm:grid-cols-2">
            <Field id="feat_name" label="Benefício">
              <input id="feat_name" name="name" required className="input" />
            </Field>
            <Field id="feat_desc" label="Descrição">
              <input id="feat_desc" name="description" className="input" />
            </Field>
            <ValidationFields prefix="feat" />
          </div>
          <SubmitButton className="btn-secondary" pendingLabel="Adicionando…">
            Adicionar benefício
          </SubmitButton>
        </form>
      )}
      {rows.length === 0 ? (
        <p className="p-6 text-sm text-slate-600">Nenhum benefício cadastrado.</p>
      ) : (
        <ul>
          {rows.map((r) => (
            <li key={r.id} className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 px-6 py-4 last:border-b-0">
              <div className="min-w-0">
                <p className="font-medium text-slate-900">
                  {r.name} <ValidationBadge status={r.validation_status} />
                </p>
                {r.description && <p className="text-sm text-slate-700">{r.description}</p>}
                <p className="text-xs text-slate-500">
                  {[r.source, r.reference_date ? `ref. ${formatDate(r.reference_date)}` : null].filter(Boolean).join(" · ") ||
                    "Sem fonte informada"}
                </p>
              </div>
              {canEdit && <DeleteButton action={deleteFeature} planId={planId} id={r.id} label="Remover" />}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function NetworkSection({ planId, rows, canEdit }: { planId: string; rows: NetworkRow[]; canEdit: boolean }) {
  const [state, action] = useActionState<FormState, FormData>(addNetworkEntry, {});
  const grouped = (Object.keys(NETWORK_TYPE_LABEL) as NetworkType[])
    .map((t) => ({ type: t, items: rows.filter((r) => r.entry_type === t) }))
    .filter((g) => g.items.length > 0);

  return (
    <section className="card" aria-label="Rede credenciada do produto">
      <div className="px-6 pt-6">
        <h2 className="text-lg font-semibold text-slate-900">Rede credenciada deste produto</h2>
        <p className="mt-1 text-sm text-slate-600">
          Registre só o que foi informado para este produto. A rede de uma operadora não vale para todos os seus planos.
        </p>
      </div>
      {canEdit && (
        <form action={action} className="space-y-3 border-b border-slate-100 p-6">
          <input type="hidden" name="plan_id" value={planId} />
          <FormMessage state={state} />
          <div className="grid gap-3 sm:grid-cols-4">
            <Field id="net_type" label="Tipo">
              <select id="net_type" name="entry_type" defaultValue="hospital" className="input">
                {Object.entries(NETWORK_TYPE_LABEL).map(([k, label]) => (
                  <option key={k} value={k}>
                    {label}
                  </option>
                ))}
              </select>
            </Field>
            <Field id="net_name" label="Nome" className="sm:col-span-2">
              <input id="net_name" name="name" required className="input" />
            </Field>
            <div className="grid grid-cols-[1fr_90px] gap-2">
              <Field id="net_city" label="Município">
                <input id="net_city" name="city" className="input" />
              </Field>
              <Field id="net_uf" label="UF">
                <select id="net_uf" name="state" defaultValue="" className="input">
                  <option value="">—</option>
                  {UFS.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <ValidationFields prefix="net" />
            <Field id="net_notes" label="Observações" className="sm:col-span-4">
              <input id="net_notes" name="notes" className="input" />
            </Field>
          </div>
          <SubmitButton className="btn-secondary" pendingLabel="Adicionando…">
            Adicionar à rede
          </SubmitButton>
        </form>
      )}
      {grouped.length === 0 ? (
        <p className="p-6 text-sm text-slate-600">Nenhuma entrada de rede cadastrada para este produto.</p>
      ) : (
        grouped.map((g) => (
          <div key={g.type}>
            <h3 className="bg-slate-50 px-6 py-2 text-sm font-medium text-slate-700">
              {NETWORK_TYPE_LABEL[g.type]} ({g.items.length})
            </h3>
            <ul>
              {g.items.map((r) => (
                <li key={r.id} className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 px-6 py-3 last:border-b-0">
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900">
                      {r.name} <ValidationBadge status={r.validation_status} />
                    </p>
                    <p className="text-sm text-slate-600">
                      {[[r.city, r.state].filter(Boolean).join("/"), r.notes].filter(Boolean).join(" · ") || "—"}
                    </p>
                    <p className="text-xs text-slate-500">
                      {[r.source, r.reference_date ? `ref. ${formatDate(r.reference_date)}` : null].filter(Boolean).join(" · ") ||
                        "Sem fonte informada"}
                    </p>
                  </div>
                  {canEdit && <DeleteButton action={deleteNetworkEntry} planId={planId} id={r.id} label="Remover" />}
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </section>
  );
}
