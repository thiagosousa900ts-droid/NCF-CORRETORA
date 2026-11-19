# NCF | Continuidade a partir da Fase 2

Data de verificação: 19/11/2026

## O que este pacote contém

Este ZIP contém o projeto integral recebido como “ncf-plataforma-fase2.zip”, incluindo os componentes da Fase 1 (autenticação, usuários, perfis, marca, navegação) e Fase 2 (clientes, operadoras, planos, benefícios e rede credenciada). O código foi preservado; adicionamos apenas este documento de orientação.

## Estado verificado

- Projeto Supabase NCF encontrado e ativo.
- Tabelas das fases seguintes já existem no Supabase: quotations, current_contracts, comparisons, comparison_items, presentations, import_batches etc.
- Todas as tabelas listadas no esquema `public` estão com RLS habilitado.
- Migrações 001 a 007 registradas no banco.
- 0 usuários no Auth e 0 membros na organização na data da consulta: o primeiro administrador ainda precisa ser criado.
- O ZIP não traz uma pasta de migrations SQL; a existência delas foi verificada diretamente no projeto remoto, não exportada.
- Build/execução não validados: instalação das dependências não pôde ser concluída neste ambiente.

## Etapas recomendadas

1. Faça backup deste ZIP em local seguro e crie um repositório GitHub **privado**.
2. Extraia e envie o conteúdo da pasta `ncf` para a raiz do repositório, mantendo `package.json`, `app`, `lib` etc. na raiz. Se enviar a pasta `ncf` como subpasta, selecione `ncf` como Root Directory na Vercel.
3. Importe o repositório na Vercel como Next.js. Configure as quatro variáveis presentes em `.env.example`, preenchendo a chave de servidor `SUPABASE_SERVICE_ROLE_KEY` na Vercel. Não adicione essa chave ao GitHub nem a publique como `NEXT_PUBLIC_*`.
4. Configure `NEXT_PUBLIC_SITE_URL` com a URL HTTPS efetiva do site implantado e faça o deploy.
5. No Supabase > Authentication > URL Configuration, ajuste o Site URL e os Redirect URLs para o domínio efetivo. Configure modelos Invite user / Reset password conforme o README original.
6. No Supabase > Authentication > Users, convide o primeiro administrador previsto no README. Confirme o convite, crie a senha e teste o login.
7. No site, teste: cadastro de cliente, operadora, plano, benefício, rede credenciada, permissão de usuário e recuperação de senha.
8. Só após validar a base: desenvolver interface de cotações e contratos vigentes; motor de comparação; PDF comercial; importação e conciliação das planilhas.

## Pontos que exigem validação

- O README afirma que o primeiro administrador será vinculado automaticamente depois do convite e da confirmação: há triggers de criação/vinculação de usuário no Supabase, mas ainda não houve teste ponta a ponta.
- A contagem de usuários, planos e cotações era zero no momento da revisão; testes com dados fictícios ainda são necessários.
- As rotas/ações do fluxo de comparação, importação e apresentações não aparecem no código da Fase 2, embora as tabelas já existam no banco.

Não há necessidade de obter um ZIP separado da Fase 1 para continuar a partir deste projeto.
