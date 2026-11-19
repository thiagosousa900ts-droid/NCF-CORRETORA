import Link from "next/link";
import { Menu } from "lucide-react";
import { requireContext } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import { hexToRgbTriplet } from "@/lib/brand";
import { ROLE_LABEL } from "@/lib/types";
import { Nav, type NavItem } from "@/components/nav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, member, org, settings } = await requireContext();

  let logoUrl: string | null = null;
  if (settings.logo_path) {
    const supabase = await createClient();
    const { data } = await supabase.storage.from("branding").createSignedUrl(settings.logo_path, 3600);
    logoUrl = data?.signedUrl ?? null;
  }

  const items: NavItem[] = [
    { href: "/", label: "Painel", icon: "painel" },
    { href: "/clientes", label: "Clientes", icon: "clientes" },
    { href: "/operadoras", label: "Operadoras", icon: "operadoras" },
    { href: "/planos", label: "Produtos", icon: "planos" },
  ];
  if (member.role === "admin") {
    items.push(
      { href: "/admin/usuarios", label: "Usuários", icon: "usuarios" },
      { href: "/admin/marca", label: "Marca e dados", icon: "marca" },
    );
  }
  items.push({ href: "/conta", label: "Minha conta", icon: "conta" });

  const brandName = settings.trade_name || org.name;
  const style = {
    "--brand": hexToRgbTriplet(settings.primary_color, "11 31 58"),
    "--accent": hexToRgbTriplet(settings.accent_color, "37 99 235"),
  } as React.CSSProperties;

  const Brand = (
    <Link href="/" className="flex items-center gap-3">
      {logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logoUrl} alt={brandName} className="max-h-9 w-auto max-w-[160px] rounded-sm bg-white/95 p-1" />
      ) : null}
      <span className="text-base font-semibold tracking-tight text-white">{logoUrl ? "" : brandName}</span>
    </Link>
  );

  const UserBox = (
    <div className="border-t border-white/15 pt-4">
      <p className="truncate text-sm font-medium text-white">{profile?.full_name || user.email}</p>
      <p className="mb-3 text-xs text-white/60">{ROLE_LABEL[member.role]}</p>
      <form action="/auth/signout" method="post">
        <button type="submit" className="text-sm text-white/70 underline-offset-2 hover:text-white hover:underline">
          Sair
        </button>
      </form>
    </div>
  );

  return (
    <div style={style} className="min-h-screen lg:grid lg:grid-cols-[250px_minmax(0,1fr)]">
      <aside className="hidden flex-col justify-between bg-brand p-5 lg:flex">
        <div className="space-y-8">
          {Brand}
          <Nav items={items} />
        </div>
        {UserBox}
      </aside>

      <header className="bg-brand px-4 py-3 lg:hidden">
        <details className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between">
            {Brand}
            <span className="flex items-center gap-2 text-sm text-white/80">
              <Menu className="h-5 w-5" aria-hidden="true" />
              Menu
            </span>
          </summary>
          <div className="mt-4 space-y-6 pb-2">
            <Nav items={items} />
            {UserBox}
          </div>
        </details>
      </header>

      <main className="min-w-0 px-4 py-8 sm:px-8">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
