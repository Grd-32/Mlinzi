# RLS Emergency Contacts Error - SOLUTION

## The Problem
```
Error code 42501: "new row violates row-level security policy for table emergency_contacts"
```

This error occurs when the RLS (Row-Level Security) policy prevents INSERT operations on emergency_contacts.

---

## Quick Fix - 2 Steps

### Step 1: Run the SQL Fix
1. Go to **Supabase Dashboard** → **SQL Editor**
2. Click **New Query**
3. Copy the entire content from: `docs/RLS_EMERGENCY_FIX.sql`
4. Paste it into the SQL editor
5. Click **Run** and wait for success

### Step 2: Logout and Login
1. Close the Mlinzi app completely
2. Reopen the app
3. Sign out (if logged in)
4. Sign in again with your credentials
5. Try adding an emergency contact - it should work now!

---

## Why This Fixes It

The RLS_EMERGENCY_FIX.sql file:
- ✅ Disables and re-enables RLS on the table (clears cached policies)
- ✅ Drops ALL conflicting policies
- ✅ Creates new, permissive policies that allow INSERT/UPDATE/DELETE
- ✅ Ensures the `users` table has proper RLS policies
- ✅ Resets the entire security policy framework

---

## What Changed in the Code

The emergencyContactService now provides better error messages:
- **Error 42501** (permission denied) → "Please log out and log in again to refresh your session"
- This directs users to the actual solution (re-authenticating refreshes token and RLS context)

---

## If It Still Doesn't Work

1. **Verify you're logged in**: The error means `auth.uid()` might be null
2. **Check user record exists**: 
   - In Supabase, go to **SQL Editor**
   - Run: `SELECT * FROM users WHERE id = '(your-user-id)'`
   - Should show 1 row. If not, sign out/in to create it
3. **Check RLS policies exist**:
   - Go to **emergency_contacts** table → **Policies**
   - Should see 4 policies: select, insert, update, delete
4. **Try on different account**: Create a new test account to see if issue is user-specific

---

## Technical Details

### RLS Policy Error Codes
- **42501** = Row-level security policy violation (permission denied)
- **23503** = Foreign key constraint violation (user doesn't exist)

### Why Logout/Login Helps
When you logout and login:
- ✅ New JWT token issued
- ✅ auth.uid() updated with fresh value
- ✅ Supabase cache refreshed
- ✅ RLS policies re-evaluated with new session

---

## Files Modified
- `docs/RLS_EMERGENCY_FIX.sql` - New SQL fix file (run this!)
- `src/services/emergencyContactService.ts` - Better error handling for code 42501
