# Firebase Data Structure

## Collections

### 1. `questions` Collection

Stores daily questions and answers.

**Document Structure:**
```javascript
{
  date: "2026-01-11",        // String, format: YYYY-MM-DD
  question: "Question text?", // String
  answer: "Answer text"       // String
}
```

**Example Documents:**
```
questions/
  ├── doc1
  │   ├── date: "2026-01-11"
  │   ├── question: "First Governor of Kerala?"
  │   └── answer: "Burgula Ramakrishna Rao"
  ├── doc2
  │   ├── date: "2026-01-11"
  │   ├── question: "Longest river in Kerala?"
  │   └── answer: "Periyar"
  ├── doc3
  │   ├── date: "2026-01-12"
  │   ├── question: "Capital of Kerala?"
  │   └── answer: "Thiruvananthapuram"
  └── ...
```

**Security Rules:**
- Read: Allowed (users need to read questions)
- Write: Denied (only you can write from Firebase Console)

**Query Pattern:**
- App queries: `WHERE date == today's date`
- All questions with today's date are shown to the user

---

### 2. `completions` Collection

Stores completion logs for analytics.

**Document Structure:**
```javascript
{
  date: "2026-01-11",                          // String, format: YYYY-MM-DD
  completedAt: Timestamp,                      // Server timestamp
  status: "completed",                         // String
  timestamp: "2026-01-11T10:30:00.000Z"       // ISO string (backup)
}
```

**Example Documents:**
```
completions/
  ├── auto-generated-id-1
  │   ├── date: "2026-01-11"
  │   ├── completedAt: January 11, 2026 at 10:30:00 AM UTC+5:30
  │   ├── status: "completed"
  │   └── timestamp: "2026-01-11T10:30:00.000Z"
  ├── auto-generated-id-2
  │   ├── date: "2026-01-12"
  │   ├── completedAt: January 12, 2026 at 9:15:00 AM UTC+5:30
  │   ├── status: "completed"
  │   └── timestamp: "2026-01-12T09:15:00.000Z"
  └── ...
```

**Security Rules:**
- Create: Allowed (users can log completions)
- Read: Denied (only you can read from Firebase Console)
- Update/Delete: Denied

---

## Adding Questions

### Method 1: Firebase Console (Manual)

1. Go to Firestore Database
2. Click "Start collection" (if `questions` doesn't exist)
3. Collection ID: `questions`
4. Click "Auto-ID" or add document ID
5. Add fields:
   - `date` (string): "2026-01-11"
   - `question` (string): "Your question?"
   - `answer` (string): "The answer"
6. Click "Save"
7. Repeat for each question

### Method 2: Import JSON (Bulk)

1. Prepare JSON file:
```json
[
  {
    "date": "2026-01-11",
    "question": "Question 1?",
    "answer": "Answer 1"
  },
  {
    "date": "2026-01-11",
    "question": "Question 2?",
    "answer": "Answer 2"
  },
  {
    "date": "2026-01-12",
    "question": "Question 3?",
    "answer": "Answer 3"
  }
]
```

2. Use Firebase Console import feature or a script

### Method 3: Firebase Admin SDK (Programmatic)

```javascript
const admin = require('firebase-admin');
admin.initializeApp();

const questions = [
  { date: "2026-01-11", question: "Q1?", answer: "A1" },
  { date: "2026-01-11", question: "Q2?", answer: "A2" }
];

questions.forEach(async (q) => {
  await admin.firestore().collection('questions').add(q);
});
```

---

## Scaling Tips

1. **Indexes**: Create composite indexes if querying by date + other fields
2. **Batch Writes**: Use batch writes when adding multiple questions
3. **Pagination**: If you have many questions per day, implement pagination
4. **Caching**: Consider caching questions client-side for better performance
5. **Date Format**: Always use YYYY-MM-DD format for easy querying and sorting

---

## Query Examples

### Get Today's Questions (App does this automatically)
```javascript
const today = "2026-01-11";
const snapshot = await db.collection('questions')
  .where('date', '==', today)
  .get();
```

### Get All Completions (Admin/Console)
```javascript
const snapshot = await db.collection('completions')
  .orderBy('completedAt', 'desc')
  .get();
```

### Get Completions for a Date Range
```javascript
const startDate = "2026-01-01";
const endDate = "2026-01-31";
const snapshot = await db.collection('completions')
  .where('date', '>=', startDate)
  .where('date', '<=', endDate)
  .get();
```