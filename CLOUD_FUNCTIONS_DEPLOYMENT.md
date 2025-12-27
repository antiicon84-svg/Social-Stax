# Cloud Functions Deployment Guide

## Overview
This guide covers deploying the Firebase Cloud Functions that power Social Stax authentication, subscription management, and API token generation.

## Prerequisites
- Firebase CLI installed locally
- Firebase project set up
- Admin access to Firebase project
- Node.js 18+ installed

## Project Structure
```
functions/
├── index.js          # Main Cloud Functions implementation
├── package.json      # Dependencies configuration
└── .env             # Environment variables (create locally, never commit)
```

## Environment Variables
Create a `.env` file in the functions directory:

```env
JWT_SECRET=your-super-secret-jwt-key-change-this
ADMIN_PASSWORD_HASH=hashed-admin-password-using-bcrypt
FIREBASE_PROJECT_ID=your-project-id
```

## Database Schema

### Users Collection
```
users/
  userId/
    email: string
    passwordHash: string (bcrypt hashed)
    createdAt: timestamp
    role: string ('user' | 'admin')
    status: string ('active' | 'suspended')
```

### Subscriptions Collection
```
subscriptions/
  userId/
    userId: string
    plan: string ('free' | 'starter' | 'pro' | 'enterprise')
    status: string ('active' | 'expired' | 'cancelled')
    createdAt: timestamp
    expiresAt: timestamp | null
    apiQuota: number (calls per day)
    apiUsed: number
    quotaResetAt: timestamp
    updatedAt: timestamp
```

### Admins Collection
```
admins/
  adminId/
    email: string
    passwordHash: string (bcrypt hashed)
    permissions: array ['manage_users', 'manage_subscriptions', 'generate_tokens']
    createdAt: timestamp
    role: string ('admin')
```

### Access Tokens Collection
```
accessTokens/
  token/
    token: string
    email: string
    createdBy: string (admin userId)
    createdAt: timestamp
    expiresAt: timestamp
    quotaLimit: number
    quotaUsed: number
    status: string ('active' | 'revoked' | 'expired')
    lastUsedAt: timestamp
```

## API Endpoints (Callable Cloud Functions)

### 1. User Registration
```
Function: signUp
Method: Callable
Input: { email, password }
Output: { success, userId, token, message }

Business Logic:
- Validates email/password
- Checks for existing user
- Hashes password with bcrypt
- Creates user in Firestore
- Auto-creates free tier subscription (100 calls/day)
- Returns JWT token (7 days expiry)
```

### 2. User Login
```
Function: login
Method: Callable
Input: { email, password }
Output: { success, userId, token, subscription }

Business Logic:
- Finds user by email
- Verifies password
- Checks account status
- Checks subscription status
- Resets daily quota if needed
- Returns JWT token + subscription info
```

### 3. Admin Login
```
Function: adminLogin
Method: Callable
Input: { email, password }
Output: { success, userId, token, role, permissions }

Business Logic:
- Finds admin user
- Verifies password
- Returns admin token (24 hours expiry)
- Includes permissions in token
```

### 4. Generate Access Token
```
Function: generateAccessToken
Method: Callable (requires authentication)
Input: { email, quotaLimit?, expiresInDays? }
Output: { success, token, quotaLimit, expiresInDays }

Business Logic:
- Verifies caller is authenticated
- Creates limited-use JWT token
- Stores token metadata in Firestore
- Default: 1000 calls, 30 days
```

### 5. Verify Token
```
Function: verifyToken
Method: Callable
Input: { token }
Output: { valid, userId, email, role }

Business Logic:
- Decodes JWT token
- Returns user info if valid
- Handles token expiry gracefully
```

### 6. Track API Usage
```
Function: trackApiUsage
Method: Callable
Input: { userId } OR { tokenOrEmail }
Output: { success }

Business Logic:
- Increments apiUsed counter
- For users: Updates subscription document
- For tokens: Updates access token metadata
- Called automatically after API calls
```

