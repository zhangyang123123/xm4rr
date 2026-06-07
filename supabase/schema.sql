-- Enable UUID extension
create extension if not exists "pgcrypto";

-- Profiles table
create table if not exists public.profiles (
  id uuid references auth.users(id) primary key,
  username text unique not null,
  name text not null,
  bio text,
  avatar_url text,
  theme text default 'theme-purple',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Links table
create table if not exists public.links (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete cascade not null,
  category text not null check (category in ('social', 'works', 'contact')),
  label text not null,
  url text not null,
  icon_name text not null,
  sort_order int default 0 not null,
  created_at timestamptz default now() not null
);

-- Link clicks table
create table if not exists public.link_clicks (
  id uuid primary key default gen_random_uuid(),
  link_id uuid references public.links(id) on delete cascade not null,
  profile_id uuid references public.profiles(id) on delete cascade not null,
  referrer text,
  user_agent text,
  ip_hash text,
  clicked_at timestamptz default now() not null
);

-- Indexes
create index if not exists idx_links_profile_id on public.links(profile_id);
create index if not exists idx_links_category on public.links(category);
create index if not exists idx_link_clicks_link_id on public.link_clicks(link_id);
create index if not exists idx_link_clicks_profile_id on public.link_clicks(profile_id);
create index if not exists idx_link_clicks_clicked_at on public.link_clicks(clicked_at);
create index if not exists idx_profiles_username on public.profiles(username);

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.links enable row level security;
alter table public.link_clicks enable row level security;

-- Policies: profiles
-- Anyone can view a public profile
drop policy if exists "Public profiles are viewable by everyone" on public.profiles;
create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using (true);

-- Users can update their own profile
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Trigger function to create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  base_username text;
  final_username text;
  counter int := 1;
begin
  base_username := coalesce(
    split_part(new.email, '@', 1),
    'user'
  );
  base_username := regexp_replace(base_username, '[^a-zA-Z0-9_]', '', 'g');
  if length(base_username) < 3 then
    base_username := 'user' || substr(md5(new.id::text), 1, 5);
  end if;
  final_username := base_username;
  loop
    if not exists (select 1 from public.profiles where username = final_username) then
      exit;
    end if;
    final_username := base_username || counter;
    counter := counter + 1;
  end loop;

  insert into public.profiles (id, username, name, bio, theme)
  values (
    new.id,
    final_username,
    coalesce(new.raw_user_meta_data->>'name', final_username),
    '这个人很懒，还没有填写简介～',
    'theme-purple'
  );
  return new;
end;
$$;

-- Attach trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Policies: links
-- Anyone can view links of a profile
drop policy if exists "Public can view all links" on public.links;
create policy "Public can view all links"
  on public.links for select
  using (true);

-- Users can insert their own links
drop policy if exists "Users can insert own links" on public.links;
create policy "Users can insert own links"
  on public.links for insert
  with check (auth.uid() = profile_id);

-- Users can update their own links
drop policy if exists "Users can update own links" on public.links;
create policy "Users can update own links"
  on public.links for update
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);

-- Users can delete their own links
drop policy if exists "Users can delete own links" on public.links;
create policy "Users can delete own links"
  on public.links for delete
  using (auth.uid() = profile_id);

-- Policies: link_clicks
-- Anyone can record a click (public access)
drop policy if exists "Anyone can record a link click" on public.link_clicks;
create policy "Anyone can record a link click"
  on public.link_clicks for insert
  with check (true);

-- Only owner can view their link clicks
drop policy if exists "Owner can view own link clicks" on public.link_clicks;
create policy "Owner can view own link clicks"
  on public.link_clicks for select
  using (auth.uid() = profile_id);
