-- Initial Schema Setup for Premium Minimalist Thrift Store

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Create categories table
create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create brands table
create table brands (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Create products table
create table products (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  price numeric(10,2) not null,
  category_id uuid references categories(id) on delete set null,
  brand_id uuid references brands(id) on delete set null,
  condition text not null check (condition in ('new', 'excellent', 'good', 'fair')),
  size text,
  color text,
  status text not null check (status in ('draft', 'available', 'reserved', 'sold', 'archived')) default 'draft',
  view_count integer not null default 0,
  sold_at timestamp with time zone,
  archived_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  search_vector tsvector
);

-- 4. Create product_images table
create table product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade not null,
  url text not null,
  r2_key text not null,
  sort_order integer not null default 0,
  is_primary boolean not null default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Create waitlist table
create table waitlist (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade not null,
  email text not null,
  phone text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Full-Text Search Configuration
create or replace function products_search_trigger() returns trigger as $$
begin
  new.search_vector :=
    setweight(to_tsvector('english', coalesce(new.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(new.description, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(new.color, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(new.size, '')), 'C');
  return new;
end;
$$ language plpgsql;

create trigger products_search_update
  before insert or update on products
  for each row execute function products_search_trigger();

create index products_search_idx on products using gin(search_vector);

-- RPC function to increment product view counts securely (bypassing public write restrictions)
create or replace function increment_view_count(product_id uuid)
returns void as $$
begin
  update products
  set view_count = view_count + 1
  where id = product_id;
end;
$$ language plpgsql security definer;

-- Enable Row Level Security
alter table categories enable row level security;
alter table brands enable row level security;
alter table products enable row level security;
alter table product_images enable row level security;
alter table waitlist enable row level security;

-- RLS Policies

-- Categories
create policy "Allow public read for categories" on categories
  for select using (true);

create policy "Allow admin write for categories" on categories
  for all using (auth.uid() is not null) with check (auth.uid() is not null);

-- Brands
create policy "Allow public read for brands" on brands
  for select using (true);

create policy "Allow admin write for brands" on brands
  for all using (auth.uid() is not null) with check (auth.uid() is not null);

-- Products
create policy "Allow public select for active products" on products
  for select using (status in ('available', 'reserved', 'sold') or auth.uid() is not null);

create policy "Allow admin write for products" on products
  for all using (auth.uid() is not null) with check (auth.uid() is not null);

-- Product Images
create policy "Allow public select for product images" on product_images
  for select using (
    exists (
      select 1 from products
      where products.id = product_images.product_id
      and (products.status in ('available', 'reserved', 'sold') or auth.uid() is not null)
    )
  );

create policy "Allow admin write for product images" on product_images
  for all using (auth.uid() is not null) with check (auth.uid() is not null);

-- Waitlist
create policy "Allow public insert for waitlist" on waitlist
  for insert with check (true);

create policy "Allow admin all for waitlist" on waitlist
  for all using (auth.uid() is not null) with check (auth.uid() is not null);
