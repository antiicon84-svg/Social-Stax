# Deployment Checklist

**Use this checklist before deploying to production.**

## ✅ Security Verification

### Credentials & Secrets
- [ ] All exposed credentials have been rotated
  - [ ] Changed admin@aiconic.co.site password
  - [ ] Regenerated Firebase API keys
  - [ ] Reset secret keys
- [ ] No `.env.local` committed to repository
- [ ] GitHub Secrets configured for all environment variables:
  - [ ] VITE_GOOGLE_API_KEY
  - [ ] VITE_FIREBASE_API_KEY
  - [ ] VITE_FIREBASE_AUTH_DOMAIN
  - [ ] VITE_FIREBASE_PROJECT_ID
  - [ ] VITE_FIREBASE_STORAGE_BUCKET
  - [ ] VITE_FIREBASE_MESSAGING_SENDER_ID
  - [ ] VITE_FIREBASE_APP_ID
  - [ ] VITE_FIREBASE_URL
  - [ ] VITE_ADMIN_EMAIL
  - [ ] VITE_ADMIN_PASSWORD
  - [ ] VITE_ADMIN_SECRET_KEY
- [ ] Review SECURITY.md for any missed guidelines
- [ ] Run `npm install` to verify no security vulnerabilities:
  ```bash
  npm audit
  ```

### API Keys & Access Control
- [ ] Google API Key restricted to production domain only
- [ ] Firebase Security Rules configured correctly
- [ ] Firestore database rules reviewed and locked down
- [ ] Cloud Storage rules reviewed

### Code Security
- [ ] No hardcoded credentials in source code
- [ ] No console.log statements with sensitive data
- [ ] No TODO comments about security
- [ ] CORS settings configured for production domain

---

## 🐛 Code Quality

### TypeScript & Linting
- [ ] No TypeScript errors:
  ```bash
  npm run type-check
  ```
- [ ] Code passes linting (if configured):
  ```bash
  npm run lint
  ```
- [ ] No `any` types used unnecessarily
- [ ] All function parameters have types

### Testing
- [ ] Manual testing completed:
  - [ ] Dashboard loads correctly
  - [ ] Can create a new client
  - [ ] Can schedule posts
  - [ ] Can delete posts
  - [ ] All routes work correctly
  - [ ] Responsive design works on mobile
- [ ] Tested in Chrome/Firefox/Safari/Edge
- [ ] Tested on mobile devices (iOS & Android)
- [ ] No console errors in browser DevTools

### Performance
- [ ] Build completes successfully:
  ```bash
  npm run build
  ```
- [ ] Build output size is reasonable
- [ ] No unused dependencies in package.json
- [ ] Images are optimized
- [ ] Bundle size checked

---

## 📮 Documentation

- [ ] README.md is up to date
- [ ] FEATURE_SUMMARY.md reflects all current features
- [ ] API documentation updated if applicable
- [ ] CONTRIBUTING.md guidelines are followed
- [ ] Changelog updated with new features/fixes
- [ ] Environment variables documented in .env.example

---

## 🗣️ Configuration

### Environment
- [ ] `.env.local` contains production credentials
- [ ] No development-only features enabled
- [ ] Debug mode disabled
- [ ] Error reporting configured
- [ ] Analytics/monitoring configured

### Firebase
- [ ] Firebase Hosting configured
- [ ] Firebase domain configured in security rules
- [ ] Firestore backups enabled
- [ ] Cloud Storage lifecycle policies configured
- [ ] Monitoring alerts set up

### Build
- [ ] Vite configuration correct for production
- [ ] Source maps disabled in production
- [ ] Environment variables properly substituted
- [ ] Service worker configured for PWA

---

## 🚀 Deployment

### Pre-Deployment
- [ ] Feature branch merged to main
- [ ] All tests passing in CI/CD
- [ ] Code review completed
- [ ] Release notes prepared
- [ ] Backup of current production created
- [ ] Rollback plan documented

### Deployment Process
- [ ] Deploy to staging first
- [ ] Test all features on staging
- [ ] Get approval from team lead
- [ ] Deploy to production
- [ ] Verify production deployment successful
- [ ] Monitor for errors in first 30 minutes

### Post-Deployment
- [ ] Check Firebase logs for errors
- [ ] Verify database queries are working
- [ ] Test critical user flows
- [ ] Check Google Analytics/monitoring
- [ ] Notify team of successful deployment
- [ ] Document deployment time and changes

---

## 👊 Monitoring & Support

### Monitoring Setup
- [ ] Error tracking configured (e.g., Sentry)
- [ ] Performance monitoring enabled
- [ ] User analytics tracking
- [ ] Alert notifications configured

### Support Readiness
- [ ] Support documentation updated
- [ ] Team trained on new features
- [ ] Support contacts documented
- [ ] Escalation procedures clear

---

## 📅 Sign-Off

- [ ] QA: ______________ Date: ______
- [ ] Dev Lead: ______________ Date: ______
- [ ] Product Owner: ______________ Date: ______

---

## 📌 Notes

```
[Add deployment notes here]



```

---

## 📚 Useful Commands

### Local Development
```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Type check
npm run type-check

# Build for production
npm run build

# Preview production build
npm run preview
```

### Firebase Deployment
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Deploy
firebase deploy

# Deploy only hosting
firebase deploy --only hosting

# View deployment status
firebase open hosting
```

### Environment Variables
```bash
# Copy template
cp .env.example .env.local

# Edit with your values
cat .env.local
```

---

## 📆 Related Documents

- [SECURITY.md](./SECURITY.md) - Security guidelines
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Development standards
- [CODE_REVIEW.md](./CODE_REVIEW.md) - Code review report
- [FEATURE_SUMMARY.md](./FEATURE_SUMMARY.md) - Feature documentation
- [README.md](./README.md) - Project overview

---

**Last Updated:** December 23, 2025
