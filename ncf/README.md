# NCF — Plataforma de comparativos de planos de saúde

Fase 1 (fundação): login, perfis e permissões, convite de usuários, marca da corretora e layout principal.
Fase 2 (cadastros): clientes (com faixas etárias e histórico de atendimentos), operadoras e produtos (com benefícios
e rede credenciada por produto, sempre com fonte, data e situação de validação).
Banco de dados: projeto Supabase **NCF** (`rmmdfhhxonddpqlsrlyg`), com RLS em todas as tabelas.

## Rodar localmente

```bash
npm install
cp .env.example .env.local     # preencha SUPABASE_SERVICE_ROLE_KEY
npm run dev                    # http://localhost:3000
```

`SUPABASE_SERVICE_ROLE_KEY` fica em Supabase > Project Settings > API Keys (chave secreta).
Ela só é usada no servidor, para enviar convites. Nunca a coloque em variável `NEXT_PUBLIC_*`.

## Primeiro acesso (administrador)

A organização "NCF" já foi criada no banco. O e-mail `thiagosousa900.ts@gmail.com` está reservado como primeiro
administrador: assim que essa conta for criada **e o e-mail confirmado**, ela vira administrador automaticamente.

1. Supabase > Authentication > Users > **Add user > Send invitation** (ou "Create new user" com e-mail confirmado).
2. Abra o link do e-mail, defina a senha e entre.

## Configurar o Auth no painel do Supabase

1. **Authentication > URL Configuration**: *Site URL* = endereço público do sistema; em *Redirect URLs* inclua
   `http://localhost:3000/**` e o domínio de produção `/**`.
2. **Authentication > Email Templates**: nos modelos *Invite user* e *Reset password*, troque o link por (abre em
   qualquer aparelho e funciona com o fluxo do app):

   ```html
   <!-- Invite user -->
   <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=invite&next=/reset-password">Aceitar convite</a>

   <!-- Reset password -->
   <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/reset-password">Criar nova senha</a>
   ```
3. **Authentication > Sign In / Providers**: mantenha *Confirm email* ativo e desative *Allow new users to sign up*
   (o acesso é só por convite).
4. **Authentication > Policies / Password**: ative a proteção contra senhas vazadas e senha mínima de 10 caracteres.
5. **Authentication > SMTP**: configure SMTP próprio. O e-mail padrão do Supabase tem limite baixo e não serve
   para produção.

## Publicar na Vercel

1. Importe o repositório na Vercel (framework: Next.js).
2. Variáveis de ambiente: as 4 do `.env.example` (com `NEXT_PUBLIC_SITE_URL` = domínio final).
3. Em Domains, adicione o domínio personalizado e atualize *Site URL*/*Redirect URLs* no Supabase.

## Estrutura

```
proxy.ts                 renova a sessão e protege as rotas
lib/session.ts           usuário, perfil e organização da requisição
lib/supabase/*           clientes (servidor, proxy e service_role)
app/(auth)/*             entrar, recuperar e definir senha
app/(app)/*              painel, clientes, operadoras, produtos, minha conta, usuários, marca e dados
app/auth/*               confirmação de e-mail/convite e saída
```

## Segurança

- Permissões são aplicadas no banco (RLS). A interface só esconde o que o banco já bloqueia.
- O administrador nunca vê nem define senhas: usuários criam a própria senha pelo link do e-mail.
- Logotipo validado por conteúdo (PNG/JPG/WebP, até 2 MB), em bucket privado com URL assinada.
- Cabeçalhos de segurança em `next.config.mjs`.

## Migrations

O esquema está aplicado no projeto NCF. Para versionar o SQL neste repositório:
`npx supabase link --project-ref rmmdfhhxonddpqlsrlyg && npx supabase db pull`.
