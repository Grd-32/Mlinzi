# Supabase Setup Checklist

## Required Tables
All tables are defined in `docs/supabase_setup.sql` and must be created in your Supabase database.

### Core Tables
- ✅ `auth.users` (Supabase built-in)
- ✅ `users` - Extends auth.users with profile data
- ✅ `emergency_contacts` - User emergency contacts
- ✅ `personal_emergency_info` - Medical info storage
- ✅ `sos_alerts` - Emergency alerts
- ✅ `location_shares` - Location sharing records
- ✅ `smart_alerts` - Smart location-based alerts
- ✅ `communities` - Community groups
- ✅ `community_memberships` - Community join records
- ✅ `community_posts` - Community posts
- ✅ `chat_messages` - SOS operator chat
- ✅ `notifications` - Push notifications

## Required Indexes
All indexes are created automatically by the SQL script.

## Required Row-Level Security (RLS) Policies

### For `users` table:
- [ ] Enable RLS
- [ ] Create policy: Users can read their own profile
- [ ] Create policy: Service role can read all (for admin)

### For `emergency_contacts` table:
- [ ] Enable RLS
- [ ] Create policy: Users can CRUD their own contacts
- [ ] Create policy: Service role can read all

### For `sos_alerts` table:
- [ ] Enable RLS
- [ ] Create policy: Users can CRUD their own alerts
- [ ] Create policy: Service role can read all

### For `communities` table:
- [ ] Enable RLS (optional - communities are public)
- [ ] Create policy: Anyone can read
- [ ] Create policy: Users can create communities

### For `community_posts` table:
- [ ] Enable RLS
- [ ] Create policy: Anyone can read
- [ ] Create policy: Users can create posts

## Setup Instructions

### 1. Create Tables
Run the SQL script in `docs/supabase_setup.sql` in your Supabase SQL editor:
```sql
-- Go to Supabase Dashboard
-- SQL Editor > New Query
-- Paste entire contents of docs/supabase_setup.sql
-- Click "Run"
```

### 2. Enable Row-Level Security (RLS)
In Supabase Dashboard > Authentication > Policies:
```sql
-- Users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Emergency Contacts table  
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own contacts"
  ON emergency_contacts
  USING (auth.uid() = user_id);

-- SOS Alerts table
ALTER TABLE sos_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own alerts"
  ON sos_alerts
  USING (auth.uid() = user_id);

-- Communities table (optional - keep public)
-- ALTER TABLE communities ENABLE ROW LEVEL SECURITY;

-- Community Posts table (optional - keep public)
-- ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
```

### 3. Set Service Role Key
In Supabase Dashboard > Settings > API:
- Copy the `service_role` key
- This is used for admin operations that bypass RLS

### 4. Test User Creation
After setup, test by:
1. Signing up a new user
2. Check `users` table to verify record was created
3. Try creating an emergency contact

## Troubleshooting

### "User not found in database" Error
- Verify the `users` table exists and has the correct schema
- Check that RLS policies allow inserts from your app's authenticated user
- Verify `auth.users` table has the user (should be automatic)

### Foreign Key Constraint Error (23503)
- This means the user record doesn't exist in the `users` table
- Check that user creation happened in signUp/signIn
- Verify RLS isn't blocking the insert

### RLS Blocking Inserts
If you're getting "Permission denied" errors:
- Check the RLS policy allows `INSERT` operations
- Use `WITH CHECK (auth.uid() = user_id)` for insert policies
- Or temporarily disable RLS during testing

## Environment Variables
Required in `.env` or Expo app config:
```
SUPABASE_URL=your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

## Key Points
1. The `users` table MUST have a record for every authenticated user
2. User creation happens automatically in signUp/signIn
3. All other tables reference the `users` table via foreign keys
4. RLS policies control who can read/write to each table
5. Service role can bypass RLS (for admin operations)
