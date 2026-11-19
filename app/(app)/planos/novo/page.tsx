import type { Metadata } from "next";
import { requireAdmin } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import { EMPTY_PLAN, PlanForm } from "../plan-form";

export const metadata: Metadata = { title: "Novo produto" };

export default async function NewPlanPage({ searchParams }: { searchParams: Promise<{ operadora?: string }> }) {
  await requireAdmin();
  const { operadora } = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase.from("operators").select("id, name").order("name");
  const operators = (data ?? []) as { id: string; name: string }[];
  const preset = operators.some((o) => o.id === operadora) ? operadora! : "";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">Novo produto</h1>
      {operators.length === 0 ? (
        <p className="card p-6 text-sm text-slate-600">Cadastre uma operadora antes de criar produtos.</p>
      ) : (
        <PlanForm values={{ ...EMPTY_PLAN, operator_id: preset }} operators={operators} canEdit />
      )}
    </div>
  );
}
