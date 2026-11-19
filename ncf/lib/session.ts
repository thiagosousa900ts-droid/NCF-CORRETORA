import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { OrgSettings, Role } from "@/lib/types";

export const getContext = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: profile }, { data: member }] = await Promise.all([
    supabase.from("user_profiles").select("full_name, email, phone").eq("id", user.id).maybeSingle(),
    supabase
      .from("organization_members")
      .select("organization_id, role")
      .eq("user_id", user.id)
      .eq("active", true)
      .limit(1)
      .maybeSingle(),
  ]);

  type Org = { id: string; name: string };
  let org: Org | null = null;
  let settings: OrgSettings | null = null;
  if (member) {
    const [{ data: o }, { data: s }] = await Promise.all([
      supabase.from("organizations").select("id, name").eq("id", member.organization_id).maybeSingle(),
      supabase.from("organization_settings").select("*").eq("organization_id", member.organization_id).maybeSingle(),
    ]);
    org = o as Org | null;
    settings = s as OrgSettings | null;
  }

  return {
    user,
    profile: profile as { full_name: string | null; email: string | null; phone: string | null } | null,
    member: member ? { organization_id: member.organization_id as string, role: member.role as Role } : null,
    org,
    settings,
  };
});

export async function requireContext() {
  const ctx = await getContext();
  if (!ctx) redirect("/login");
  if (!ctx.member || !ctx.org || !ctx.settings) redirect("/sem-acesso");
  return { ...ctx, member: ctx.member, org: ctx.org as { id: string; name: string }, settings: ctx.settings as OrgSettings };
}

export async function requireAdmin() {
  const ctx = await requireContext();
  if (ctx.member.role !== "admin") redirect("/");
  return ctx;
}
