# A Rose After Five Questions 🌹

A gentle daily quiz experience where users earn a virtual rose by correctly answering 5 Kerala PSC-style multiple-choice questions each day.

## Features

- ✨ Daily quiz with 5 randomly selected questions
- 📊 Questions fetched dynamically from Google Sheets
- 🔒 Daily lock to prevent multiple attempts
- 🌹 Beautiful rose animation reward
- 📱 Fully responsive design
- 💾 Local storage for completion tracking

## Setup Instructions

### 1. Create a Google Sheet

1. Go to [Google Sheets](https://sheets.google.com) and create a new spreadsheet
2. Name your sheet (e.g., "Quiz Questions")
3. Set up the following columns in the first row (header):
   - `date` (Format: YYYY-MM-DD, e.g., 2025-01-15)
   - `question`
   - `optionA`
   - `optionB`
   - `optionC`
   - `optionD`
   - `correctOption` (Values: A, B, C, or D)

### 2. Make the Sheet Public

1. Click on **Share** button (top right)
2. Click on **Change to anyone with the link**
3. Select **Viewer** permission
4. Click **Done**

### 3. Get Your Sheet URL

1. Copy the URL from your browser's address bar
2. The URL should look like:
   ```
   https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit#gid=0
   ```

### 4. Configure the Application

1. Open `script.js` in a text editor
2. Find this line near the top:
   ```javascript
   const GOOGLE_SHEET_URL = 'YOUR_GOOGLE_SHEET_URL_HERE';
   ```
3. Replace `YOUR_GOOGLE_SHEET_URL_HERE` with your Google Sheet URL:
   ```javascript
   const GOOGLE_SHEET_URL = 'https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit';
   ```

### 5. Add Questions to Your Sheet

Add questions in this format (starting from row 2, row 1 is the header):

| date       | question                      | optionA | optionB | optionC | optionD | correctOption |
|------------|-------------------------------|---------|---------|---------|---------|---------------|
| 2025-01-15 | What is the capital of Kerala?| Kochi   | Trivandrum | Calicut | Kollam | B            |
| 2025-01-15 | Which river flows through Kerala? | Ganga | Periyar | Yamuna | Narmada | B |

**Important Notes:**
- Date must be in YYYY-MM-DD format
- correctOption must be exactly A, B, C, or D (case-insensitive)
- Each row represents one question
- Add questions for each day you want the quiz to be available

### 6. Deploy

You can deploy this to any static hosting service:
- GitHub Pages
- Netlify
- Vercel
- Any web server

Simply upload all files (index.html, styles.css, script.js) to your hosting service.

## How It Works

1. **Daily Reset**: The app automatically resets each day at midnight (based on the user's local time)
2. **Question Selection**: On page load, the app fetches questions for today's date and randomly selects 5 questions
3. **Progress Tracking**: Users must answer all 5 questions correctly to earn the rose
4. **Daily Lock**: Once completed, the quiz is locked for the rest of the day using browser localStorage
5. **Tomorrow**: The lock automatically expires the next day, allowing a new attempt

## Technical Details

- **Frontend Only**: No backend server required
- **Google Sheets API**: Uses Google Sheets JSON export format
- **LocalStorage**: Stores completion date for daily lock
- **No Authentication**: Simple, privacy-friendly approach

## Customization

You can customize:
- Colors in `styles.css` (CSS variables at the top)
- Fonts in `index.html` (Google Fonts link)
- Question count (currently 5) in `script.js`
- Google Sheet URL in `script.js`

## Browser Compatibility

Works on all modern browsers that support:
- ES6+ JavaScript
- Fetch API
- LocalStorage
- CSS Grid and Flexbox

## License

Free to use and modify for personal or commercial projects.

---

**Note**: Make sure your Google Sheet is set to "Anyone with the link can view" for the application to work properly.
