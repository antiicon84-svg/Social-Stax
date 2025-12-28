# Setting Up .env.local from GitHub Secrets

Your Firebase and Google Cloud API keys are stored securely in GitHub repository secrets. This guide shows you how to extract them and populate your local `.env.local` file.

## Why This Setup?

- **Security**: Sensitive credentials are stored in GitHub Secrets, not in the repository
- **Convenience**: All keys are managed in one place (GitHub Settings)
- **Collaboration**: Team members can access the same configuration

## Step 1: Access Your GitHub Secrets

1. Go to your repository: **Settings → Secrets and variables → Actions**
2. You should see all your Firebase and Google API keys stored there:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_URL`
   - `VITE_GOOGLE_API_KEY`

## Step 2: Create Your Local `.env.local` File

### Option A: Manual Copy (Most Secure)

1. Open the GitHub Secrets page in your browser
2. Click on each secret name to reveal the value (you may need to copy from network requests)
3. Create a `.env.local` file in your project root:

```bash
cd path/to/Social-Stax
touch .env.local
```

4. Add all variables to `.env.local`:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_APP_ID=your_app_id_here
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
VITE_FIREBASE_PROJECT_ID=your_project_id_here
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
VITE_FIREBASE_URL=your_firebase_url_here
VITE_GOOGLE_API_KEY=your_google_api_key_here
```

### Option B: Using GitHub CLI (Faster)

If you have GitHub CLI installed:

```bash
# Install GitHub CLI if you haven't already
# https://cli.github.com

# Authenticate with GitHub
gh auth login

# Extract all secrets and create .env.local
gh secret list --repo antiicon84-svg/Social-Stax | grep VITE > temp_secrets.txt

# Then manually transfer these to .env.local
```

## Step 3: Verify Your Setup

1. Ensure `.env.local` is in your `.gitignore` (it should already be):

```bash
grep ".env.local" .gitignore
# Should return: .env.local
```

2. Start your development server:

```bash
cd path/to/Social-Stax
npm install
npm run dev
```

3. Test your login/signup page:
   - Navigate to `http://localhost:5173`
   - Try signing up with a test email
   - You should **NOT** see `auth/api-key-not-valid` error anymore
   - If you do, double-check your API key is correct

## Step 4: Troubleshooting

### Error: `auth/api-key-not-valid`
- Your API key is incorrect or incomplete
- Make sure you copied the ENTIRE key from GitHub Secrets
- The key should start with `AIza` or similar

### Error: `auth/configuration-not-found`
- One of your Firebase configuration variables is missing
- Verify all 7 Firebase variables are in your `.env.local`
- Check for typos in variable names (they're case-sensitive!)

### Dev server not loading environment variables
- Restart your dev server after creating/updating `.env.local`
- Run: `npm run dev` again

## Step 5: Complete Project Setup

Once your `.env.local` is working, complete the file reorganization:

```bash
# Pull the latest changes with new src/ structure
git pull origin main

# Move files to new structure
mv App.tsx src/
mv index.tsx src/main.tsx
mv AuthContext.tsx src/context/
mv AppKitRouter.tsx src/routes/
mv WebRouter.tsx src/routes/
mv firebase.ts src/config/
mv constants.ts src/config/

# Update import paths (search and replace in your editor)
# Example: import { AuthContext } from "./AuthContext"
# Changes to: import { AuthContext } from "./context/AuthContext"

# Test again
npm run dev
```

## Important Security Notes

- ⚠️ **NEVER** commit `.env.local` to git
- ⚠️ **NEVER** share your API keys in messages or code
- ✅ Always use GitHub Secrets for sensitive data
- ✅ Use `.env.example` for non-sensitive configuration templates

## For GitHub Actions/Deployment

When deploying to production, these secrets are automatically available in GitHub Actions workflows. Your CI/CD pipeline can use them directly.

## Questions?

If you encounter issues:
1. Check that all variable names match exactly (case-sensitive)
2. Verify API keys are complete (no truncation)
3. Restart your dev server after changing `.env.local`
4. Check browser console for detailed Firebase error messages
