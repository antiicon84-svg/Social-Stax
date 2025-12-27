# Social Stax Authentication System Overview

## Executive Summary

Social Stax now features a complete, enterprise-grade authentication system with:
- **Custom Authentication**: No dependency on third-party auth providers
- **Subscription Management**: Free, Starter, Pro, Enterprise tiers
- **API Token Management**: Limited-use tokens for testing and external integrations
- **Admin Panel**: Full user and subscription management
- **Security**: Bcrypt hashing, JWT tokens, role-based access control

## System Architecture

```
┌─────────────────────────────────────────┐
│       Frontend (React/TypeScript)      │
│  ┌─────────────────────────────────┐  │
│  │   AuthContext (State Management) │  │
│  │   - User authentication         │  │
│  │   - Token persistence           │  │
│  │   - Subscription tracking       │  │
│  └─────────────────────────────────┘  │
└────────────────┬────────────────────────┘
                 │
         HTTP/REST Calls
         (Cloud Functions)
                 │
        ┌────────▼─────────────────┐
        │  Cloud Functions (Node)  │
        │  ┌────────────────────┐  │
        │  │ signUp()           │  │  ✓ Password hashing
        │  │ login()            │  │  ✓ JWT token generation
        │  │ adminLogin()       │  │  ✓ Subscription creation
        │  │ generateToken()    │  │
        │  │ verifyToken()      │  │
        │  │ trackApiUsage()    │  │
        │  │ getQuotaStatus()   │  │
        │  │ updateSubscription()│  │
        │  └────────────────────┘  │
        └────────┬─────────────────┘
                 │
          Firestore API
                 │
        ┌────────▼──────────────────┐
        │   Firestore Database      │
        │  ┌──────────────────────┐ │
        │  │ users/               │ │  Bcrypt-hashed passwords
        │  │ subscriptions/        │ │  Plan, quota, usage data
        │  │ admins/               │ │  Admin permissions
        │  │ accessTokens/         │ │  Limited-use tokens
        │  │ auditLogs/           │ │  Security audit trails
        │  └──────────────────────┘ │
        └──────────────────────────┘
```

## Key Components

### 1. Frontend Services

**File:** `services/customAuthService.ts`

Provides client-side authentication utilities:
- Password hashing (bcrypt)
- Token management (JWT)
- User session persistence
- API usage tracking

### 2. Authentication Context

**File:** `AuthContext.tsx`

Manages global authentication state:
```typescript
interface AuthContextType {
  currentUser: CurrentUser;     // User ID and email
  loading: boolean;              // Loading state
  signUp: (email, password) => Promise<void>;
  login: (email, password) => Promise<void>;
  logout: () => Promise<void>;
}
```

### 3. Cloud Functions Backend

**File:** `functions/index.js`

Core authentication and business logic:

#### User Authentication
- **signUp**: Register new user, auto-create free tier subscription
- **login**: Authenticate user, check subscription status, reset daily quota
- **verifyToken**: Validate JWT tokens

#### Admin Management
- **adminLogin**: Authenticate admin users with permissions
- **updateSubscription**: Admin-only subscription modifications

#### API Management
- **generateAccessToken**: Create limited-use test tokens
- **trackApiUsage**: Increment quotas (automatic on API calls)
- **getQuotaStatus**: Return remaining quota for user/token

### 4. Database Schema

#### Users Collection
```json
{
  "userId": {
    "email": "user@example.com",
    "passwordHash": "$2b$10$...",
    "role": "user",
    "status": "active",
    "createdAt": "2024-01-15T10:00:00Z"
  }
}
```

#### Subscriptions Collection
```json
{
  "userId": {
    "userId": "user-id",
    "plan": "free",           // free|starter|pro|enterprise
    "status": "active",       // active|expired|cancelled
    "apiQuota": 100,          // calls per day
    "apiUsed": 24,            // calls used today
    "quotaResetAt": "2024-01-20T00:00:00Z",
    "expiresAt": null,        // null for perpetual
    "createdAt": "2024-01-15T10:00:00Z"
  }
}
```

