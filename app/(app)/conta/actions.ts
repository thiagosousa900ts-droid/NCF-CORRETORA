"use server";

import { revalidatePath } from "next/cache";
import { requireContext } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import { firstIssue, newPasswordSchema, profileSchema } from "@/lib/validation";
import type { FormState } from "@/lib/types";

export async function updateProfile(_prev: FormState, formData: FormData): Promise<FormState> {
  const { user } = await requireContext();
  const parsed = profileSchema.safeParse({ full_name: formData.get("full_name"), phone: formData.get("phone") ?? "" });
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  const supabase = await createClient();
  const { error } = await supabase.from("user_profiles").update(parsed.data).eq("id", user.id);
  if (error) return { error: "Não foi possível salvar seus dados. Tente de novo." };
  revalidatePath("/", "layout");
  return { success: "Dados salvos." };
}

export async function changePassword(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireContext();
  const parsed = newPasswordSchema.safeParse({
    password: formData.get("password"),
    confirm: formData.get("confirm"),
  });
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { error: "Não foi possível alterar a senha. Tente de novo." };
  return { success: "Senha alterada." };
}
