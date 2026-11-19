export type Role = "admin" | "editor" | "viewer";

export const ROLE_LABEL: Record<Role, string> = {
  admin: "Administrador",
  editor: "Corretor",
  viewer: "Visualizador",
};

export type FormState = { error?: string; success?: string };

export type OrgSettings = {
  organization_id: string;
  trade_name: string | null;
  logo_path: string | null;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  contact_email: string | null;
  contact_phone: string | null;
  website: string | null;
  address: string | null;
  max_users: number;
  default_validity_days: number;
  intro_text: string | null;
  closing_text: string | null;
  legal_disclaimer: string;
};
