// Custom Authentication Service for Social Stax
// Provides secure email/password authentication with JWT tokens

const API_URL = 'https://us-central1-elegant-fort-482119-t4.cloudfunctions.net';

export interface SignupResponse {
  success: boolean;
  message: string;
  token?: string;
  userId?: string;
  email?: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  userId?: string;
  email?: string;
}

export interface CurrentUser {
  userId: string | null;
  email: string | null;
}

export const customAuthService = {
  /**
   * Sign up a new user with email and password
   * @param email User email address
   * @param password User password (will be hashed on backend)
   */
  async signup(email: string, password: string): Promise<SignupResponse> {
    try {
      const response = await fetch(`${API_URL}/createUser`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include', // Include cookies
      });

      const data = await response.json();

      if (data.success) {
        // Store user info locally
        localStorage.setItem('user_id', data.userId);
        localStorage.setItem('user_email', email);
      }

      return data;
    } catch (error: any) {
      console.error('Signup error:', error);
      return {
        success: false,
        message: error.message || 'Signup failed. Please try again.',
      };
    }
  },

  /**
   * Login user with email and password
   * @param email User email address
   * @param password User password
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await fetch(`${API_URL}/loginUser`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include', // Include cookies for JWT token
      });

      const data = await response.json();

      if (data.success) {
        // Store user info locally
        localStorage.setItem('user_id', data.userId);
        localStorage.setItem('user_email', email);
      }

      return data;
    } catch (error: any) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.message || 'Login failed. Please try again.',
      };
    }
  },

  /**
   * Logout the current user
   */
  async logout(): Promise<{ success: boolean }> {
    try {
      await fetch(`${API_URL}/logoutUser`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      // Clear local storage
      localStorage.removeItem('user_id');
      localStorage.removeItem('user_email');
      localStorage.removeItem('auth_token');

      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      // Clear local storage anyway
      localStorage.removeItem('user_id');
      localStorage.removeItem('user_email');
      localStorage.removeItem('auth_token');
      return { success: false };
    }
  },

  /**
   * Get the currently logged-in user
   */
  getCurrentUser(): CurrentUser {
    return {
      userId: localStorage.getItem('user_id'),
      email: localStorage.getItem('user_email'),
    };
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('user_id');
  },

  /**
   * Verify token is still valid (optional - for extra security)
   */
  async verifyToken(): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/verifyToken`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const data = await response.json();
      return data.valid === true;
    } catch (error) {
      console.error('Token verification error:', error);
      return false;
    }
  },
};

export default customAuthService;
