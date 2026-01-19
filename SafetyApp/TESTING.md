# Testing Checklist - SafetyApp Kenya

## Pre-Testing Setup

- [ ] `.env.local` configured with Supabase credentials
- [ ] Supabase database created and populated (run SQL script)
- [ ] Node dependencies installed (`npm install`)
- [ ] App started (`npm start`)
- [ ] Device/emulator ready
- [ ] Location permission enabled on device

## Authentication Tests

### Login
- [ ] Load app → Login screen appears
- [ ] Enter valid email and password
- [ ] "Sign In" button clickable
- [ ] Loading state shows spinner
- [ ] Successfully logged in → Home screen
- [ ] User name displays correctly
- [ ] Token stored securely

### Sign Up
- [ ] Click "Don't have an account?" link
- [ ] Enter first name, last name, email, password
- [ ] Password validation works (min 6 chars)
- [ ] Passwords match validation
- [ ] Account created successfully
- [ ] Auto-login after signup
- [ ] Can then login with created credentials

### Persistent Login
- [ ] Login to account
- [ ] Kill and restart app
- [ ] Still logged in (no login screen)
- [ ] User data preserved

## Home Screen Tests

### SOS Button
- [ ] Large SOS button visible
- [ ] Tapping SOS → SOSFlow screen
- [ ] "Welcome back, [Name]" displays correctly

### Incident Type Quick Access
- [ ] All 6 incident types visible (Normal, Sensitive, Test, Medical, Crime, Fire)
- [ ] Tapping each type → SOSFlow with type pre-selected
- [ ] Visual feedback on tap

### Quick Actions
- [ ] "Emergency Contacts" button works
- [ ] "Safety Map" button works
- [ ] "Community Feed" button works
- [ ] "Profile Settings" button works

### Safety Tips
- [ ] Tips display correctly
- [ ] Text is readable
- [ ] Scrollable if needed

## SOS Flow Tests

### Type Selection
- [ ] All 6 incident types listed
- [ ] Can select/deselect types
- [ ] Visual feedback (highlight)
- [ ] "Continue" button enabled
- [ ] "Cancel" button returns to home

### Details Step
- [ ] Description input appears
- [ ] Can type multiple lines
- [ ] "Back" button works
- [ ] "Continue" button proceeds

### Confirmation
- [ ] Shows selected type, location, description
- [ ] Location displays address (reverse geocoding)
- [ ] Coordinates shown
- [ ] Sensitive mode shows warning
- [ ] "Back" button works
- [ ] "Submit SOS" button works

### Success Screen
- [ ] Checkmark icon shows
- [ ] "SOS Alert Submitted" message
- [ ] Alert ID displayed
- [ ] Status shows "active"
- [ ] For Sensitive: "Open Operator Chat" button visible
- [ ] "Cancel Alert" button works (except Test type)
- [ ] "Return to Home" button works

## Emergency Contacts Tests

### View Contacts
- [ ] Screen loads with list of contacts
- [ ] Each contact shows: name, phone, relationship
- [ ] Primary contact highlighted
- [ ] Empty state shows when no contacts

### Add Contact
- [ ] "+ Add Contact" button works
- [ ] Modal opens with form fields
- [ ] Can enter name
- [ ] Can enter phone number
- [ ] Can enter relationship
- [ ] Can check "Set as Primary"
- [ ] "Save" button adds contact
- [ ] Notification shows "Contact added"
- [ ] New contact appears in list
- [ ] "Cancel" closes modal

### Edit Contact
- [ ] "Edit" button on contact works
- [ ] Form pre-fills with data
- [ ] Can change fields
- [ ] "Save" updates contact
- [ ] Changes reflected in list
- [ ] Notification shows "Contact updated"

### Delete Contact
- [ ] "Delete" button shows confirmation
- [ ] Confirming deletes contact
- [ ] Notification shows "Contact deleted"
- [ ] Contact removed from list
- [ ] Canceling keeps contact

### Primary Contact
- [ ] Can set a contact as primary
- [ ] Only one primary at a time
- [ ] Primary contact highlighted differently
- [ ] Primary badge visible

## Map Tests

### Initial Load
- [ ] Map displays
- [ ] User's location marked (blue pin)
- [ ] Map centered on user
- [ ] Legend shows (You, Alert, Post colors)
- [ ] "Refresh" button visible

### Nearby Alerts
- [ ] SOS alerts within radius show (red pins)
- [ ] Tapping alert shows details modal
- [ ] Modal shows: type, status, location, time, description

### Nearby Posts
- [ ] Community posts show (orange pins)
- [ ] Tapping post shows details
- [ ] Modal shows: author, content, location, likes

### Refresh
- [ ] "Refresh" button updates data
- [ ] New alerts/posts appear
- [ ] Loading state shows

## Community Tests

### View Communities
- [ ] Communities tab shows nearby communities
- [ ] Each card shows: name, description, member count
- [ ] "Join" button visible
- [ ] Empty state when no communities

### Create Community
- [ ] "+ Create Community" button works
- [ ] Modal opens with form
- [ ] Can enter community name
- [ ] Can enter description
- [ ] "Create" button submits
- [ ] Community added to list
- [ ] User auto-joined
- [ ] Notification shows "Community created"

### Join Community
- [ ] "Join" button works
- [ ] Confirmation appears
- [ ] User count increases
- [ ] Notification shows success

### View Posts
- [ ] Switch to "Posts" tab
- [ ] Posts display with: author, content, date, likes
- [ ] Anonymous posts show "Anonymous" author
- [ ] Empty state when no posts

