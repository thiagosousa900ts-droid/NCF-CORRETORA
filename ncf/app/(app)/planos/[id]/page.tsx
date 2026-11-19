import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireContext } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import { PlanForm, type PlanValues } from "../plan-form";
import { FeaturesSection, NetworkSection, type FeatureRow, type NetworkRow } from "../plan-details";

export const metadata: Metadata = { title: "Produto" };

export default async function PlanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { member } = await requireContext();
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const supabase = await createClient();
  const { data } = await supabase.from("health_plans").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  const p = data as unknown as Record<string, string | null>;

  const [{ data: ops }, { data: feats }, { data: net }] = await Promise.all([
    supabase.from("operators").select("id, name").order("name"),
    supabase.from("plan_features").select("id, name, description, validation_status, source, reference_date").eq("health_plan_id", id).order("name"),
    supabase
      .from("plan_network_entries")
      .select("id, entry_type, name, city, state, notes, validation_status, source, reference_date")
      .eq("health_plan_id", id)
      .order("name"),
  ]);
  const operators = (ops ?? []) as { id: string; name: string }[];
  const canEdit = member.role === "admin";

  const s = (k: string) => p[k] ?? "";
  const values: PlanValues = {
    id: s("id"),
    operator_id: s("operator_id"),
    commercial_name: s("commercial_name"),
    product_code: s("product_code"),
    ans_product_registry: s("ans_product_registry"),
    segmentation: s("segmentation"),
    contract_type: s("contract_type"),
    coverage_area: s("coverage_area"),
    accommodation: s("accommodation"),
    copay_modality: s("copay_modality"),
    reimbursement: s("reimbursement"),
    grace_periods: s("grace_periods"),
    network_summary: s("network_summary"),
    additional_benefits: s("additional_benefits"),
    restrictions: s("restrictions"),
    availability: s("availability"),
    validation_status: s("validation_status"),
    source: s("source"),
    reference_date: s("reference_date"),
    notes: s("notes"),
  };
  const operatorName = operators.find((o) => o.id === values.operator_id)?.name;

  return (
    <div className="space-y-6">
      <div>
        <Link href="/planos" className="text-sm text-accent hover:underline">
          ← Produtos
        </Link>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900">{values.commercial_name}</h1>
        {operatorName && <p className="text-sm text-slate-600">{operatorName}</p>}
      </div>
      <PlanForm values={values} operators={operators} canEdit={canEdit} />
      <FeaturesSection planId={id} rows={(feats ?? []) as unknown as FeatureRow[]} canEdit={canEdit} />
      <NetworkSection planId={id} rows={(net ?? []) as unknown as NetworkRow[]} canEdit={canEdit} />
    </div>
  );
}
