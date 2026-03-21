/**
 * Admin Setup Script for Social StaX
 *
 * Run this ONCE to create your admin account in Firebase Auth + Firestore.
 *
 * Usage:
 *   node functions/setupAdmin.js
 *
 * Make sure you have GOOGLE_APPLICATION_CREDENTIALS set or are running in a
 * Firebase environment with Application Default Credentials.
 */

const admin = require('firebase-admin');

// Initialize with your project
const serviceAccount = require('./serviceAccountKey.json'); // Download from Firebase Console
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'social-stax-7ce24'
});

const db = admin.firestore();
const auth = admin.auth();

const ADMIN_EMAIL = 'antiicon84@gmail.com';
const ADMIN_PASSWORD = 'AdminStaX2024!'; // Change this!
const ADMIN_DISPLAY_NAME = 'Social StaX Admin';

async function setupAdmin() {
  console.log('Setting up admin account...');

  try {
    // Create or get Firebase Auth user
    let userRecord;
    try {
      userRecord = await auth.getUserByEmail(ADMIN_EMAIL);
      console.log('Admin user already exists in Firebase Auth:', userRecord.uid);
    } catch {
      userRecord = await auth.createUser({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        displayName: ADMIN_DISPLAY_NAME,
        emailVerified: true,
      });
      console.log('Created Firebase Auth admin user:', userRecord.uid);
    }

    const uid = userRecord.uid;

    // Set custom claims for admin
    await auth.setCustomUserClaims(uid, { admin: true, role: 'admin' });
    console.log('Set admin custom claims');

    // Create Firestore user document with admin role
    const trialExpiresAt = new Date();
    trialExpiresAt.setFullYear(trialExpiresAt.getFullYear() + 10); // 10 year "trial"

    await db.collection('users').doc(uid).set({
      uid,
      email: ADMIN_EMAIL,
      displayName: ADMIN_DISPLAY_NAME,
      role: 'admin',
      planTier: 'enterprise',
      credits: 999999,
      creditsUsed: 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      autoDeleteGeneratedContent: false,
      storageUsed: 0,
      subscription: {
        status: 'active',
        plan: 'enterprise',
        expiresAt: admin.firestore.Timestamp.fromDate(trialExpiresAt),
        autoRenew: true,
      },
      usage: {
        contentGenerations: 0,
        imageGenerations: 0,
        voiceAssistantMinutes: 0,
        apiCalls: 0,
        lastReset: admin.firestore.FieldValue.serverTimestamp(),
      },
    }, { merge: true });

    console.log('Created Firestore admin document');

    // Also create in the custom admins collection (for cloud function adminLogin)
    await db.collection('admins').doc(uid).set({
      uid,
      email: ADMIN_EMAIL,
      displayName: ADMIN_DISPLAY_NAME,
      role: 'admin',
      permissions: [
        'manage_users',
        'manage_subscriptions',
        'generate_tokens',
        'view_analytics',
        'manage_admins'
      ],
      status: 'active',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    console.log('Created admins collection document');
    console.log('\n✅ Admin setup complete!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:    ', ADMIN_EMAIL);
    console.log('🔑 Password: ', ADMIN_PASSWORD);
    console.log('🆔 UID:      ', uid);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('⚠️  CHANGE THE PASSWORD after first login!');
    console.log('\nTo login: Go to the app → Sign In tab → use the email and password above.');
    console.log('For admin panel access: navigate to /admin after signing in.\n');

  } catch (error) {
    console.error('❌ Admin setup failed:', error.message);
    process.exit(1);
  }

  process.exit(0);
}

setupAdmin();
