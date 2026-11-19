"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import { featureSchema, firstIssue, networkSchema, planSchema } from "@/lib/validation";
import type { FormState } from "@/lib/types";

const PLAN_FIELDS = [
  "operator_id",
  "commercial_name",
  "product_code",
  "ans_product_registry",
  "segmentation",
  "contract_type",
  "coverage_area",
  "accommodation",
  "copay_modality",
  "reimbursement",
  "grace_periods",
  "network_summary",
  "additional_benefits",
  "restrictions",
  "availability",
  "validation_status",
  "source",
  "reference_date",
  "notes",
] as const;

export async function savePlan(_prev: FormState, formData: FormData): Promise<FormState> {
  const { member } = await requireAdmin();
  const id = String(formData.get("id") ?? "");

  const parsed = planSchema.safeParse(Object.fromEntries(PLAN_FIELDS.map((k) => [k, formData.get(k) ?? ""])));
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  const supabase = await createClient();
  if (id) {
    const { data, error } = await supabase.from("health_plans").update(parsed.data).eq("id", id).select("id");
    if (error) return { error: "Não foi possível salvar o produto." };
    if (!data || data.length === 0) return { error: "Produto não encontrado." };
    revalidatePath(`/planos/${id}`);
    revalidatePath("/planos");
    return { success: "Produto salvo." };
  }

  const { data, error } = await supabase
    .from("health_plans")
    .insert({ ...parsed.data, organization_id: member.organization_id })
    .select("id")
    .single();
  if (error || !data) return { error: "Não foi possível cadastrar o produto. Confira a operadora escolhida." };
  revalidatePath("/planos");
  redirect(`/planos/${data.id}`);
}

export async function addFeature(_prev: FormState, formData: FormData): Promise<FormState> {
  const { member } = await requireAdmin();
  const planId = String(formData.get("plan_id") ?? "");
  const parsed = featureSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") ?? "",
    validation_status: formData.get("validation_status"),
    source: formData.get("source") ?? "",
    reference_date: formData.get("reference_date") ?? "",
  });
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  const supabase = await createClient();
  const { error } = await supabase
    .from("plan_features")
    .insert({ ...parsed.data, organization_id: member.organization_id, health_plan_id: planId });
  if (error) return { error: "Não foi possível adicionar o benefício." };
  revalidatePath(`/planos/${planId}`);
  return { success: "Benefício adicionado." };
}

export async function deleteFeature(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const planId = String(formData.get("plan_id") ?? "");
  const supabase = await createClient();
  const { error } = await supabase.from("plan_features").delete().eq("id", String(formData.get("id") ?? ""));
  if (error) return { error: "Não foi possível remover." };
  revalidatePath(`/planos/${planId}`);
  return { success: "Removido." };
}

export async function addNetworkEntry(_prev: FormState, formData: FormData): Promise<FormState> {
  const { member } = await requireAdmin();
  const planId = String(formData.get("plan_id") ?? "");
  const parsed = networkSchema.safeParse({
    entry_type: formData.get("entry_type"),
    name: formData.get("name"),
    city: formData.get("city") ?? "",
    state: formData.get("state") ?? "",
    notes: formData.get("notes") ?? "",
    validation_status: formData.get("validation_status"),
    source: formData.get("source") ?? "",
    reference_date: formData.get("reference_date") ?? "",
  });
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  const supabase = await createClient();
  const { error } = await supabase
    .from("plan_network_entries")
    .insert({ ...parsed.data, organization_id: member.organization_id, health_plan_id: planId });
  if (error) return { error: "Não foi possível adicionar à rede." };
  revalidatePath(`/planos/${planId}`);
  return { success: "Adicionado à rede do produto." };
}

export async function deleteNetworkEntry(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const planId = String(formData.get("plan_id") ?? "");
  const supabase = await createClient();
  const { error } = await supabase.from("plan_network_entries").delete().eq("id", String(formData.get("id") ?? ""));
  if (error) return { error: "Não foi possível remover." };
  revalidatePath(`/planos/${planId}`);
  return { success: "Removido." };
}
