-- UrbanHars Partner Verification Portal
-- Supabase PostgreSQL Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- TECHNICIANS TABLE
-- ============================================
create table if not exists technicians (
  id uuid primary key default uuid_generate_v4(),
  reference_id text unique not null,

  -- Personal Information
  full_name text not null,
  dob date not null,
  gender text not null check (gender in ('Male', 'Female', 'Other')),

  -- Phone Verification
  phone_number text unique not null,
  phone_verified boolean default false,
  otp_verified_at timestamptz,

  -- Contact
  email text,

  -- Address
  address_line1 text not null,
  address_line2 text,
  city text not null,
  state text not null default 'Karnataka',
  pincode text not null check (pincode ~ '^\d{6}$'),

  -- Profile Photo
  profile_photo_url text,

  -- Service Details
  service_categories text[] default '{}',
  experience text,
  current_occupation text,
  previous_company text,
  languages_known text[] default '{}',
  service_areas text[] default '{}',

  -- Emergency Contact
  emergency_contact_name text,
  emergency_contact_relationship text,
  emergency_contact_phone text,
  emergency_contact_alternate_phone text,

  -- Documents
  aadhaar_front_url text,
  aadhaar_back_url text,
  selfie_url text,

  -- Vehicle
  vehicle_available boolean default false,
  vehicle_number text,

  -- GPS Location
  latitude decimal(10, 8),
  longitude decimal(11, 8),
  location_timestamp timestamptz,

  -- Terms & Consents
  terms_accepted boolean default false,
  terms_accepted_at timestamptz,
  privacy_consent boolean default false,
  gps_consent boolean default false,
  document_consent boolean default false,
  criminal_declaration boolean default false,
  criminal_declaration_at timestamptz,

  -- Verification
  verification_score integer default 0 check (verification_score >= 0 and verification_score <= 100),
  verification_status text default 'pending' check (verification_status in ('pending', 'approved', 'rejected', 'suspended')),
  approval_notes text,
  approved_by text,
  approved_at timestamptz,

  -- Timestamps
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- INDEXES
-- ============================================
create index idx_technicians_phone on technicians(phone_number);
create index idx_technicians_status on technicians(verification_status);
create index idx_technicians_reference on technicians(reference_id);
create index idx_technicians_city on technicians(city);
create index idx_technicians_created on technicians(created_at desc);

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language 'plpgsql';

create trigger update_technicians_updated_at
  before update on technicians
  for each row execute function update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
alter table technicians enable row level security;

-- Allow anonymous reads for dashboard (by phone)
create policy "technicians_read_own" on technicians
  for select
  using (true);

-- Allow insert for registration
create policy "technicians_insert" on technicians
  for insert
  with check (true);

-- Allow update (admin via service role)
create policy "technicians_update" on technicians
  for update
  using (true);

-- ============================================
-- STORAGE BUCKETS
-- Setup in Supabase Dashboard > Storage
-- OR run these if using service role
-- ============================================

-- In Supabase Dashboard, create bucket: technician-documents
-- Settings: Public bucket = true
-- Allowed MIME types: image/jpeg, image/png, application/pdf
-- Max file size: 5MB (5242880 bytes)

-- ============================================
-- SAMPLE DATA (for testing)
-- ============================================
insert into technicians (
  reference_id, full_name, dob, gender,
  phone_number, phone_verified, otp_verified_at,
  email, address_line1, city, state, pincode,
  service_categories, experience, service_areas,
  emergency_contact_name, emergency_contact_relationship, emergency_contact_phone,
  vehicle_available, terms_accepted, terms_accepted_at,
  privacy_consent, gps_consent, document_consent, criminal_declaration,
  verification_score, verification_status
) values
(
  'UH-TECH-10001', 'Rajesh Kumar', '1990-05-15', 'Male',
  '9876543210', true, now(),
  'rajesh@example.com', '45 MG Road', 'Bangalore', 'Karnataka', '560001',
  ARRAY['AC Repair', 'Refrigerator Repair'], '3-5 Years', ARRAY['Bangalore North', 'Whitefield'],
  'Suresh Kumar', 'Father', '9876543211',
  true, true, now(),
  true, true, true, true,
  90, 'approved'
),
(
  'UH-TECH-10002', 'Priya Sharma', '1995-08-22', 'Female',
  '9876543212', true, now(),
  null, '12 Indiranagar', 'Bangalore', 'Karnataka', '560038',
  ARRAY['Washing Machine Repair', 'Microwave Repair'], '1-3 Years', ARRAY['Bangalore East', 'Marathahalli'],
  'Mohan Sharma', 'Father', '9876543213',
  false, true, now(),
  true, true, true, true,
  60, 'pending'
);

-- ============================================
-- USEFUL QUERIES
-- ============================================

-- Count by status
-- select verification_status, count(*) from technicians group by verification_status;

-- Get pending with low score
-- select full_name, phone_number, verification_score from technicians where verification_status = 'pending' order by verification_score desc;

-- Search technician
-- select * from technicians where phone_number = '9876543210' or reference_id = 'UH-TECH-10001';
