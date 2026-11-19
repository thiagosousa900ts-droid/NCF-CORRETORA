import type { Metadata } from "next";
import Link from "next/link";
import { requireContext } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import { PAGE_SIZE } from "@/lib/constants";
import { formatDocument } from "@/lib/format";
import { pageParam, sanitizeQuery } from "@/lib/search";
import { Pagination } from "@/components/pagination";

export const metadata: Metadata = { title: "Clientes" };

type Row = {
  id: string;
  name: string;
  person_type: "pf" | "pj";
  document: string | null;
  city: string | null;
  state: string | null;
  lives_count: number | null;
  deleted_at: string | null;
  owner: { full_name: string | null } | null;
};

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tipo?: string; arquivados?: string; pagina?: string }>;
}) {
  const sp = await searchParams;
  const { member } = await requireContext();
  const q = sanitizeQuery(sp.q);
  const page = pageParam(sp.pagina);
  const tipo = sp.tipo === "pf" || sp.tipo === "pj" ? sp.tipo : undefined;
  const archived = sp.arquivados === "1";

  const supabase = await createClient();
  let query = supabase
    .from("clients")
    .select("id, name, person_type, document, city, state, lives_count, deleted_at, owner:user_profiles!clients_owner_id_fkey(full_name)", {
      count: "exact",
    })
    .order("name", { ascending: true })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  query = archived ? query.not("deleted_at", "is", null) : query.is("deleted_at", null);
  if (tipo) query = query.eq("person_type", tipo);
  if (q) {
    const digits = q.replace(/\D/g, "");
    query = query.or(
      [`name.ilike.%${q}%`, `email.ilike.%${q}%`, digits.length >= 3 ? `document.ilike.%${digits}%` : null]
        .filter(Boolean)
        .join(","),
    );
  }
  const { data, count, error } = await query;
  const rows = (data ?? []) as unknown as Row[];

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-slate-900">Clientes</h1>
        {member.role !== "viewer" && (
          <Link href="/clientes/novo" className="btn">
            Novo cliente
          </Link>
        )}
      </header>

      <form className="card flex flex-wrap items-end gap-3 p-4" role="search">
        <div className="min-w-[220px] flex-1">
          <label htmlFor="q" className="label">
            Buscar por nome, CPF/CNPJ ou e-mail
          </label>
          <input id="q" name="q" defaultValue={q} className="input" />
        </div>
        <div>
          <label htmlFor="tipo" className="label">
            Tipo
          </label>
          <select id="tipo" name="tipo" defaultValue={tipo ?? ""} className="input">
            <option value="">Todos</option>
            <option value="pf">Pessoa física</option>
            <option value="pj">Pessoa jurídica</option>
          </select>
        </div>
        <label className="flex items-center gap-2 pb-2 text-sm text-slate-700">
          <input type="checkbox" name="arquivados" value="1" defaultChecked={archived} />
          Ver arquivados
        </label>
        <button type="submit" className="btn-secondary">
          Filtrar
        </button>
      </form>

      <section className="card overflow-x-auto" aria-label="Lista de clientes">
        {error ? (
          <p className="alert-error m-4">Não foi possível carregar os clientes.</p>
        ) : rows.length === 0 ? (
          <p className="p-6 text-sm text-slate-600">
            {q || tipo || archived ? "Nenhum cliente encontrado com esses filtros." : "Nenhum cliente cadastrado ainda."}
          </p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-slate-600">
              <tr>
                <th scope="col" className="px-6 py-3 font-medium">Nome</th>
                <th scope="col" className="px-4 py-3 font-medium">Tipo</th>
                <th scope="col" className="px-4 py-3 font-medium">CPF/CNPJ</th>
                <th scope="col" className="px-4 py-3 font-medium">Município</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">Vidas</th>
                <th scope="col" className="px-4 py-3 font-medium">Responsável</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50">
                  <td className="px-6 py-3">
                    <Link href={`/clientes/${r.id}`} className="font-medium text-accent hover:underline">
                      {r.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{r.person_type === "pj" ? "PJ" : "PF"}</td>
                  <td className="px-4 py-3 tabular-nums">{formatDocument(r.document)}</td>
                  <td className="px-4 py-3">{[r.city, r.state].filter(Boolean).join("/") || "—"}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{r.lives_count ?? "—"}</td>
                  <td className="px-4 py-3">{r.owner?.full_name ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <Pagination page={page} total={count ?? 0} basePath="/clientes" params={{ q, tipo, arquivados: archived ? "1" : undefined }} />
      </section>
    </div>
  );
}
