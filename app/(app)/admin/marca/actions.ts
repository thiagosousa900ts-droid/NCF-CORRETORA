"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import { brandSchema, firstIssue } from "@/lib/validation";
import { detectImage } from "@/lib/image";
import type { FormState } from "@/lib/types";

const MAX_LOGO = 2 * 1024 * 1024;

export async function saveBrand(_prev: FormState, formData: FormData): Promise<FormState> {
  const { member, settings } = await requireAdmin();
  const orgId = member.organization_id;

  const raw = Object.fromEntries(
    [
      "org_name",
      "trade_name",
      "primary_color",
      "secondary_color",
      "accent_color",
      "contact_email",
      "contact_phone",
      "website",
      "address",
      "max_users",
      "default_validity_days",
      "intro_text",
      "closing_text",
      "legal_disclaimer",
    ].map((k) => [k, formData.get(k) ?? ""]),
  );
  const parsed = brandSchema.safeParse(raw);
  if (!parsed.success) return { error: firstIssue(parsed.error) };
  const { org_name, ...rest } = parsed.data;

  const supabase = await createClient();

  // Limite de usuários não pode ficar abaixo da quantidade de usuários ativos
  const { count } = await supabase
    .from("organization_members")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", orgId)
    .eq("active", true);
  if (rest.max_users < (count ?? 0)) {
    return { error: `Há ${count} usuários ativos. Desative alguém antes de reduzir o limite para ${rest.max_users}.` };
  }

  let logo_path: string | undefined;
  const file = formData.get("logo");
  if (file instanceof File && file.size > 0) {
    if (file.size > MAX_LOGO) return { error: "O logotipo deve ter no máximo 2 MB." };
    const bytes = new Uint8Array(await file.arrayBuffer());
    const kind = detectImage(bytes);
    if (!kind) return { error: "Use um logotipo em PNG, JPG ou WebP." };

    const path = `${orgId}/logo-${Date.now()}.${kind.ext}`;
    const { error: upErr } = await supabase.storage.from("branding").upload(path, bytes, {
      contentType: kind.mime,
      upsert: false,
    });
    if (upErr) return { error: "Não foi possível enviar o logotipo. Tente de novo." };
    logo_path = path;
  }

  const { error: orgErr } = await supabase.from("organizations").update({ name: org_name }).eq("id", orgId);
  if (orgErr) return { error: "Não foi possível salvar o nome da corretora." };

  const { error: setErr } = await supabase
    .from("organization_settings")
    .update({ ...rest, ...(logo_path ? { logo_path } : {}) })
    .eq("organization_id", orgId);
  if (setErr) return { error: "Não foi possível salvar as configurações. Tente de novo." };

  if (logo_path && settings.logo_path) {
    await supabase.storage.from("branding").remove([settings.logo_path]);
  }

  revalidatePath("/", "layout");
  return { success: "Configurações salvas." };
}
