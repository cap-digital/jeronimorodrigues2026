# Relatórios — configuração do Supabase

A página **/relatorios** deixa o cliente adicionar, ler e baixar relatórios
(PDF/DOCX). Os arquivos ficam no **Supabase Storage** e os dados (título,
tipo, período) numa tabela. Este guia liga tudo em ~5 minutos.

> Enquanto não estiver configurado, a página abre normalmente mas mostra o
> aviso "Armazenamento ainda não configurado". Nada quebra.

---

## 1. Tabela de metadados

No Supabase: **SQL Editor → New query**, cole e rode:

```sql
create table if not exists public.relatorios (
  id             uuid primary key default gen_random_uuid(),
  titulo         text not null default '',
  tipo           text not null check (tipo in ('dia','semana','mes')),
  periodo_inicio date,
  periodo_fim    date,
  arquivo_path   text not null,
  arquivo_nome   text not null,
  mime           text,
  tamanho        bigint,
  criado_em      timestamptz not null default now()
);

-- RLS ligada: só o servidor (service_role) escreve/lê.
-- O navegador nunca fala direto com a tabela.
alter table public.relatorios enable row level security;
```

Não é preciso criar policies: a chave `service_role` (usada só no servidor)
ignora a RLS. Deixar a RLS ligada sem policies bloqueia o acesso público —
que é exatamente o que queremos.

## 2. Bucket de Storage

**Storage → New bucket**:

- **Name:** `RelatorioJeronimo`
- **Public bucket:** **NÃO** (deixe privado)

> O nome do bucket fica definido em `lib/supabase.ts` (`RELATORIOS_BUCKET`).
> Se um dia trocar o bucket, é só ajustar essa constante.

Os arquivos são servidos por links assinados temporários gerados pelo
servidor — o bucket privado é o comportamento correto e seguro.

> O upload do navegador usa uma **URL de upload assinada** emitida pelo
> servidor, então também não precisa de policies de Storage.

## 3. Chaves e variáveis de ambiente

Copie o exemplo e preencha:

```bash
cp .env.local.example .env.local
```

| Variável | Onde encontrar |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Settings → API → Project URL (já preenchida). |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Settings → API → chave `anon`/publishable (já preenchida). |
| `SUPABASE_SERVICE_ROLE_KEY` | Settings → API → chave `service_role`/secret. **Segredo!** |

Reinicie o `npm run dev` depois de editar o `.env.local`.

## 4. Produção (Vercel)

Adicione as **três** variáveis em **Project → Settings → Environment
Variables** e faça um novo deploy. Mantenha `SUPABASE_SERVICE_ROLE_KEY`
apenas como variável de servidor (sem o prefixo `NEXT_PUBLIC_`).

---

## Como funciona (resumo técnico)

1. O navegador pede uma URL de upload assinada — `POST /api/relatorios/upload-url`.
2. O arquivo sobe **direto** ao Storage (contorna o limite de 4,5 MB das
   funções serverless).
3. O servidor grava os metadados — `POST /api/relatorios`.
4. **Ler / Baixar** — `GET /api/relatorios/:id/file` gera um link assinado
   (validade 10 min) e redireciona; `?download=1` força o download.
5. **Excluir** — `DELETE /api/relatorios/:id` remove o arquivo e o registro.

Formatos aceitos: **PDF, DOC, DOCX**.
