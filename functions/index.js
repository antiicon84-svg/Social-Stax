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

    // Generate Firebase Custom Token
    const token = await admin.auth().createCustomToken(userRef.id, { role: 'user' });

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

    // Generate Firebase Custom Token
    const token = await admin.auth().createCustomToken(userId, { role: userData.role, plan: subscription.plan });

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

// Gemini 2.0 Audio - Voice Assistant (Secure Backend)
exports.geminiVoiceAssistant = functions.https.onCall(async (data, context) => {
  // Verify user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  try {
    const { audioContent, mimeType = 'audio/webm' } = data;

    if (!audioContent) {
      throw new functions.https.HttpsError('invalid-argument', 'Audio content is required');
    }

    // Import Gemini SDK
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

    // Use Gemini 2.0 Flash model with audio capabilities
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    // Prepare the audio part
    const audioPart = {
      inlineData: {
        data: audioContent, // Base64 encoded audio
        mimeType: mimeType
      }
    };

    // Send to Gemini with audio
    const result = await model.generateContent([
      {
        text: 'You are a helpful voice assistant. Listen to the user\'s voice input and provide a natural, concise response. Respond in a conversational manner.'
      },
      audioPart
    ]);

    const responseText = result.response.text();

    // Convert response to speech using Google Cloud Text-to-Speech
    const textToSpeech = require('@google-cloud/text-to-speech');
    const ttsClient = new textToSpeech.TextToSpeechClient();

    const synthesizeRequest = {
      input: { text: responseText },
      voice: {
        languageCode: 'en-US',
        name: 'en-US-Neural2-C', // Natural-sounding voice
        ssmlGender: 'FEMALE'
      },
      audioConfig: {
        audioEncoding: 'MP3',
        pitch: 0,
        speakingRate: 1
      }
    };

    const [response] = await ttsClient.synthesizeSpeech(synthesizeRequest);
    const audioBuffer = response.audioContent;

    return {
      success: true,
      text: responseText,
      audio: audioBuffer.toString('base64'),
      mimeType: 'audio/mpeg',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Gemini Voice Assistant error:', error);
    throw new functions.https.HttpsError('internal', 'Voice assistant error: ' + error.message);
  }
});

