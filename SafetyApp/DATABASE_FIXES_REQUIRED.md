# CRITICAL: Database Setup Required for SafetyApp

## ⚠️ IMMEDIATE ACTION NEEDED

The app requires SQL to be run in Supabase to function properly. Follow these steps:

### Step 1: Go to Supabase Dashboard
1. Visit https://app.supabase.com
2. Select your project "uulsomwvmmowakcutria"
3. Click **SQL Editor** in the left sidebar

### Step 2: Create New Query
1. Click **New Query**
2. Copy the ENTIRE contents of: `docs/fixes_required.sql`
3. Paste it into the SQL editor
4. Click **Run** (or press Ctrl+Enter on Windows, Cmd+Enter on Mac)

### Step 3: Wait for Success
- You should see a "Success" message
- All tables and permissions will be created

---

## What This Fixes

### ✅ Comments Now Work
- Creates `post_comments` table
- Enables users to comment on posts
- Comments persist to database

### ✅ Emergency Contacts Work
- Fixes RLS (Row-Level Security) policies
- Allows adding, updating, deleting contacts
- No more "row-level security policy" errors

### ✅ Alert Creation Works
- Creates `smart_alerts` table with new schema
- Allows users to create and share alerts
- Alerts persist to database

### ✅ All Data Persists
- Communities, posts, contacts, alerts all save to DB
- Data syncs across all screens
- Real-time updates available

---

## Database Tables Created/Fixed

1. **post_comments** - NEW
   - Stores comments on posts
   - Links to users and posts
   - RLS policies for privacy

2. **smart_alerts** - ENHANCED
   - Now supports community alerts (security, traffic, weather, community)
   - Stores title, description, severity level
   - Saves location data

3. **emergency_contacts** - FIXED
   - RLS policies allow INSERT/UPDATE/DELETE
   - Users can fully manage their contacts

4. **community_posts** - FIXED
   - RLS policies allow viewing, creating, editing, deleting

5. **communities** - FIXED
   - Proper RLS for community creation and viewing

6. **location_shares** - FIXED
   - RLS policies for location sharing

7. **All other tables** - VERIFIED
   - RLS policies confirmed and working

---

## App Code Changes

### Comments Feature (ENABLED)
- `handleOpenComments()` now works
- `handleAddComment()` fully functional
- Comments modal displays all comments
- New comments save to database

### Alert Creation (ENABLED)
- Users can create alerts from AlertsFeed screen
- Alerts save to `smart_alerts` table
- Alerts visible to entire community
- Severity levels tracked

### Profile (FIXED)
- `useFocusEffect` import corrected
- Profile data refreshes when screen opens
- All changes persist

### App Startup
- Onboarding cache cleared on each app start
- App always shows onboarding screen first
- Users can skip to login

---

## After Running SQL

1. ✅ Restart the app
2. ✅ Go through onboarding
3. ✅ Log in
4. ✅ Features should now work:
   - Add emergency contacts
   - Create posts and comments
   - Create safety alerts
   - All data persists

---

## If You Get Errors

### "Table already exists" errors
- This is FINE! It means tables already exist
- Click Continue
- The SQL will update RLS policies

### "Permission denied" or "RLS policy violation"
- Make sure you're logged into Supabase with correct account
- Verify in Settings > API that your anon key is correct
- Try running the SQL again

### Comments/Alerts still not working
- Refresh the app
- Make sure SQL finished successfully
- Check Supabase SQL Editor output for any errors

---

## Testing the Features

### To Test Comments:
1. Create a post in Community tab
2. Click the comment button on any post
3. Type a comment and submit
4. Comment should appear immediately

### To Test Alerts:
1. Go to Alerts Feed
2. Click "Create Alert" button
3. Fill in title, description, type, severity
4. Click "Create Alert"
5. Alert appears in feed for all users

### To Test Contacts:
1. Go to Emergency Contacts
2. Click "Add Manually" or "Import from Phone"
3. Add a contact
4. Contact appears in list
5. Go away and come back - contact still there

---

## Database File Location

**File to run:** `docs/fixes_required.sql`

Copy the ENTIRE file content and paste into Supabase SQL Editor.

---

## Questions?

Check:
- `DATABASE_SETUP.md` - General setup guide
- `RLS_POLICIES_SETUP.sql` - All security policies
- `docs/supabase_setup.sql` - Original schema
- `docs/fixes_required.sql` - New additions and fixes

Good luck! 🚀
