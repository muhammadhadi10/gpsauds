-- =============================================================================
-- GPSA-UDS — Supabase Database Schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New query).
-- Safe to re-run: all objects use CREATE IF NOT EXISTS / OR REPLACE.
-- =============================================================================

-- =============================================================================
-- 0. EXTENSIONS
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- for fuzzy text search

-- =============================================================================
-- 1. ENUMS
-- =============================================================================

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM (
    'super_admin', 'treasurer', 'academic', 'welfare',
    'events', 'opportunities', 'ediboard', 'student'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE membership_status AS ENUM (
    'pending', 'active', 'expired', 'suspended'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE membership_tier AS ENUM (
    '100_level', '200_level', '300_level',
    '400_level', '500_level', 'alumnus'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM (
    'pending', 'success', 'failed', 'abandoned'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE payment_provider AS ENUM ('paystack');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE mobile_money_network AS ENUM (
    'mtn', 'vodafone', 'airteltigo'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE event_type AS ENUM (
    'general', 'academic', 'social', 'welfare', 'executive'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE event_status AS ENUM (
    'draft', 'published', 'cancelled', 'completed'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE news_status AS ENUM ('draft', 'published', 'archived');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE opportunity_type AS ENUM (
    'internship', 'scholarship', 'job', 'conference', 'workshop', 'other'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE opportunity_status AS ENUM (
    'draft', 'published', 'closed', 'archived'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE welfare_request_status AS ENUM (
    'submitted', 'under_review', 'approved', 'rejected', 'disbursed'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE welfare_request_type AS ENUM (
    'financial', 'medical', 'bereavement', 'emergency', 'other'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE resource_type AS ENUM (
    'past_question', 'lecture_note', 'textbook', 'research_paper', 'other'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE notification_type AS ENUM (
    'membership', 'payment', 'event', 'news',
    'opportunity', 'welfare', 'system'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =============================================================================
-- 2. HELPER FUNCTION — updated_at trigger
-- =============================================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- =============================================================================
-- 3. TABLES
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 3.1 profiles
-- Extends auth.users. Created automatically on sign-up via trigger (§5).
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS profiles (
  id              UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email           TEXT        NOT NULL,
  full_name       TEXT        NOT NULL,
  student_id      TEXT        UNIQUE,
  phone           TEXT,
  level           membership_tier,
  role            user_role   NOT NULL DEFAULT 'student',
  avatar_url      TEXT,
  bio             TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS profiles_role_idx      ON profiles(role);
CREATE INDEX IF NOT EXISTS profiles_student_id_idx ON profiles(student_id);
CREATE INDEX IF NOT EXISTS profiles_full_name_trgm ON profiles USING GIN (full_name gin_trgm_ops);

DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- 3.2 payments
-- Paystack transaction records; memberships reference these.
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS payments (
  id              UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID            NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reference       TEXT            NOT NULL UNIQUE,  -- Paystack reference
  amount          INTEGER         NOT NULL CHECK (amount > 0), -- pesewas
  currency        TEXT            NOT NULL DEFAULT 'GHS',
  status          payment_status  NOT NULL DEFAULT 'pending',
  provider        payment_provider NOT NULL DEFAULT 'paystack',
  network         mobile_money_network,
  mobile_number   TEXT,
  metadata        JSONB,
  paid_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS payments_user_id_idx   ON payments(user_id);
CREATE INDEX IF NOT EXISTS payments_reference_idx  ON payments(reference);
CREATE INDEX IF NOT EXISTS payments_status_idx     ON payments(status);

DROP TRIGGER IF EXISTS payments_updated_at ON payments;
CREATE TRIGGER payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- 3.3 memberships
-- One active membership per user per academic year.
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS memberships (
  id              UUID              PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID              NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status          membership_status NOT NULL DEFAULT 'pending',
  tier            membership_tier   NOT NULL,
  academic_year   TEXT              NOT NULL,  -- e.g. "2024/2025"
  start_date      DATE,
  end_date        DATE,
  payment_id      UUID              REFERENCES payments(id),
  verified_by     UUID              REFERENCES profiles(id),
  verified_at     TIMESTAMPTZ,
  notes           TEXT,
  created_at      TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ       NOT NULL DEFAULT NOW(),

  UNIQUE (user_id, academic_year)
);

CREATE INDEX IF NOT EXISTS memberships_user_id_idx      ON memberships(user_id);
CREATE INDEX IF NOT EXISTS memberships_status_idx       ON memberships(status);
CREATE INDEX IF NOT EXISTS memberships_academic_year_idx ON memberships(academic_year);

DROP TRIGGER IF EXISTS memberships_updated_at ON memberships;
CREATE TRIGGER memberships_updated_at
  BEFORE UPDATE ON memberships
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- 3.4 events
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS events (
  id                      UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  title                   TEXT          NOT NULL,
  slug                    TEXT          NOT NULL UNIQUE,
  description             TEXT          NOT NULL,
  type                    event_type    NOT NULL DEFAULT 'general',
  status                  event_status  NOT NULL DEFAULT 'draft',
  cover_image_url         TEXT,
  location                TEXT,
  is_virtual              BOOLEAN       NOT NULL DEFAULT FALSE,
  virtual_link            TEXT,
  starts_at               TIMESTAMPTZ   NOT NULL,
  ends_at                 TIMESTAMPTZ,
  capacity                INTEGER       CHECK (capacity > 0),
  registration_required   BOOLEAN       NOT NULL DEFAULT FALSE,
  registration_deadline   TIMESTAMPTZ,
  created_by              UUID          NOT NULL REFERENCES profiles(id),
  published_at            TIMESTAMPTZ,
  created_at              TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS events_status_idx    ON events(status);
CREATE INDEX IF NOT EXISTS events_starts_at_idx ON events(starts_at);
CREATE INDEX IF NOT EXISTS events_slug_idx      ON events(slug);

DROP TRIGGER IF EXISTS events_updated_at ON events;
CREATE TRIGGER events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- 3.5 event_registrations
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS event_registrations (
  id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id        UUID        NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id         UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  registered_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (event_id, user_id)
);

CREATE INDEX IF NOT EXISTS event_registrations_event_id_idx ON event_registrations(event_id);
CREATE INDEX IF NOT EXISTS event_registrations_user_id_idx  ON event_registrations(user_id);

-- ---------------------------------------------------------------------------
-- 3.6 news
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS news (
  id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  title           TEXT        NOT NULL,
  slug            TEXT        NOT NULL UNIQUE,
  excerpt         TEXT,
  content         TEXT        NOT NULL,
  cover_image_url TEXT,
  status          news_status NOT NULL DEFAULT 'draft',
  is_featured     BOOLEAN     NOT NULL DEFAULT FALSE,
  author_id       UUID        NOT NULL REFERENCES profiles(id),
  published_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS news_status_idx      ON news(status);
CREATE INDEX IF NOT EXISTS news_author_id_idx   ON news(author_id);
CREATE INDEX IF NOT EXISTS news_published_at_idx ON news(published_at DESC);
CREATE INDEX IF NOT EXISTS news_title_trgm       ON news USING GIN (title gin_trgm_ops);

DROP TRIGGER IF EXISTS news_updated_at ON news;
CREATE TRIGGER news_updated_at
  BEFORE UPDATE ON news
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- 3.7 news_tags
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS news_tags (
  id      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  news_id UUID NOT NULL REFERENCES news(id) ON DELETE CASCADE,
  tag     TEXT NOT NULL,

  UNIQUE (news_id, tag)
);

CREATE INDEX IF NOT EXISTS news_tags_news_id_idx ON news_tags(news_id);
CREATE INDEX IF NOT EXISTS news_tags_tag_idx     ON news_tags(tag);

-- ---------------------------------------------------------------------------
-- 3.8 opportunities
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS opportunities (
  id              UUID                NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
  title           TEXT                NOT NULL,
  slug            TEXT                NOT NULL UNIQUE,
  description     TEXT                NOT NULL,
  type            opportunity_type    NOT NULL,
  status          opportunity_status  NOT NULL DEFAULT 'draft',
  organisation    TEXT                NOT NULL,
  location        TEXT,
  is_remote       BOOLEAN             NOT NULL DEFAULT FALSE,
  application_url TEXT,
  deadline        TIMESTAMPTZ,
  cover_image_url TEXT,
  eligibility     TEXT,
  benefits        TEXT,
  posted_by       UUID                NOT NULL REFERENCES profiles(id),
  published_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ         NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS opportunities_status_idx   ON opportunities(status);
CREATE INDEX IF NOT EXISTS opportunities_type_idx     ON opportunities(type);
CREATE INDEX IF NOT EXISTS opportunities_deadline_idx ON opportunities(deadline);

DROP TRIGGER IF EXISTS opportunities_updated_at ON opportunities;
CREATE TRIGGER opportunities_updated_at
  BEFORE UPDATE ON opportunities
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- 3.9 welfare_requests
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS welfare_requests (
  id                  UUID                  PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID                  NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type                welfare_request_type  NOT NULL,
  status              welfare_request_status NOT NULL DEFAULT 'submitted',
  title               TEXT                  NOT NULL,
  description         TEXT                  NOT NULL,
  amount_requested    NUMERIC(10,2),
  amount_approved     NUMERIC(10,2),
  supporting_documents TEXT[]               NOT NULL DEFAULT '{}',
  reviewed_by         UUID                  REFERENCES profiles(id),
  reviewed_at         TIMESTAMPTZ,
  review_notes        TEXT,
  disbursed_at        TIMESTAMPTZ,
  created_at          TIMESTAMPTZ           NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ           NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS welfare_requests_user_id_idx ON welfare_requests(user_id);
CREATE INDEX IF NOT EXISTS welfare_requests_status_idx  ON welfare_requests(status);
CREATE INDEX IF NOT EXISTS welfare_requests_type_idx    ON welfare_requests(type);

DROP TRIGGER IF EXISTS welfare_requests_updated_at ON welfare_requests;
CREATE TRIGGER welfare_requests_updated_at
  BEFORE UPDATE ON welfare_requests
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- 3.10 academic_resources
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS academic_resources (
  id              UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
  title           TEXT            NOT NULL,
  description     TEXT,
  type            resource_type   NOT NULL,
  course_code     TEXT,
  course_name     TEXT,
  level           membership_tier,
  academic_year   TEXT,
  file_url        TEXT            NOT NULL,
  file_name       TEXT            NOT NULL,
  file_size       INTEGER         NOT NULL CHECK (file_size > 0),
  file_type       TEXT            NOT NULL,
  download_count  INTEGER         NOT NULL DEFAULT 0,
  is_approved     BOOLEAN         NOT NULL DEFAULT FALSE,
  uploaded_by     UUID            NOT NULL REFERENCES profiles(id),
  approved_by     UUID            REFERENCES profiles(id),
  approved_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS academic_resources_type_idx    ON academic_resources(type);
CREATE INDEX IF NOT EXISTS academic_resources_level_idx   ON academic_resources(level);
CREATE INDEX IF NOT EXISTS academic_resources_approved_idx ON academic_resources(is_approved);

DROP TRIGGER IF EXISTS academic_resources_updated_at ON academic_resources;
CREATE TRIGGER academic_resources_updated_at
  BEFORE UPDATE ON academic_resources
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- 3.11 notifications
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS notifications (
  id          UUID              PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID              NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type        notification_type NOT NULL,
  title       TEXT              NOT NULL,
  body        TEXT              NOT NULL,
  is_read     BOOLEAN           NOT NULL DEFAULT FALSE,
  action_url  TEXT,
  metadata    JSONB,
  created_at  TIMESTAMPTZ       NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS notifications_user_id_idx  ON notifications(user_id);
CREATE INDEX IF NOT EXISTS notifications_is_read_idx  ON notifications(is_read);
CREATE INDEX IF NOT EXISTS notifications_created_at_idx ON notifications(created_at DESC);

-- ---------------------------------------------------------------------------
-- 3.12 site_settings
-- Key-value store for CMS-managed configuration.
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS site_settings (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  key         TEXT        NOT NULL UNIQUE,
  value       TEXT        NOT NULL,
  label       TEXT        NOT NULL,
  description TEXT,
  category    TEXT        NOT NULL DEFAULT 'general',
  updated_by  UUID        REFERENCES profiles(id),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS site_settings_category_idx ON site_settings(category);

-- =============================================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- =============================================================================

ALTER TABLE profiles            ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments            ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships         ENABLE ROW LEVEL SECURITY;
ALTER TABLE events              ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE news                ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_tags           ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities       ENABLE ROW LEVEL SECURITY;
ALTER TABLE welfare_requests    ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_resources  ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications       ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings       ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- Helper: check if the current user has a given role
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION auth_has_role(required_role user_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
      AND role = required_role
  );
$$;

CREATE OR REPLACE FUNCTION auth_is_admin()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
      AND role = 'super_admin'
  );
$$;

CREATE OR REPLACE FUNCTION auth_is_executive()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
      AND role IN (
        'super_admin', 'treasurer', 'academic', 'welfare',
        'events', 'opportunities', 'ediboard'
      )
  );
$$;

-- ---------------------------------------------------------------------------
-- 4.1 profiles policies
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "profiles: public read" ON profiles;
CREATE POLICY "profiles: public read"
  ON profiles FOR SELECT
  USING (TRUE);

DROP POLICY IF EXISTS "profiles: own update" ON profiles;
CREATE POLICY "profiles: own update"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles: admin full access" ON profiles;
CREATE POLICY "profiles: admin full access"
  ON profiles FOR ALL
  USING (auth_is_admin());

-- ---------------------------------------------------------------------------
-- 4.2 payments policies
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "payments: own read" ON payments;
CREATE POLICY "payments: own read"
  ON payments FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "payments: own insert" ON payments;
CREATE POLICY "payments: own insert"
  ON payments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "payments: treasurer/admin read all" ON payments;
CREATE POLICY "payments: treasurer/admin read all"
  ON payments FOR SELECT
  USING (auth_has_role('treasurer') OR auth_is_admin());

DROP POLICY IF EXISTS "payments: treasurer/admin update" ON payments;
CREATE POLICY "payments: treasurer/admin update"
  ON payments FOR UPDATE
  USING (auth_has_role('treasurer') OR auth_is_admin());

-- ---------------------------------------------------------------------------
-- 4.3 memberships policies
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "memberships: own read" ON memberships;
CREATE POLICY "memberships: own read"
  ON memberships FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "memberships: own insert" ON memberships;
CREATE POLICY "memberships: own insert"
  ON memberships FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "memberships: treasurer/admin full" ON memberships;
CREATE POLICY "memberships: treasurer/admin full"
  ON memberships FOR ALL
  USING (auth_has_role('treasurer') OR auth_is_admin());

-- ---------------------------------------------------------------------------
-- 4.4 events policies
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "events: published public read" ON events;
CREATE POLICY "events: published public read"
  ON events FOR SELECT
  USING (status = 'published' OR auth_is_executive());

DROP POLICY IF EXISTS "events: committee write" ON events;
CREATE POLICY "events: committee write"
  ON events FOR INSERT
  WITH CHECK (auth_has_role('events') OR auth_is_admin());

DROP POLICY IF EXISTS "events: committee update" ON events;
CREATE POLICY "events: committee update"
  ON events FOR UPDATE
  USING (auth_has_role('events') OR auth_is_admin());

DROP POLICY IF EXISTS "events: admin delete" ON events;
CREATE POLICY "events: admin delete"
  ON events FOR DELETE
  USING (auth_is_admin());

-- ---------------------------------------------------------------------------
-- 4.5 event_registrations policies
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "event_registrations: own read" ON event_registrations;
CREATE POLICY "event_registrations: own read"
  ON event_registrations FOR SELECT
  USING (auth.uid() = user_id OR auth_has_role('events') OR auth_is_admin());

DROP POLICY IF EXISTS "event_registrations: own insert" ON event_registrations;
CREATE POLICY "event_registrations: own insert"
  ON event_registrations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "event_registrations: own delete" ON event_registrations;
CREATE POLICY "event_registrations: own delete"
  ON event_registrations FOR DELETE
  USING (auth.uid() = user_id OR auth_is_admin());

-- ---------------------------------------------------------------------------
-- 4.6 news policies
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "news: published public read" ON news;
CREATE POLICY "news: published public read"
  ON news FOR SELECT
  USING (status = 'published' OR auth_is_executive());

DROP POLICY IF EXISTS "news: ediboard write" ON news;
CREATE POLICY "news: ediboard write"
  ON news FOR INSERT
  WITH CHECK (auth_has_role('ediboard') OR auth_is_admin());

DROP POLICY IF EXISTS "news: ediboard update" ON news;
CREATE POLICY "news: ediboard update"
  ON news FOR UPDATE
  USING (
    (auth_has_role('ediboard') AND author_id = auth.uid())
    OR auth_is_admin()
  );

DROP POLICY IF EXISTS "news: admin delete" ON news;
CREATE POLICY "news: admin delete"
  ON news FOR DELETE
  USING (auth_is_admin());

-- ---------------------------------------------------------------------------
-- 4.7 news_tags policies
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "news_tags: public read" ON news_tags;
CREATE POLICY "news_tags: public read"
  ON news_tags FOR SELECT
  USING (TRUE);

DROP POLICY IF EXISTS "news_tags: ediboard/admin write" ON news_tags;
CREATE POLICY "news_tags: ediboard/admin write"
  ON news_tags FOR ALL
  USING (auth_has_role('ediboard') OR auth_is_admin());

-- ---------------------------------------------------------------------------
-- 4.8 opportunities policies
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "opportunities: published public read" ON opportunities;
CREATE POLICY "opportunities: published public read"
  ON opportunities FOR SELECT
  USING (status = 'published' OR auth_is_executive());

DROP POLICY IF EXISTS "opportunities: committee write" ON opportunities;
CREATE POLICY "opportunities: committee write"
  ON opportunities FOR INSERT
  WITH CHECK (auth_has_role('opportunities') OR auth_is_admin());

DROP POLICY IF EXISTS "opportunities: committee update" ON opportunities;
CREATE POLICY "opportunities: committee update"
  ON opportunities FOR UPDATE
  USING (auth_has_role('opportunities') OR auth_is_admin());

DROP POLICY IF EXISTS "opportunities: admin delete" ON opportunities;
CREATE POLICY "opportunities: admin delete"
  ON opportunities FOR DELETE
  USING (auth_is_admin());

-- ---------------------------------------------------------------------------
-- 4.9 welfare_requests policies
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "welfare_requests: own read" ON welfare_requests;
CREATE POLICY "welfare_requests: own read"
  ON welfare_requests FOR SELECT
  USING (
    auth.uid() = user_id
    OR auth_has_role('welfare')
    OR auth_is_admin()
  );

DROP POLICY IF EXISTS "welfare_requests: own insert" ON welfare_requests;
CREATE POLICY "welfare_requests: own insert"
  ON welfare_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "welfare_requests: committee update" ON welfare_requests;
CREATE POLICY "welfare_requests: committee update"
  ON welfare_requests FOR UPDATE
  USING (
    (auth.uid() = user_id AND status = 'submitted')
    OR auth_has_role('welfare')
    OR auth_is_admin()
  );

DROP POLICY IF EXISTS "welfare_requests: admin delete" ON welfare_requests;
CREATE POLICY "welfare_requests: admin delete"
  ON welfare_requests FOR DELETE
  USING (auth_is_admin());

-- ---------------------------------------------------------------------------
-- 4.10 academic_resources policies
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "academic_resources: approved public read" ON academic_resources;
CREATE POLICY "academic_resources: approved public read"
  ON academic_resources FOR SELECT
  USING (is_approved = TRUE OR auth_is_executive());

DROP POLICY IF EXISTS "academic_resources: member upload" ON academic_resources;
CREATE POLICY "academic_resources: member upload"
  ON academic_resources FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "academic_resources: academic/admin update" ON academic_resources;
CREATE POLICY "academic_resources: academic/admin update"
  ON academic_resources FOR UPDATE
  USING (
    (auth.uid() = uploaded_by AND is_approved = FALSE)
    OR auth_has_role('academic')
    OR auth_is_admin()
  );

DROP POLICY IF EXISTS "academic_resources: admin delete" ON academic_resources;
CREATE POLICY "academic_resources: admin delete"
  ON academic_resources FOR DELETE
  USING (auth_has_role('academic') OR auth_is_admin());

-- ---------------------------------------------------------------------------
-- 4.11 notifications policies
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "notifications: own read" ON notifications;
CREATE POLICY "notifications: own read"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "notifications: own update (mark read)" ON notifications;
CREATE POLICY "notifications: own update (mark read)"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "notifications: system insert" ON notifications;
CREATE POLICY "notifications: system insert"
  ON notifications FOR INSERT
  WITH CHECK (auth_is_executive() OR auth_is_admin());

-- ---------------------------------------------------------------------------
-- 4.12 site_settings policies
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "site_settings: public read" ON site_settings;
CREATE POLICY "site_settings: public read"
  ON site_settings FOR SELECT
  USING (TRUE);

DROP POLICY IF EXISTS "site_settings: admin write" ON site_settings;
CREATE POLICY "site_settings: admin write"
  ON site_settings FOR ALL
  USING (auth_is_admin());

-- =============================================================================
-- 5. TRIGGERS — business logic
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 5.1 Auto-create profile on sign-up
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'student'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ---------------------------------------------------------------------------
-- 5.2 Auto-publish timestamps
-- Set published_at when status transitions to 'published'.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION set_published_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.status = 'published' AND OLD.status <> 'published' THEN
    NEW.published_at = NOW();
  END IF;
  IF NEW.status <> 'published' AND OLD.status = 'published' THEN
    NEW.published_at = NULL;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS events_published_at ON events;
CREATE TRIGGER events_published_at
  BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION set_published_at();

DROP TRIGGER IF EXISTS news_published_at ON news;
CREATE TRIGGER news_published_at
  BEFORE UPDATE ON news
  FOR EACH ROW EXECUTE FUNCTION set_published_at();

DROP TRIGGER IF EXISTS opportunities_published_at ON opportunities;
CREATE TRIGGER opportunities_published_at
  BEFORE UPDATE ON opportunities
  FOR EACH ROW EXECUTE FUNCTION set_published_at();

-- ---------------------------------------------------------------------------
-- 5.3 Auto-activate membership when payment succeeds
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION activate_membership_on_payment()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status = 'success' AND OLD.status <> 'success' THEN
    UPDATE public.memberships
    SET
      status      = 'active',
      verified_at = NOW(),
      start_date  = CURRENT_DATE,
      end_date    = (DATE_TRUNC('year', CURRENT_DATE) + INTERVAL '1 year - 1 day')::DATE
    WHERE payment_id = NEW.id
      AND status = 'pending';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS payment_activates_membership ON payments;
CREATE TRIGGER payment_activates_membership
  AFTER UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION activate_membership_on_payment();

-- ---------------------------------------------------------------------------
-- 5.4 Increment download count on academic resource reads
-- (Call via RPC: SELECT increment_download_count('<resource_id>'))
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION increment_download_count(resource_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.academic_resources
  SET download_count = download_count + 1
  WHERE id = resource_id;
END;
$$;

-- ---------------------------------------------------------------------------
-- 5.5 Expire memberships past their end_date
-- Call via Supabase cron (pg_cron) or a daily Edge Function:
--   SELECT expire_memberships();
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION expire_memberships()
RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  affected INTEGER;
BEGIN
  UPDATE public.memberships
  SET status = 'expired'
  WHERE status = 'active'
    AND end_date < CURRENT_DATE;

  GET DIAGNOSTICS affected = ROW_COUNT;
  RETURN affected;
END;
$$;

-- =============================================================================
-- 6. STORAGE BUCKETS
-- (Run via Supabase Dashboard → Storage, or via the Management API.
--  SQL cannot create buckets directly — these are instructions.)
-- =============================================================================

-- Bucket: avatars         (public)   — user profile pictures
-- Bucket: event-covers    (public)   — event banner images
-- Bucket: news-covers     (public)   — news article cover images
-- Bucket: opportunity-covers (public) — opportunity cover images
-- Bucket: welfare-docs    (private)  — welfare request supporting documents
-- Bucket: resources       (private)  — academic resource files
-- Bucket: site-assets     (public)   — site logos, banners, misc

-- RLS for storage.objects is configured in the Supabase dashboard.
-- Recommended policies:
--   avatars / event-covers / news-covers / opportunity-covers / site-assets:
--     SELECT: anon + authenticated
--     INSERT/UPDATE/DELETE: authenticated (owner match or admin role)
--   welfare-docs:
--     SELECT: owner OR welfare role OR admin
--     INSERT: authenticated (owner only)
--     DELETE: admin only
--   resources:
--     SELECT: authenticated (active membership) OR admin
--     INSERT: authenticated
--     DELETE: academic role OR admin

-- =============================================================================
-- 7. SEED DATA — site settings defaults
-- =============================================================================

INSERT INTO site_settings (key, value, label, description, category)
VALUES
  -- Membership fees (in GHS)
  ('membership_fee_100_level',  '30',  '100 Level Dues (GHS)',  'Annual membership dues for 100 level students',  'membership'),
  ('membership_fee_200_level',  '30',  '200 Level Dues (GHS)',  'Annual membership dues for 200 level students',  'membership'),
  ('membership_fee_300_level',  '30',  '300 Level Dues (GHS)',  'Annual membership dues for 300 level students',  'membership'),
  ('membership_fee_400_level',  '30',  '400 Level Dues (GHS)',  'Annual membership dues for 400 level students',  'membership'),
  ('membership_fee_500_level',  '30',  '500 Level Dues (GHS)',  'Annual membership dues for 500 level students',  'membership'),
  ('membership_fee_alumnus',    '50',  'Alumni Dues (GHS)',     'Annual membership dues for alumni',              'membership'),
  ('current_academic_year',     '2024/2025', 'Current Academic Year', 'The active academic year for membership registration', 'membership'),

  -- Branding
  ('site_name',     'GPSA-UDS',
   'Site Name',     'Full association name shown in the browser tab and emails', 'branding'),
  ('site_tagline',  'Ghana Pharmaceutical Students Association – University for Development Studies',
   'Site Tagline',  'Subtitle shown on the homepage hero',                       'branding'),
  ('site_logo_url', '',
   'Logo URL',      'Public URL of the site logo in Supabase Storage',           'branding'),

  -- Contact
  ('contact_email',  'info@gpsa-uds.org', 'Contact Email',   'Public contact address displayed on the site', 'contact'),
  ('contact_phone',  '',                   'Contact Phone',   'Public phone number',                          'contact'),
  ('contact_address','UDS, Tamale, Ghana', 'Postal Address',  'Physical/postal address of the association',   'contact'),

  -- Social media
  ('social_facebook',  '', 'Facebook URL',  'Full URL to the Facebook page',  'social'),
  ('social_twitter',   '', 'Twitter/X URL', 'Full URL to the Twitter/X page', 'social'),
  ('social_instagram', '', 'Instagram URL', 'Full URL to the Instagram page', 'social'),
  ('social_linkedin',  '', 'LinkedIn URL',  'Full URL to the LinkedIn page',  'social'),
  ('social_whatsapp',  '', 'WhatsApp Link', 'WhatsApp community invite link', 'social')

ON CONFLICT (key) DO NOTHING;

-- =============================================================================
-- END OF SCHEMA
-- =============================================================================