#### Admins Collection
```json
{
  "adminId": {
    "email": "admin@socialstax.com",
    "passwordHash": "$2b$10$...",
    "role": "admin",
    "permissions": [
      "manage_users",
      "manage_subscriptions",
      "generate_tokens",
      "view_analytics"
    ],
    "status": "active",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

#### Access Tokens Collection
```json
{
  "token-jwt-string": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "email": "tester@example.com",
    "createdBy": "admin-user-id",
    "quotaLimit": 1000,
    "quotaUsed": 234,
    "status": "active",     // active|revoked|expired
    "createdAt": "2024-01-15T10:00:00Z",
    "expiresAt": "2024-02-14T10:00:00Z",
    "lastUsedAt": "2024-01-20T15:30:00Z"
  }
}
```

## Authentication Flow

### User Registration
```
1. User enters email + password in UI
2. Frontend calls Cloud Function: signUp()
3. Server validates input
4. Server hashes password with bcrypt (10 rounds)
5. Server creates user document in Firestore
6. Server auto-creates free tier subscription (100 calls/day)
7. Server generates JWT token (7 days expiry)
8. Frontend stores token + userId in localStorage
9. Frontend redirects to dashboard
```

### User Login
```
1. User enters email + password
2. Frontend calls Cloud Function: login()
3. Server finds user by email
4. Server compares password with bcrypt hash
5. Server verifies account status (active)
6. Server checks subscription status
7. Server checks if daily quota needs reset (>24 hours since reset)
8. Server generates JWT token
9. Frontend stores token in localStorage
10. User can now make API calls
```

### Admin Login
```
1. Admin enters email + password in admin panel
2. Frontend calls Cloud Function: adminLogin()
3. Server finds admin in admins collection
4. Server verifies password
5. Server generates JWT token (24 hours expiry)
6. Server returns token + permissions
7. Frontend stores token and checks permissions
8. Frontend unlocks admin features
```

### Test Token Generation
```
1. Admin clicks "Generate Test Token" in admin panel
2. Admin specifies email + quota limit + expiry days
3. Frontend calls generateAccessToken()
4. Server verifies admin is authenticated
5. Server creates JWT token with limited claims
6. Server stores token metadata in accessTokens collection
7. Server returns token to admin
8. Admin shares token with external tester
9. Tester uses token to make limited API calls
10. Usage tracked in accessTokens.quotaUsed
```

### API Call with Quota Tracking
```
1. User makes API call with JWT token in Authorization header
2. Server validates JWT token (signature + expiry)
3. Server processes the API request
4. Server calls trackApiUsage() function
5. Server increments subscription.apiUsed counter
6. Server checks if quota exceeded
7. Server returns API response
8. User's remaining quota decreases
```

## Subscription Tiers

| Tier | API Calls/Day | Monthly Cost | Auto-created | Features |
|------|---------------|--------------|--------------|----------|
| Free | 100 | Free | ✓ On signup | Basic API access |
| Starter | 1,000 | $9 | ✗ Manual | Standard features |
| Pro | 10,000 | $29 | ✗ Manual | Advanced features |
| Enterprise | Unlimited | Custom | ✗ Contact sales | Full access |

## Security Features

### Password Security
✅ Bcrypt hashing with 10 rounds
✅ Salted hashes never reused
✅ Passwords never logged or exposed
✅ Constant-time comparison to prevent timing attacks

### Token Security
✅ JWT tokens signed with secret key
✅ Separate expiry times (7 days users, 24 hours admins)
✅ Token verification on every request
✅ Tokens can be manually revoked

### Access Control
✅ Role-based permissions (user vs admin)
✅ Permission validation for admin operations
✅ Subscription status checks before API access
✅ Quota enforcement prevents overages

### Data Protection
✅ Firestore security rules restrict access
✅ Users can only see their own data
✅ Admins can only modify with proper permissions
✅ Audit logs track all changes

## File Structure

```
Social-Stax/
├── functions/
│   ├── index.js              # Cloud Functions implementation
│   └── package.json          # Dependencies
├── services/
│   └── customAuthService.ts  # Frontend auth utilities
├── AuthContext.tsx           # React Context for auth state
├── firestore.rules           # Firestore security rules
├── CLOUD_FUNCTIONS_DEPLOYMENT.md      # Deployment guide
├── ADMIN_AND_SUBSCRIPTIONS_GUIDE.md    # Admin setup guide
└── AUTHENTICATION_SYSTEM_OVERVIEW.md   # This file
```

## Deployment Checklist

- [ ] Firebase project created
- [ ] Firestore database initialized
- [ ] Cloud Functions deployed
- [ ] Environment variables set (JWT_SECRET)
- [ ] First admin user created
- [ ] Firestore security rules applied
- [ ] Frontend AuthContext integrated
- [ ] Login/Signup components updated
- [ ] API endpoints call trackApiUsage()
- [ ] Quota checking implemented in API handlers
- [ ] Admin panel created
- [ ] Email notifications configured (optional)
- [ ] Testing completed

## Integration Examples

### Protect Routes with Auth
```typescript
function ProtectedRoute() {
  const { currentUser, loading } = useAuth();
  
  if (loading) return <Spinner />;
  if (!currentUser.userId) return <Navigate to="/login" />;
  
  return <Dashboard />;
}
```

### Make Authenticated API Call
```typescript
const makeApiCall = async (endpoint: string) => {
  const { currentUser } = useAuth();
  const token = localStorage.getItem('auth_token');
  
  const response = await fetch(endpoint, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  // Automatically track usage
  const trackUsage = httpsCallable(functions, 'trackApiUsage');
  await trackUsage({ userId: currentUser.userId });
  
  return response.json();
};
```

### Check User Quota
```typescript
const QuotaDisplay = () => {
  const { currentUser } = useAuth();
  const [quota, setQuota] = useState(null);
  
  useEffect(() => {
    const getQuota = httpsCallable(functions, 'getQuotaStatus');
    getQuota({ userId: currentUser.userId }).then(result => {
      setQuota(result.data);
    });
  }, [currentUser]);
  
  if (!quota) return null;
  
  return (
    <div>
      <p>Plan: {quota.plan}</p>
      <p>Usage: {quota.quotaUsed}/{quota.quotaLimit}</p>
      <ProgressBar value={quota.percentageUsed} />
    </div>
  );
};
```

## Next Steps

1. **Deploy Cloud Functions**
   ```bash
   cd functions
   npm install
   firebase deploy --only functions
   ```

2. **Create Admin User**
   - Hash password with bcrypt
   - Create admin document in Firestore

3. **Integrate Frontend**
   - Import AuthContext in App.tsx
   - Wrap app with AuthProvider
   - Add authentication to login/signup pages

4. **Update API Handlers**
   - Validate JWT tokens
   - Check quota before processing
   - Call trackApiUsage() after success

5. **Build Admin Panel**
   - User management UI
   - Subscription upgrade forms
   - Token generation interface
   - Analytics dashboard

6. **Testing**
   - Test signup flow
   - Test login with wrong password
   - Test quota enforcement
   - Test admin functions
   - Test token generation

## Support & Documentation

- **Deployment Guide**: See `CLOUD_FUNCTIONS_DEPLOYMENT.md`
- **Admin Setup**: See `ADMIN_AND_SUBSCRIPTIONS_GUIDE.md`
- **Security Rules**: See `firestore.rules`
- **Custom Auth Service**: See `services/customAuthService.ts`
