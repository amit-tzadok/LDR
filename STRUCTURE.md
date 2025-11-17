# LDR App - Visual Structure

## 🗂️ File Structure Tree

```
LDR/
│
├── 📄 Configuration Files
│   ├── package.json              # Dependencies & scripts
│   ├── vite.config.js            # Vite configuration
│   ├── tailwind.config.js        # Tailwind customization
│   ├── postcss.config.js         # PostCSS setup
│   ├── eslint.config.js          # ESLint rules
│   ├── .gitignore                # Git ignore rules
│   └── .env.example              # Environment template
│
├── 📚 Documentation
│   ├── README.md                 # Main documentation
│   ├── SETUP_GUIDE.md            # Quick setup (5 min)
│   ├── PROJECT_SUMMARY.md        # What was built
│   ├── LAUNCH_CHECKLIST.md       # Pre-launch checklist
│   ├── QUICK_REFERENCE.md        # Common tasks guide
│   └── STRUCTURE.md              # This file
│
├── 🌐 Public Assets
│   └── heart.svg                 # App favicon
│
├── 📝 HTML Entry
│   └── index.html                # Main HTML file
│
└── 💻 Source Code (src/)
    │
    ├── 🎨 Styling
    │   └── index.css             # Tailwind + custom CSS
    │
    ├── ⚙️ Configuration
    │   ├── main.jsx              # React entry point
    │   ├── App.jsx               # Routing & app structure
    │   └── firebase.js           # Firebase initialization
    │
    ├── 🔐 Authentication
    │   └── contexts/
    │       └── AuthContext.jsx   # Auth provider & hooks
    │
    ├── 🗄️ Backend Services
    │   └── services/
    │       └── firebase.js       # All Firestore operations
    │
    ├── 🧩 Shared Components
    │   └── components/
    │       └── Layout.jsx        # Header + nav + outlet
    │
    └── 📄 Pages
        ├── Login.jsx             # Authentication page
        ├── Home.jsx              # Countdown + navigation
        ├── DateIdeas.jsx         # Date ideas CRUD
        ├── DateIdeasByLocation.jsx # Location-grouped ideas
        ├── Books.jsx             # Books CRUD
        ├── Shows.jsx             # Shows CRUD
        ├── FutureTrips.jsx       # Future trips CRUD
        └── DreamTrips.jsx        # Dream trips CRUD
```

## 🔄 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Firebase                             │
│  ┌──────────────────────┐    ┌──────────────────────┐      │
│  │   Authentication     │    │     Firestore        │      │
│  │  - Email/Password    │    │  - dateIdeas         │      │
│  │  - Session Mgmt      │    │  - books             │      │
│  └──────────┬───────────┘    │  - shows             │      │
│             │                 │  - futureTrips       │      │
│             │                 │  - dreamTrips        │      │
│             │                 │  - settings          │      │
│             │                 └──────────┬───────────┘      │
└─────────────┼────────────────────────────┼──────────────────┘
              │                            │
              ▼                            ▼
       ┌──────────────────────────────────────────┐
       │         AuthContext.jsx                  │
       │  - Manages authentication state          │
       │  - Provides signIn, signUp, signOut      │
       └──────────────┬───────────────────────────┘
                      │
                      ▼
       ┌──────────────────────────────────────────┐
       │           App.jsx                        │
       │  - Protected Routes                      │
       │  - Route Configuration                   │
       └──────────────┬───────────────────────────┘
                      │
                      ▼
       ┌──────────────────────────────────────────┐
       │         Layout.jsx                       │
       │  - Header with sign out                  │
       │  - Bottom navigation                     │
       │  - Renders child routes                  │
       └──────────────┬───────────────────────────┘
                      │
          ┌───────────┴───────────┐
          ▼                       ▼
    ┌─────────┐            ┌─────────────┐
    │  Pages  │            │  Services   │
    │         │◄───────────┤             │
    │ - Home  │            │ firebase.js │
    │ - Ideas │  Real-time │             │
    │ - Books │  Updates   │ - subscribe │
    │ - Shows │            │ - add       │
    │ - Trips │            │ - update    │
    │         │            │ - delete    │
    └─────────┘            └─────────────┘
