-- 1. Create PROFILES table (Linked to Auth)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable RLS on Profiles
alter table public.profiles enable row level security;

-- Policy: Public profiles are viewable by everyone
create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

-- Policy: Users can insert their own profile
create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

-- Policy: Users can update own profile
create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- 3. Auto-create Profile on Signup (Trigger)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$;

-- Trigger checks
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 4. Create Storage Bucket for AI Uploads
insert into storage.buckets (id, name, public)
values ('uploads', 'uploads', true)
on conflict (id) do nothing;

-- 5. Storage Policies (Fixed Syntax)
-- Policy: Public can view images (Select)
create policy "Public Access to Uploads"
  on storage.objects for select
  using ( bucket_id = 'uploads' );

-- Policy: Auth Users can upload images (Insert)
create policy "Auth Users can upload images"
  on storage.objects for insert
  with check ( bucket_id = 'uploads' and auth.role() = 'authenticated' );

-- Policy: Users can update their own images (Update)
create policy "Auth Users can update own images"
  on storage.objects for update
  using ( bucket_id = 'uploads' and auth.uid() = owner );

-- Policy: Users can delete their own images (Delete)
create policy "Auth Users can delete own images"
  on storage.objects for delete
  using ( bucket_id = 'uploads' and auth.uid() = owner );
