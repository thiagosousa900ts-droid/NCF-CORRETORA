"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, ClipboardList, LayoutDashboard, Palette, UserCog, UserRound, Users, type LucideIcon } from "lucide-react";

export type NavItem = { href: string; label: string; icon: "painel" | "usuarios" | "marca" | "conta" | "clientes" | "operadoras" | "planos" };

const ICONS: Record<NavItem["icon"], LucideIcon> = {
  painel: LayoutDashboard,
  usuarios: UserCog,
  marca: Palette,
  conta: UserRound,
  clientes: Users,
  operadoras: Building2,
  planos: ClipboardList,
};

export function Nav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Principal" className="flex flex-col gap-1">
      {items.map((item) => {
        const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        const Icon = ICONS[item.icon];
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors " +
              (active ? "bg-white/15 font-medium text-white" : "text-white/70 hover:bg-white/10 hover:text-white")
            }
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
