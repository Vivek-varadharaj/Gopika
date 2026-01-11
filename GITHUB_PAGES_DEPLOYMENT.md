# GitHub Pages Deployment Guide for Firebase Authentication

## Problem
Firebase authentication works locally but not on GitHub Pages because `firebase-config.js` is in `.gitignore` and not deployed.

## Solution: Add GitHub Pages Domain to Firebase

### Step 1: Add Your GitHub Pages Domain to Firebase Authorized Domains

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your Firebase project
3. Go to **Authentication** > **Settings** tab
4. Scroll down to **Authorized domains** section
5. Click **Add domain**
6. Add your GitHub Pages domain:
   - If using `username.github.io/repository-name`: Add `username.github.io`
   - If using custom domain: Add your custom domain
   - Example: `vivek-varadharaj.github.io` or `yourusername.github.io`
7. Click **Add**

**Important:** 
- You only need to add the base domain (`username.github.io`), not the full path
- Changes may take a few minutes to propagate
- Both `username.github.io` and `yourusername.github.io/Gopika` will work once the base domain is added

### Step 2: Update API Key Restrictions (if applicable)

If your Firebase API key has referrer restrictions:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project
3. Go to **APIs & Services** > **Credentials**
4. Find your Firebase API key (from `firebase-config.js`)
5. Click on it to edit
6. Under **Application restrictions** > **HTTP referrers (web sites)**:
   - Add: `https://username.github.io/*`
   - Add: `https://username.github.io/Gopika/*`
   - Or remove restrictions for testing (not recommended for production)

### Step 3: Deploy firebase-config.js to GitHub Pages

You have two options:

#### Option A: Include firebase-config.js in Repository (Recommended for GitHub Pages)

Since Firebase API keys are safe to expose in client-side code (they're meant to be public), you can include the config file:

1. Remove `firebase-config.js` from `.gitignore` (temporarily or permanently)
2. Commit and push `firebase-config.js` to your repository
3. The file will be deployed to GitHub Pages

**Note:** Firebase API keys are designed to be public. Security is handled through Firebase Security Rules, not by hiding the API key.

#### Option B: Use Environment Variables (Advanced)

For a more secure approach, you can use GitHub Actions to inject the config during deployment. This requires additional setup.

### Step 4: Verify Deployment

1. Push your changes to GitHub
2. Wait for GitHub Pages to deploy (usually takes 1-2 minutes)
3. Visit your GitHub Pages URL
4. Open browser console (F12)
5. Check for any Firebase initialization errors
6. Try logging in with email/password

### Troubleshooting

#### Still Not Working?

1. **Check Browser Console**:
   - Open DevTools (F12) > Console tab
   - Look for Firebase errors
   - Common error: "Firebase not configured" means `firebase-config.js` is missing

2. **Verify Domain is Added**:
   - Firebase Console > Authentication > Settings > Authorized domains
   - Make sure `username.github.io` is listed
   - It should show "Local" or "Custom" type

3. **Check API Key Restrictions**:
   - Google Cloud Console > APIs & Services > Credentials
   - Verify your API key allows requests from GitHub Pages domain

4. **Test Configuration**:
   - Try accessing your GitHub Pages site in an incognito window
   - Check if `firebase-config.js` loads correctly:
     - Visit: `https://yourusername.github.io/Gopika/firebase-config.js`
     - Should show your Firebase config (not 404)

5. **Verify File is Deployed**:
   - Check your GitHub repository
   - Make sure `firebase-config.js` is present
   - If it's in `.gitignore`, it won't be deployed

### Quick Checklist

- [ ] Added GitHub Pages domain to Firebase Authorized domains
- [ ] `firebase-config.js` is in repository (not in `.gitignore`) or manually uploaded
- [ ] API key restrictions updated (if applicable)
- [ ] Changes pushed to GitHub
- [ ] GitHub Pages deployed successfully
- [ ] Tested login on GitHub Pages URL
- [ ] Checked browser console for errors

### Security Note

Firebase API keys are safe to expose in client-side code because:
- They identify your Firebase project, not authenticate requests
- Security is enforced through Firebase Security Rules
- Authentication requires valid user credentials (email/password)
- Firebase automatically protects against abuse

The only reason to keep them private is to prevent others from using your Firebase project quota, but for personal projects, this is usually not a concern.

