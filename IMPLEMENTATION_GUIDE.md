# Custom Authentication Implementation Guide

## Overview
This guide provides step-by-step instructions to implement a secure custom authentication system using Firebase Cloud Functions, Firestore, and JWT tokens.

## Quick Start - Next Steps

### 1. Update Your Frontend Authentication Service

Replace `services/authService.ts` with:

```typescript
import axios from 'axios';

const API_URL = 'https://us-central1-elegant-fort-482119-t4.cloudfunctions.net';

interface SignupResponse {
  success: boolean;
  message: string;
  token?: string;
  userId?: string;
}

interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  userId?: string;
}

export const customAuthService = {
  // Signup with email and password
  async signup(email: string, password: string): Promise<SignupResponse> {
    try {
      const response = await axios.post(`${API_URL}/createUser`, {
        email,
        password,
      });
      
      // Store token in HttpOnly cookie (backend will set)
      localStorage.setItem('user_id', response.data.userId);
      localStorage.setItem('user_email', email);
      
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Signup failed',
      };
    }
  },

  // Login with email and password
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await axios.post(
        `${API_URL}/loginUser`,
        { email, password },
        { withCredentials: true } // Send cookies
      );
      
      localStorage.setItem('user_id', response.data.userId);
      localStorage.setItem('user_email', email);
      
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed',
      };
    }
  },

  // Logout
  async logout() {
    try {
      await axios.post(`${API_URL}/logout`, {}, { withCredentials: true });
      localStorage.removeItem('user_id');
      localStorage.removeItem('user_email');
      return { success: true };
    } catch (error) {
      return { success: false };
    }
  },

  // Get current user
  getCurrentUser() {
    return {
      userId: localStorage.getItem('user_id'),
      email: localStorage.getItem('user_email'),
    };
  },

  // Check if user is authenticated
  isAuthenticated() {
    return !!localStorage.getItem('user_id');
  },
};
```

### 2. Update Login Component

Replace signup/login form handlers:

```typescript
import { customAuthService } from '../services/authService';

const handleSignup = async (email: string, password: string) => {
  try {
    const result = await customAuthService.signup(email, password);
    
    if (result.success) {
      // Redirect to dashboard
      window.location.href = '/dashboard';
    } else {
      setError(result.message);
    }
  } catch (error) {
    setError('An error occurred during signup');
  }
};

const handleLogin = async (email: string, password: string) => {
  try {
    const result = await customAuthService.login(email, password);
    
    if (result.success) {
      // Redirect to dashboard
      window.location.href = '/dashboard';
    } else {
      setError(result.message);
    }
  } catch (error) {
    setError('An error occurred during login');
  }
};
```

### 3. Update AuthContext.tsx

Replace Firebase Auth calls with custom service:

```typescript
import { customAuthService } from '../services/authService';

const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const user = customAuthService.getCurrentUser();
    if (user.userId) {
      setCurrentUser(user);
    }
    setLoading(false);
  }, []);

  const signup = async (email: string, password: string) => {
    const result = await customAuthService.signup(email, password);
    if (result.success) {
      setCurrentUser({ userId: result.userId, email });
    }
  };

  const login = async (email: string, password: string) => {
    const result = await customAuthService.login(email, password);
    if (result.success) {
      setCurrentUser({ userId: result.userId, email });
    }
  };

  const logout = async () => {
    await customAuthService.logout();
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, loading, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
```

## Cloud Functions Setup

### File Structure Needed
```
functions/
├── src/
│   ├── auth/
│   │   ├── createUser.ts     (Handle signup)
│   │   ├── loginUser.ts      (Handle login)
│   │   └── logoutUser.ts     (Handle logout)
│   ├── utils/
│   │   ├── passwordManager.ts (bcrypt hashing)
│   │   ├── tokenManager.ts    (JWT tokens)
│   │   └── rateLimiter.ts     (Brute force protection)
│   └── index.ts              (Main functions file)
├── .env
├── package.json
└── tsconfig.json
```

## Security Checklist

- ✅ Passwords are hashed with bcrypt (one-way encryption)
- ✅ JWT tokens expire after 24 hours
- ✅ Tokens stored in HttpOnly cookies (cannot be accessed by JavaScript)
- ✅ Rate limiting prevents brute force attacks (5 attempts per 15 min)
- ✅ Firestore rules prevent unauthorized data access
- ✅ HTTPS encryption for all data in transit
- ✅ Passwords NOT readable from frontend
- ✅ Users can only access their own data

## Testing the Implementation

1. Try signing up with a new account
2. Verify the account is created in Firestore (without plain text password)
3. Try logging in with wrong password - should fail
4. Try logging in with correct credentials - should succeed
5. Check browser cookies - should have JWT token
6. Try accessing other users' data from console - should fail

## Next: Deploy Cloud Functions

Once frontend code is updated:
```bash
cd functions
firebase deploy --only functions
```

## Support & Debugging

Check Cloud Function logs:
```bash
firebase functions:log
```

Check Firestore security rule violations:
- Firebase Console > Firestore > Rules > Debug

## Success Indicators

✅ Sign up works without Firebase Auth error
✅ Login works and stores JWT token
✅ Protected pages redirect unauthenticated users
✅ Users can only see their own data
✅ Password hashes are stored (not plain passwords)
