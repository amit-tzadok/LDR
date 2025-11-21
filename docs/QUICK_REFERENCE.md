# Quick Reference Guide

## 🎯 Common Tasks

### Adding New Categories

**File**: `src/pages/DateIdeas.jsx` and `src/pages/DateIdeasByLocation.jsx`

```javascript
const categories = ['Romantic', 'Movie Night', 'Games', 'Cute', 'Adventure', 'Food', 'Other', 'YOUR_NEW_CATEGORY']
```

### Adding New Streaming Platforms

**File**: `src/pages/Shows.jsx`

```javascript
const platforms = ['Netflix', 'Hulu', 'Prime Video', 'Disney+', 'HBO Max', 'Apple TV+', 'Other', 'YOUR_PLATFORM']
```

### Changing Theme Colors

**File**: `tailwind.config.js`

```javascript
colors: {
  primary: {
    50: '#fdf2f8',   // Lightest
    100: '#fce7f3',
    200: '#fbcfe8',
    300: '#f9a8d4',
    400: '#f472b6',  // Used in buttons
    500: '#ec4899',  // Primary color
    600: '#db2777',
    700: '#be185d',
    800: '#9d174d',
    900: '#831843',  // Darkest
  },
}
```

### Updating Firebase Config

**File**: `src/firebase.js`

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
}
```

## 📝 Firestore Collections

### Collection Names
- `settings` - App settings (next meet date)
- `dateIdeas` - Date ideas
- `books` - Books to read
- `shows` - Shows to watch
- `futureTrips` - Planned trips
- `dreamTrips` - Bucket list trips

### Adding New Collection

1. **Create service functions** in `src/services/firebase.js`:

```javascript
export const subscribeYourCollection = (callback) => {
  const q = query(collection(db, 'yourCollection'))
  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    callback(items)
  })
}

export const addYourItem = async (item) => {
  await addDoc(collection(db, 'yourCollection'), item)
}

export const updateYourItem = async (id, updates) => {
  const docRef = doc(db, 'yourCollection', id)
  await updateDoc(docRef, updates)
}

export const deleteYourItem = async (id) => {
  await deleteDoc(doc(db, 'yourCollection', id))
}
```

2. **Create page component** in `src/pages/YourPage.jsx`

3. **Add route** in `src/App.jsx`:

```javascript
<Route path="your-path" element={<YourPage />} />
```

4. **Add navigation** in `src/pages/Home.jsx` and `src/components/Layout.jsx`

## 🎨 Custom Styling Classes

### Available Classes

```css
.card                  /* White card with shadow */
.btn-primary           /* Pink gradient button */
.btn-secondary         /* White button with pink text */
.input                 /* Standard input field */
.nav-card              /* Clickable navigation card */
```

### Usage Example

```jsx
<div className="card">
  <h2 className="text-xl font-bold text-gray-800">Title</h2>
  <button className="btn-primary">Click Me</button>
</div>
```

## 🔧 Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

## 🐛 Troubleshooting

### "Module not found" Error
```bash
npm install
```

### Firebase Config Error
Check `src/firebase.js` has correct config values

### Real-time Updates Not Working
1. Check Firestore rules
2. Verify authentication
3. Check browser console for errors

### Styling Not Applied
```bash
# Restart dev server
npm run dev
```

### Build Errors
```bash
# Clear cache and rebuild
rm -rf node_modules
npm install
npm run build
```

## 📱 Responsive Breakpoints

- **Mobile**: Default (< 640px)
- **Tablet**: `sm:` (≥ 640px)
- **Desktop**: `md:` (≥ 768px), `lg:` (≥ 1024px)

### Example Usage

```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* 1 column on mobile, 2 on tablet, 3 on desktop */}
</div>
```

## 🎯 Page Navigation Structure

```
/                    → Home (with countdown)
/date-ideas          → Date Ideas
/date-ideas-by-location → Date Ideas by Location
/books              → Books
/shows              → Shows
/future-trips       → Future Trips
/dream-trips        → Dream Trips
/login              → Login/Sign Up
```

## 🔐 Authentication Flow

1. User visits protected route (e.g., `/`)
2. If not authenticated → Redirect to `/login`
3. User signs up or signs in
4. Redirect to originally requested route
5. User can now access all features

## 💡 Pro Tips

1. **Real-time Updates**: Data syncs automatically - no refresh needed!
2. **Offline Edits**: Changes made offline will sync when connection restored
3. **Mobile First**: Design looks best on mobile, but works everywhere
4. **Categories**: Feel free to customize categories in the code
5. **Images**: For Dream Trips, use direct image URLs (e.g., Imgur, Unsplash)

## 📞 Need Help?

- Check `README.md` for full documentation
- Check `SETUP_GUIDE.md` for setup instructions
- Check `PROJECT_SUMMARY.md` for technical details
- Firebase Console: https://console.firebase.google.com/
