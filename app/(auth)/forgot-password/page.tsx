import type { Metadata } from "next";
import { ForgotForm } from "./form";

export const metadata: Metadata = { title: "Recuperar senha" };

export default function ForgotPasswordPage() {
  return (
    <>
      <h1 className="mb-1 text-2xl font-semibold text-slate-900">Recuperar senha</h1>
      <p className="mb-6 text-sm text-slate-600">Enviaremos um link para você criar uma nova senha.</p>
      <ForgotForm />
    </>
  );
}
