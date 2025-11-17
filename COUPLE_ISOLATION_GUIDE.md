# Firebase Security Rules for Couple Isolation

To make each couple's data private, update your Firestore Security Rules in Firebase Console:

## Steps:
1. Go to Firebase Console: https://console.firebase.google.com/
2. Select your project: **ldr-app-923ac**
3. Go to **Firestore Database** → **Rules**
4. Replace with these rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // User profiles - users can only read/write their own profile
    match /userProfiles/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Couples collection
    match /couples/{coupleId} {
      allow read: if request.auth != null && 
                     request.auth.uid in resource.data.members;
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
                       request.auth.uid in resource.data.members;
    }
    
    // All shared data - scoped by coupleCode in document
    match /{collection}/{document} {
      allow read, write: if request.auth != null &&
                           (resource == null || 
                            !exists(/databases/$(database)/documents/userProfiles/$(request.auth.uid)) ||
                            get(/databases/$(database)/documents/userProfiles/$(request.auth.uid)).data.coupleCode == resource.data.coupleCode);
    }
  }
}
```

## Current Simple Solution (Recommended):

Since you only plan to use this with your boyfriend, the current setup is fine. Just:
1. **Don't share the link publicly**
2. **Only give it to your boyfriend**
3. **Use strong passwords**

The data is already protected by Firebase Authentication - only logged-in users can access it.

## If you want true isolation:

I would need to:
1. Add a "coupleCode" field to every document
2. Update all 15+ Firebase queries to filter by coupleCode
3. Modify the signup flow to create/join couples
4. This would take significant refactoring (~30-40 file changes)

**Recommendation**: Keep it simple since it's just for you two. If you want the full isolation system later, let me know and I can implement it.
