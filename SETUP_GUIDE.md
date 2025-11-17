# Quick Setup Guide for LDR App

## 🚀 Getting Started in 5 Minutes

### Step 1: Firebase Setup (5 minutes)

1. **Create Firebase Project**
   - Go to https://console.firebase.google.com/
   - Click "Add project"
   - Name it "LDR-App" (or any name you like)
   - Disable Google Analytics (optional)
   - Click "Create project"

2. **Enable Authentication**
   - In Firebase Console, go to "Authentication" in left sidebar
   - Click "Get started"
   - Click "Email/Password" under Sign-in method
   - Toggle "Enable" and save

3. **Enable Firestore Database**
   - In Firebase Console, go to "Firestore Database"
   - Click "Create database"
   - Select "Start in test mode" (we'll secure it later)
   - Choose a location close to you
   - Click "Enable"

4. **Set Up Security Rules**
   - In Firestore Database, go to "Rules" tab
   - Replace the rules with:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```
   - Click "Publish"

5. **Get Your Firebase Config**
   - Go to Project Settings (gear icon near "Project Overview")
   - Scroll down to "Your apps"
   - Click the web icon (</>)
   - Register app with nickname "LDR Web App"
   - Copy the firebaseConfig object

6. **Update src/firebase.js**
   - Open `src/firebase.js` in your code editor
   - Replace the placeholder config with your actual config:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIza...",  // Your actual values here
     authDomain: "ldr-app-xxxxx.firebaseapp.com",
     projectId: "ldr-app-xxxxx",
     storageBucket: "ldr-app-xxxxx.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abcdef"
   }
   ```

### Step 2: Run the App

```bash
npm run dev
```

Open http://localhost:5173 in your browser

### Step 3: Create Your Accounts

1. Click "Don't have an account? Sign up"
2. Enter your email and password (min 6 characters)
3. Click "Sign Up"
4. Share the link with your partner
5. Your partner creates their own account
6. Both of you can now see and edit the same content!

## 📱 First Things to Try

1. **Set Your Countdown**
   - Click "Set Date" on the home page
   - Choose when you'll see each other next
   - Watch the countdown update!

2. **Add a Date Idea**
   - Go to "Date Ideas" from the home page
   - Click "Add Idea"
   - Fill in the details
   - Watch it appear on your partner's screen too!

3. **Explore All Features**
   - Navigate using the bottom menu (on mobile)
   - Add books, shows, and trips
   - Try the filters and categories

## 🔒 Security Notes

- Both users need to be authenticated to see any data
- All data is shared between authenticated users
- For production, consider adding more specific security rules

## 🐛 Troubleshooting

**Problem**: "Firebase not configured" error
- **Solution**: Make sure you updated `src/firebase.js` with your actual Firebase config

**Problem**: Can't sign in
- **Solution**: Check that Email/Password auth is enabled in Firebase Console

**Problem**: Data not syncing
- **Solution**: Check Firestore rules allow authenticated users to read/write

**Problem**: App won't start
- **Solution**: Run `npm install` to ensure all dependencies are installed

## 📞 Need Help?

- Check the main README.md for detailed documentation
- Firebase Console: https://console.firebase.google.com/
- Firebase Docs: https://firebase.google.com/docs

## 🎉 You're All Set!

Enjoy planning your future together! ❤️
