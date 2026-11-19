import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireContext } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import { OperatorForm } from "../operator-form";

export const metadata: Metadata = { title: "Operadora" };

export default async function OperatorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { member } = await requireContext();
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const supabase = await createClient();
  const { data } = await supabase.from("operators").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  const op = data as unknown as {
    id: string;
    name: string;
    ans_registry: string | null;
    availability: string;
    commercial_contacts: string[] | null;
    notes: string | null;
    logo_path: string | null;
  };

  const [{ data: plans }, signed] = await Promise.all([
    supabase
      .from("health_plans")
      .select("id, commercial_name, segmentation, accommodation, availability")
      .eq("operator_id", id)
      .order("commercial_name"),
    op.logo_path ? supabase.storage.from("branding").createSignedUrl(op.logo_path, 3600) : Promise.resolve({ data: null }),
  ]);

  const rows = (plans ?? []) as unknown as {
    id: string;
    commercial_name: string;
    segmentation: string | null;
    accommodation: string | null;
    availability: string;
  }[];

  return (
    <div className="space-y-6">
      <div>
        <Link href="/operadoras" className="text-sm text-accent hover:underline">
          ← Operadoras
        </Link>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900">{op.name}</h1>
      </div>

      <OperatorForm
        canEdit={member.role === "admin"}
        logoUrl={signed.data?.signedUrl ?? null}
        values={{
          id: op.id,
          name: op.name,
          ans_registry: op.ans_registry ?? "",
          availability: op.availability,
          contacts: (op.commercial_contacts ?? []).join("\n"),
          notes: op.notes ?? "",
        }}
      />

      <section className="card" aria-label="Produtos da operadora">
        <div className="flex items-center justify-between px-6 pt-6">
          <h2 className="text-lg font-semibold text-slate-900">Produtos</h2>
          {member.role === "admin" && (
            <Link href={`/planos/novo?operadora=${op.id}`} className="btn-secondary">
              Novo produto
            </Link>
          )}
        </div>
        {rows.length === 0 ? (
          <p className="p-6 text-sm text-slate-600">Nenhum produto cadastrado para esta operadora.</p>
        ) : (
          <ul className="mt-4">
            {rows.map((p) => (
              <li key={p.id} className="flex items-center justify-between border-t border-slate-100 px-6 py-3">
                <Link href={`/planos/${p.id}`} className="font-medium text-accent hover:underline">
                  {p.commercial_name}
                </Link>
                <span className="text-sm text-slate-600">
                  {[p.segmentation, p.accommodation].filter(Boolean).join(" · ") || "—"}
                  {p.availability !== "disponivel" && ` · ${p.availability}`}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
