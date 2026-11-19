import Link from "next/link";
import { PAGE_SIZE } from "@/lib/constants";

export function Pagination({
  page,
  total,
  basePath,
  params,
}: {
  page: number;
  total: number;
  basePath: string;
  params: Record<string, string | undefined>;
}) {
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  if (pages <= 1) return null;
  const href = (p: number) => {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (v) sp.set(k, v);
    sp.set("pagina", String(p));
    return `${basePath}?${sp.toString()}`;
  };
  return (
    <nav aria-label="Paginação" className="flex items-center justify-between px-6 py-3 text-sm text-slate-600">
      <span>
        Página {page} de {pages} · {total} registros
      </span>
      <span className="flex gap-2">
        {page > 1 && (
          <Link href={href(page - 1)} className="btn-secondary">
            Anterior
          </Link>
        )}
        {page < pages && (
          <Link href={href(page + 1)} className="btn-secondary">
            Próxima
          </Link>
        )}
      </span>
    </nav>
  );
}
