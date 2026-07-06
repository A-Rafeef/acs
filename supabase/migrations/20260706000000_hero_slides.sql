-- Migration to support customizable Hero Slides from the Admin Panel

create table hero_slides (
  id uuid primary key default gen_random_uuid(),
  image text not null,
  subtitle text,
  title_line_1 text not null,
  title_line_2 text,
  description text,
  cta_text text not null default 'Shop',
  cta_href text not null default '/shop',
  secondary_cta_text text,
  secondary_cta_href text,
  sort_order integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table hero_slides enable row level security;

-- Policies
create policy "Allow public read for hero slides" on hero_slides
  for select using (true);

create policy "Allow admin write for hero slides" on hero_slides
  for all using (auth.uid() is not null) with check (auth.uid() is not null);
