# URGENT: RLS Policy Fix Required

## Problem
User creation is failing because the `users` table is missing an **INSERT policy** for Row Level Security (RLS).

When users sign up, they cannot insert their own record into the `users` table, causing the foreign key constraint error:
```
Key is not present in table "users"
```

## Solution
Run this SQL in your **Supabase SQL Editor** (go to https://supabase.com → Your Project → SQL Editor):

```sql
-- Add INSERT policy to users table
CREATE POLICY "Users can insert their own data"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);
```

## Steps to Apply
1. Go to your Supabase project dashboard
2. Click on **SQL Editor** (left sidebar)
3. Click **New Query** or create a new tab
4. Paste the SQL above
5. Click **Run** (or press Cmd+Enter / Ctrl+Enter)
6. You should see: **"Success. No rows returned"**

## Verify It Works
After running the SQL:
1. Go back to your app
2. Press **r** in the terminal to reload
3. Sign up with a new account
4. Try creating an emergency contact
5. It should now work without the "Key is not present in table users" error

## Why This Happened
The original RLS setup only had SELECT and UPDATE policies, but no INSERT policy. This meant:
- ✅ Users could view their own records
- ✅ Users could update their own records
- ❌ Users could NOT create their own records (the problem!)

The fix allows users to insert their own user record upon signup, which then allows all dependent operations (contacts, communities, posts, etc.) to work correctly.
