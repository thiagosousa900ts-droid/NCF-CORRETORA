"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSiteUrl } from "@/lib/site-url";
import { firstIssue, inviteSchema } from "@/lib/validation";
import type { FormState } from "@/lib/types";

const LIMIT_MSG = "O limite de usuários ativos foi atingido. Aumente o limite em Marca e dados ou desative alguém.";

function friendly(message: string): string {
  if (message.includes("Limite de usuários")) return LIMIT_MSG;
  if (message.includes("ao menos um administrador")) return "A corretora precisa manter ao menos um administrador ativo.";
  return "Não foi possível concluir a ação. Tente de novo.";
}

export async function inviteUser(_prev: FormState, formData: FormData): Promise<FormState> {
  const { user, member, settings } = await requireAdmin();
  const parsed = inviteSchema.safeParse({
    email: formData.get("email"),
    full_name: formData.get("full_name"),
    role: formData.get("role"),
  });
  if (!parsed.success) return { error: firstIssue(parsed.error) };
  const { email, full_name, role } = parsed.data;

  const supabase = await createClient();

  const { count } = await supabase
    .from("organization_members")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", member.organization_id)
    .eq("active", true);
  if ((count ?? 0) >= settings.max_users) return { error: LIMIT_MSG };

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return { error: "O servidor ainda não tem a chave de serviço configurada (SUPABASE_SERVICE_ROLE_KEY)." };
  }

  const site = await getSiteUrl();
  let userId: string | null = null;

  const invited = await admin.auth.admin.inviteUserByEmail(email, {
    data: { full_name },
    redirectTo: `${site}/auth/callback?next=/reset-password`,
  });

  if (invited.error) {
    // Conta já existente no Auth: reaproveita o perfil, sem enviar novo convite
    const { data: existing } = await admin.from("user_profiles").select("id").eq("email", email).maybeSingle();
    if (!existing) return { error: "Não foi possível enviar o convite. Confira o e-mail e tente de novo." };
    userId = existing.id as string;
  } else {
    userId = invited.data.user.id;
  }

  const { error } = await supabase.from("organization_members").insert({
    organization_id: member.organization_id,
    user_id: userId,
    role,
    invited_by: user.id,
  });
  if (error) {
    if (error.code === "23505") return { error: "Essa pessoa já faz parte da corretora." };
    return { error: friendly(error.message) };
  }

  revalidatePath("/admin/usuarios");
  return { success: `Convite enviado para ${email}.` };
}

async function loadMember(memberId: string) {
  const { user, member } = await requireAdmin();
  const supabase = await createClient();
  const { data } = await supabase
    .from("organization_members")
    .select("id, user_id")
    .eq("id", memberId)
    .eq("organization_id", member.organization_id)
    .maybeSingle();
  return { supabase, row: data as { id: string; user_id: string } | null, selfId: user.id };
}

export async function updateMemberRole(_prev: FormState, formData: FormData): Promise<FormState> {
  const role = String(formData.get("role"));
  if (!["admin", "editor", "viewer"].includes(role)) return { error: "Perfil inválido." };
  const { supabase, row, selfId } = await loadMember(String(formData.get("member_id")));
  if (!row) return { error: "Usuário não encontrado." };
  if (row.user_id === selfId) return { error: "Você não pode alterar o seu próprio perfil de acesso." };

  const { error } = await supabase.from("organization_members").update({ role }).eq("id", row.id);
  if (error) return { error: friendly(error.message) };
  revalidatePath("/admin/usuarios");
  return { success: "Perfil atualizado." };
}

export async function setMemberActive(_prev: FormState, formData: FormData): Promise<FormState> {
  const active = formData.get("active") === "true";
  const { supabase, row, selfId } = await loadMember(String(formData.get("member_id")));
  if (!row) return { error: "Usuário não encontrado." };
  if (row.user_id === selfId) return { error: "Você não pode desativar o seu próprio acesso." };

  const { error } = await supabase.from("organization_members").update({ active }).eq("id", row.id);
  if (error) return { error: friendly(error.message) };
  revalidatePath("/admin/usuarios");
  return { success: active ? "Acesso reativado." : "Acesso desativado." };
}
