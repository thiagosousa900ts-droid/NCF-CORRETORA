import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Entrar" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
  const { erro } = await searchParams;
  const notice = erro === "link" ? "O link é inválido ou expirou. Peça um novo link de acesso." : undefined;
  return (
    <>
      <h1 className="mb-1 text-2xl font-semibold text-slate-900">Entrar</h1>
      <p className="mb-6 text-sm text-slate-600">Use o e-mail e a senha da sua conta.</p>
      <LoginForm notice={notice} />
    </>
  );
}
