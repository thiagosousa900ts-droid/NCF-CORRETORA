"use client";

import { useActionState } from "react";
import { savePlan } from "./actions";
import { SubmitButton } from "@/components/submit-button";
import { FormMessage } from "@/components/form-message";
import { DataList, Field } from "@/components/field";
import {
  ACCOMMODATIONS,
  CONTRACT_TYPES,
  COPAY_MODALITIES,
  COVERAGE_AREAS,
  SEGMENTATIONS,
  VALIDATION_LABEL,
} from "@/lib/constants";
import type { FormState } from "@/lib/types";

export type PlanValues = {
  id?: string;
  operator_id: string;
  commercial_name: string;
  product_code: string;
  ans_product_registry: string;
  segmentation: string;
  contract_type: string;
  coverage_area: string;
  accommodation: string;
  copay_modality: string;
  reimbursement: string;
  grace_periods: string;
  network_summary: string;
  additional_benefits: string;
  restrictions: string;
  availability: string;
  validation_status: string;
  source: string;
  reference_date: string;
  notes: string;
};

export const EMPTY_PLAN: PlanValues = {
  operator_id: "",
  commercial_name: "",
  product_code: "",
  ans_product_registry: "",
  segmentation: "",
  contract_type: "",
  coverage_area: "",
  accommodation: "",
  copay_modality: "",
  reimbursement: "",
  grace_periods: "",
  network_summary: "",
  additional_benefits: "",
  restrictions: "",
  availability: "disponivel",
  validation_status: "pendente_validacao",
  source: "",
  reference_date: "",
  notes: "",
};

export function PlanForm({
  values,
  operators,
  canEdit,
}: {
  values: PlanValues;
  operators: { id: string; name: string }[];
  canEdit: boolean;
}) {
  const [state, action] = useActionState<FormState, FormData>(savePlan, {});
  const v = values;
  return (
    <form action={action} className="space-y-6">
      {v.id && <input type="hidden" name="id" value={v.id} />}
      <FormMessage state={state} />
      <fieldset disabled={!canEdit} className="space-y-6">
        <section className="card space-y-4 p-6">
          <h2 className="text-lg font-semibold text-slate-900">Produto</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="operator_id" label="Operadora">
              <select id="operator_id" name="operator_id" defaultValue={v.operator_id} required className="input">
                <option value="" disabled>
                  Escolha…
                </option>
                {operators.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field id="commercial_name" label="Nome comercial do plano">
              <input id="commercial_name" name="commercial_name" defaultValue={v.commercial_name} required className="input" />
            </Field>
            <Field id="product_code" label="Identificação do produto">
              <input id="product_code" name="product_code" defaultValue={v.product_code} className="input" />
            </Field>
            <Field id="ans_product_registry" label="Registro do produto (ANS)">
              <input id="ans_product_registry" name="ans_product_registry" defaultValue={v.ans_product_registry} className="input" />
            </Field>
            <Field id="segmentation" label="Segmentação assistencial">
              <input id="segmentation" name="segmentation" list="seg" defaultValue={v.segmentation} className="input" />
              <DataList id="seg" options={SEGMENTATIONS} />
            </Field>
            <Field id="contract_type" label="Tipo de contratação">
              <input id="contract_type" name="contract_type" list="ctype" defaultValue={v.contract_type} className="input" />
              <DataList id="ctype" options={CONTRACT_TYPES} />
            </Field>
            <Field id="coverage_area" label="Abrangência geográfica">
              <input id="coverage_area" name="coverage_area" list="cov" defaultValue={v.coverage_area} className="input" />
              <DataList id="cov" options={COVERAGE_AREAS} />
            </Field>
            <Field id="accommodation" label="Acomodação">
              <input id="accommodation" name="accommodation" list="acc" defaultValue={v.accommodation} className="input" />
              <DataList id="acc" options={ACCOMMODATIONS} />
            </Field>
            <Field id="copay_modality" label="Coparticipação">
              <input id="copay_modality" name="copay_modality" list="copay" defaultValue={v.copay_modality} className="input" />
              <DataList id="copay" options={COPAY_MODALITIES} />
            </Field>
            <Field id="availability" label="Disponibilidade">
              <select id="availability" name="availability" defaultValue={v.availability} className="input">
                <option value="disponivel">Disponível</option>
                <option value="indisponivel">Indisponível</option>
                <option value="suspenso">Suspenso</option>
              </select>
            </Field>
          </div>
        </section>

        <section className="card space-y-4 p-6">
          <h2 className="text-lg font-semibold text-slate-900">Condições</h2>
          <Field id="reimbursement" label="Reembolso">
            <textarea id="reimbursement" name="reimbursement" rows={2} defaultValue={v.reimbursement} className="input" />
          </Field>
          <Field id="grace_periods" label="Carências">
            <textarea id="grace_periods" name="grace_periods" rows={2} defaultValue={v.grace_periods} className="input" />
          </Field>
          <Field id="network_summary" label="Rede credenciada (resumo informado para este produto)">
            <textarea id="network_summary" name="network_summary" rows={3} defaultValue={v.network_summary} className="input" />
          </Field>
          <Field id="additional_benefits" label="Benefícios adicionais">
            <textarea id="additional_benefits" name="additional_benefits" rows={2} defaultValue={v.additional_benefits} className="input" />
          </Field>
          <Field id="restrictions" label="Restrições e condições relevantes">
            <textarea id="restrictions" name="restrictions" rows={2} defaultValue={v.restrictions} className="input" />
          </Field>
          <Field id="notes" label="Observações">
            <textarea id="notes" name="notes" rows={2} defaultValue={v.notes} className="input" />
          </Field>
        </section>

        <section className="card space-y-4 p-6">
          <h2 className="text-lg font-semibold text-slate-900">Origem da informação</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field id="validation_status" label="Situação">
              <select id="validation_status" name="validation_status" defaultValue={v.validation_status} className="input">
                {Object.entries(VALIDATION_LABEL).map(([k, label]) => (
                  <option key={k} value={k}>
                    {label}
                  </option>
                ))}
              </select>
            </Field>
            <Field id="source" label="Fonte">
              <input id="source" name="source" defaultValue={v.source} placeholder="Ex.: tabela de preços set/2026" className="input" />
            </Field>
            <Field id="reference_date" label="Data de referência">
              <input id="reference_date" name="reference_date" type="date" defaultValue={v.reference_date} className="input" />
            </Field>
          </div>
        </section>
      </fieldset>

      {canEdit ? (
        <SubmitButton>{v.id ? "Salvar produto" : "Cadastrar produto"}</SubmitButton>
      ) : (
        <p className="text-sm text-slate-600">Somente administradores alteram produtos.</p>
      )}
    </form>
  );
}
