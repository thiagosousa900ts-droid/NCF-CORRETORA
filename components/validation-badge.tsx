import { VALIDATION_LABEL, type ValidationStatus } from "@/lib/constants";

const STYLE: Record<ValidationStatus, string> = {
  confirmado: "bg-emerald-50 text-emerald-800",
  nao_disponivel: "bg-slate-100 text-slate-600",
  pendente_validacao: "bg-amber-50 text-amber-800",
};

export function ValidationBadge({ status }: { status: ValidationStatus }) {
  return (
    <span className={"rounded-full px-2.5 py-0.5 text-xs font-medium " + STYLE[status]}>{VALIDATION_LABEL[status]}</span>
  );
}
