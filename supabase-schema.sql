-- Nexora B2B Commerce - Supabase schema inicial
-- Use no Supabase Dashboard > SQL Editor.
--
-- Importante:
-- Estas policies permitem leitura/escrita anonima para a demo frontend funcionar
-- com publishable key. Para producao, troque por policies baseadas em auth.uid()
-- e uma tabela de membros por empresa.

create table if not exists public.nexora_products (
  id uuid primary key default gen_random_uuid(),
  company_id text not null,
  company_name text,
  sku text not null,
  name text not null,
  price numeric(14, 2) not null default 0,
  stock integer not null default 0,
  status text not null default 'Ativo',
  source text not null default 'Cadastro manual',
  source_url text,
  media_count integer not null default 0,
  media_summary text not null default 'Sem mídia',
  created_label text,
  updated_label text,
  synced_at timestamptz not null default now(),
  unique (company_id, sku)
);

create index if not exists nexora_products_company_idx on public.nexora_products (company_id);
create index if not exists nexora_products_sku_idx on public.nexora_products (sku);
create index if not exists nexora_products_status_idx on public.nexora_products (status);

alter table public.nexora_products enable row level security;

drop policy if exists "nexora demo products read" on public.nexora_products;
drop policy if exists "nexora demo products insert" on public.nexora_products;
drop policy if exists "nexora demo products update" on public.nexora_products;
drop policy if exists "nexora demo products delete" on public.nexora_products;

create policy "nexora demo products read"
on public.nexora_products
for select
to anon
using (true);

create policy "nexora demo products insert"
on public.nexora_products
for insert
to anon
with check (true);

create policy "nexora demo products update"
on public.nexora_products
for update
to anon
using (true)
with check (true);

create policy "nexora demo products delete"
on public.nexora_products
for delete
to anon
using (true);

-- Opcional para o proximo ciclo: metadados de midias.
-- O app atual salva o arquivo localmente na demo e sincroniza resumo/count.
-- Em producao, envie arquivos para Supabase Storage e salve as URLs aqui.
create table if not exists public.nexora_product_media (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.nexora_products (id) on delete cascade,
  company_id text not null,
  sku text not null,
  file_name text not null,
  media_type text not null,
  storage_url text not null,
  file_size integer default 0,
  created_at timestamptz not null default now()
);

create index if not exists nexora_product_media_product_idx on public.nexora_product_media (product_id);
create index if not exists nexora_product_media_company_idx on public.nexora_product_media (company_id);

alter table public.nexora_product_media enable row level security;

drop policy if exists "nexora demo media read" on public.nexora_product_media;
drop policy if exists "nexora demo media insert" on public.nexora_product_media;
drop policy if exists "nexora demo media update" on public.nexora_product_media;
drop policy if exists "nexora demo media delete" on public.nexora_product_media;

create policy "nexora demo media read"
on public.nexora_product_media
for select
to anon
using (true);

create policy "nexora demo media insert"
on public.nexora_product_media
for insert
to anon
with check (true);

create policy "nexora demo media update"
on public.nexora_product_media
for update
to anon
using (true)
with check (true);

create policy "nexora demo media delete"
on public.nexora_product_media
for delete
to anon
using (true);
