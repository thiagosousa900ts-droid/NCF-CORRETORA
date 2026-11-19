import type { Metadata } from "next";
import Link from "next/link";
import { requireContext } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import { PAGE_SIZE, type ValidationStatus } from "@/lib/constants";
import { pageParam, sanitizeQuery } from "@/lib/search";
import { Pagination } from "@/components/pagination";
import { ValidationBadge } from "@/components/validation-badge";

export const metadata: Metadata = { title: "Produtos" };

type Row = {
  id: string;
  commercial_name: string;
  segmentation: string | null;
  accommodation: string | null;
  coverage_area: string | null;
  availability: string;
  validation_status: ValidationStatus;
  operators: { name: string } | null;
};

export default async function PlansPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; operadora?: string; pagina?: string }>;
}) {
  const sp = await searchParams;
  const { member } = await requireContext();
  const q = sanitizeQuery(sp.q);
  const page = pageParam(sp.pagina);
  const operadora = /^[0-9a-f-]{36}$/i.test(sp.operadora ?? "") ? sp.operadora : undefined;

  const supabase = await createClient();
  const { data: ops } = await supabase.from("operators").select("id, name").order("name");

  let query = supabase
    .from("health_plans")
    .select("id, commercial_name, segmentation, accommodation, coverage_area, availability, validation_status, operators(name)", {
      count: "exact",
    })
    .order("commercial_name")
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
  if (operadora) query = query.eq("operator_id", operadora);
  if (q) query = query.ilike("commercial_name", `%${q}%`);

  const { data, count, error } = await query;
  const rows = (data ?? []) as unknown as Row[];

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-slate-900">Produtos</h1>
        {member.role === "admin" && (
          <Link href="/planos/novo" className="btn">
            Novo produto
          </Link>
        )}
      </header>

      <form className="card flex flex-wrap items-end gap-3 p-4" role="search">
        <div className="min-w-[200px] flex-1">
          <label htmlFor="q" className="label">
            Buscar por nome do plano
          </label>
          <input id="q" name="q" defaultValue={q} className="input" />
        </div>
        <div>
          <label htmlFor="operadora" className="label">
            Operadora
          </label>
          <select id="operadora" name="operadora" defaultValue={operadora ?? ""} className="input">
            <option value="">Todas</option>
            {((ops ?? []) as { id: string; name: string }[]).map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn-secondary">
          Filtrar
        </button>
      </form>

      <section className="card overflow-x-auto" aria-label="Lista de produtos">
        {error ? (
          <p className="alert-error m-4">Não foi possível carregar os produtos.</p>
        ) : rows.length === 0 ? (
          <p className="p-6 text-sm text-slate-600">
            {q || operadora ? "Nenhum produto encontrado com esses filtros." : "Nenhum produto cadastrado ainda."}
          </p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-slate-600">
              <tr>
                <th scope="col" className="px-6 py-3 font-medium">Produto</th>
                <th scope="col" className="px-4 py-3 font-medium">Operadora</th>
                <th scope="col" className="px-4 py-3 font-medium">Segmentação</th>
                <th scope="col" className="px-4 py-3 font-medium">Acomodação</th>
                <th scope="col" className="px-4 py-3 font-medium">Abrangência</th>
                <th scope="col" className="px-4 py-3 font-medium">Dados</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50">
                  <td className="px-6 py-3">
                    <Link href={`/planos/${r.id}`} className="font-medium text-accent hover:underline">
                      {r.commercial_name}
                    </Link>
                    {r.availability !== "disponivel" && <span className="ml-2 text-xs text-slate-500">({r.availability})</span>}
                  </td>
                  <td className="px-4 py-3">{r.operators?.name ?? "—"}</td>
                  <td className="px-4 py-3">{r.segmentation ?? "—"}</td>
                  <td className="px-4 py-3">{r.accommodation ?? "—"}</td>
                  <td className="px-4 py-3">{r.coverage_area ?? "—"}</td>
                  <td className="px-4 py-3">
                    <ValidationBadge status={r.validation_status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <Pagination page={page} total={count ?? 0} basePath="/planos" params={{ q, operadora }} />
      </section>
    </div>
  );
}
