# Custom Authentication System Setup Guide

## Overview
This document explains how to implement a secure custom authentication system for Social Stax using Firebase Cloud Functions, Firestore, and JWT tokens.

## Security Architecture

### 1. Password Hashing (bcrypt)
- Passwords are hashed using bcrypt algorithm
- One-way encryption - cannot be reversed
- Each password gets unique salt
- Stored in Firestore: ONLY the hash, never plain text

### 2. JWT Tokens
- After successful login, user receives JWT token
- Token contains: {userId, email, expirationTime, signature}
- Token expires after 24 hours (configurable)
- Stored in HttpOnly cookie (cannot be accessed by JavaScript)
- Sent with each request for authentication

### 3. HTTPS Encryption
- All data in transit is encrypted (SSL/TLS)
- Firebase Hosting provides automatic HTTPS

### 4. Firestore Security Rules
- Users can only access their own data
- Password hashes are NOT readable by users
- Backend Cloud Function only entity that can read/write passwords

### 5. Rate Limiting
- Maximum 5 login attempts per 15 minutes per IP
- Prevents brute force attacks

## Files to Create

1. `functions/src/auth/createUser.ts` - User registration function
2. `functions/src/auth/loginUser.ts` - User login function
3. `functions/src/utils/tokenManager.ts` - JWT token generation/validation
4. `functions/src/utils/passwordManager.ts` - Password hashing/verification
5. `services/authService.ts` (Frontend) - API calls to auth functions
6. `firestore.rules` - Database security rules
7. `functions/package.json` - Dependencies (bcrypt, jsonwebtoken)

## Setup Steps

### Step 1: Initialize Cloud Functions
```bash
cd functions
npm install
npm install bcrypt jsonwebtoken firebase-admin
```

### Step 2: Create Environment Variables
Add to `functions/.env`:
```
JWT_SECRET=your-super-secret-key-change-this-in-production
TOKEN_EXPIRY=24h
```

### Step 3: Update Firestore Rules
Apply the security rules in `firestore.rules`

### Step 4: Deploy Cloud Functions
```bash
firebase deploy --only functions
```

### Step 5: Update Frontend
- Replace Firebase Auth calls with custom auth service
- Update login/signup components to use new API
- Store JWT token in HttpOnly cookie

## Next Steps
Each file will be created with full implementation details
