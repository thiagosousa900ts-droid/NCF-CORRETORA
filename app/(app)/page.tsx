import type { Metadata } from "next";
import { requireContext } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import { ROLE_LABEL } from "@/lib/types";

export const metadata: Metadata = { title: "Painel" };

export default async function DashboardPage() {
  const { profile, member, settings } = await requireContext();
  const supabase = await createClient();

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const count = async (query: PromiseLike<{ count: number | null; error: unknown }>) => {
    const { count: n } = await query;
    return n ?? 0;
  };

  // Todos os números vêm do banco e respeitam as permissões (RLS) do usuário logado
  const [clients, comparisons, comparisonsMonth, finalized, drafts, members] = await Promise.all([
    count(supabase.from("clients").select("id", { count: "exact", head: true }).is("deleted_at", null)),
    count(supabase.from("comparisons").select("id", { count: "exact", head: true })),
    count(supabase.from("comparisons").select("id", { count: "exact", head: true }).gte("created_at", monthStart)),
    count(supabase.from("presentations").select("id", { count: "exact", head: true }).eq("status", "finalizado")),
    count(supabase.from("presentations").select("id", { count: "exact", head: true }).in("status", ["rascunho", "em_revisao"])),
    count(supabase.from("organization_members").select("id", { count: "exact", head: true }).eq("active", true)),
  ]);

  const firstName = (profile?.full_name ?? "").split(" ")[0];
  const stats = [
    { label: "Clientes cadastrados", value: clients },
    { label: "Comparativos criados", value: comparisons },
    { label: "Comparativos no mês", value: comparisonsMonth },
    { label: "Apresentações finalizadas", value: finalized },
    { label: "Apresentações em elaboração", value: drafts },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">{firstName ? `Olá, ${firstName}` : "Painel"}</h1>
        <p className="mt-1 text-sm text-slate-600">Seu acesso: {ROLE_LABEL[member.role]}.</p>
      </header>

      <section aria-label="Indicadores" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="card p-5">
            <p className="text-sm text-slate-600">{s.label}</p>
            <p className="mt-2 text-3xl font-semibold tabular-nums text-slate-900">{s.value}</p>
          </div>
        ))}
        {member.role === "admin" && (
          <div className="card p-5">
            <p className="text-sm text-slate-600">Usuários ativos</p>
            <p className="mt-2 text-3xl font-semibold tabular-nums text-slate-900">
              {members}
              <span className="text-base font-normal text-slate-500"> de {settings.max_users}</span>
            </p>
          </div>
        )}
      </section>

      {clients === 0 && comparisons === 0 && (
        <p className="card p-5 text-sm text-slate-600">
          Ainda não há clientes nem comparativos. Os indicadores aparecem aqui conforme os cadastros forem feitos.
        </p>
      )}
    </div>
  );
}
