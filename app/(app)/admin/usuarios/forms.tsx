"use client";

import { useActionState } from "react";
import { inviteUser, setMemberActive, updateMemberRole } from "./actions";
import { SubmitButton } from "@/components/submit-button";
import { FormMessage } from "@/components/form-message";
import { ROLE_LABEL, type FormState, type Role } from "@/lib/types";

export function InviteForm() {
  const [state, action] = useActionState<FormState, FormData>(inviteUser, {});
  return (
    <form action={action} className="card space-y-4 p-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Convidar usuário</h2>
        <p className="mt-1 text-sm text-slate-600">
          A pessoa recebe um e-mail para criar a própria senha. Você nunca vê nem define senhas.
        </p>
      </div>
      <FormMessage state={state} />
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="full_name" className="label">
            Nome
          </label>
          <input id="full_name" name="full_name" required className="input" />
        </div>
        <div>
          <label htmlFor="email" className="label">
            E-mail
          </label>
          <input id="email" name="email" type="email" required className="input" />
        </div>
        <div>
          <label htmlFor="role" className="label">
            Perfil
          </label>
          <select id="role" name="role" defaultValue="editor" className="input">
            {(Object.keys(ROLE_LABEL) as Role[]).map((r) => (
              <option key={r} value={r}>
                {ROLE_LABEL[r]}
              </option>
            ))}
          </select>
        </div>
      </div>
      <SubmitButton pendingLabel="Enviando…">Enviar convite</SubmitButton>
    </form>
  );
}

export type MemberRowData = {
  id: string;
  name: string;
  email: string;
  role: Role;
  active: boolean;
  isSelf: boolean;
};

export function MemberRow({ m }: { m: MemberRowData }) {
  const [roleState, roleAction] = useActionState<FormState, FormData>(updateMemberRole, {});
  const [activeState, activeAction] = useActionState<FormState, FormData>(setMemberActive, {});
  const message = roleState.error || roleState.success ? roleState : activeState;

  return (
    <li className="flex flex-col gap-3 border-b border-slate-100 px-6 py-4 last:border-b-0 lg:flex-row lg:items-center lg:justify-between">
      <div className="min-w-0">
        <p className="truncate font-medium text-slate-900">
          {m.name}
          {m.isSelf && <span className="ml-2 text-xs font-normal text-slate-500">(você)</span>}
        </p>
        <p className="truncate text-sm text-slate-600">{m.email}</p>
        {(message.error || message.success) && (
          <div className="mt-2">
            <FormMessage state={message} />
          </div>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <span
          className={
            "rounded-full px-2.5 py-0.5 text-xs font-medium " +
            (m.active ? "bg-emerald-50 text-emerald-800" : "bg-slate-100 text-slate-600")
          }
        >
          {m.active ? "Ativo" : "Desativado"}
        </span>
        <form action={roleAction} className="flex items-center gap-2">
          <input type="hidden" name="member_id" value={m.id} />
          <label htmlFor={`role-${m.id}`} className="sr-only">
            Perfil de {m.name}
          </label>
          <select
            id={`role-${m.id}`}
            name="role"
            defaultValue={m.role}
            disabled={m.isSelf}
            className="input w-auto py-1.5"
          >
            {(Object.keys(ROLE_LABEL) as Role[]).map((r) => (
              <option key={r} value={r}>
                {ROLE_LABEL[r]}
              </option>
            ))}
          </select>
          {!m.isSelf && (
            <SubmitButton className="btn-secondary" pendingLabel="Salvando…">
              Salvar perfil
            </SubmitButton>
          )}
        </form>
        {!m.isSelf && (
          <form action={activeAction}>
            <input type="hidden" name="member_id" value={m.id} />
            <input type="hidden" name="active" value={m.active ? "false" : "true"} />
            <SubmitButton className={m.active ? "btn-danger" : "btn-secondary"} pendingLabel="Aguarde…">
              {m.active ? "Desativar acesso" : "Reativar acesso"}
            </SubmitButton>
          </form>
        )}
      </div>
    </li>
  );
}
