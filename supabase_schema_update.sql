-- ====================================================================
-- MATCH & MARKET — COMPLETE SCHEMA UPDATE (v2)
-- Run this ENTIRE script in Supabase Dashboard > SQL Editor > Run.
--
-- WHY THIS UPDATE EXISTS (verified against the live project):
--   1. Sign-up not recording: Supabase Auth has "Confirm email" enabled
--      and the free built-in SMTP hit its rate limit
--      (error: 429 over_email_send_rate_limit), so signUp aborts before
--      any table write. Schema cannot fix that alone -> see the note at
--      the bottom of this file for the dashboard switch.
--   2. All live tables use UUID primary keys, but the app seeds baseline
--      rows with text IDs ('v1', 'm1', ...). Every seeded insert failed
--      with "invalid input syntax for type uuid". This script converts
--      the ID columns to TEXT (non-destructive: existing UUID values are
--      kept as their string form).
--   3. The Help & Support form sends a camelCase "userId" key, but the
--      inquiries table only has user_id -> PostgREST PGRST204 error, so
--      inquiries were never saved. A compatibility column + trigger below
--      makes the existing frontend code work WITHOUT any code change.
-- ====================================================================


-- ====================================================================
-- 1. CREATE MISSING TABLES (no effect on tables that already exist)
-- ====================================================================

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

