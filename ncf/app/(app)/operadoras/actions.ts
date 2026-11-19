"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import { detectImage } from "@/lib/image";
import { firstIssue, operatorSchema } from "@/lib/validation";
import type { FormState } from "@/lib/types";

const MAX_LOGO = 2 * 1024 * 1024;

export async function saveOperator(_prev: FormState, formData: FormData): Promise<FormState> {
  const { member } = await requireAdmin();
  const orgId = member.organization_id;
  const id = String(formData.get("id") ?? "");

  const parsed = operatorSchema.safeParse({
    name: formData.get("name"),
    ans_registry: formData.get("ans_registry") ?? "",
    availability: formData.get("availability"),
    contacts: formData.get("contacts") ?? "",
    notes: formData.get("notes") ?? "",
  });
  if (!parsed.success) return { error: firstIssue(parsed.error) };
  const { contacts, ...rest } = parsed.data;
  const values = { ...rest, commercial_contacts: contacts };

  const supabase = await createClient();

  // valida o logotipo antes de gravar qualquer coisa
  let logo: { bytes: Uint8Array; ext: string; mime: string } | null = null;
  const file = formData.get("logo");
  if (file instanceof File && file.size > 0) {
    if (file.size > MAX_LOGO) return { error: "O logotipo deve ter no máximo 2 MB." };
    const bytes = new Uint8Array(await file.arrayBuffer());
    const kind = detectImage(bytes);
    if (!kind) return { error: "Use um logotipo em PNG, JPG ou WebP." };
    logo = { bytes, ...kind };
  }

  let operatorId = id;
  if (id) {
    const { data, error } = await supabase.from("operators").update(values).eq("id", id).select("id");
    if (error) return { error: error.code === "23505" ? "Já existe uma operadora com esse nome." : "Não foi possível salvar." };
    if (!data || data.length === 0) return { error: "Operadora não encontrada." };
  } else {
    const { data, error } = await supabase
      .from("operators")
      .insert({ ...values, organization_id: orgId })
      .select("id")
      .single();
    if (error || !data) {
      return { error: error?.code === "23505" ? "Já existe uma operadora com esse nome." : "Não foi possível salvar." };
    }
    operatorId = data.id as string;
  }

  if (logo) {
    const path = `${orgId}/operators/${operatorId}-${Date.now()}.${logo.ext}`;
    const { error: upErr } = await supabase.storage.from("branding").upload(path, logo.bytes, {
      contentType: logo.mime,
      upsert: false,
    });
    if (upErr) {
      revalidatePath("/operadoras");
      if (!id) redirect(`/operadoras/${operatorId}`);
      return { error: "Operadora salva, mas não foi possível enviar o logotipo." };
    }
    const { data: old } = await supabase.from("operators").select("logo_path").eq("id", operatorId).maybeSingle();
    await supabase.from("operators").update({ logo_path: path }).eq("id", operatorId);
    const oldPath = (old as { logo_path: string | null } | null)?.logo_path;
    if (oldPath) await supabase.storage.from("branding").remove([oldPath]);
  }

  revalidatePath("/operadoras");
  revalidatePath(`/operadoras/${operatorId}`);
  if (!id) redirect(`/operadoras/${operatorId}`);
  return { success: "Operadora salva." };
}
