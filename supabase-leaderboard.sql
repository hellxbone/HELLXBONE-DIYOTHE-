-- A executer dans l'editeur SQL Supabase pour MEGA RIFF.
-- Tableau public anonyme: les scores ne sont pas certifies anti-triche.
create table if not exists public.riff_scores (
  id bigint generated always as identity primary key,
  player_id text not null check (char_length(player_id) between 6 and 100),
  player_name text not null check (char_length(player_name) between 1 and 20),
  score integer not null check (score between 1 and 100000000),
  created_at timestamptz not null default now()
);
create index if not exists riff_scores_rank_idx on public.riff_scores(score desc);
alter table public.riff_scores enable row level security;
drop policy if exists "Anyone can submit a valid score" on public.riff_scores;
create policy "Anyone can submit a valid score" on public.riff_scores for insert to anon with check (true);
-- Ne pas accorder de lecture brute des identifiants joueurs.
revoke all on public.riff_scores from anon, authenticated;
grant insert(player_id,player_name,score) on public.riff_scores to anon;
grant usage,select on sequence public.riff_scores_id_seq to anon;
create or replace view public.riff_top10 with (security_invoker=false) as
select distinct on (player_id) player_name, score
from public.riff_scores
order by player_id, score desc, created_at asc;
grant select on public.riff_top10 to anon;
-- Attention: la vue ne limite pas elle-meme les resultats. Le client demande order=score.desc&limit=10.
-- En production, proteger la soumission via une fonction serveur, anti-spam et validation des parties.
