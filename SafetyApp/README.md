# SafetyApp Kenya - Setup & Deployment Guide

A comprehensive mobile safety app for Kenya users, built with Expo and React Native, featuring emergency SOS alerts, location sharing, emergency contacts, and community safety features.

## Features Implemented

✅ **User Authentication**
- Email/password registration and login
- Persistent login using secure token storage
- Password protection

✅ **SOS Emergency System**
- Multiple incident types: Normal, Sensitive, Test, Medical, Crime, Fire
- GPS location capture and address reverse-geocoding
- Discreet sensitive mode (no contact notifications)
- In-app operator chat for sensitive incidents
- Emergency contact notifications for Normal SOS

✅ **Emergency Contacts**
- Add, edit, delete emergency contacts
- Set primary contact
- Store phone numbers and relationships
- Auto-notify on SOS

✅ **Location Features**
- Real-time location tracking
- Live location sharing with trusted contacts
- Smart alerts for arrival/departure at locations
- Background location updates

✅ **Map View**
- Display user's location
- Show nearby SOS alerts
- Display community posts with locations
- Interactive markers with details

✅ **Community Features**
- Create and join local communities
- Post safety messages (with anonymous option)
- Like and comment on posts
- Geotagged posts (show location on map)
- Community feed

✅ **Personal Emergency Info**
- Store medical conditions, allergies
- Blood type storage
- Insurance information
- Emergency doctor details
- Sent to responders during SOS

✅ **Push Notifications**
- Register for Expo push notifications
- Notify emergency contacts on SOS
- Notify for community updates
- Local notifications for reminders

✅ **In-App Chat**
- Real-time messaging with operators
- Separate chat for sensitive incidents
- Message history

## Tech Stack

- **Frontend**: Expo, React Native, TypeScript
- **Navigation**: React Navigation
- **Backend**: Supabase (PostgreSQL)
- **Maps**: react-native-maps
- **Location**: Expo Location
- **Notifications**: Expo Notifications
- **Secure Storage**: Expo Secure Store
- **API Client**: Axios

## Prerequisites

Before starting, ensure you have:

1. **Node.js** (v16 or higher)
   - Download from https://nodejs.org/

2. **Expo CLI**
   ```bash
   npm install -g expo-cli
   ```

3. **Supabase Account**
   - Go to https://supabase.com
   - Create a free project
   - Get your project URL and anonymous key

4. **Android Studio** or **Xcode** (for local testing)
   - Or use Expo Go app on your phone

5. **ngrok** (optional, for testing webhooks)

## Installation & Setup

### 1. Clone the Project

```bash
cd "c:\Users\Admin\Desktop\Astron Projects\mlinzi\SafetyApp"
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Supabase

#### Step 3a: Create Supabase Project

1. Go to https://supabase.com
2. Sign up or login
3. Click "New Project"
4. Fill in details:
   - **Name**: SafetyApp-Kenya
   - **Database Password**: Choose a strong password
   - **Region**: Choose closest to Kenya (e.g., London, Europe)
5. Wait for project creation (2-3 minutes)

#### Step 3b: Get Credentials

1. In Supabase dashboard, go to **Settings** > **API**
2. Copy:
   - **Project URL**
   - **anon public key**

#### Step 3c: Setup Database

1. Go to **SQL Editor** in Supabase
2. Click **New Query**
3. Copy contents from `docs/supabase_setup.sql`
4. Paste into the query editor
5. Click **Run**

#### Step 3d: Create .env File

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
EXPO_PUBLIC_APP_ENV=development
```

### 4. Start the App

```bash
npm start
```

This will open the Expo CLI. You'll see options:

```
i │ open in Expo Go
a │ open Android Emulator
w │ open in web browser
r │ reload
p │ toggle dev menu
j │ open debugger
```

#### Option 1: Expo Go (Easiest)
1. Download "Expo Go" on your phone (iOS/Android)
2. Scan the QR code shown in terminal
3. App loads on your phone

#### Option 2: Android Emulator
```bash
npm run android
```

#### Option 3: iOS Simulator (Mac only)
```bash
npm run ios
```

