# Firestore Security Rules

Copy and paste these rules into your Firebase Console > Firestore Database > Rules tab, then click "Publish".

## Rules for Questions and Completions

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Questions collection - read for users, write for imports
    match /questions/{document=**} {
      allow read: if true; // Users need to read questions
      allow create: if true; // Allow creating (for bulk imports)
      allow update, delete: if false; // No updates or deletes from client
    }
    
    // Completions collection - allow creating documents
    match /completions/{document=**} {
      allow create: if true; // Users can log completions
      allow read: if false; // Only you can read from Firebase Console
      allow update, delete: if false; // No updates or deletes from client
    }
  }
}
```

## How to Update Rules

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Firestore Database** > **Rules** tab
4. Copy the rules above and paste them
5. Click **Publish** button (top right)
6. Wait for confirmation that rules are published

## Testing

After publishing, try the import again. The error should be resolved.
