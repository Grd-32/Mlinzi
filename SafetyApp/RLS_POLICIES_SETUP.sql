-- RLS Policies Setup for SafetyApp
-- Run this in your Supabase SQL Editor to fix permission errors

-- First, make sure RLS is enabled on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_emergency_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE sos_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE location_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE smart_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts (if they exist)
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Users can insert their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;

DROP POLICY IF EXISTS "Users can view their own emergency contacts" ON emergency_contacts;
DROP POLICY IF EXISTS "Users can insert their own emergency contacts" ON emergency_contacts;
DROP POLICY IF EXISTS "Users can update their own emergency contacts" ON emergency_contacts;
DROP POLICY IF EXISTS "Users can delete their own emergency contacts" ON emergency_contacts;

DROP POLICY IF EXISTS "Users can view their own emergency info" ON personal_emergency_info;
DROP POLICY IF EXISTS "Users can insert their own emergency info" ON personal_emergency_info;
DROP POLICY IF EXISTS "Users can update their own emergency info" ON personal_emergency_info;

DROP POLICY IF EXISTS "Users can view their own SOS alerts" ON sos_alerts;
DROP POLICY IF EXISTS "Users can insert their own SOS alerts" ON sos_alerts;
DROP POLICY IF EXISTS "Users can update their own SOS alerts" ON sos_alerts;

DROP POLICY IF EXISTS "Users can view their own location shares" ON location_shares;
DROP POLICY IF EXISTS "Users can insert their own location shares" ON location_shares;

DROP POLICY IF EXISTS "Users can view their own smart alerts" ON smart_alerts;
DROP POLICY IF EXISTS "Users can insert their own smart alerts" ON smart_alerts;

DROP POLICY IF EXISTS "Users can view communities" ON communities;
DROP POLICY IF EXISTS "Users can insert communities" ON communities;
DROP POLICY IF EXISTS "Users can update their own communities" ON communities;

DROP POLICY IF EXISTS "Users can view community memberships" ON community_memberships;
DROP POLICY IF EXISTS "Users can insert community memberships" ON community_memberships;

DROP POLICY IF EXISTS "Users can view community posts" ON community_posts;
DROP POLICY IF EXISTS "Users can insert community posts" ON community_posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON community_posts;
DROP POLICY IF EXISTS "Users can delete their own posts" ON community_posts;

DROP POLICY IF EXISTS "Users can view chat messages" ON chat_messages;
DROP POLICY IF EXISTS "Users can insert chat messages" ON chat_messages;

DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can insert their own notifications" ON notifications;

-- ===== USERS TABLE =====
CREATE POLICY "Users can view their own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own data"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own data"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- ===== EMERGENCY CONTACTS TABLE =====
CREATE POLICY "Users can view their own emergency contacts"
  ON emergency_contacts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own emergency contacts"
  ON emergency_contacts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own emergency contacts"
  ON emergency_contacts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own emergency contacts"
  ON emergency_contacts FOR DELETE
  USING (auth.uid() = user_id);

-- ===== PERSONAL EMERGENCY INFO TABLE =====
CREATE POLICY "Users can view their own emergency info"
  ON personal_emergency_info FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own emergency info"
  ON personal_emergency_info FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own emergency info"
  ON personal_emergency_info FOR UPDATE
  USING (auth.uid() = user_id);

-- ===== SOS ALERTS TABLE =====
CREATE POLICY "Users can view their own SOS alerts"
  ON sos_alerts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own SOS alerts"
  ON sos_alerts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own SOS alerts"
  ON sos_alerts FOR UPDATE
  USING (auth.uid() = user_id);

-- ===== LOCATION SHARES TABLE =====
CREATE POLICY "Users can view their own location shares"
  ON location_shares FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = shared_with_user_id);

CREATE POLICY "Users can insert their own location shares"
  ON location_shares FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ===== SMART ALERTS TABLE =====
CREATE POLICY "Users can view their own smart alerts"
  ON smart_alerts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own smart alerts"
  ON smart_alerts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ===== COMMUNITIES TABLE =====
CREATE POLICY "Users can view communities"
  ON communities FOR SELECT
  USING (true);

CREATE POLICY "Users can insert communities"
  ON communities FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own communities"
  ON communities FOR UPDATE
  USING (auth.uid() = created_by);

-- ===== COMMUNITY MEMBERSHIPS TABLE =====
CREATE POLICY "Users can view community memberships"
  ON community_memberships FOR SELECT
  USING (true);

CREATE POLICY "Users can insert community memberships"
  ON community_memberships FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ===== COMMUNITY POSTS TABLE =====
CREATE POLICY "Users can view community posts"
  ON community_posts FOR SELECT
  USING (true);

CREATE POLICY "Users can insert community posts"
  ON community_posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts"
  ON community_posts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts"
  ON community_posts FOR DELETE
  USING (auth.uid() = user_id);

-- ===== CHAT MESSAGES TABLE =====
CREATE POLICY "Users can view chat messages"
  ON chat_messages FOR SELECT
  USING (true);

CREATE POLICY "Users can insert chat messages"
  ON chat_messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- ===== NOTIFICATIONS TABLE =====
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM sos_alerts
      WHERE sos_alerts.id = notifications.alert_id
      AND sos_alerts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

-- Done! All RLS policies are now in place