## Project Structure

```
SafetyApp/
├── src/
│   ├── screens/              # All app screens
│   │   ├── LoginScreen.tsx
│   │   ├── SignUpScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── SOSFlowScreen.tsx
│   │   ├── EmergencyContactsScreen.tsx
│   │   ├── MapScreen.tsx
│   │   ├── CommunityScreen.tsx
│   │   ├── ProfileScreen.tsx
│   │   └── OperatorChatScreen.tsx
│   ├── components/           # Reusable components (ready for expansion)
│   ├── services/             # API services
│   │   ├── supabaseClient.ts
│   │   ├── sosService.ts
│   │   ├── emergencyContactService.ts
│   │   ├── locationService.ts
│   │   ├── smartAlertService.ts
│   │   ├── emergencyInfoService.ts
│   │   ├── communityService.ts
│   │   ├── chatService.ts
│   │   ├── locationPermissionsService.ts
│   │   └── notificationService.ts
│   ├── context/              # Global state management
│   │   └── AuthContext.tsx
│   ├── navigation/           # Navigation setup
│   │   └── RootNavigator.tsx
│   ├── types/                # TypeScript types
│   │   └── index.ts
│   └── utils/                # Utility functions (ready for expansion)
├── App.tsx                   # Root component
├── app.json                  # Expo configuration
├── babel.config.js           # Babel configuration
├── package.json              # Dependencies
├── tsconfig.json             # TypeScript configuration
└── docs/
    └── supabase_setup.sql    # Database schema
```

## Usage Guide

### 1. Registration & Login

1. **Sign Up**: Enter name, email, and password
2. **Login**: Use your credentials
3. Token stored securely on device

### 2. SOS Emergency

1. Press the large **SOS** button
2. Select incident type:
   - **Normal**: All contacts notified
   - **Sensitive**: Private chat only, no contact notifications
   - **Test**: Test the system
   - **Medical**: Medical emergency
   - **Crime**: Criminal activity
   - **Fire**: Fire emergency
3. Add optional description
4. Confirm with location
5. Alert submitted and contacts notified

### 3. Emergency Contacts

1. **Home Tab** → **Emergency Contacts**
2. **Add Contact**: Enter name, phone, relationship
3. **Set Primary**: Primary contact gets priority notification
4. **Edit/Delete**: Manage contacts

### 4. Safety Map

1. **Map Tab**
2. View:
   - Your location (blue pin)
   - Nearby SOS alerts (red pin)
   - Community posts (orange pin)
3. Tap markers for details
4. Refresh button to update

### 5. Community

1. **Community Tab**
2. **Create Community**: Set up local neighborhood group
3. **Share Posts**: Post safety messages
4. **Anonymous Posts**: Toggle for privacy
5. **Join Communities**: Discover nearby groups

### 6. Profile & Settings

1. **Profile Tab**
2. **Emergency Info**: Store medical details, insurance
3. **Settings**: Privacy, terms, about
4. **Sign Out**: Logout from app

## Testing

### Test Data

Use these test credentials:
```
Email: test@example.com
Password: Test@123456
```

### Test Scenarios

1. **SOS Flow**
   - Create test SOS
   - Check in Supabase dashboard
   - Verify location stored

2. **Emergency Contacts**
   - Add test contact
   - Create SOS with Normal type
   - Verify notification logic

3. **Community**
   - Join/create community
   - Post message
   - Check map updates

4. **Location**
   - Grant location permission
   - Test map loading
   - Verify address geocoding

## Building for Google Play

### Prerequisites

1. **Android Studio** (for signing)
2. **Keystore file** (signing certificate)
3. **Google Play Developer account** ($25 one-time)

### Steps

#### 1. Create Keystore

```bash
keytool -genkey -v -keystore ~/my-release-key.keystore \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias my-key-alias
```

#### 2. Build APK/AAB

```bash
eas build --platform android --auto-submit
```

(Install EAS CLI first: `npm install -g eas-cli`)

#### 3. Upload to Google Play

1. Go to https://play.google.com/console
2. Create app
3. Fill app details, screenshots, description
4. Upload signed APK/AAB
5. Submit for review

