#!/bin/bash
# Social-Stax Auto Setup Script Steps 1-3
set -e
echo '===================================='
echo 'Social-Stax Auto-Setup (Steps 1-3)'
echo '===================================='
echo ''

echo '[STEP 1] Pulling latest changes...'
git pull origin main
echo '✓ Latest changes pulled'
echo ''

echo '[STEP 2] Installing dependencies...'
npm install
echo '✓ Dependencies installed'
echo ''

echo '[STEP 3] Creating src structure...'
mkdir -p src/{config,context,routes}
echo '✓ Folders created'
echo ''

echo 'Moving files...'
[ -f App.tsx ] && mv App.tsx src/ && echo '  ✓ App.tsx'
[ -f index.tsx ] && mv index.tsx src/main.tsx && echo '  ✓ index.tsx → main.tsx'
[ -f AuthContext.tsx ] && mv AuthContext.tsx src/context/ && echo '  ✓ AuthContext.tsx'
[ -f AppKitRouter.tsx ] && mv AppKitRouter.tsx src/routes/ && echo '  ✓ AppKitRouter.tsx'
[ -f WebRouter.tsx ] && mv WebRouter.tsx src/routes/ && echo '  ✓ WebRouter.tsx'
[ -f firebase.ts ] && mv firebase.ts src/config/ && echo '  ✓ firebase.ts'
[ -f constants.ts ] && mv constants.ts src/config/ && echo '  ✓ constants.ts'

echo ''
echo '===================================='
echo '✓ STEPS 1-3 COMPLETE!'
echo '===================================='
echo ''
echo 'NEXT: Create .env.local (Step 4)'
echo '1. Go to GitHub Settings → Secrets → Actions'
echo '2. Copy all VITE_FIREBASE_* values'
echo '3. Create .env.local in project root'
echo ''
echo 'Then: Update imports and run npm run dev'
echo ''
echo 'See GITHUB_ACTIONS_COMPLETED.md for full guide'
