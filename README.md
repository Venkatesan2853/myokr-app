# MyOKR App

This is a modern OKR (Objectives & Key Results) management system.

## Features
- Firebase Authentication (Email/Password)
- Firestore database integration
- Team and user OKRs with full CRUD
- Dashboard with Recharts analytics

## Setup

1. Clone or download this project
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up Firebase project and replace config in `src/firebase.js`
4. Start the app:
   ```bash
   npm run dev
   ```
5. Deploy to Vercel or Firebase Hosting

## Firestore Rules
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /okrs/{docId} {
      allow read, write: if request.auth != null;
    }
  }
}
```