### App Store Requirements

- **Privacy Policy**: Required
- **Screenshots**: 5-8 per orientation
- **Description**: Clear, safety-focused
- **Content Rating**: Fill questionnaire
- **Age Rating**: 12+ recommended

## API Integration

### Supabase Real-Time (Optional Enhancement)

```typescript
// Subscribe to SOS alerts
supabase
  .from('sos_alerts')
  .on('*', (payload) => {
    console.log('New alert:', payload);
  })
  .subscribe();
```

### Push Notifications (for operators)

```typescript
// Send push to responder
await notificationService.sendLocalNotification(
  'New SOS Alert',
  'Emergency in Westlands - Type: Crime'
);
```

### SMS Notifications (future)

Use Twilio or AWS SNS for SMS:
```typescript
// Example for future implementation
await twilioClient.messages.create({
  body: 'SOS Alert from SafetyApp',
  from: '+1234567890',
  to: emergencyContact.phone
});
```

## Troubleshooting

### Location Permission Not Granted

**Issue**: "Location permission denied"
**Solution**:
1. Go to phone settings
2. Find SafetyApp → Permissions
3. Grant Location permission
4. Restart app

### Map Not Loading

**Issue**: Map shows blank
**Solution**:
1. Check internet connection
2. Verify location permission
3. Clear app cache: `expo prebuild --clean`
4. Reinstall: `npm install && expo start`

### Supabase Connection Error

**Issue**: "Failed to connect to Supabase"
**Solution**:
1. Check `.env.local` credentials
2. Verify Supabase project is active
3. Check network connectivity
4. Run `expo start --tunnel` for offline mode

### Messages Not Syncing

**Issue**: Chat messages not appearing
**Solution**:
1. Check RLS policies in Supabase
2. Verify user ID matches
3. Check alert ID exists
4. Restart app

## Performance Optimization

### Already Implemented

- ✅ Lazy loading screens
- ✅ RLS for database security
- ✅ Optimized location queries
- ✅ Indexed database fields
- ✅ Efficient navigation structure

### Future Enhancements

- Local caching with SQLite
- Image optimization
- Background sync
- Offline mode support
- Push notification batching

## Security Best Practices

✅ **Implemented**:
- Secure token storage (Expo Secure Store)
- Row-Level Security (RLS) on all tables
- HTTPS-only API calls
- Environment variable protection

⚠️ **For Production**:
- Enable CORS restrictions
- Implement rate limiting
- Add CAPTCHA for signup
- Enable 2FA for accounts
- Monitor for suspicious activity
- Encrypt sensitive data at rest

## Database Backup

### Manual Backup

1. Go to Supabase Dashboard
2. Settings → Backups
3. Click "Create Backup"

### Automated Backups

- Supabase Pro plan: Daily backups
- Retention: 7 days

## Deployment Checklist

- [ ] All environment variables set
- [ ] Supabase database configured
- [ ] Privacy policy written
- [ ] Screenshots prepared
- [ ] App tested on device
- [ ] Version number updated (app.json)
- [ ] APK/AAB built and signed
- [ ] Google Play account created
- [ ] Store listing completed
- [ ] Submitted for review

## Support & Maintenance

### Regular Updates

- Check dependency updates monthly
- Update Expo SDK quarterly
- Monitor Supabase announcements

### Monitoring

- Set up Supabase alerts for errors
- Monitor user feedback
- Track crash reports

### Bug Fixes

If issues found:
1. Create issue on GitHub (if applicable)
2. Fix in development
3. Test thoroughly
4. Deploy new version
5. Notify users

## Additional Resources

- **Expo Documentation**: https://docs.expo.dev
- **React Native**: https://reactnative.dev
- **Supabase**: https://supabase.com/docs
- **React Navigation**: https://reactnavigation.org

## License

This project is created for Kenya mobile safety. Ensure compliance with local regulations and data protection laws.

## Contact & Support

For bugs, feature requests, or help:
- Create an issue in your repository
- Contact: [Your Contact Info]

---

**Happy Building! 🚀 Stay Safe! 🛡️**
