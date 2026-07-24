-- ====================================================================
-- SUPABASE COMPLETE QUERY SCHEMA FOR MATCH & MARKET PLATFORM
-- Execute this script in your Supabase SQL Editor to create/align
-- all tables, indexes, and Row Level Security (RLS) policies.
-- ====================================================================

-- 1. PROFILES (User Login & Registration)
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  email TEXT,
  username TEXT,
  name TEXT,
  phone TEXT,
  role TEXT,
  linked_entity_name TEXT,
  profile_photo_url TEXT,
  address TEXT,
  delivery_point TEXT,
  bio TEXT,
  pickup_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS linked_entity_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS profile_photo_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS delivery_point TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS pickup_note TEXT;

-- 2. GAS PREDICTIONS (Gas-O-Meter Smart Tracker)
CREATE TABLE IF NOT EXISTS public.gas_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  gas_size TEXT,
  household_size NUMERIC,
  days_remaining NUMERIC,
  last_refill_date TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ESCROW TRANSACTIONS (Escrow Payment Ledger - Holding/Released/Refunded)
CREATE TABLE IF NOT EXISTS public.escrow_transactions (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  payer TEXT NOT NULL,
  vendor_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Holding',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. DELIVERY JOBS (Dispatch & Boda Boda Rider Fleet)
CREATE TABLE IF NOT EXISTS public.delivery_jobs (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  destination TEXT NOT NULL,
  fee NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Available',
  rider_name TEXT,
  customer_phone TEXT,
  merchant_name TEXT,
  items_summary TEXT,
  otp TEXT,
  boda_pool_active BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. VENDORS (Marketplace Stores & Merchants)
CREATE TABLE IF NOT EXISTS public.vendors (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  sub_type TEXT,
  rating NUMERIC DEFAULT 5.0,
  delivery_time TEXT,
  min_order NUMERIC DEFAULT 0,
  badge TEXT,
  image TEXT,
  approved BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. MENU ITEMS (Marketplace Products & Dishes)
CREATE TABLE IF NOT EXISTS public.menu_items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL DEFAULT 0,
  description TEXT,
  category TEXT,
  store_name TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. INQUIRIES (Help & Support Messages)
CREATE TABLE IF NOT EXISTS public.inquiries (
  id TEXT PRIMARY KEY,
  name TEXT,
  phone TEXT,
  topic TEXT,
  message TEXT,
  status TEXT DEFAULT 'Pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. VENDOR APPROVALS (Vendor Registration Request Queue)
CREATE TABLE IF NOT EXISTS public.vendor_approvals (
  id TEXT PRIMARY KEY,
  shop_name TEXT NOT NULL,
  category TEXT NOT NULL,
  phone TEXT NOT NULL,
  login_email TEXT,
  login_password TEXT,
  status TEXT DEFAULT 'Pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.vendor_approvals ADD COLUMN IF NOT EXISTS login_email TEXT;
ALTER TABLE public.vendor_approvals ADD COLUMN IF NOT EXISTS login_password TEXT;

-- 9. RIDER APPROVALS (Boda Boda Rider Onboarding Request Queue)
CREATE TABLE IF NOT EXISTS public.rider_approvals (
  id TEXT PRIMARY KEY,
  rider_name TEXT NOT NULL,
  motorcycle_plate TEXT NOT NULL,
  phone TEXT NOT NULL,
  login_email TEXT,
  login_password TEXT,
  status TEXT DEFAULT 'Pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.rider_approvals ADD COLUMN IF NOT EXISTS login_email TEXT;
ALTER TABLE public.rider_approvals ADD COLUMN IF NOT EXISTS login_password TEXT;

-- 10. CHAMA DEALS (Bulk Buying & Chama Group Buys)
CREATE TABLE IF NOT EXISTS public.chama_deals (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  merchant TEXT NOT NULL,
  category TEXT,
  total_price NUMERIC NOT NULL,
  portion_price NUMERIC NOT NULL,
  target_portions INTEGER NOT NULL,
  filled_portions INTEGER DEFAULT 0,
  backers TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. BANNED VENDORS (Store Blacklist)
CREATE TABLE IF NOT EXISTS public.banned_vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES & PERMISSIONS
-- Ensures full CRUD (Select, Insert, Update, Delete) for client apps
-- ====================================================================

-- Helper function to enable full access policies on tables
DO $$
DECLARE
  tbl TEXT;
  tables TEXT[] := ARRAY[
    'profiles', 'gas_predictions', 'escrow_transactions', 'delivery_jobs',
    'vendors', 'menu_items', 'inquiries', 'vendor_approvals',
    'rider_approvals', 'chama_deals', 'banned_vendors'
  ];
BEGIN
  FOREACH tbl IN ARRAY tables LOOP
    -- Enable RLS
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', tbl);
    
    -- Drop policy if existing to prevent duplication error
    EXECUTE format('DROP POLICY IF EXISTS "Public Full Access %I" ON public.%I;', tbl, tbl);
    
    -- Create open policy for select, insert, update, delete
    EXECUTE format(
      'CREATE POLICY "Public Full Access %I" ON public.%I FOR ALL USING (true) WITH CHECK (true);',
      tbl, tbl
    );

    -- Grant permissions to anon and authenticated roles
    EXECUTE format('GRANT ALL ON public.%I TO anon, authenticated, service_role;', tbl);
  END LOOP;
END $$;
