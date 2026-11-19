"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireContext } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import { AGE_BANDS } from "@/lib/constants";
import { clientSchema, firstIssue, interactionSchema } from "@/lib/validation";
import type { FormState } from "@/lib/types";

const FIELDS = [
  "name",
  "person_type",
  "document",
  "email",
  "phone",
  "city",
  "state",
  "lives_count",
  "desired_contract_type",
  "pj_contract_kind",
  "notes",
] as const;

function readClientForm(formData: FormData) {
  const raw = Object.fromEntries(FIELDS.map((k) => [k, formData.get(k) ?? ""]));
  const parsed = clientSchema.safeParse(raw);
  if (!parsed.success) return { error: firstIssue(parsed.error) } as const;

  const bands = AGE_BANDS.map((faixa, i) => ({
    faixa,
    quantidade: Math.max(0, Math.min(100000, Number.parseInt(String(formData.get(`band_${i}`) ?? "0"), 10) || 0)),
  })).filter((b) => b.quantidade > 0);
  const bandTotal = bands.reduce((n, b) => n + b.quantidade, 0);

  const data = parsed.data;
  if (data.person_type === "pf") data.pj_contract_kind = null;
  return {
    data: {
      ...data,
      age_ranges: bands,
      lives_count: bandTotal > 0 ? bandTotal : data.lives_count,
    },
  } as const;
}

function dbError(code: string | undefined): string {
  if (code === "23505") return "Já existe um cliente cadastrado com este CPF/CNPJ.";
  return "Não foi possível salvar. Tente de novo.";
}

async function resolveOwner(formData: FormData, ctx: Awaited<ReturnType<typeof requireContext>>) {
  const requested = String(formData.get("owner_id") ?? "");
  if (ctx.member.role !== "admin" || !requested) return ctx.user.id;
  const supabase = await createClient();
  const { data } = await supabase
    .from("organization_members")
    .select("user_id")
    .eq("organization_id", ctx.member.organization_id)
    .eq("user_id", requested)
    .eq("active", true)
    .maybeSingle();
  return data ? requested : ctx.user.id;
}

export async function createClientAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const ctx = await requireContext();
  if (ctx.member.role === "viewer") return { error: "Seu perfil não permite cadastrar clientes." };

  const form = readClientForm(formData);
  if ("error" in form) return { error: form.error };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clients")
    .insert({
      ...form.data,
      organization_id: ctx.member.organization_id,
      owner_id: await resolveOwner(formData, ctx),
      created_by: ctx.user.id,
    })
    .select("id")
    .single();
  if (error || !data) return { error: dbError(error?.code) };

  revalidatePath("/clientes");
  redirect(`/clientes/${data.id}`);
}

export async function updateClientAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const ctx = await requireContext();
  if (ctx.member.role === "viewer") return { error: "Seu perfil não permite editar clientes." };
  const id = String(formData.get("id") ?? "");

  const form = readClientForm(formData);
  if ("error" in form) return { error: form.error };

  const patch: Record<string, unknown> = { ...form.data };
  if (ctx.member.role === "admin" && formData.get("owner_id")) patch.owner_id = await resolveOwner(formData, ctx);

  const supabase = await createClient();
  const { data, error } = await supabase.from("clients").update(patch).eq("id", id).select("id");
  if (error) return { error: dbError(error.code) };
  if (!data || data.length === 0) return { error: "Cliente não encontrado ou sem permissão para editar." };

  revalidatePath("/clientes");
  revalidatePath(`/clientes/${id}`);
  return { success: "Cliente salvo." };
}

export async function setClientArchived(_prev: FormState, formData: FormData): Promise<FormState> {
  const ctx = await requireContext();
  if (ctx.member.role === "viewer") return { error: "Seu perfil não permite esta ação." };
  const id = String(formData.get("id") ?? "");
  const archive = formData.get("archive") === "true";

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clients")
    .update({ deleted_at: archive ? new Date().toISOString() : null })
    .eq("id", id)
    .select("id");
  if (error) return { error: dbError(error.code) };
  if (!data || data.length === 0) return { error: "Cliente não encontrado ou sem permissão." };

  revalidatePath("/clientes");
  revalidatePath(`/clientes/${id}`);
  return { success: archive ? "Cliente arquivado." : "Cliente reativado." };
}

export async function addInteraction(_prev: FormState, formData: FormData): Promise<FormState> {
  const ctx = await requireContext();
  if (ctx.member.role === "viewer") return { error: "Seu perfil não permite registrar atendimentos." };
  const clientId = String(formData.get("client_id") ?? "");

  const parsed = interactionSchema.safeParse({ channel: formData.get("channel") ?? "", summary: formData.get("summary") });
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  const supabase = await createClient();
  const { error } = await supabase.from("client_interactions").insert({
    ...parsed.data,
    organization_id: ctx.member.organization_id,
    client_id: clientId,
    created_by: ctx.user.id,
  });
  if (error) return { error: "Não foi possível registrar o atendimento." };

  revalidatePath(`/clientes/${clientId}`);
  return { success: "Atendimento registrado." };
}
