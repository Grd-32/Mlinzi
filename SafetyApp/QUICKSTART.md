# Quick Start Guide - SafetyApp Kenya

## 5-Minute Quick Setup

### 1. Install Dependencies (1 min)
```bash
cd "c:\Users\Admin\Desktop\Astron Projects\mlinzi\SafetyApp"
npm install
```

### 2. Create Supabase Account (2 min)
- Go to https://supabase.com
- Sign up (free)
- Create a new project
- Copy your URL and anon key

### 3. Configure Environment (1 min)
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```
EXPO_PUBLIC_SUPABASE_URL=your_url_here
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_key_here
EXPO_PUBLIC_APP_ENV=development
```

### 4. Setup Database (1 min)
1. In Supabase, open **SQL Editor**
2. Create new query
3. Copy-paste contents of `docs/supabase_setup.sql`
4. Click **Run**

### 5. Start App
```bash
npm start
```

Then:
- Press `i` for Expo Go (phone)
- Or press `a` for Android emulator
- Or press `w` for web browser

## ✅ What Works Out of the Box

### Authentication
```typescript
// Test Account
Email: test@example.com
Password: TestPassword123
```

### Main Features
- ✅ Login/Signup
- ✅ SOS Button (6 types)
- ✅ Emergency Contacts (add/edit/delete)
- ✅ Location tracking
- ✅ Map view with markers
- ✅ Community posts
- ✅ Emergency info storage
- ✅ Operator chat
- ✅ Push notifications

### All Screens
1. **Login/SignUp** - Email/password authentication
2. **Home** - SOS button, quick actions
3. **SOS Flow** - Select type, add details, confirm
4. **Emergency Contacts** - Manage contacts
5. **Map** - View alerts and posts on map
6. **Community** - Create communities, post messages
7. **Profile** - Emergency medical info, settings
8. **Operator Chat** - Private messaging for sensitive SOS

## Common Commands

```bash
# Start development
npm start

# Run on specific platform
npm run android      # Android emulator
npm run ios          # iOS simulator
npm start -- --web   # Web browser

# Clean and rebuild
expo prebuild --clean
npm install

# Check for errors
expo doctor
```

## Troubleshooting

### "Supabase connection failed"
- Check `.env.local` has correct credentials
- Verify Supabase project is active
- Check internet connection

### "Location permission denied"
- Grant permission in phone settings
- Restart app

### "Map not loading"
- Ensure location permission granted
- Check internet connection
- Verify map library installed: `npm install react-native-maps`

### App won't start
```bash
# Clear cache and reinstall
npm run clean
npm install
npm start
```

## Next Steps for Development

### 1. Add More Features
- SMS notifications via Twilio
- File uploads for posts
- Advanced filtering
- User search

### 2. Optimize Performance
- Add local caching
- Image compression
- Offline mode

### 3. Enhance UI
- Add animations
- Improve maps
- Dark mode support

### 4. Deploy to App Stores
- Sign APK for Android
- Submit to Google Play
- Build for iOS (if on Mac)

## File Structure Reference

```
/src
├── /screens       - All UI screens
├── /services      - API & business logic
├── /context       - Global state (auth)
├── /navigation    - Screen routing
├── /types         - TypeScript definitions
└── /utils         - Helper functions
```

## Database Tables

All tables created automatically:
- `users` - User profiles
- `sos_alerts` - Emergency alerts
- `emergency_contacts` - User's contacts
- `communities` - Neighborhood groups
- `community_posts` - Safety messages
- `chat_messages` - Operator conversations
- `location_shares` - Shared locations
- `smart_alerts` - Arrival/departure alerts
- `personal_emergency_info` - Medical details
- `notifications` - Notification history

## Testing Checklist

- [ ] Create account
- [ ] Login/Logout
- [ ] Press SOS button
- [ ] Add emergency contact
- [ ] Verify location on map
- [ ] Post in community
- [ ] Edit emergency info
- [ ] Chat with operator

## Support

For help:
1. Check README.md for detailed guide
2. Review service files for API details
3. Check Expo documentation: https://docs.expo.dev
4. Check Supabase docs: https://supabase.com/docs

## You're Ready! 🚀

The app is fully functional and ready for:
- ✅ Development
- ✅ Testing
- ✅ Customization
- ✅ Deployment

Start with `npm start` and begin building!