<<<<<<< HEAD
// Analyze Website (Scrape + Gemini)
exports.analyzeWebsite = functions.https.onCall(async (data, context) => {
  // Verify user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  try {
    let { url } = data;
    if (!url) {
      throw new functions.https.HttpsError('invalid-argument', 'URL is required');
    }

    // Normalize URL
    if (!/^https?:\/\//i.test(url)) {
      url = `https://${url}`;
    }

    // 1. Fetch website content
    const axios = require('axios');
    const cheerio = require('cheerio');
    const { GoogleGenerativeAI } = require('@google/generative-ai');

    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 10000
    });

    const html = response.data;
    const $ = cheerio.load(html);

    // 2. Extract key information
    const title = $('title').text().trim();
    const metaDescription = $('meta[name="description"]').attr('content') || $('meta[property="og:description"]').attr('content') || '';

    // Extract main text content (limit length to avoid token limits)
    $('script, style, nav, footer, iframe').remove();
    let bodyText = $('body').text().replace(/\s+/g, ' ').trim().substring(0, 15000);

    // 3. Extract Images (Logo, Profile Pic candidates)
    const images = [];
    const pushImage = (src, type) => {
      if (src && !src.startsWith('data:') && (src.startsWith('http') || src.startsWith('//'))) {
        if (src.startsWith('//')) src = 'https:' + src;
        images.push({ src, type });
      } else if (src && src.startsWith('/')) {
        try {
          // Construct absolute URL
          const urlObj = new URL(url);
          const absoluteUrl = `${urlObj.protocol}//${urlObj.host}${src}`;
          images.push({ src: absoluteUrl, type });
        } catch (e) { }
      }
    };

    // OpenGraph Image (High priority)
    pushImage($('meta[property="og:image"]').attr('content'), 'og:image');
    pushImage($('meta[name="twitter:image"]').attr('content'), 'twitter:image');

    // Favicons / Icons
    pushImage($('link[rel="icon"]').attr('href'), 'icon');
    pushImage($('link[rel="shortcut icon"]').attr('href'), 'icon');
    pushImage($('link[rel="apple-touch-icon"]').attr('href'), 'icon');

    // Img tags with 'logo' or 'profile' in class/id/src
    $('img').each((i, el) => {
      const src = $(el).attr('src');
      const className = $(el).attr('class') || '';
      const id = $(el).attr('id') || '';
      const alt = $(el).attr('alt') || '';

      if (src) {
        const score = (className + id + src + alt).toLowerCase();
        let type = 'image';
        if (score.includes('logo')) type = 'possible_logo';
        if (score.includes('profile') || score.includes('avatar') || score.includes('user')) type = 'possible_profile';

        if (type !== 'image' || i < 5) { // Limit generic images
          pushImage(src, type);
        }
      }
    });

    // 4. Send to Gemini for inference
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const systemPrompt = `
      You are a brand expert. Analyze the provided website text and list of image URLs.
      Extract the following information in JSON format:
      1. name: Brand/Person name.
      2. industry: The industry or niche.
      3. tone: The brand tone of voice (e.g., Professional, Playful).
      4. description: A short bio/summary.
      5. mission: The brand's mission statement or core value proposition.
      6. colors: Array of up to 3 hex color codes (primary, secondary, accent). Infer if not explicit.
      7. logoUrl: The best URL for the brand LOGO. Prefer 'og:image' if it looks like a logo, otherwise identify a logo from the list.
      8. profilePicUrl: The best URL for a PERSON'S profile picture (if this is an influencer/personal site).
      9. instagram: Instagram handle/URL if found.
      10. facebook: Facebook URL.
      11. twitter: Twitter/X URL.
      12. linkedin: LinkedIn URL.
      13. whatsapp: WhatsApp number/link.
      14. phoneNumber: Phone number.
      15. email: Contact email.
      16. contactInfo: General contact details (address, etc).
      17. targetMarket: Suggested target market/audience for this brand.
      18. keywords: Array of 5-10 SEO keywords/tags.

      Input Data:
      Page Title: ${title}
      Meta Description: ${metaDescription}
      
      Image Candidates: ${JSON.stringify(images.slice(0, 15))}
      
      Page Text:
      ${bodyText}
    `;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: systemPrompt }] }]
    });

    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/); // Flexible JSON match

    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    } else {
      throw new Error('Failed to parse AI response');
    }

  } catch (error) {
    console.error('Analyze website error:', error);
    throw new functions.https.HttpsError('internal', 'Analysis failed: ' + error.message);
=======
// Email Verification Handler - Custom Backend Handler
exports.verifyEmail = functions.https.onCall(async (data, context) => {
  const { oobCode, mode } = data;

  if (!oobCode) {
    throw new functions.https.HttpsError('invalid-argument', 'oobCode is required');
  }

  try {
    // Step 1: Verify the action code with Firebase Admin SDK
    const resetEmail = await admin.auth().verifyIdToken(oobCode).catch(async () => {
      // If it's not a token, try to verify it as an action code
      return await admin.auth().verifyActionCodeAsync(oobCode);
    });

    // Step 2: Apply the action code (completes the verification)
    await admin.auth().applyActionCode(oobCode);

    console.log('Email verification successful for action code:', oobCode);

    return {
      success: true,
      message: 'Email verified successfully',
    };
  } catch (error) {
    console.error('Email verification error:', error);

    // Return specific error messages
    if (error.code === 'auth/invalid-action-code') {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Invalid or expired verification code. Please request a new verification email.'
      );
    }
    if (error.code === 'auth/expired-action-code') {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'This verification code has expired. Please request a new verification email.'
      );
    }

    throw new functions.https.HttpsError(
      'internal',
      'An error occurred during email verification. Please try again.'
    );
  }
});

// Alternative: REST API endpoint for email verification (for email links)
exports.verifyEmailAction = functions.https.onRequest(async (req, res) => {
  const { oobCode, mode, continueUrl } = req.query;

  // Set CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  if (!oobCode || mode !== 'verifyEmail') {
    return res.status(400).json({
      error: 'Invalid request',
      message: 'oobCode and mode parameters are required',
    });
  }

  try {
    // Verify the action code
    await admin.auth().applyActionCode(oobCode);

    console.log('Email verification successful via REST API');

    // Redirect to success page
    const redirectUrl = continueUrl || 'https://elegant-fort-482119-t4.firebaseapp.com/verified';
    return res.redirect(302, redirectUrl);
  } catch (error) {
    console.error('Email verification error via REST:', error);

    const errorMessages = {
      'auth/invalid-action-code': 'Invalid or expired verification code. Please request a new verification email.',
      'auth/expired-action-code': 'This verification code has expired. Please request a new verification email.',
    };

    const message = errorMessages[error.code] || 'An error occurred during email verification';
    const redirectUrl = `https://elegant-fort-482119-t4.firebaseapp.com/verify-error?message=${encodeURIComponent(message)}`;
    return res.redirect(302, redirectUrl);
>>>>>>> 69f700431ddbf9e4b2d9a853f5e1ccf0c437290f
  }
});

module.exports = exports;
