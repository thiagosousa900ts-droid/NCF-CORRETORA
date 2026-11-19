import type { Metadata } from "next";
import { ResetForm } from "./form";

export const metadata: Metadata = { title: "Definir senha" };

export default function ResetPasswordPage() {
  return (
    <>
      <h1 className="mb-1 text-2xl font-semibold text-slate-900">Definir senha</h1>
      <p className="mb-6 text-sm text-slate-600">Escolha a senha que você usará para entrar.</p>
      <ResetForm />
    </>
  );
}
