-- Criar tabela para os Modelos da Biblioteca de Ouro
create table if not exists public.gold_models (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  niche text,
  icon_name text, -- Nome do ícone da Lucide (ex: 'UserCircle')
  bg_gradient text,
  ctr text,
  roas text,
  views text,
  prompt_instruction text,
  example_video_url text,
  example_thumbnail_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (title)
);

-- Habilitar RLS
alter table public.gold_models enable row level security;

-- Política: Todos podem ler
drop policy if exists "Todos podem ver os modelos" on public.gold_models;
create policy "Todos podem ver os modelos" on public.gold_models for select using (true);

-- Política: Apenas admins podem gerenciar (usando profiles.is_admin)
drop policy if exists "Apenas admins podem gerenciar modelos" on public.gold_models;
create policy "Apenas admins podem gerenciar modelos" on public.gold_models 
for all 
to authenticated
using (
  exists (
    select 1 from public.profiles 
    where id = auth.uid() 
    and is_admin = true
  )
);
