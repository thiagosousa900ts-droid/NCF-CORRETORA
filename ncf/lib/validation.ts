import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email("Informe um e-mail válido.")),
  password: z.string().min(1, "Informe a senha."),
});

export const emailSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email("Informe um e-mail válido.")),
});

export const passwordSchema = z
  .string()
  .min(10, "A senha precisa ter ao menos 10 caracteres.")
  .regex(/[A-Za-z]/, "A senha precisa ter ao menos uma letra.")
  .regex(/[0-9]/, "A senha precisa ter ao menos um número.");

export const newPasswordSchema = z
  .object({ password: passwordSchema, confirm: z.string() })
  .refine((v) => v.password === v.confirm, { message: "As senhas não conferem.", path: ["confirm"] });

export const inviteSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email("Informe um e-mail válido.")),
  full_name: z.string().trim().min(2, "Informe o nome.").max(120),
  role: z.enum(["admin", "editor", "viewer"]),
});

const hex = z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Cor inválida.");
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((v) => (v === "" ? null : v));

export const brandSchema = z.object({
  org_name: z.string().trim().min(2, "Informe o nome da corretora.").max(120),
  trade_name: optionalText(120),
  primary_color: hex,
  secondary_color: hex,
  accent_color: hex,
  contact_email: optionalText(160),
  contact_phone: optionalText(40),
  website: optionalText(200),
  address: optionalText(300),
  max_users: z.coerce.number().int().min(1, "Mínimo de 1 usuário.").max(500),
  default_validity_days: z.coerce.number().int().min(1).max(365),
  intro_text: optionalText(2000),
  closing_text: optionalText(2000),
  legal_disclaimer: z.string().trim().min(5, "Informe o aviso legal.").max(1000),
});

export const profileSchema = z.object({
  full_name: z.string().trim().min(2, "Informe seu nome.").max(120),
  phone: optionalText(40),
});

export function firstIssue(err: z.ZodError): string {
  return err.issues[0]?.message ?? "Dados inválidos.";
}

/* ---------- Fase 2: cadastros ---------- */

function isValidCpf(cpf: string): boolean {
  if (!/^\d{11}$/.test(cpf) || /^(\d)\1+$/.test(cpf)) return false;
  const calc = (len: number) => {
    let sum = 0;
    for (let i = 0; i < len; i++) sum += Number(cpf[i]) * (len + 1 - i);
    const r = (sum * 10) % 11;
    return r === 10 ? 0 : r;
  };
  return calc(9) === Number(cpf[9]) && calc(10) === Number(cpf[10]);
}

function isValidCnpj(cnpj: string): boolean {
  if (!/^\d{14}$/.test(cnpj) || /^(\d)\1+$/.test(cnpj)) return false;
  const calc = (len: number) => {
    const weights = len === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    let sum = 0;
    for (let i = 0; i < len; i++) sum += Number(cnpj[i]) * weights[i];
    const r = sum % 11;
    return r < 2 ? 0 : 11 - r;
  };
  return calc(12) === Number(cnpj[12]) && calc(13) === Number(cnpj[13]);
}

const nullIfEmpty = (v: string) => (v === "" ? null : v);
const intOrNull = (min: number, max: number, msg: string) =>
  z
    .string()
    .trim()
    .transform((v) => (v === "" ? null : Number(v)))
    .pipe(z.number(msg).int(msg).min(min, msg).max(max, msg).nullable());

export const clientSchema = z
  .object({
    name: z.string().trim().min(2, "Informe o nome ou a razão social.").max(160),
    person_type: z.enum(["pf", "pj"], "Escolha pessoa física ou jurídica."),
    document: z.string().trim().transform((v) => nullIfEmpty(v.replace(/\D/g, ""))),
    email: z
      .string()
      .trim()
      .max(160)
      .transform((v) => nullIfEmpty(v.toLowerCase()))
      .pipe(z.email("E-mail inválido.").nullable()),
    phone: optionalText(40),
    city: optionalText(120),
    state: z
      .string()
      .trim()
      .transform((v) => nullIfEmpty(v.toUpperCase()))
      .pipe(z.string().regex(/^[A-Z]{2}$/, "UF inválida.").nullable()),
    lives_count: intOrNull(0, 100000, "Quantidade de beneficiários inválida."),
    desired_contract_type: optionalText(80),
    pj_contract_kind: z
      .string()
      .transform(nullIfEmpty)
      .pipe(z.enum(["pme", "empresarial"]).nullable()),
    notes: optionalText(2000),
  })
  .superRefine((v, ctx) => {
    if (v.document) {
      const ok = v.person_type === "pf" ? isValidCpf(v.document) : isValidCnpj(v.document);
      if (!ok) {
        ctx.addIssue({ code: "custom", path: ["document"], message: v.person_type === "pf" ? "CPF inválido." : "CNPJ inválido." });
      }
    }
  });

export const interactionSchema = z.object({
  channel: z.string().transform(nullIfEmpty).pipe(z.enum(["telefone", "whatsapp", "email", "reuniao", "outro"]).nullable()),
  summary: z.string().trim().min(3, "Descreva o atendimento.").max(2000),
});

export const operatorSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome da operadora.").max(120),
  ans_registry: optionalText(40),
  availability: z.enum(["disponivel", "indisponivel", "suspensa"]),
  contacts: z
    .string()
    .max(2000)
    .transform((v) =>
      v
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean)
        .slice(0, 20),
    ),
  notes: optionalText(2000),
});

const validationEnum = z.enum(["confirmado", "nao_disponivel", "pendente_validacao"]);
const dateOrNull = z
  .string()
  .trim()
  .transform(nullIfEmpty)
  .pipe(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida.").nullable());

export const planSchema = z.object({
  operator_id: z.uuid("Escolha a operadora."),
  commercial_name: z.string().trim().min(2, "Informe o nome comercial do plano.").max(160),
  product_code: optionalText(60),
  ans_product_registry: optionalText(60),
  segmentation: optionalText(120),
  contract_type: optionalText(120),
  coverage_area: optionalText(120),
  accommodation: optionalText(80),
  copay_modality: optionalText(120),
  reimbursement: optionalText(1000),
  grace_periods: optionalText(1000),
  network_summary: optionalText(2000),
  additional_benefits: optionalText(2000),
  restrictions: optionalText(2000),
  availability: z.enum(["disponivel", "indisponivel", "suspenso"]),
  validation_status: validationEnum,
  source: optionalText(300),
  reference_date: dateOrNull,
  notes: optionalText(2000),
});

export const featureSchema = z.object({
  name: z.string().trim().min(2, "Informe o benefício.").max(160),
  description: optionalText(1000),
  validation_status: validationEnum,
  source: optionalText(300),
  reference_date: dateOrNull,
});

export const networkSchema = z.object({
  entry_type: z.enum(["hospital", "laboratorio", "clinica", "outro"], "Escolha o tipo."),
  name: z.string().trim().min(2, "Informe o nome.").max(200),
  city: optionalText(120),
  state: z
    .string()
    .trim()
    .transform((v) => nullIfEmpty(v.toUpperCase()))
    .pipe(z.string().regex(/^[A-Z]{2}$/, "UF inválida.").nullable()),
  notes: optionalText(500),
  validation_status: validationEnum,
  source: optionalText(300),
  reference_date: dateOrNull,
});
