-- Run this once in Supabase: SQL Editor > New query > paste > Run.
-- It creates the posts table for the Social page with safe row-level security.

create table if not exists posts (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users default auth.uid(),
  author text not null,
  body text not null check (char_length(body) <= 280),
  created_at timestamptz default now()
);

alter table posts enable row level security;

create policy "anyone can read posts" on posts
  for select using (true);

create policy "signed-in users can post as themselves" on posts
  for insert with check (auth.uid() = user_id);

create policy "users can delete their own posts" on posts
  for delete using (auth.uid() = user_id);
