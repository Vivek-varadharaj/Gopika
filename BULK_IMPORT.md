# Bulk Import Questions to Firebase

This guide explains how to bulk import questions into Firebase Firestore.

## Method 1: Browser-Based Import (Recommended - Easiest)

### Step 1: Prepare Firebase Config
Make sure `firebase-config.js` is configured with your Firebase credentials.

### Step 2: Open Import Page
1. Start your local server:
   ```bash
   python3 -m http.server 8000
   ```

2. Open the import page in your browser:
   ```
   http://localhost:8000/import-questions.html
   ```

### Step 3: Import Questions
1. Select a date for the questions (all questions will use this date)
2. Click "Import Questions"
3. Wait for the import to complete (you'll see progress messages)
4. Check Firebase Console to verify the questions were imported

**Note:** This method imports all 25 questions with the same date. To import questions for different dates, run the import multiple times with different dates.

---

## Method 2: Manual Import via Firebase Console

### Step 1: Go to Firebase Console
1. Open [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Firestore Database

### Step 2: Add Questions One by One
1. Click "Start collection" (if `questions` doesn't exist)
2. Collection ID: `questions`
3. For each question, add a document with:
   - Document ID: Auto-ID (or custom)
   - Fields:
     - `date` (string): e.g., "2026-01-11"
     - `question` (string): The question text
     - `answer` (string): The answer text
4. Click "Save" and repeat for all questions

**Note:** This method is tedious for bulk imports but gives you full control.

---

## Method 3: Node.js Script (For Advanced Users)

If you prefer using a Node.js script for bulk imports:

### Step 1: Install Firebase Admin SDK
```bash
npm install firebase-admin
```

### Step 2: Get Service Account Key
1. Go to Firebase Console > Project Settings > Service Accounts
2. Click "Generate new private key"
3. Save the JSON file securely (do NOT commit to git)

### Step 3: Create Import Script
Create a file `import-questions.js`:

```javascript
const admin = require('firebase-admin');
const serviceAccount = require('./path-to-service-account-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const questionsData = {
  "q001": {
    "question": "Kerala was formed as a state in which year?",
    "answer": "1956"
  },
  // ... (add all your questions)
};

async function importQuestions(date) {
  const questions = Object.values(questionsData);
  const batch = db.batch();
  
  questions.forEach(q => {
    const docRef = db.collection('questions').doc();
    batch.set(docRef, {
      date: date,
      question: q.question,
      answer: q.answer
    });
  });
  
  await batch.commit();
  console.log(`Imported ${questions.length} questions for date ${date}`);
}

// Usage: node import-questions.js 2026-01-11
const date = process.argv[2] || new Date().toISOString().split('T')[0];
importQuestions(date).then(() => process.exit(0));
```

### Step 4: Run the Script
```bash
node import-questions.js 2026-01-11
```

**Note:** Add `service-account-key.json` and `import-questions.js` to `.gitignore`.

---

## Format Requirements

Each question document in Firestore must have:
- `date` (string): Format "YYYY-MM-DD" (e.g., "2026-01-11")
- `question` (string): The question text
- `answer` (string): The answer text

## Security Rules

Make sure your Firestore security rules allow writes to the `questions` collection. For the browser-based import, you need write access. See `FIREBASE_SETUP.md` for security rules configuration.

---

## Troubleshooting

### "Permission denied" error
- Check Firestore security rules allow writes to `questions` collection
- Make sure rules are published

### "Firebase not configured" error
- Make sure `firebase-config.js` exists and is properly configured
- Check that the file is loaded before the import script

### Questions not appearing
- Check the date format (must be YYYY-MM-DD)
- Verify questions were added to the `questions` collection in Firebase Console
- Check browser console for errors
