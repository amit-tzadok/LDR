# Invite System Testing Guide

## What Was Fixed

### Critical Bugs Resolved ✅

1. **URL Parameters Lost on Redirect**
   - Problem: `?invite=xyz` was lost when redirecting to `/login`
   - Fix: Preserve query params in redirect: `<Navigate to={`/login${location.search}`} />`

2. **Invite Code Hidden After Creation**
   - Problem: User creates couple → immediately redirects to home → never sees invite code
   - Fix: Don't redirect after creation, show invite code immediately

3. **Poor Error Messages**
   - Problem: Generic "Invalid invite code" doesn't help debugging
   - Fix: Specific errors like "no couple found with this code" or "already has 2 members"

4. **No Console Logging**
   - Problem: Can't debug what's happening
   - Fix: Added comprehensive logging throughout the invite flow

5. **No Visual Feedback**
   - Problem: User doesn't know if invite code was detected from URL
   - Fix: Green banner shows "✨ You're joining via invite code: xyz123"

## How to Test

### Test 1: Create Couple & Get Invite Code

1. **Login** to your existing account
2. **Navigate** to Invite page (if not already there)
3. **Click** "Create Shared Space" (if you don't have a couple)
4. **Verify**: Invite code appears immediately (don't get redirected away)
5. **Click** "Get Invite Code" (if you already have a couple)
6. **Check**: Your unique invite code displays
7. **Copy** the invite link

**Expected Result**: 
- Invite code shows immediately
- Link format: `https://amit-tzadok.github.io/LDR/?invite=abc123xyz`

### Test 2: Join Via Invite Link (Incognito Browser)

1. **Open** incognito/private window
2. **Paste** the invite link from Test 1
3. **Verify**: 
   - Redirects to login page
   - Green banner shows: "✨ You're joining via invite code: [code]"
   - Signup mode is auto-selected
   - "Join my partner's space" is auto-selected
   - Invite code field is pre-filled
4. **Enter**: Name, email, password
5. **Click** "Sign Up"
6. **Open browser console** (F12 → Console tab)
7. **Watch** for logs:
   ```
   Signing up user...
   User signed up: [userId]
   Attempting to join couple with invite code: [code]
   joinCouple called with: {inviteCode: "...", userId: "..."}
   Query results: {empty: false, count: 1}
   Found couple: {coupleCode: "...", members: [...]}
   Updated couple members
   Updated user profile with coupleCode: ...
   Successfully joined couple
   ```

**Expected Result**:
- No errors in console
- Redirects to home page
- Sees shared data from original account

### Test 3: Join Via Manual Invite Code (Incognito)

1. **Open** incognito window
2. **Go to**: `https://amit-tzadok.github.io/LDR/`
3. **Click** "Sign up"
4. **Select** "Join my partner's space"
5. **Manually type** the invite code
6. **Complete** signup
7. **Check console** for same logs as Test 2

**Expected Result**: Same as Test 2

### Test 4: Invalid Invite Code

1. **Try** joining with code: `INVALID123`
2. **Check** error message

**Expected Result**:
- Error: "Invalid invite code - no couple found with this code"

### Test 5: Couple Already Full

1. **Have** two accounts already in a couple
2. **Try** joining with that couple's invite code from 3rd account
3. **Check** error message

**Expected Result**:
- Error: "This couple already has 2 members"

### Test 6: URL Parameter Preservation

1. **Visit**: `https://amit-tzadok.github.io/LDR/?invite=xyz123`
2. **Check** URL bar after redirect

**Expected Result**:
- URL becomes: `https://amit-tzadok.github.io/LDR/login?invite=xyz123`
- Invite code preserved in URL

## Console Logs to Watch For

### Successful Couple Creation
```
Couple created successfully: {coupleCode: "ABC123", inviteCode: "xyz789abc"}
User profile updated
Couple code refreshed: ABC123
```

### Successful Invite Code Join
```
Attempting to join couple with invite code: xyz789abc
joinCouple called with: {inviteCode: "xyz789abc", userId: "..."}
Query results: {empty: false, count: 1}
Found couple: {coupleCode: "ABC123", members: ["user1"]}
Updated couple members
Updated user profile with coupleCode: ABC123
Successfully joined couple
```

### Failed Join (Invalid Code)
```
Attempting to join couple with invite code: INVALID
joinCouple called with: {inviteCode: "INVALID", userId: "..."}
Query results: {empty: true, count: 0}
Error: Invalid invite code - no couple found with this code
```

## Troubleshooting

### Problem: "Invalid invite code" error

**Possible Causes**:
1. Code was typed wrong (case-sensitive)
2. Couple was deleted
3. Database query failed

**Debug Steps**:
1. Open Firebase Console → Firestore
2. Navigate to `couples` collection
3. Find your couple document
4. Check if `inviteCode` field exists
5. Compare with the code you're trying to use

### Problem: Redirect loops

**Possible Causes**:
1. User has couple but redirect is misconfigured
2. CoupleContext not updating

**Debug Steps**:
1. Check console for "Invite page state: {hasCouple: ..., coupleCode: ...}"
2. Check user profile in Firestore for `coupleCode` field
3. Refresh couple code manually

### Problem: Invite link doesn't work

**Possible Causes**:
1. Base URL incorrect
2. Query params not preserved
3. React Router not handling params

**Debug Steps**:
1. Check if URL has `?invite=...` after redirect
2. Open console and check for "Check for invite code in URL" logs
3. Verify `window.location.search` contains the param

## Success Criteria

✅ Invite link auto-fills code on login page
✅ Visual confirmation (green banner) when code detected
✅ Detailed error messages if join fails
✅ Console logs show each step of the process
✅ User sees invite code immediately after creating couple
✅ Second user can successfully join via link or manual code
✅ Both users see same shared data
✅ Can't join if couple already has 2 members

## Next Steps After Testing

If all tests pass:
- Share invite link with your partner
- Monitor console for any unexpected errors
- Test all shared features (sticky notes, gratitude, etc.)
- Verify data isolation (create 2nd couple, confirm data doesn't mix)