### 7. Get Quota Status
```
Function: getQuotaStatus
Method: Callable
Input: { userId }
Output: { plan, quotaLimit, quotaUsed, quotaRemaining, percentageUsed, status }

Business Logic:
- Retrieves subscription data
- Calculates remaining quota
- Returns percentage used
```

### 8. Update Subscription (Admin)
```
Function: updateSubscription
Method: Callable (requires admin auth)
Input: { userId, plan?, status?, quotaLimit? }
Output: { success, message }

Business Logic:
- Verifies admin authorization
- Updates subscription fields
- Logs update timestamp
```

## Deployment Steps

### 1. Setup Firebase Project
```bash
cd functions
npm install
```

### 2. Initialize Firebase (if not done)
```bash
firebase init functions
```

### 3. Deploy Functions
```bash
firebase deploy --only functions
```

### 4. Set Environment Variables
```bash
firebase functions:config:set jwt.secret="your-secret-key"
firebase functions:config:set admin.password.hash="hashed-password"
```

### 5. Verify Deployment
```bash
firebase functions:list
```

## Frontend Integration

### Example: User Sign Up
```javascript
import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';

const signUp = httpsCallable(functions, 'signUp');
const result = await signUp({
  email: 'user@example.com',
  password: 'secure-password'
});

if (result.data.success) {
  localStorage.setItem('auth_token', result.data.token);
  localStorage.setItem('user_id', result.data.userId);
}
```

### Example: Track API Usage
```javascript
const trackUsage = httpsCallable(functions, 'trackApiUsage');
await trackUsage({ userId: currentUserId });
```

### Example: Get Quota Status
```javascript
const getQuota = httpsCallable(functions, 'getQuotaStatus');
const quotaData = await getQuota({ userId: currentUserId });
console.log(`Quota: ${quotaData.data.quotaUsed}/${quotaData.data.quotaLimit}`);
```

## Subscription Plans

| Plan | API Calls/Day | Price | Features |
|------|---------------|-------|----------|
| Free | 100 | $0 | Limited API access |
| Starter | 1000 | $9/mo | Basic features |
| Pro | 10000 | $29/mo | Advanced features |
| Enterprise | Unlimited | Custom | Full access |

## Security Features

✅ **Password Security**
- Bcrypt hashing with 10 rounds
- Passwords never stored in plaintext
- Hashes validated on every login

✅ **Token Security**
- JWT tokens signed with secret key
- Separate expiry times (7 days users, 24 hours admins)
- Token verification on sensitive operations

✅ **API Rate Limiting**
- Per-user quota tracking
- Daily quota reset
- Access token quota enforcement

✅ **Authorization**
- Role-based access control (user vs admin)
- Permission validation for admin operations
- Subscription status checks

## Monitoring

### View Function Logs
```bash
firebase functions:log
```

### Common Issues

**Issue: "auth/api-key-not-valid"**
- Ensure JWT_SECRET environment variable is set
- Check Cloud Functions have Firestore permissions

**Issue: "User not found"**
- Verify email is correctly stored in Firestore
- Check user collection exists

**Issue: "Subscription inactive"**
- Create subscription record when user signs up
- Check subscription status in Firestore

## Testing

### Local Emulation
```bash
firebase emulators:start
```

### Test Authentication Flow
1. Sign up user with test email
2. Verify subscription created
3. Login with same credentials
4. Check token validity
5. Track API usage
6. Verify quota decreases

## Production Checklist

- [ ] Firebase project created and configured
- [ ] Firestore database initialized
- [ ] Cloud Functions deployed
- [ ] Environment variables set
- [ ] Database rules applied (firestore.rules)
- [ ] Admin user created in Firestore
- [ ] Frontend integration tested
- [ ] Email verification enabled (optional)
- [ ] Password reset flow implemented
- [ ] Monitoring and logging configured
- [ ] Backup strategy planned

## Next Steps

1. **Email Verification**: Add email verification on signup
2. **Password Reset**: Implement password reset flow
3. **2FA**: Add two-factor authentication for admins
4. **Analytics**: Track usage patterns and metrics
5. **Notifications**: Email notifications for quota warnings
