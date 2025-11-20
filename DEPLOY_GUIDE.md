# Quick Deploy Guide

## 🚀 Deploy Firestore Security Rules

**⚠️ CRITICAL: Run this before sharing the app with anyone!**

```bash
# 1. Login to Firebase (if not already logged in)
firebase login

# 2. Deploy the security rules
firebase deploy --only firestore:rules
```

## ✅ What This Does
- Deploys `firestore.rules` to Firebase
- Enforces couple-based data isolation
- Prevents unauthorized access
- Required for multi-couple support

## 🎯 Verify Deployment
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: `ldr-app-923ac`
3. Navigate to: Firestore Database → Rules
4. Confirm rules match `firestore.rules`

---

## 🌐 Deploy App to GitHub Pages

```bash
npm run deploy
```

This will:
- Build the production version
- Deploy to GitHub Pages
- Make the app accessible at your GitHub Pages URL

---

## 🧪 Test Before Sharing

### Test Locally First
```bash
npm run dev
```

Then test:
1. ✅ Sign up creates profile
2. ✅ Redirects to invite page
3. ✅ Can create couple
4. ✅ Invite code generated
5. ✅ Can join with invite code
6. ✅ Can access app after setup
7. ✅ Protected routes work

### Test Production
After deploying rules and app:
1. Test with a real second account
2. Verify data isolation
3. Ensure invite flow works
4. Check security rules enforce access

---

## ⚠️ Before Sharing with Friends

**Checklist:**
- [ ] Security rules deployed to Firebase
- [ ] App deployed to GitHub Pages
- [ ] Tested with 2 real accounts
- [ ] Verified data isolation works
- [ ] Confirmed invite flow works
- [ ] Checked all features work in production

**Then:**
- Share your GitHub Pages URL
- Friends sign up and create/join couples
- Each couple gets isolated data space
- Enjoy! 🎉
