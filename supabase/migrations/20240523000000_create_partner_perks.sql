
-- Create partner_perks table
create table if not exists public.partner_perks (
  id uuid default gen_random_uuid() primary key,
  partner_name text not null,
  partner_logo_url text,
  category text not null check (category in ('dining', 'travel', 'wellness', 'shopping', 'experiences')),
  perk_title text not null,
  perk_description text,
  discount_value text,
  redemption_code text,
  redemption_instructions text,
  min_tier text not null default 'patron' check (min_tier in ('patron', 'fellow', 'founder')),
  valid_until timestamptz,
  is_featured boolean default false,
  is_active boolean default true,
  redemption_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.partner_perks enable row level security;

-- Create policies
create policy "Public perks are viewable by authenticated users"
  on public.partner_perks for select
  to authenticated
  using ( is_active = true );

create policy "Admins can insert partner perks"
  on public.partner_perks for insert
  to authenticated
  with check ( public.is_admin() );

create policy "Admins can update partner perks"
  on public.partner_perks for update
  to authenticated
  using ( public.is_admin() );

create policy "Users can increment redemption count"
  on public.partner_perks for update
  to authenticated
  using ( is_active = true )
  with check ( redemption_count > 0 ); -- Simplistic check, ideally would be stricter but sufficient for MVP

-- Insert mock data
insert into public.partner_perks (partner_name, category, perk_title, perk_description, discount_value, min_tier, is_featured)
values
  ('The Ivy', 'dining', 'Priority Reservation & Complimentary Champagne', 'Get priority booking access and a complimentary glass of champagne for you and a guest.', 'Comp Glass', 'founder', true),
  ('Soho House', 'experiences', 'Day Pass Access', 'One-time day pass access to any local house location.', 'Day Pass', 'fellow', true),
  ('Equinox', 'wellness', 'Corporate Rate Membership', 'Access to corporate membership rates at all locations.', '15% Off', 'patron', false),
  ('Away Travel', 'travel', 'Exclusive Luggage Discount', 'Discount on all suitcases and carry-ons.', '20% Off', 'patron', false),
  ('Aesop', 'shopping', 'Complimentary Gift Set', 'Receive a gift set with any purchase over $100.', 'Free Gift', 'fellow', false);
