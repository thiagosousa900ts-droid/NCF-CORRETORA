export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <aside className="hidden flex-col justify-between bg-brand p-12 text-white lg:flex">
        <p className="text-2xl font-semibold tracking-tight">NCF</p>
        <div className="max-w-md">
          <h2 className="text-3xl font-semibold leading-tight">
            Compare propostas de planos de saúde e entregue uma apresentação pronta.
          </h2>
          <p className="mt-4 text-white/70">
            Clientes, operadoras, cotações e histórico de apresentações em um só lugar.
          </p>
        </div>
        <p className="text-sm text-white/50">Acesso restrito aos usuários da corretora.</p>
      </aside>
      <main className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">{children}</div>
      </main>
    </div>
  );
}
