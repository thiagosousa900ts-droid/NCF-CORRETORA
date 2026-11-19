import type { Metadata } from "next";
import { requireAdmin } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import type { Role } from "@/lib/types";
import { InviteForm, MemberRow, type MemberRowData } from "./forms";

export const metadata: Metadata = { title: "Usuários" };

type Row = {
  id: string;
  user_id: string;
  role: Role;
  active: boolean;
  user_profiles: { full_name: string | null; email: string | null } | null;
};

export default async function UsersPage() {
  const { user, member, settings } = await requireAdmin();
  const supabase = await createClient();

  const { data } = await supabase
    .from("organization_members")
    .select("id, user_id, role, active, user_profiles(full_name, email)")
    .eq("organization_id", member.organization_id)
    .order("created_at", { ascending: true });

  const rows = (data ?? []) as unknown as Row[];
  const activeCount = rows.filter((r) => r.active).length;
  const members: MemberRowData[] = rows.map((r) => ({
    id: r.id,
    name: r.user_profiles?.full_name || r.user_profiles?.email || "Sem nome",
    email: r.user_profiles?.email ?? "",
    role: r.role,
    active: r.active,
    isSelf: r.user_id === user.id,
  }));

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">Usuários</h1>
        <p className="mt-1 text-sm text-slate-600">
          {activeCount} de {settings.max_users} usuários ativos.
        </p>
      </header>

      <InviteForm />

      <section className="card" aria-label="Lista de usuários">
        <ul>
          {members.map((m) => (
            <MemberRow key={m.id} m={m} />
          ))}
        </ul>
      </section>
    </div>
  );
}