CREATE TABLE IF NOT EXISTS public.gas_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  gas_size TEXT,
  household_size NUMERIC,
  days_remaining NUMERIC,
  last_refill_date TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.escrow_transactions (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  payer TEXT NOT NULL,
  vendor_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Holding',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

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

CREATE TABLE IF NOT EXISTS public.inquiries (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  name TEXT,
  phone TEXT,
  topic TEXT,
  message TEXT,
  admin_response TEXT,
  status TEXT DEFAULT 'Pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

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

CREATE TABLE IF NOT EXISTS public.banned_vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ====================================================================
-- 2. CONVERT UUID PRIMARY KEYS -> TEXT (fixes baseline seed inserts
--    like 'v1' / 'm1' and keeps existing UUID rows intact as strings)
-- ====================================================================

DO $$
DECLARE
  tbl TEXT;
  tables TEXT[] := ARRAY[
    'profiles', 'escrow_transactions', 'delivery_jobs', 'vendors',
    'menu_items', 'inquiries', 'vendor_approvals', 'rider_approvals',
    'chama_deals'
  ];
BEGIN
  FOREACH tbl IN ARRAY tables LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = tbl
        AND column_name = 'id'
        AND data_type = 'uuid'
    ) THEN
      EXECUTE format(
        'ALTER TABLE public.%I ALTER COLUMN id DROP DEFAULT;', tbl
      );
      EXECUTE format(
        'ALTER TABLE public.%I ALTER COLUMN id TYPE TEXT USING id::text;', tbl
      );
      EXECUTE format(
        'ALTER TABLE public.%I ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;', tbl
      );
    END IF;
  END LOOP;
END $$;


-- ====================================================================
-- 3. MAKE SURE EVERY COLUMN THE APP WRITES EXISTS
-- ====================================================================

ALTER TABLE public.profiles        ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.profiles        ADD COLUMN IF NOT EXISTS username TEXT;
ALTER TABLE public.profiles        ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.profiles        ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles        ADD COLUMN IF NOT EXISTS role TEXT;
ALTER TABLE public.profiles        ADD COLUMN IF NOT EXISTS linked_entity_name TEXT;
ALTER TABLE public.profiles        ADD COLUMN IF NOT EXISTS profile_photo_url TEXT;
ALTER TABLE public.profiles        ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.profiles        ADD COLUMN IF NOT EXISTS delivery_point TEXT;
ALTER TABLE public.profiles        ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.profiles        ADD COLUMN IF NOT EXISTS pickup_note TEXT;

ALTER TABLE public.inquiries       ADD COLUMN IF NOT EXISTS user_id TEXT;
ALTER TABLE public.inquiries       ADD COLUMN IF NOT EXISTS admin_response TEXT;

ALTER TABLE public.vendor_approvals ADD COLUMN IF NOT EXISTS login_email TEXT;
ALTER TABLE public.vendor_approvals ADD COLUMN IF NOT EXISTS login_password TEXT;

ALTER TABLE public.rider_approvals  ADD COLUMN IF NOT EXISTS login_email TEXT;
ALTER TABLE public.rider_approvals  ADD COLUMN IF NOT EXISTS login_password TEXT;

ALTER TABLE public.delivery_jobs    ADD COLUMN IF NOT EXISTS rider_name TEXT;
ALTER TABLE public.delivery_jobs    ADD COLUMN IF NOT EXISTS otp TEXT;
ALTER TABLE public.delivery_jobs    ADD COLUMN IF NOT EXISTS boda_pool_active BOOLEAN DEFAULT FALSE;

ALTER TABLE public.menu_items       ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;


-- ====================================================================
-- 4. COMPATIBILITY SHIM: the Help & Support form inserts a camelCase
--    "userId" key. This quoted column + trigger accepts it and copies
--    the value into user_id, so the existing frontend works unchanged.
-- ====================================================================

ALTER TABLE public.inquiries ADD COLUMN IF NOT EXISTS "userId" TEXT;

CREATE OR REPLACE FUNCTION public.sync_inquiry_userid()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW."userId" IS NOT NULL THEN
    NEW.user_id := NEW."userId";
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_inquiries_sync_userid ON public.inquiries;
CREATE TRIGGER trg_inquiries_sync_userid
  BEFORE INSERT OR UPDATE ON public.inquiries
  FOR EACH ROW EXECUTE FUNCTION public.sync_inquiry_userid();


-- ====================================================================
-- 5. ROW LEVEL SECURITY — permissive policies so both anonymous and
--    logged-in sessions can use every feature (sign-up profile insert
--    happens BEFORE a session may exist, so anon must be allowed)
-- ====================================================================

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
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', tbl);
    EXECUTE format('DROP POLICY IF EXISTS "Public Full Access %I" ON public.%I;', tbl, tbl);
    EXECUTE format(
      'CREATE POLICY "Public Full Access %I" ON public.%I FOR ALL USING (true) WITH CHECK (true);',
      tbl, tbl
    );
    EXECUTE format('GRANT ALL ON public.%I TO anon, authenticated, service_role;', tbl);
  END LOOP;
END $$;


-- ====================================================================
-- 6. HELPFUL INDEXES (idempotent)
-- ====================================================================

CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles (username);
CREATE INDEX IF NOT EXISTS idx_profiles_phone    ON public.profiles (phone);
CREATE INDEX IF NOT EXISTS idx_inquiries_user    ON public.inquiries (user_id);
CREATE INDEX IF NOT EXISTS idx_vendor_app_phone  ON public.vendor_approvals (phone);
CREATE INDEX IF NOT EXISTS idx_rider_app_phone   ON public.rider_approvals (phone);
CREATE INDEX IF NOT EXISTS idx_delivery_order    ON public.delivery_jobs (order_id);
CREATE INDEX IF NOT EXISTS idx_escrow_order      ON public.escrow_transactions (order_id);
CREATE INDEX IF NOT EXISTS idx_gas_user          ON public.gas_predictions (user_id);


-- ====================================================================
-- 7. REFRESH THE REST API SCHEMA CACHE (so PostgREST sees the changes
--    immediately without waiting)
-- ====================================================================
NOTIFY pgrst, 'reload schema';


-- ====================================================================
-- 8. NOTIFICATIONS TABLE (cross-user order release alerts)
--    The app writes one row per recipient (customer, vendor, rider)
--    whenever escrow is released, so each of them sees the update in
--    their own dashboard the next time they sign in.
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  phone TEXT,
  target_name TEXT,
  recipient_role TEXT,
  order_id TEXT,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS user_id TEXT;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS target_name TEXT;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS recipient_role TEXT;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS order_id TEXT;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS read BOOLEAN DEFAULT FALSE;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'notifications'
      AND column_name = 'id'
      AND data_type = 'uuid'
  ) THEN
    ALTER TABLE public.notifications ALTER COLUMN id DROP DEFAULT;
    ALTER TABLE public.notifications ALTER COLUMN id TYPE TEXT USING id::text;
    ALTER TABLE public.notifications ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
  END IF;
END $$;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Full Access notifications" ON public.notifications;
CREATE POLICY "Public Full Access notifications" ON public.notifications FOR ALL USING (true) WITH CHECK (true);
GRANT ALL ON public.notifications TO anon, authenticated, service_role;

