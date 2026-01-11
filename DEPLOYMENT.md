# Deployment Guide

## Firebase Setup (Required)

This app uses Firebase Firestore for both questions and completion logging.

See `FIREBASE_SETUP.md` for detailed step-by-step instructions.

**Quick setup:**
1. Create a Firebase project at https://console.firebase.google.com/
2. Enable Firestore Database
3. Get your Firebase config from Project Settings
4. Update `FIREBASE_CONFIG` in `script.js` with your config
5. Set up Firestore security rules (see FIREBASE_SETUP.md)
6. Add questions to the `questions` collection in Firestore
7. Format: `{ date: "YYYY-MM-DD", question: "...", answer: "..." }`

**Note:** All data (questions and completions) is stored in Firebase. The app requires Firebase to be configured and set up.

## Local Testing

1. Open terminal in the project directory
2. Run: `python3 -m http.server 8000`
3. Open browser: `http://localhost:8000`

## Production Deployment

You can host this on:
- GitHub Pages
- Netlify
- Vercel
- Any static hosting service

Just upload the HTML, CSS, and JS files. No backend required.