```

## 🎯 Component Hierarchy

```
App
├── BrowserRouter
├── AuthProvider
└── Routes
    ├── /login → Login
    └── / → Layout (Protected)
        ├── Header
        │   ├── App Title
        │   └── Sign Out Button
        │
        ├── Main Content (Outlet)
        │   ├── / → Home
        │   │   ├── Countdown Card
        │   │   └── Navigation Grid (6 cards)
        │   │
        │   ├── /date-ideas → DateIdeas
        │   │   ├── Filters
        │   │   ├── Add Form (conditional)
        │   │   └── Ideas List (cards)
        │   │
        │   ├── /date-ideas-by-location → DateIdeasByLocation
        │   │   ├── Add Form (conditional)
        │   │   └── Location Groups
        │   │       └── Ideas Cards
        │   │
        │   ├── /books → Books
        │   │   ├── Status Filters
        │   │   ├── Add Form (conditional)
        │   │   └── Books Grid (cards)
        │   │
        │   ├── /shows → Shows
        │   │   ├── Status Filters
        │   │   ├── Add Form (conditional)
        │   │   └── Shows Grid (cards)
        │   │
        │   ├── /future-trips → FutureTrips
        │   │   ├── Priority Filters
        │   │   ├── Add Form (conditional)
        │   │   └── Trips Grid (cards)
        │   │
        │   └── /dream-trips → DreamTrips
        │       ├── Add Form (conditional)
        │       └── Dreams Grid (cards with images)
        │
        └── Bottom Navigation (Mobile)
            ├── Home Icon
            ├── Date Ideas Icon
            ├── By Location Icon
            ├── Books Icon
            └── Shows Icon
```

## 🎨 Style Architecture

```
index.css
├── @tailwind base
│   └── Custom base styles
│       └── Body gradient background
│
├── @tailwind components
│   └── Custom components
│       ├── .card
│       ├── .btn-primary
│       ├── .btn-secondary
│       ├── .input
│       └── .nav-card
│
└── @tailwind utilities
    └── Tailwind utility classes
```

## 🔐 Authentication Flow

```
User Visits App
     │
     ▼
Is Authenticated?
     │
     ├─ No ──► Redirect to /login
     │            │
     │            ▼
     │         Sign Up / Sign In
     │            │
     │            ▼
     │         Firebase Auth
     │            │
     │            ▼
     │         AuthContext Updates
     │            │
     └─ Yes ──────┘
                  │
                  ▼
            Access Protected Routes
                  │
                  ▼
            Real-time Data Sync
```

## 📊 Firestore Schema

```
settings (collection)
└── main (document)
    └── nextMeetDate: "2024-12-25"

dateIdeas (collection)
├── idea1 (document)
│   ├── id: auto
│   ├── title: string
│   ├── description: string
│   ├── category: string
│   ├── location: string
│   ├── addedBy: string
│   ├── completed: boolean
│   └── timestamp: timestamp
├── idea2 (document)
└── ...

books (collection)
├── book1 (document)
│   ├── id: auto
│   ├── title: string
│   ├── author: string
│   ├── status: string
│   └── notes: string
└── ...

shows (collection)
├── show1 (document)
│   ├── id: auto
│   ├── title: string
│   ├── platform: string
│   ├── status: string
│   └── notes: string
└── ...

futureTrips (collection)
├── trip1 (document)
│   ├── id: auto
│   ├── destination: string
│   ├── priority: string
│   ├── estimatedDate: string
│   └── notes: string
└── ...

dreamTrips (collection)
├── dream1 (document)
│   ├── id: auto
│   ├── destination: string
│   ├── why: string
│   └── pictureUrl: string
└── ...
```

## 🎯 User Journey

```
1. First Visit
   └── Land on /login (auto-redirect)
       └── Sign Up with email/password
           └── Auto-login & redirect to Home

2. Home Page
   └── See countdown (or prompt to set date)
       └── Click navigation card
           └── Navigate to feature page

3. Feature Page (e.g., Date Ideas)
   └── View existing items
       ├── Click "Add" → Show form
       │   └── Fill form → Submit → Item added
       ├── Click Edit → Populate form
       │   └── Modify → Submit → Item updated
       ├── Click Delete → Confirm
       │   └── Item removed
       └── Use filters → View filtered results

4. Real-time Updates
   └── Partner adds/edits/deletes item
       └── Your screen updates automatically
           └── No refresh needed!

5. Sign Out
   └── Click sign out in header
       └── Redirect to /login
           └── Protected routes inaccessible
```

---

**This structure ensures**:
✅ Clean separation of concerns
✅ Easy to maintain and extend
✅ Real-time synchronization
✅ Secure authentication
✅ Beautiful user experience
