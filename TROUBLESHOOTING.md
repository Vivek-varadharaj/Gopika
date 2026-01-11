# Troubleshooting Completion Logging

## Issue: Completion logs not appearing in Google Sheet

### Step 1: Check if Apps Script URL is configured

Open `script.js` and check the `APPS_SCRIPT_URL` constant at the top:

```javascript
const APPS_SCRIPT_URL = 'YOUR_APPS_SCRIPT_WEB_APP_URL';
```

If it still says `YOUR_APPS_SCRIPT_WEB_APP_URL`, you need to:
1. Deploy the Apps Script (see DEPLOYMENT.md)
2. Copy the Web App URL
3. Paste it in script.js

### Step 2: Check browser console

1. Open your browser's Developer Tools (F12 or Cmd+Option+I)
2. Go to the Console tab
3. Complete a day's ritual
4. Look for messages like:
   - "Apps Script URL not configured" - means URL needs to be set
   - "Completion logged successfully" - means logging worked
   - "Logging failed" - means there's an error

### Step 3: Verify Apps Script deployment

1. Go to https://script.google.com
2. Open your project
3. Click "Deploy" > "Manage deployments"
4. Make sure:
   - Status is "Active"
   - Type is "Web app"
   - "Who has access" is set to "Anyone"
5. Copy the Web App URL (it should look like: `https://script.google.com/macros/s/...`)

### Step 4: Create the Responses sheet

In your Google Sheet:
1. Create a new sheet named exactly: **Responses** (case-sensitive)
2. Add headers in row 1:
   - Column A: `Date`
   - Column B: `Completed At`
   - Column C: `Status`
3. Format row 1 as bold (optional, for readability)

The Apps Script will create this sheet automatically if it doesn't exist, but creating it manually ensures it's set up correctly.

### Step 5: Test the Apps Script directly

1. In Apps Script editor, click "Run" (play button) to test `doPost`
2. Or use curl/Postman to test:
```bash
curl -X POST 'YOUR_APPS_SCRIPT_URL' \
  -H 'Content-Type: application/json' \
  -d '{
    "date": "2026-01-11",
    "completedAt": "2026-01-11T10:00:00.000Z",
    "status": "completed"
  }'
```

### Step 6: Check CORS issues

If you see CORS errors in the console:
- The Apps Script must be deployed as "Web app" with "Anyone" access
- Make sure you're using the deployed URL, not the editor URL

### Common Issues:

1. **"Apps Script URL not configured"**
   - Solution: Update APPS_SCRIPT_URL in script.js

2. **"Logging failed" errors**
   - Check if Apps Script is deployed correctly
   - Verify the URL is correct
   - Check browser console for specific error messages

3. **Sheet exists but no data**
   - Check Apps Script execution logs (View > Execution log)
   - Verify the sheet name is exactly "Responses"
   - Check if there are any errors in Apps Script

4. **CORS errors**
   - Make sure Apps Script is deployed (not just saved)
   - Verify "Who has access" is set to "Anyone"

### Note:
Logging failures are **non-blocking** - the app will work fine even if logging fails. This is intentional so users can complete their ritual even if there are network issues or Apps Script problems.