# Quick Start: Run Setup Script

## One-Line Command (Fastest Way)

Open your terminal in the Social-Stax project directory and run:

```bash
bash setup-project.sh
```

That's it! This will automatically:
- ✓ Pull latest changes from GitHub
- ✓ Install all dependencies
- ✓ Create the new src/ folder structure
- ✓ Move all files to their correct locations

## What The Script Does

1. **Pulls Latest Code** - Gets the newest changes from the main branch
2. **Installs Dependencies** - Runs npm install for you
3. **Creates Folders** - Makes src/config, src/context, src/routes
4. **Moves Files**:
   - App.tsx → src/
   - index.tsx → src/main.tsx
   - AuthContext.tsx → src/context/
   - AppKitRouter.tsx → src/routes/
   - WebRouter.tsx → src/routes/
   - firebase.ts → src/config/
   - constants.ts → src/config/

## After Running The Script

### Step 1: Create .env.local

1. Go to GitHub: **Settings → Secrets and variables → Actions**
2. You'll see all your Firebase secrets stored there
3. Create a `.env.local` file in your project root:

```env
VITE_FIREBASE_API_KEY=<copy from GitHub Secrets>
VITE_FIREBASE_APP_ID=<copy from GitHub Secrets>
VITE_FIREBASE_AUTH_DOMAIN=<copy from GitHub Secrets>
VITE_FIREBASE_MESSAGING_SENDER_ID=<copy from GitHub Secrets>
VITE_FIREBASE_PROJECT_ID=<copy from GitHub Secrets>
VITE_FIREBASE_STORAGE_BUCKET=<copy from GitHub Secrets>
VITE_FIREBASE_URL=<copy from GitHub Secrets>
VITE_GOOGLE_API_KEY=<copy from GitHub Secrets>
```

### Step 2: Update Import Paths

Your IDE will likely show import errors. Fix them using Find & Replace (Ctrl+Shift+H):

```
Find:    from "./firebase"
Replace: from "./config/firebase"

Find:    from "./AuthContext"
Replace: from "./context/AuthContext"

Find:    from "./AppKitRouter"
Replace: from "./routes/AppKitRouter"

Find:    from "./WebRouter"
Replace: from "./routes/WebRouter"

Find:    from "./constants"
Replace: from "./config/constants"
```

**Also check for:**
- `from "../firebase"` → `from "../config/firebase"`
- `from "../AuthContext"` → `from "../context/AuthContext"`
- etc.

### Step 3: Test It Works

```bash
npm run dev
```

Then:
1. Navigate to `http://localhost:5173`
2. Click **Sign Up**
3. Try creating an account with a test email
4. **You should NOT see the `auth/api-key-not-valid` error anymore**

## Troubleshooting

### "Permission denied" when running script

Make the script executable:
```bash
chmod +x setup-project.sh
bash setup-project.sh
```

### Script doesn't move files

Make sure you're in the correct directory:
```bash
cd /path/to/Social-Stax
bash setup-project.sh
```

### Still seeing auth/api-key-not-valid error

- Double-check that you copied the ENTIRE API key from GitHub Secrets
- The key should start with `AIza`
- Make sure there are no extra spaces or quotes
- Restart the dev server after creating .env.local

### Can't find GitHub Secrets

1. Go to your repo: https://github.com/antiicon84-svg/Social-Stax
2. Click **Settings** (top right)
3. Click **Secrets and variables** in the sidebar
4. Click **Actions**
5. You should see all your VITE_FIREBASE_* secrets

## Full Documentation

For more detailed information, see:
- **GITHUB_ACTIONS_COMPLETED.md** - Complete step-by-step guide
- **SETUP_ENV_FROM_SECRETS.md** - Detailed environment setup
- **firebase.ts** - Fixed Firebase initialization

## Need Help?

If something goes wrong:
1. Check the error message in the terminal
2. Verify your .env.local has all 8 variables
3. Make sure API keys are complete (no truncation)
4. Restart `npm run dev` after any changes
5. Check the browser console (F12) for Firebase error details

---

**You're just 4 simple steps away from a fully functional app!** 🚀
