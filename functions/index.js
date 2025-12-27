const functions = require('firebase-functions');
const admin = require('firebase-admin');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

admin.initializeApp();
const db = admin.firestore();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || '';

// Database Schema Collections:
// - users: { email, passwordHash, createdAt, role }
// - subscriptions: { userId, plan, status, expiresAt, apiQuota, apiUsed }
// - admins: { email, passwordHash, permissions, createdAt }
// - accessTokens: { token, createdBy, expiresAt, quotaLimit, quotaUsed }

// Sign Up - Regular User
exports.signUp = functions.https.onCall(async (data, context) => {
  try {
    const { email, password } = data;

    if (!email || !password) {
      throw new functions.https.HttpsError('invalid-argument', 'Email and password required');
    }

    // Check if user already exists
    const userSnapshot = await db.collection('users').where('email', '==', email).get();
    if (!userSnapshot.empty) {
      throw new functions.https.HttpsError('already-exists', 'User already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user document
    const userRef = db.collection('users').doc();
    await userRef.set({
      email,
      passwordHash,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      role: 'user',
      status: 'active'
    });

    // Create free tier subscription
    await db.collection('subscriptions').doc(userRef.id).set({
      userId: userRef.id,
      plan: 'free',
      status: 'active',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      expiresAt: null,
      apiQuota: 100, // 100 calls per day
      apiUsed: 0,
      quotaResetAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: userRef.id, email, role: 'user' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return {
      success: true,
      userId: userRef.id,
      token,
      message: 'User created successfully'
    };
  } catch (error) {
    console.error('Sign up error:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// Login - Regular User
exports.login = functions.https.onCall(async (data, context) => {
  try {
    const { email, password } = data;

    if (!email || !password) {
      throw new functions.https.HttpsError('invalid-argument', 'Email and password required');
    }

    // Find user by email
    const userSnapshot = await db.collection('users').where('email', '==', email).get();
    if (userSnapshot.empty) {
      throw new functions.https.HttpsError('not-found', 'User not found');
    }

    const userDoc = userSnapshot.docs[0];
    const userData = userDoc.data();
    const userId = userDoc.id;

    // Check if user is active
    if (userData.status !== 'active') {
      throw new functions.https.HttpsError('permission-denied', 'Account is disabled');
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, userData.passwordHash);
    if (!passwordMatch) {
      throw new functions.https.HttpsError('unauthenticated', 'Invalid password');
    }

    // Check subscription status
    const subscriptionDoc = await db.collection('subscriptions').doc(userId).get();
    const subscription = subscriptionDoc.data();

    if (!subscription || subscription.status !== 'active') {
      throw new functions.https.HttpsError('permission-denied', 'Subscription inactive');
    }

    // Check quota reset
    const now = admin.firestore.Timestamp.now();
    const quotaResetAt = subscription.quotaResetAt.toDate();
    const daysSinceReset = (now.toDate() - quotaResetAt) / (1000 * 60 * 60 * 24);
    
    if (daysSinceReset >= 1) {
      await db.collection('subscriptions').doc(userId).update({
        apiUsed: 0,
        quotaResetAt: now
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId, email, role: userData.role, plan: subscription.plan },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return {
      success: true,
      userId,
      token,
      subscription: {
        plan: subscription.plan,
        quotaRemaining: subscription.apiQuota - subscription.apiUsed,
        quotaLimit: subscription.apiQuota
      },
      message: 'Login successful'
    };
  } catch (error) {
    console.error('Login error:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// Admin Login
exports.adminLogin = functions.https.onCall(async (data, context) => {
  try {
    const { email, password } = data;

    if (!email || !password) {
      throw new functions.https.HttpsError('invalid-argument', 'Email and password required');
    }

    // Find admin by email
    const adminSnapshot = await db.collection('admins').where('email', '==', email).get();
    if (adminSnapshot.empty) {
      throw new functions.https.HttpsError('not-found', 'Admin not found');
    }

    const adminDoc = adminSnapshot.docs[0];
    const adminData = adminDoc.data();
    const adminId = adminDoc.id;

    // Verify password
    const passwordMatch = await bcrypt.compare(password, adminData.passwordHash);
    if (!passwordMatch) {
      throw new functions.https.HttpsError('unauthenticated', 'Invalid password');
    }

    // Generate JWT token with admin role
    const token = jwt.sign(
      { userId: adminId, email, role: 'admin', permissions: adminData.permissions },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return {
      success: true,
      userId: adminId,
      token,
      role: 'admin',
      permissions: adminData.permissions,
      message: 'Admin login successful'
    };
  } catch (error) {
    console.error('Admin login error:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// Verify Token
exports.verifyToken = functions.https.onCall(async (data, context) => {
  try {
    const { token } = data;

    if (!token) {
      throw new functions.https.HttpsError('invalid-argument', 'Token required');
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    return {
      valid: true,
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role
    };
  } catch (error) {
    console.error('Token verification error:', error);
    return {
      valid: false,
      error: error.message
    };
  }
});

// Generate Access Token (For Testing/Limited Usage)
exports.generateAccessToken = functions.https.onCall(async (data, context) => {
  try {
    const { email, quotaLimit = 1000, expiresInDays = 30 } = data;

    // Verify admin or owner calling this
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
    }

    const token = jwt.sign(
      { type: 'access-token', email, quotaLimit },
      JWT_SECRET,
      { expiresIn: `${expiresInDays}d` }
    );

    // Store token metadata
    await db.collection('accessTokens').doc(token).set({
      token,
      email,
      createdBy: context.auth.uid,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      expiresAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)),
      quotaLimit,
      quotaUsed: 0,
      status: 'active'
    });

    return {
      success: true,
      token,
      quotaLimit,
      expiresInDays,
      message: 'Access token generated'
    };
  } catch (error) {
    console.error('Generate token error:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// Update Subscription (Admin)
exports.updateSubscription = functions.https.onCall(async (data, context) => {
  try {
    const { userId, plan, status, quotaLimit } = data;

    // Verify admin
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
    }

    const adminDoc = await db.collection('admins').doc(context.auth.uid).get();
    if (!adminDoc.exists || adminDoc.data().role !== 'admin') {
      throw new functions.https.HttpsError('permission-denied', 'Admin access required');
    }

    // Update subscription
    const updateData = {};
    if (plan) updateData.plan = plan;
    if (status) updateData.status = status;
    if (quotaLimit) updateData.apiQuota = quotaLimit;
    updateData.updatedAt = admin.firestore.FieldValue.serverTimestamp();

    await db.collection('subscriptions').doc(userId).update(updateData);

    return {
      success: true,
      message: 'Subscription updated'
    };
  } catch (error) {
    console.error('Update subscription error:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// Track API Usage
exports.trackApiUsage = functions.https.onCall(async (data, context) => {
  try {
    const { userId, tokenOrEmail } = data;

    if (userId) {
      // Track user API usage
      const subscriptionRef = db.collection('subscriptions').doc(userId);
      const subscriptionDoc = await subscriptionRef.get();
      
      if (subscriptionDoc.exists) {
        const current = subscriptionDoc.data().apiUsed || 0;
        await subscriptionRef.update({
          apiUsed: current + 1,
          lastUsedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }
    } else if (tokenOrEmail) {
      // Track access token usage
      const tokenRef = db.collection('accessTokens').doc(tokenOrEmail);
      const tokenDoc = await tokenRef.get();
      
      if (tokenDoc.exists) {
        const current = tokenDoc.data().quotaUsed || 0;
        await tokenRef.update({
          quotaUsed: current + 1,
          lastUsedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Track usage error:', error);
    return { success: false, error: error.message };
  }
});

// Get User Quota Status
exports.getQuotaStatus = functions.https.onCall(async (data, context) => {
  try {
    const { userId } = data;

    const subscriptionDoc = await db.collection('subscriptions').doc(userId).get();
    if (!subscriptionDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Subscription not found');
    }

    const subscription = subscriptionDoc.data();
    const remaining = subscription.apiQuota - subscription.apiUsed;
    const percentageUsed = (subscription.apiUsed / subscription.apiQuota) * 100;

    return {
      plan: subscription.plan,
      quotaLimit: subscription.apiQuota,
      quotaUsed: subscription.apiUsed,
      quotaRemaining: remaining,
      percentageUsed: percentageUsed.toFixed(2),
      status: subscription.status,
      expiresAt: subscription.expiresAt || null
    };
  } catch (error) {
    console.error('Get quota error:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

module.exports = exports;
