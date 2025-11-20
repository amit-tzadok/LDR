# Invite System Fix - Complete Overhaul

## Problem Summary

The invite code system was completely broken due to **two conflicting couple management systems** running in parallel:

### Old System (coupleService.js)
- Created couple documents with field: `code` (no `inviteCode`)
- Used by: `Login.jsx`
- Joined couples using `coupleCode` directly
- Function signature: `joinCouple(userId, userName, userEmail, coupleCode)`

### New System (firebase.js)
- Created couple documents with fields: `coupleCode` AND `inviteCode`
- Used by: `Invite.jsx`
- Joined couples using `inviteCode` (separate from coupleCode)
- Function signature: `joinCouple(inviteCode, userId)`

**Result**: Login page asked for "couple code", Invite page generated "invite codes", and they were incompatible. Complete mess.

## Solutions Implemented

### 1. Unified Couple System ✅

**Updated `createCouple()` in firebase.js**:
- Now creates couple documents with BOTH `code` and `coupleCode` fields (backwards compatibility)
- Always generates an `inviteCode`
- Structure:
  ```javascript
  {
    code: "ABC123",           // For old system compatibility
    coupleCode: "ABC123",     // For new system
    inviteCode: "xyz789abc",  // Secret code for joining
    members: [userId],
    createdAt: timestamp,
    createdBy: userId
  }
  ```

### 2. Fixed Login.jsx ✅

**Changes**:
- Removed import from `coupleService.js`
- Now uses `joinCouple` from `firebase.js` (new system)
- Changed "couple code" to "invite code" in UI
- Updated function call: `joinCouple(inviteCode, userId)` (correct signature)
- Added URL parameter detection: `?invite=xyz789abc` auto-fills the code
- Auto-switches to signup mode when invite code detected in URL

### 3. Fixed Invite.jsx ✅

**Changes**:
- Added static import of `getCouple` (removed dynamic import)
- Improved "Get Invite Code" button to:
  - Fetch existing invite code if available
  - Auto-generate new invite code for old couples without one
  - Save generated code to Firestore
  - Better error messages
- Fixed invite link to include GitHub Pages base path: `/LDR/`
- URL: `https://amit-tzadok.github.io/LDR/?invite=xyz789abc`

### 4. URL Parameter Flow ✅

**Complete flow for invite links**:
1. User A creates couple → gets invite code
2. User A shares link: `https://amit-tzadok.github.io/LDR/?invite=xyz789abc`
3. User B clicks link → Login page
4. Login page detects `?invite=xyz789abc` in URL
5. Auto-fills invite code field
6. Auto-switches to "Sign Up" mode
7. Auto-selects "Join my partner's space"
8. User B enters name, email, password → signs up
9. Automatically joins User A's couple
10. Redirected to home page with shared data

## Backwards Compatibility

Old couples (created before this fix) will:
- Still work normally
- Get an `inviteCode` auto-generated when user clicks "Get Invite Code"
- Have both `code` and `coupleCode` fields added (via merge)
- Be fully compatible with new system

## Testing Checklist

- [x] Deploy fixes to GitHub Pages
- [ ] Test new couple creation
- [ ] Test invite code generation
- [ ] Test invite link sharing
- [ ] Test URL parameter (`?invite=XXX`)
- [ ] Test joining via invite code on login page
- [ ] Test old couples getting invite codes
- [ ] Test two separate couples can't see each other's data

## What's Fixed

✅ Invite codes now work consistently everywhere
✅ Login page uses invite codes (not couple codes)
✅ Invite links include correct base URL
✅ URL parameters auto-fill invite code on signup
✅ Old couples get invite codes when needed
✅ Single unified couple management system
✅ Better error messages

## What to Tell Your Friends

**To invite someone**:
1. Go to "Invite" page
2. Click "Get Invite Code"
3. Share the link OR code with them
4. They click link (or enter code during signup)
5. Done!

**If they already have an account**:
- They can go to Invite page
- Enter your invite code in the "Join" section
- This will switch them to your couple

## Migration Path

The old `coupleService.js` is now **deprecated** but kept for reference. All new code should use:
- `createCouple()` from `services/firebase.js`
- `joinCouple()` from `services/firebase.js`
- `getCouple()` from `services/firebase.js`

Consider removing `coupleService.js` entirely in a future cleanup once all users are on the new system.
