# Security Guidelines for Social-Stax

## 🔐 Environment Variables & Credentials

### DO NOT Commit Sensitive Data

⚠️ **NEVER commit the following to the repository:**
- `.env.local` files with real credentials
- API keys or secret keys
- Admin passwords
- Database connection strings
- Private tokens or tokens

### Setup Instructions

1. **Copy the template file:**
   ```bash
   cp .env.example .env.local
   ```

2. **Fill in your credentials:**
   - Get Google API Key from [https://ai.google.dev/](https://ai.google.dev/)
   - Get Firebase credentials from [https://console.firebase.google.com](https://console.firebase.google.com)
   - Add your actual values to `.env.local`

3. **Verify .env.local is in .gitignore:**
   ```bash
   cat .gitignore | grep "*.local"
   ```

## 🚀 Production Deployment

### GitHub Secrets Setup

For production deployments using GitHub Actions:

1. Go to **Repository Settings → Secrets and variables → Actions**

2. Add the following secrets:
   ```
   VITE_GOOGLE_API_KEY
   VITE_FIREBASE_API_KEY
   VITE_FIREBASE_AUTH_DOMAIN
   VITE_FIREBASE_PROJECT_ID
   VITE_FIREBASE_STORAGE_BUCKET
   VITE_FIREBASE_MESSAGING_SENDER_ID
   VITE_FIREBASE_APP_ID
   VITE_FIREBASE_URL
   VITE_ADMIN_EMAIL
   VITE_ADMIN_PASSWORD
   VITE_ADMIN_SECRET_KEY
   ```

3. Reference in GitHub Actions workflow:
   ```yaml
   env:
     VITE_GOOGLE_API_KEY: ${{ secrets.VITE_GOOGLE_API_KEY }}
     VITE_FIREBASE_API_KEY: ${{ secrets.VITE_FIREBASE_API_KEY }}
     # ... etc for all secrets
   ```

## 🔑 Credential Rotation

### When to Rotate Credentials

- ✓ Immediately if accidentally committed to repository
- ✓ After any security incident
- ✓ Every 90 days (best practice)
- ✓ When team members leave
- ✓ After security audit

### How to Rotate

1. **Firebase:**
   - Go to Firebase Console → Project Settings
   - Create new Web App credentials
   - Update `.env.local` with new keys

2. **Google API Keys:**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create new API key
   - Restrict key to appropriate domains and APIs
   - Update `.env.local`

3. **Admin Credentials:**
   - Change password in Firebase Auth
   - Update `VITE_ADMIN_EMAIL` and `VITE_ADMIN_PASSWORD`
   - Notify team members of new credentials

## 🛡️ Code Security Best Practices

### API Key Protection

✅ DO:
- Use environment variables for all secrets
- Use `VITE_` prefix for client-side variables (visible to browser)
- Restrict API key usage to specific domains
- Keep API keys with minimal required permissions

❌ DON'T:
- Hardcode API keys in source code
- Commit `.env.local` to version control
- Share API keys via Slack, email, or chat
- Use the same key for development and production

### Firebase Security Rules

Review your Firestore security rules:

```firebase
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Only authenticated users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    
    // Clients are public read, but protected write
    match /clients/{clientId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == resource.data.ownerUid;
    }
  }
}
```

## 📝 Audit Trail

Keep track of credential changes:

| Date | Secret | Action | Reason | By |
|------|--------|--------|--------|----|
| YYYY-MM-DD | Example | Rotated | Routine rotation | @username |
| | | | | |

## 🚨 If Credentials Are Compromised

1. **Immediately revoke compromised credentials**
   - Disable in Firebase Console
   - Regenerate API keys
   - Reset passwords

2. **Update deployment**
   - Update GitHub Secrets with new credentials
   - Redeploy application
   - Monitor for suspicious activity

3. **Communicate with team**
   - Notify all team members
   - Update documentation
   - Document what happened and why

4. **Review and improve**
   - Check if changes need better protection
   - Add monitoring/alerts
   - Conduct security review

## 🔍 Pre-Commit Checks

Add a pre-commit hook to prevent accidental commits:

```bash
#!/bin/bash
# .git/hooks/pre-commit

# Check for environment files
if git diff --cached --name-only | grep -E '\.env\.local|\.env\.\*';
then
    echo "❌ Error: Do not commit .env files!"
    exit 1
fi

# Check for exposed API keys (pattern matching)
if git diff --cached | grep -E 'VITE_.*=.*[A-Za-z0-9]{32,}';
then
    echo "❌ Error: Possible API key exposure detected!"
    exit 1
fi

exit 0
```

To install:
```bash
chmod +x .git/hooks/pre-commit
```

## 📚 Resources

- [Firebase Security Best Practices](https://firebase.google.com/docs/projects/security)
- [Google Cloud Security Best Practices](https://cloud.google.com/docs/authentication/production)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)

## Questions?

If you have security concerns or questions, please reach out to the team lead or open a confidential security issue.

---

**Last Updated:** December 23, 2025
