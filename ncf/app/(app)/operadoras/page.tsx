import type { Metadata } from "next";
import Link from "next/link";
import { requireContext } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import { sanitizeQuery } from "@/lib/search";

export const metadata: Metadata = { title: "Operadoras" };

type Row = { id: string; name: string; ans_registry: string | null; availability: string; logo_path: string | null };

const AVAIL: Record<string, string> = { disponivel: "Disponível", indisponivel: "Indisponível", suspensa: "Suspensa" };

export default async function OperatorsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { member } = await requireContext();
  const q = sanitizeQuery((await searchParams).q);
  const supabase = await createClient();

  let query = supabase.from("operators").select("id, name, ans_registry, availability, logo_path").order("name");
  if (q) query = query.ilike("name", `%${q}%`);
  const { data, error } = await query;
  const rows = (data ?? []) as unknown as Row[];

  const paths = rows.map((r) => r.logo_path).filter((p): p is string => Boolean(p));
  const urls = new Map<string, string>();
  if (paths.length) {
    const { data: signed } = await supabase.storage.from("branding").createSignedUrls(paths, 3600);
    for (const s of signed ?? []) if (s.path && s.signedUrl) urls.set(s.path, s.signedUrl);
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-slate-900">Operadoras</h1>
        {member.role === "admin" && (
          <Link href="/operadoras/novo" className="btn">
            Nova operadora
          </Link>
        )}
      </header>

      <form className="card flex items-end gap-3 p-4" role="search">
        <div className="flex-1">
          <label htmlFor="q" className="label">
            Buscar por nome
          </label>
          <input id="q" name="q" defaultValue={q} className="input" />
        </div>
        <button type="submit" className="btn-secondary">
          Buscar
        </button>
      </form>

      <section className="card" aria-label="Lista de operadoras">
        {error ? (
          <p className="alert-error m-4">Não foi possível carregar as operadoras.</p>
        ) : rows.length === 0 ? (
          <p className="p-6 text-sm text-slate-600">
            {q ? "Nenhuma operadora encontrada." : "Nenhuma operadora cadastrada ainda."}
          </p>
        ) : (
          <ul>
            {rows.map((r) => {
              const logo = r.logo_path ? urls.get(r.logo_path) : undefined;
              return (
                <li key={r.id} className="flex items-center gap-4 border-b border-slate-100 px-6 py-4 last:border-b-0">
                  <div className="flex h-10 w-16 items-center justify-center">
                    {logo && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={logo} alt="" className="max-h-10 w-auto" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link href={`/operadoras/${r.id}`} className="font-medium text-accent hover:underline">
                      {r.name}
                    </Link>
                    <p className="text-sm text-slate-600">{r.ans_registry ? `ANS ${r.ans_registry}` : "Sem registro ANS informado"}</p>
                  </div>
                  <span className="text-sm text-slate-600">{AVAIL[r.availability] ?? r.availability}</span>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
