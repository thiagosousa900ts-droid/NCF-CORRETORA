import type { Metadata } from "next";
import { requireContext } from "@/lib/session";
import { PasswordForm, ProfileForm } from "./forms";

export const metadata: Metadata = { title: "Minha conta" };

export default async function AccountPage() {
  const { profile, user } = await requireContext();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">Minha conta</h1>
      <div className="grid gap-6 lg:grid-cols-2">
        <ProfileForm fullName={profile?.full_name ?? ""} phone={profile?.phone ?? ""} email={user.email ?? ""} />
        <PasswordForm />
      </div>
    </div>
  );
}
