# Database Setup Guide

## Important: You MUST Run This SQL in Supabase for the App to Work

The app errors you're getting ("Could not find the table") mean the database tables don't exist yet.

### Steps to Fix:

1. **Go to Supabase Dashboard**
   - Visit: https://app.supabase.com
   - Select your project "uulsomwvmmowakcutria"
   - Go to **SQL Editor** in the left sidebar

2. **Run the Setup SQL**
   - Click **New Query**
   - Copy the entire contents of `docs/supabase_setup.sql`
   - Paste it into the SQL editor
   - Click **Run** (or press Cmd+Enter on Mac, Ctrl+Enter on Windows)

3. **Wait for completion**
   - You should see "Success" message
   - The output will show all tables created

### What Gets Created:
- ✅ `users` - User profiles
- ✅ `emergency_contacts` - Contact list
- ✅ `personal_emergency_info` - Medical info
- ✅ `sos_alerts` - Emergency alerts
- ✅ `communities` - Community networks
- ✅ And 8 more supporting tables

### After Running SQL:
1. The app errors will disappear
2. You'll be able to:
   - Create emergency contacts
   - File SOS alerts
   - View map data
   - Join communities
   - Store emergency info

### Troubleshooting:

**If you get "already exists" errors:**
- This is fine! It means the tables are already there
- The app should work

**If you still get "Could not find table" errors after running SQL:**
- Go to **Table Editor** in Supabase
- Look for the table names on the left
- Make sure they're in the `public` schema
- If missing, try running the SQL again

**If permissions errors occur:**
- Make sure you're logged in with your Supabase account
- Check that your anon key in `.env.local` matches the public key in Supabase
- Go to **Settings > API** to verify

---

**Need the full SQL? It's in: `docs/supabase_setup.sql`**
