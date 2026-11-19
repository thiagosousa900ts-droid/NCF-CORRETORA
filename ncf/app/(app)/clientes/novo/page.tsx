import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireContext } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import { ClientForm, EMPTY_CLIENT } from "../client-form";

export const metadata: Metadata = { title: "Novo cliente" };

export default async function NewClientPage() {
  const { member } = await requireContext();
  if (member.role === "viewer") redirect("/clientes");

  let owners: { id: string; name: string }[] = [];
  if (member.role === "admin") {
    const supabase = await createClient();
    const { data } = await supabase
      .from("organization_members")
      .select("user_id, user_profiles(full_name, email)")
      .eq("organization_id", member.organization_id)
      .eq("active", true);
    owners = ((data ?? []) as unknown as { user_id: string; user_profiles: { full_name: string | null; email: string | null } | null }[]).map(
      (m) => ({ id: m.user_id, name: m.user_profiles?.full_name || m.user_profiles?.email || "Sem nome" }),
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">Novo cliente</h1>
      <ClientForm values={EMPTY_CLIENT} owners={owners} canChooseOwner={member.role === "admin"} />
    </div>
  );
}
