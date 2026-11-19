/** "#0B1F3A" -> "11 31 58" (formato usado pelas variáveis CSS do Tailwind) */
export function hexToRgbTriplet(hex: string, fallback: string): string {
  const m = /^#([0-9a-f]{6})$/i.exec(hex ?? "");
  if (!m) return fallback;
  const n = parseInt(m[1], 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
}
