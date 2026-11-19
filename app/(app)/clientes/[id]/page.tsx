import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireContext } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import { CHANNEL_LABEL, type Channel } from "@/lib/constants";
import { formatDateTime } from "@/lib/format";
import { ArchiveForm, ClientForm, InteractionForm, type ClientValues } from "../client-form";

export const metadata: Metadata = { title: "Cliente" };

type ClientRow = {
  id: string;
  name: string;
  person_type: "pf" | "pj";
  document: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  state: string | null;
  lives_count: number | null;
  desired_contract_type: string | null;
  pj_contract_kind: string | null;
  notes: string | null;
  owner_id: string | null;
  age_ranges: { faixa: string; quantidade: number }[] | null;
  deleted_at: string | null;
};

export default async function ClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { member } = await requireContext();
  const supabase = await createClient();

  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { data } = await supabase.from("clients").select("*").eq("id", id).maybeSingle();
  if (!data) notFound(); // inexistente ou sem permissão (RLS)
  const c = data as unknown as ClientRow;

  const canEdit = member.role !== "viewer";
  const [{ data: inter }, { data: mem }] = await Promise.all([
    supabase
      .from("client_interactions")
      .select("id, interaction_date, channel, summary, user_profiles(full_name)")
      .eq("client_id", id)
      .order("interaction_date", { ascending: false })
      .limit(50),
    member.role === "admin"
      ? supabase
          .from("organization_members")
          .select("user_id, user_profiles(full_name, email)")
          .eq("organization_id", member.organization_id)
          .eq("active", true)
      : Promise.resolve({ data: [] }),
  ]);

  const owners = ((mem ?? []) as unknown as { user_id: string; user_profiles: { full_name: string | null; email: string | null } | null }[]).map(
    (m) => ({ id: m.user_id, name: m.user_profiles?.full_name || m.user_profiles?.email || "Sem nome" }),
  );
  const interactions = (inter ?? []) as unknown as {
    id: string;
    interaction_date: string;
    channel: Channel | null;
    summary: string;
    user_profiles: { full_name: string | null } | null;
  }[];

  const bands: Record<string, number> = {};
  for (const b of c.age_ranges ?? []) bands[b.faixa] = b.quantidade;

  const values: ClientValues = {
    id: c.id,
    name: c.name,
    person_type: c.person_type,
    document: c.document ?? "",
    email: c.email ?? "",
    phone: c.phone ?? "",
    city: c.city ?? "",
    state: c.state ?? "",
    lives_count: c.lives_count?.toString() ?? "",
    desired_contract_type: c.desired_contract_type ?? "",
    pj_contract_kind: c.pj_contract_kind ?? "",
    notes: c.notes ?? "",
    owner_id: c.owner_id ?? "",
    bands,
  };

  return (
    <div className="space-y-6">
      <div>
        <Link href="/clientes" className="text-sm text-accent hover:underline">
          ← Clientes
        </Link>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900">{c.name}</h1>
        {c.deleted_at && <p className="mt-1 text-sm text-amber-800">Cliente arquivado.</p>}
      </div>

      {canEdit ? (
        <>
          <ClientForm values={values} owners={owners} canChooseOwner={member.role === "admin"} />
          <ArchiveForm id={c.id} archived={Boolean(c.deleted_at)} />
        </>
      ) : (
        <dl className="card grid gap-4 p-6 sm:grid-cols-2">
          {[
            ["Tipo", c.person_type === "pj" ? "Pessoa jurídica" : "Pessoa física"],
            ["Município", [c.city, c.state].filter(Boolean).join("/") || "—"],
            ["Beneficiários", c.lives_count?.toString() ?? "—"],
            ["Contratação pretendida", c.desired_contract_type ?? "—"],
          ].map(([k, v]) => (
            <div key={k}>
              <dt className="text-sm text-slate-600">{k}</dt>
              <dd className="font-medium text-slate-900">{v}</dd>
            </div>
          ))}
        </dl>
      )}

      <section className="card" aria-label="Histórico de atendimentos">
        <h2 className="px-6 pt-6 text-lg font-semibold text-slate-900">Histórico de atendimentos</h2>
        {canEdit && <InteractionForm clientId={c.id} />}
        {interactions.length === 0 ? (
          <p className="p-6 text-sm text-slate-600">Nenhum atendimento registrado.</p>
        ) : (
          <ul>
            {interactions.map((i) => (
              <li key={i.id} className="border-b border-slate-100 px-6 py-4 last:border-b-0">
                <p className="text-sm text-slate-600">
                  {formatDateTime(i.interaction_date)}
                  {i.channel ? ` · ${CHANNEL_LABEL[i.channel]}` : ""}
                  {i.user_profiles?.full_name ? ` · ${i.user_profiles.full_name}` : ""}
                </p>
                <p className="mt-1 whitespace-pre-wrap text-slate-900">{i.summary}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
