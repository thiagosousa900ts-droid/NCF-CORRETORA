/** Remove caracteres que têm significado nos filtros do PostgREST (vírgula, parênteses, %, * etc.). */
export function sanitizeQuery(q: string | undefined): string {
  return (q ?? "").replace(/[^\p{L}\p{N}\s@.\-]/gu, " ").replace(/\s+/g, " ").trim().slice(0, 80);
}

export function pageParam(v: string | undefined): number {
  const n = Number.parseInt(v ?? "1", 10);
  return Number.isFinite(n) && n > 0 ? Math.min(n, 10000) : 1;
}
