# 🚀 START HERE - Quick Start Guide

Welcome to your LDR Companion App! Follow these steps to get started in **5 minutes**.

## ⚡ Super Quick Start (For Amit & RJ)

### Step 1: Set Up Firebase (3 minutes)

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Create Project**:
   - Click "Add project"
   - Name: "LDR-App" (or anything you like)
   - Disable Google Analytics (optional)
   - Click "Create project"

3. **Enable Authentication**:
   - Click "Authentication" in sidebar
   - Click "Get started"
   - Enable "Email/Password"
   - Save

4. **Enable Firestore**:
   - Click "Firestore Database" in sidebar
   - Click "Create database"
   - Choose "Start in test mode"
   - Select a region close to you
   - Click "Enable"

5. **Update Security Rules**:
   - In Firestore, go to "Rules" tab
   - Replace with:
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

6. **Get Your Config**:
   - Go to Project Settings (gear icon)
   - Scroll to "Your apps"
   - Click web icon (</>)
   - Register app: "LDR Web"
   - **Copy the firebaseConfig object**

7. **Update Your Code**:
   - Open `src/firebase.js`
   - Replace the config starting at line 6:
   ```javascript
   const firebaseConfig = {
     apiKey: "YOUR_ACTUAL_API_KEY_HERE",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abcdef123456"
   }
   ```

### Step 2: Run the App (1 minute)

```bash
# Open terminal in this folder and run:
npm run dev
```

**That's it!** Open http://localhost:5173 in your browser.

### Step 3: Create Accounts (1 minute)

**Amit**:
1. Click "Don't have an account? Sign up"
2. Enter your email and password (min 6 characters)
3. Click "Sign Up"
4. You're in! 🎉

**RJ**:
1. Open the same link: http://localhost:5173
2. Create your own account
3. Now you both can see the same content!

## 🎯 First Things to Try

### 1. Set Your Countdown ⏰
- On the home page, click "Set Date"
- Choose when you'll see each other next
- Watch the countdown appear!

### 2. Add Your First Date Idea 💕
- Click "Date Ideas" from home
- Click "+ Add Idea"
- Fill in:
  - Title: "Movie night with popcorn"
  - Category: "Movie Night"
  - Location: (optional) "Our place"
- Submit!
- Check your partner's screen - it should appear instantly!

### 3. Plan a Trip ✈️
- Go back to home
- Click "Future Trips"
- Click "+ Add Trip"
- Add your next adventure together

### 4. Explore Everything 🎨
- Navigate using the bottom bar (on mobile)
- Try adding books, shows, dream trips
- Everything syncs in real-time between you both!

## 📱 Mobile Access

Want to access on your phone?

1. Find your computer's local IP:
   ```bash
   # On Mac/Linux:
   ifconfig | grep "inet "
   
   # On Windows:
   ipconfig
   ```

2. Start dev server with host flag:
   ```bash
   npm run dev -- --host
   ```

3. On your phone, visit:
   ```
   http://YOUR_IP_ADDRESS:5173
   ```

## 🎨 Customize It!

### Change Categories
Edit `src/pages/DateIdeas.jsx`, line 7:
```javascript
const categories = ['Romantic', 'Movie Night', 'Games', 'Add Your Own!']
```

### Change Colors
Edit `tailwind.config.js` to use your favorite colors!

## 📚 Need More Help?

- **Quick Setup**: See `SETUP_GUIDE.md` (more detailed)
- **Full Documentation**: See `README.md`
- **Common Tasks**: See `QUICK_REFERENCE.md`
- **Before Launch**: See `LAUNCH_CHECKLIST.md`
- **Technical Details**: See `PROJECT_SUMMARY.md`

## 🐛 Troubleshooting

**Problem**: "Firebase not configured" error
- Make sure you updated `src/firebase.js` with your real Firebase config

**Problem**: Can't sign in
- Check that Email/Password auth is enabled in Firebase Console

**Problem**: Nothing syncs
- Check Firestore rules (Step 1.5 above)

**Problem**: npm install errors
- Try: `rm -rf node_modules && npm install`

## 🎉 You're Ready!

Start planning your amazing future together! Every date idea, book, show, and trip you add brings you closer to those special moments. ❤️

---

**Made with love for Amit & RJ** 💕

---

## 🚢 Deploy to Production (Optional)

When you're ready to make it live:

```bash
# Build the app
npm run build

# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize hosting
firebase init hosting

# Deploy
firebase deploy
```

Your app will be live at: `https://your-project.web.app`

Share this URL with your partner and access it from anywhere! 🌍
