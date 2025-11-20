# Firestore Security Rules Deployment Guide

## Prerequisites
You need to be logged in to Firebase CLI.

## Steps to Deploy Security Rules

1. **Login to Firebase** (if not already logged in):
   ```bash
   firebase login
   ```

2. **Deploy the Firestore security rules**:
   ```bash
   firebase deploy --only firestore:rules
   ```

## What This Does

The security rules in `firestore.rules` will be deployed to your Firebase project. These rules:

- ✅ Prevent unauthorized access to data
- ✅ Ensure couples can only see their own data
- ✅ Validate that users belong to a couple before accessing shared content
- ✅ Allow users to manage their own profiles
- ✅ Protect against data leaks between different couples

## Verification

After deployment, you can verify the rules in the Firebase Console:
1. Go to https://console.firebase.google.com/
2. Select your project: `ldr-app-923ac`
3. Navigate to Firestore Database > Rules
4. Check that the rules match the content in `firestore.rules`

## Important Note

⚠️ **These security rules MUST be deployed before sharing the app with others!**

Without these rules, any user could potentially access data from other couples. The rules ensure proper data isolation.
