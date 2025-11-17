# LDR - Long Distance Relationship Companion App 💕

A beautiful, mobile-responsive web app for long-distance couples to save, plan, and organize everything they want to experience together.

## Features ✨

- **Countdown Timer**: Real-time countdown to your next in-person reunion
- **Date Ideas**: Save and categorize date ideas with filtering and completion tracking
- **Date Ideas by Location**: Organize ideas by specific places (Buffalo, NYC, California, etc.)
- **Books**: Track books you want to read together with status updates
- **Shows**: Keep track of shows to watch together across different streaming platforms
- **Future Trips**: Plan upcoming trips with priority levels and estimated dates
- **Dream Trips**: Build your bucket list of dream destinations together
- **Real-time Sync**: All data syncs instantly between both partners
- **Beautiful UI**: Romantic pink/purple gradient theme with mobile-first design

## Tech Stack 🛠️

- **Frontend**: React 19 + Vite
- **Styling**: TailwindCSS with custom romantic theme
- **Routing**: React Router v6
- **Backend**: Firebase (Firestore + Authentication)
- **Icons**: Lucide React

## Getting Started 🚀

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Firebase account

### Installation

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd LDR
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up Firebase:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable Firestore Database
   - Enable Authentication (Email/Password)
   - Get your Firebase config from Project Settings

4. Update Firebase configuration:
   - Open `src/firebase.js`
   - Replace the placeholder config with your actual Firebase config:
   ```javascript
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_PROJECT_ID.appspot.com",
     messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
     appId: "YOUR_APP_ID"
   }
   ```

5. Set up Firestore Rules (in Firebase Console):
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

6. Start the development server:
   ```bash
   npm run dev
   ```

7. Open your browser and navigate to `http://localhost:5173`

### First Time Setup

1. Create an account using the Sign Up form
2. Have your partner create an account with the same credentials or their own
3. Both accounts will have access to all shared data
4. Start adding date ideas, books, shows, and trips!

## Usage 📱

### Setting the Countdown
1. On the home page, click "Set Date" or "Update Date"
2. Choose the date when you'll see each other next
3. The countdown will update automatically

### Adding Items
- Each page has an "Add" button to create new items
- Fill in the form and submit
- Items appear instantly for both partners

### Editing & Deleting
- Click the edit icon to modify any item
- Click the trash icon to delete (with confirmation)
- Click the checkmark on date ideas to mark them as complete

### Filtering
- Use category filters on Date Ideas, Books, and Shows pages
- Toggle "Show completed ideas" to hide/show finished date ideas
- Filter trips by priority level

## Project Structure 📁

```
LDR/
├── src/
│   ├── components/
│   │   └── Layout.jsx          # Main layout with navigation
│   ├── contexts/
│   │   └── AuthContext.jsx     # Authentication context
│   ├── pages/
│   │   ├── Login.jsx           # Login/Sign up page
│   │   ├── Home.jsx            # Home with countdown
│   │   ├── DateIdeas.jsx       # Date ideas list
│   │   ├── DateIdeasByLocation.jsx
│   │   ├── Books.jsx
│   │   ├── Shows.jsx
│   │   ├── FutureTrips.jsx
│   │   └── DreamTrips.jsx
│   ├── services/
│   │   └── firebase.js         # Firebase service functions
│   ├── App.jsx                 # Main app with routing
│   ├── firebase.js             # Firebase configuration
│   ├── index.css               # Tailwind + custom styles
│   └── main.jsx                # App entry point
├── index.html
├── package.json
├── tailwind.config.js
├── vite.config.js
└── README.md
```

## Deployment 🌐

### Deploy to Firebase Hosting

1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize Firebase Hosting:
   ```bash
   firebase init hosting
   ```
   - Select your Firebase project
   - Set public directory to `dist`
   - Configure as single-page app: Yes
   - Don't overwrite index.html

4. Build and deploy:
   ```bash
   npm run build
   firebase deploy
   ```

## Customization 🎨

### Changing Colors
Edit `tailwind.config.js` to customize the pink gradient theme:
```javascript
colors: {
  primary: {
    // Customize these values
  }
}
```

### Adding Categories
To add new categories for date ideas, edit the `categories` array in:
- `src/pages/DateIdeas.jsx`
- `src/pages/DateIdeasByLocation.jsx`

### Adding Streaming Platforms
Edit the `platforms` array in `src/pages/Shows.jsx`

## Future Enhancements 🔮

- [ ] Photo uploads for date ideas and trips
- [ ] Shared calendar integration
- [ ] Random date generator ("Surprise Us")
- [ ] Relationship milestones timeline
- [ ] Dark mode
- [ ] Push notifications
- [ ] Offline mode with local caching

## Contributing 🤝

This is a personal project for Amit & RJ, but feel free to fork it for your own relationship!

## License 📄

This project is open source and available under the MIT License.

---

Made with ❤️ for long-distance love
