# Implementation Steps 1-5: Quick Start Guide

## STEP 1: Deploy Cloud Functions to Firebase

### Prerequisites:
- Firebase CLI installed: `npm install -g firebase-tools`
- Node.js 18+ installed
- Logged into Firebase CLI: `firebase login`

### Deployment Process:

```bash
# Clone repo locally
git clone https://github.com/antiicon84-svg/Social-Stax.git
cd Social-Stax

# Install dependencies
cd functions
npm install

# Deploy Cloud Functions
firebase deploy --only functions --project elegant-fort-482119-t4

# Verify deployment
firebase functions:list --project elegant-fort-482119-t4
```

### Environment Setup:
Create `.env` in functions directory:
```
JWT_SECRET=your-super-secret-jwt-key-change-in-production
ADMIN_PASSWORD_HASH=placeholder
FIREBASE_PROJECT_ID=elegant-fort-482119-t4
```

---

## STEP 2: Create First Admin User in Firestore

### Generate Admin Password Hash:

```javascript
const bcrypt = require('bcrypt');

async function hashPassword() {
  const password = 'your-secure-admin-password-here';
  const hash = await bcrypt.hash(password, 10);
  console.log('Password hash:', hash);
}

hashPassword();
```

### Create Admin in Firebase Console:

1. Go to: https://console.firebase.google.com/project/elegant-fort-482119-t4/firestore
2. Create new collection: `admins`
3. Add document with these fields:

```json
{
  "email": "your-admin-email@example.com",
  "passwordHash": "$2b$10$[paste-hash-from-above]",
  "role": "admin",
  "permissions": [
    "manage_users",
    "manage_subscriptions",
    "generate_tokens",
    "view_analytics"
  ],
  "status": "active",
  "createdAt": [auto-timestamp]
}
```

---

## STEP 3: Integrate AuthContext into App.tsx

```typescript
// App.tsx
import { AuthProvider } from './AuthContext';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginView from './views/LoginView';
import DashboardView from './views/DashboardView';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginView />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardView />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
```

### Create ProtectedRoute.tsx:

```typescript
import { useAuth } from '../AuthContext';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { currentUser, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!currentUser.userId) return <Navigate to="/login" replace />;

  return <>{children}</>;
}
```

---

## STEP 4: Update Login/Signup Components

### LoginView.tsx:

```typescript
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function LoginView() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto' }}>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
    </div>
  );
}
```

### SignupView.tsx:

```typescript
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function SignupView() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signUp(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto' }}>
      <h2>Sign Up</h2>
      <form onSubmit={handleSignup}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password (min 8 chars)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={8}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Signing up...' : 'Sign Up'}
        </button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
    </div>
  );
}
```

---

## STEP 5: Update API Handlers with Quota Tracking

### Create utils/apiClient.ts:

```typescript
import { httpsCallable, getFunctions } from 'firebase/functions';
import { app } from '../firebase';

const functions = getFunctions(app);

export async function callApiWithTracking(
  endpoint: string,
  userId: string,
  data?: any
) {
  try {
    // Make API call
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      },
      body: JSON.stringify(data)
    });

    // Track usage automatically
    const trackUsage = httpsCallable(functions, 'trackApiUsage');
    await trackUsage({ userId });

    return response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
}

export async function getQuotaStatus(userId: string) {
  const getQuota = httpsCallable(functions, 'getQuotaStatus');
  const result = await getQuota({ userId });
  return result.data;
}
```

### Use in Components:

```typescript
import { useAuth } from '../AuthContext';
import { callApiWithTracking, getQuotaStatus } from '../utils/apiClient';

export default function ApiComponent() {
  const { currentUser } = useAuth();

  const handleApiCall = async () => {
    const quota = await getQuotaStatus(currentUser.userId!);

    if (quota.quotaRemaining <= 0) {
      alert('Quota exceeded. Please upgrade your subscription.');
      return;
    }

    const result = await callApiWithTracking(
      'https://your-api-endpoint.com/process',
      currentUser.userId!,
      { data: 'example' }
    );

    console.log('Success! Quota remaining:', quota.quotaRemaining - 1);
  };

  return <button onClick={handleApiCall}>Call API</button>;
}
```

---

## Verification Checklist:

- [ ] Cloud Functions deployed successfully
- [ ] Admin user created in Firestore
- [ ] AuthContext wraps entire app
- [ ] Login/Signup components working
- [ ] API calls track usage and check quotas
- [ ] Protected routes redirect unauthenticated users
- [ ] localStorage stores auth tokens
- [ ] Logout clears localStorage

## Next Steps After Implementation:

1. Test signup flow with test email
2. Verify free tier subscription created automatically
3. Test login with correct/incorrect credentials
4. Test admin login with bcrypt-hashed password
5. Test quota tracking on API calls
6. Build admin dashboard UI
7. Add email notifications
8. Deploy to production