### Create Post
- [ ] "+ Share Post" button works
- [ ] Modal opens with message field
- [ ] "Post anonymously" checkbox works
- [ ] "Post" button submits
- [ ] Post appears in feed (top)
- [ ] Notification shows "Post created"

### Like Post
- [ ] Heart emoji clickable
- [ ] Like count increases
- [ ] Visual feedback

## Profile Tests

### User Info
- [ ] User avatar shows first letter
- [ ] User name displays
- [ ] Email shows
- [ ] Phone shows (if available)

### Emergency Info Section
- [ ] "Emergency Info" section visible
- [ ] If no data: shows "No emergency information"
- [ ] "Edit" button works

### Edit Emergency Info
- [ ] Modal opens with form fields
- [ ] Can enter: blood type, allergies, conditions, doctor name/phone, insurance
- [ ] "Save" button saves data
- [ ] Data persists on reload
- [ ] Notification shows "Information updated"

### Settings
- [ ] "Privacy Policy" button clickable
- [ ] "Terms of Service" button clickable
- [ ] "About" shows version

### Sign Out
- [ ] "Sign Out" button shows confirmation
- [ ] Confirming logs out
- [ ] Returns to Login screen
- [ ] Tokens cleared

## Operator Chat Tests

### Access Chat
- [ ] Create Sensitive SOS
- [ ] On success screen, "Open Operator Chat" visible
- [ ] Button opens chat screen

### Send Messages
- [ ] Message input field visible
- [ ] Can type message
- [ ] "Send" button works
- [ ] Message appears in chat (user color)
- [ ] Message sent to backend
- [ ] Input clears after send
- [ ] Can't send empty messages

### Receive Messages
- [ ] Subscribe to real-time messages
- [ ] Operator messages appear (different color)
- [ ] Sender name shows
- [ ] Timestamps display
- [ ] Messages scroll as new ones arrive

### Message History
- [ ] Previous messages load on open
- [ ] Scrollable message list
- [ ] Old messages still there

## Location Tests

### Permission Request
- [ ] First use: location permission requested
- [ ] User can grant/deny
- [ ] Granted: location updates work
- [ ] Denied: graceful error handling

### Get Location
- [ ] Accurate location captured
- [ ] Coordinates saved
- [ ] Address reverse-geocoded correctly
- [ ] Accuracy shown in map

### Location Sharing
- [ ] Can share location with contact
- [ ] Location updates in real-time
- [ ] Can stop sharing
- [ ] Status shows correct

## Notification Tests

### Push Notification Registration
- [ ] App requests notification permission
- [ ] Registration succeeds
- [ ] Expo token generated (check device)

### Local Notifications
- [ ] Create SOS → notification received
- [ ] Notification shows correct title/message
- [ ] Can tap to interact

### Contact Notifications (when implemented)
- [ ] Create Normal SOS
- [ ] Emergency contacts notified (verify in backend)
- [ ] Sensitive SOS: contacts NOT notified

## Performance Tests

### Load Times
- [ ] App starts in <3 seconds
- [ ] Screens load smoothly
- [ ] No freezing
- [ ] Animations smooth

### Offline Handling
- [ ] Disable internet
- [ ] App shows graceful error
- [ ] Re-enable: reconnects properly

### Memory
- [ ] App doesn't leak memory
- [ ] Long usage stable
- [ ] No crashes after heavy use

## Edge Cases

### Error Handling
- [ ] Invalid email format rejected
- [ ] Short password rejected
- [ ] Missing required fields rejected
- [ ] Network errors shown to user
- [ ] Supabase errors handled
- [ ] Location denied handled
- [ ] Permission denied handled

### Boundary Cases
- [ ] Max character inputs work
- [ ] Very long addresses handled
- [ ] Multiple rapid taps don't duplicate
- [ ] Fast screen switching stable
- [ ] Map with 100+ markers loads
- [ ] Chat with 1000+ messages loads

## Accessibility Tests

### Screen Reader
- [ ] Important elements have labels
- [ ] Buttons are reachable
- [ ] Input fields have labels

### Visual
- [ ] Text is readable (contrast OK)
- [ ] Text size reasonable
- [ ] Icons clear
- [ ] Colors not only differentiator

### Navigation
- [ ] Can navigate using keyboard (if device)
- [ ] Back buttons work
- [ ] Modals closable

## Platform-Specific Tests

### Android
- [ ] Permissions dialog shows
- [ ] Location services work
- [ ] Notifications work
- [ ] Back button behavior correct

### iOS (if available)
- [ ] Notch/safe area respected
- [ ] Gestures work
- [ ] Dark mode respects system
- [ ] Notifications work

## Database Tests

### Data Persistence
- [ ] Create contact → stored in DB
- [ ] Refresh app → data still there
- [ ] Create post → appears in DB
- [ ] Can query data via Supabase

### RLS (Row Level Security)
- [ ] User can't see others' data
- [ ] User can edit own data
- [ ] Permissions working correctly

### Cascading Deletes
- [ ] Delete user → related data deleted
- [ ] Delete community → posts deleted

## Final Checks

- [ ] All screens accessible
- [ ] All buttons functional
- [ ] All forms submit correctly
- [ ] All data persists
- [ ] All notifications work
- [ ] No console errors
- [ ] No crashes/freezes
- [ ] Performance acceptable
- [ ] Ready for beta testing

## Sign-Off

- **Tester Name**: _____________
- **Date**: _____________
- **Device**: _____________
- **OS Version**: _____________
- **App Version**: 1.0.0
- **Status**: [ ] PASS [ ] FAIL

**Notes**:
```
_____________________________
_____________________________
_____________________________
```

---

✅ All tests passed? Ready to submit to Google Play!
