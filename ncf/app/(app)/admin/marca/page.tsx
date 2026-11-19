import type { Metadata } from "next";
import { requireAdmin } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import { BrandForm } from "./form";

export const metadata: Metadata = { title: "Marca e dados" };

export default async function BrandPage() {
  const { org, settings } = await requireAdmin();

  let logoUrl: string | null = null;
  if (settings.logo_path) {
    const supabase = await createClient();
    const { data } = await supabase.storage.from("branding").createSignedUrl(settings.logo_path, 3600);
    logoUrl = data?.signedUrl ?? null;
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">Marca e dados da corretora</h1>
        <p className="mt-1 text-sm text-slate-600">Essas informações aparecem na plataforma e nas apresentações.</p>
      </header>
      <BrandForm orgName={org.name} settings={settings} logoUrl={logoUrl} />
    </div>
  );
}
