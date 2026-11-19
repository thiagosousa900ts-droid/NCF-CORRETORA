import type { Metadata } from "next";
import { requireAdmin } from "@/lib/session";
import { EMPTY_OPERATOR, OperatorForm } from "../operator-form";

export const metadata: Metadata = { title: "Nova operadora" };

export default async function NewOperatorPage() {
  await requireAdmin();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">Nova operadora</h1>
      <OperatorForm values={EMPTY_OPERATOR} canEdit logoUrl={null} />
    </div>
  );
}
