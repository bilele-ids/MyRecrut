-- Activer UUID
create extension if not exists "pgcrypto";

-- Table candidatures
create table candidatures (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  entreprise  text not null,
  source      text not null default '',
  statut      text not null default 'Envoyé'
              check (statut in ('Envoyé','Entretien','Relancé','Refus','Accepté')),
  salaire     text,
  localisation text,
  lien_offre  text,
  commentaires text,
  date        date not null default current_date,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Index sur user_id pour les requêtes filtrées
create index candidatures_user_id_idx on candidatures (user_id);

-- Row Level Security : chaque utilisateur ne voit que ses données
alter table candidatures enable row level security;

create policy "Utilisateur voit ses candidatures"
  on candidatures for select
  using (auth.uid() = user_id);

create policy "Utilisateur crée ses candidatures"
  on candidatures for insert
  with check (auth.uid() = user_id);

create policy "Utilisateur modifie ses candidatures"
  on candidatures for update
  using (auth.uid() = user_id);

create policy "Utilisateur supprime ses candidatures"
  on candidatures for delete
  using (auth.uid() = user_id);
