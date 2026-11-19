import type { Metadata } from "next";

export const metadata: Metadata = { title: "Sem acesso" };

export default function NoAccessPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="card w-full max-w-md p-8">
        <h1 className="text-xl font-semibold text-slate-900">Seu acesso não está ativo</h1>
        <p className="mt-2 text-sm text-slate-600">
          Sua conta existe, mas não está vinculada a nenhuma corretora ou foi desativada. Peça a um administrador
          para liberar o acesso.
        </p>
        <form action="/auth/signout" method="post" className="mt-6">
          <button type="submit" className="btn-secondary">
            Sair
          </button>
        </form>
      </div>
    </main>
  );
}