CREATE INDEX IF NOT EXISTS idx_notifications_user  ON public.notifications (user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_phone ON public.notifications (phone);
CREATE INDEX IF NOT EXISTS idx_notifications_name  ON public.notifications (target_name);

NOTIFY pgrst, 'reload schema';


-- ====================================================================
-- 9. RIDER PANEL UPGRADES (earnings, availability, payouts)
--    a) delivery_jobs.delivered_at  -> timestamps used by the rider
--       Earnings Desk (Today / This Week / Total).
--    b) payout_requests             -> M-Pesa payout requests riders
--       submit and the admin marks Paid / Rejected.
-- ====================================================================

ALTER TABLE public.delivery_jobs ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS public.payout_requests (
  id TEXT PRIMARY KEY,
  rider_name TEXT,
  phone TEXT,
  amount DOUBLE PRECISION DEFAULT 0,
  status TEXT DEFAULT 'Pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'payout_requests'
      AND column_name = 'id'
      AND data_type = 'uuid'
  ) THEN
    ALTER TABLE public.payout_requests ALTER COLUMN id DROP DEFAULT;
    ALTER TABLE public.payout_requests ALTER COLUMN id TYPE TEXT USING id::text;
    ALTER TABLE public.payout_requests ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
  END IF;
END $$;

ALTER TABLE public.payout_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Full Access payout_requests" ON public.payout_requests;
CREATE POLICY "Public Full Access payout_requests" ON public.payout_requests FOR ALL USING (true) WITH CHECK (true);
GRANT ALL ON public.payout_requests TO anon, authenticated, service_role;

CREATE INDEX IF NOT EXISTS idx_payout_rider ON public.payout_requests (rider_name);
CREATE INDEX IF NOT EXISTS idx_payout_status ON public.payout_requests (status);

NOTIFY pgrst, 'reload schema';


-- ====================================================================
-- 10. RIDER PANEL ROUND 2 (badge, receipts, leaderboard, zone fees,
--     offline queue)
--    a) rider_approvals.approved_at -> timestamp shown on the rider
--       profile badge (set automatically when admin approves).
--    b) zone_fees                   -> admin-configured per-zone
--       suggested transit fees shown to riders on matching jobs.
--     (Receipts, leaderboard and the offline queue are computed
--      client-side from delivery_jobs - no extra tables needed.)
-- ====================================================================

ALTER TABLE public.rider_approvals ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS public.zone_fees (
  id TEXT PRIMARY KEY,
  zone TEXT,
  fee DOUBLE PRECISION DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'zone_fees'
      AND column_name = 'id'
      AND data_type = 'uuid'
  ) THEN
    ALTER TABLE public.zone_fees ALTER COLUMN id DROP DEFAULT;
    ALTER TABLE public.zone_fees ALTER COLUMN id TYPE TEXT USING id::text;
    ALTER TABLE public.zone_fees ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
  END IF;
END $$;

ALTER TABLE public.zone_fees ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Full Access zone_fees" ON public.zone_fees;
CREATE POLICY "Public Full Access zone_fees" ON public.zone_fees FOR ALL USING (true) WITH CHECK (true);
GRANT ALL ON public.zone_fees TO anon, authenticated, service_role;

CREATE INDEX IF NOT EXISTS idx_zone_fees_zone ON public.zone_fees (zone);

NOTIFY pgrst, 'reload schema';


-- ====================================================================
-- REQUIRED DASHBOARD STEP FOR SIGN-UP (schema alone cannot fix this):
--
-- Supabase Dashboard > Authentication > Sign In / Providers > Email:
--   * Make sure "Enable Email provider" is ON.
--   * For development, turn OFF "Confirm email".
--     Reason: with confirmation ON, every sign-up sends an email through
--     the free built-in SMTP (~3-4 emails/hour). Once exhausted, sign-up
--     fails with "over_email_send_rate_limit" and NOTHING is recorded —
--     exactly the symptom you reported.
--   * For production, keep confirmation ON but configure your own SMTP
--     provider (Authentication > SMTP Settings) to lift the rate limit.
--
-- After changing the switch, sign up again in the app: a row must appear
-- in public.profiles (id = the auth user's UUID).
-- ====================================================================
