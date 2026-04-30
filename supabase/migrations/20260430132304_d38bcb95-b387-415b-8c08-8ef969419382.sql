
-- Profiles table
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles viewable by authenticated"
  on public.profiles for select to authenticated using (true);
create policy "Users insert own profile"
  on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "Users update own profile"
  on public.profiles for update to authenticated using (auth.uid() = id);

-- Tasks table
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text not null,
  category text not null,
  location text not null,
  contact text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index tasks_user_id_idx on public.tasks(user_id);
create index tasks_category_idx on public.tasks(category);
create index tasks_created_at_idx on public.tasks(created_at desc);

alter table public.tasks enable row level security;

create policy "Tasks viewable by authenticated"
  on public.tasks for select to authenticated using (true);
create policy "Users insert own tasks"
  on public.tasks for insert to authenticated with check (auth.uid() = user_id);
create policy "Users update own tasks"
  on public.tasks for update to authenticated using (auth.uid() = user_id);
create policy "Users delete own tasks"
  on public.tasks for delete to authenticated using (auth.uid() = user_id);

-- Task responses (one-to-many: task -> responses)
create table public.task_responses (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  message text not null,
  created_at timestamptz not null default now()
);

create index task_responses_task_id_idx on public.task_responses(task_id);
create index task_responses_user_id_idx on public.task_responses(user_id);

alter table public.task_responses enable row level security;

create policy "Responses viewable by authenticated"
  on public.task_responses for select to authenticated using (true);
create policy "Users insert own responses"
  on public.task_responses for insert to authenticated with check (auth.uid() = user_id);
create policy "Users update own responses"
  on public.task_responses for update to authenticated using (auth.uid() = user_id);
create policy "Users delete own responses"
  on public.task_responses for delete to authenticated using (auth.uid() = user_id);

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger tasks_updated_at before update on public.tasks
  for each row execute function public.set_updated_at();

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)));
  return new;
end; $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
