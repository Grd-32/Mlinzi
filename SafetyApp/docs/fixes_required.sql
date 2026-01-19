-- CRITICAL FIXES REQUIRED FOR SAFETYAPP
-- Run this SQL in Supabase SQL Editor to resolve errors

-- ============================================================================
-- 1. CREATE MISSING POST_COMMENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  content TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_user_id ON post_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_created_at ON post_comments(created_at);

-- Enable RLS on post_comments
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies on post_comments if any
DROP POLICY IF EXISTS "Users can view post comments" ON post_comments;
DROP POLICY IF EXISTS "Users can insert post comments" ON post_comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON post_comments;

-- Create RLS policies for post_comments
CREATE POLICY "Users can view post comments"
  ON post_comments FOR SELECT
  USING (true); -- Anyone can view comments

CREATE POLICY "Users can insert post comments"
  ON post_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON post_comments FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 2. FIX EMERGENCY_CONTACTS RLS - ALLOW INSERT/UPDATE/DELETE
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own emergency contacts" ON emergency_contacts;
DROP POLICY IF EXISTS "Users can insert their own emergency contacts" ON emergency_contacts;
DROP POLICY IF EXISTS "Users can update their own emergency contacts" ON emergency_contacts;
DROP POLICY IF EXISTS "Users can delete their own emergency contacts" ON emergency_contacts;

-- Enable RLS if not already enabled
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;

-- Recreate with proper policies
CREATE POLICY "Users can view their own emergency contacts"
  ON emergency_contacts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own emergency contacts"
  ON emergency_contacts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own emergency contacts"
  ON emergency_contacts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own emergency contacts"
  ON emergency_contacts FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 3. CREATE MISSING SMART_ALERTS TABLE (for alert creation feature)
-- ============================================================================
-- Drop and recreate to ensure schema is correct
DROP TABLE IF EXISTS smart_alerts CASCADE;

CREATE TABLE smart_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT,
  description TEXT,
  location_name TEXT,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('security', 'traffic', 'weather', 'community', 'arrival', 'departure')),
  severity TEXT CHECK (severity IN ('low', 'medium', 'high')),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  radius NUMERIC,
  shared_with_user_ids UUID[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_smart_alerts_user_id ON smart_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_smart_alerts_created_at ON smart_alerts(created_at);

-- Enable RLS on smart_alerts
ALTER TABLE smart_alerts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies on smart_alerts if any
DROP POLICY IF EXISTS "Users can view smart alerts" ON smart_alerts;
DROP POLICY IF EXISTS "Users can insert smart alerts" ON smart_alerts;
DROP POLICY IF EXISTS "Users can update their own smart alerts" ON smart_alerts;
DROP POLICY IF EXISTS "Users can delete their own smart alerts" ON smart_alerts;

-- Create RLS policies for smart_alerts
CREATE POLICY "Users can view smart alerts"
  ON smart_alerts FOR SELECT
  USING (true); -- Anyone can view alerts

CREATE POLICY "Users can insert smart alerts"
  ON smart_alerts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own smart alerts"
  ON smart_alerts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own smart alerts"
  ON smart_alerts FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 4. ADD MISSING COMMUNITY_POSTS RLS POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can view community posts" ON community_posts;
DROP POLICY IF EXISTS "Users can insert community posts" ON community_posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON community_posts;
DROP POLICY IF EXISTS "Users can delete their own posts" ON community_posts;

ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view community posts"
  ON community_posts FOR SELECT
  USING (true); -- Anyone can view posts

CREATE POLICY "Users can insert community posts"
  ON community_posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts"
  ON community_posts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts"
  ON community_posts FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 5. VERIFY ALL TABLES HAVE RLS ENABLED AND PROPER POLICIES
-- ============================================================================

-- Communities
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view communities" ON communities;
DROP POLICY IF EXISTS "Users can insert communities" ON communities;
DROP POLICY IF EXISTS "Users can update their own communities" ON communities;

CREATE POLICY "Users can view communities"
  ON communities FOR SELECT
  USING (true);

CREATE POLICY "Users can insert communities"
  ON communities FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own communities"
  ON communities FOR UPDATE
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- Community Memberships
ALTER TABLE community_memberships ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view community memberships" ON community_memberships;
DROP POLICY IF EXISTS "Users can insert community memberships" ON community_memberships;
DROP POLICY IF EXISTS "Users can delete their own memberships" ON community_memberships;

CREATE POLICY "Users can view community memberships"
  ON community_memberships FOR SELECT
  USING (true);

CREATE POLICY "Users can insert community memberships"
  ON community_memberships FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own memberships"
  ON community_memberships FOR DELETE
  USING (auth.uid() = user_id);

-- Location Shares
ALTER TABLE location_shares ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own location shares" ON location_shares;
DROP POLICY IF EXISTS "Users can insert location shares" ON location_shares;
DROP POLICY IF EXISTS "Users can update their own shares" ON location_shares;
DROP POLICY IF EXISTS "Users can delete their own shares" ON location_shares;

CREATE POLICY "Users can view their own location shares"
  ON location_shares FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = shared_with_user_id);

CREATE POLICY "Users can insert location shares"
  ON location_shares FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own shares"
  ON location_shares FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own shares"
  ON location_shares FOR DELETE
  USING (auth.uid() = user_id);

-- SOS Alerts
ALTER TABLE sos_alerts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own SOS alerts" ON sos_alerts;
DROP POLICY IF EXISTS "Users can insert their own SOS alerts" ON sos_alerts;
DROP POLICY IF EXISTS "Users can update their own SOS alerts" ON sos_alerts;
DROP POLICY IF EXISTS "Users can delete their own SOS alerts" ON sos_alerts;

CREATE POLICY "Users can view their own SOS alerts"
  ON sos_alerts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own SOS alerts"
  ON sos_alerts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own SOS alerts"
  ON sos_alerts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own SOS alerts"
  ON sos_alerts FOR DELETE
  USING (auth.uid() = user_id);

-- Personal Emergency Info
ALTER TABLE personal_emergency_info ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own emergency info" ON personal_emergency_info;
DROP POLICY IF EXISTS "Users can insert their own emergency info" ON personal_emergency_info;
DROP POLICY IF EXISTS "Users can update their own emergency info" ON personal_emergency_info;

CREATE POLICY "Users can view their own emergency info"
  ON personal_emergency_info FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own emergency info"
  ON personal_emergency_info FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own emergency info"
  ON personal_emergency_info FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users Table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Users can insert their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;

CREATE POLICY "Users can view their own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own data"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own data"
  ON users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================
-- All critical tables and RLS policies are now properly configured!
-- The app should work without database errors now.
-- Note: Notifications and Chat Messages RLS can be configured separately if needed.
