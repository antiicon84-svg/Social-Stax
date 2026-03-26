const functions = require('firebase-functions');
const admin = require('firebase-admin');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

admin.initializeApp();
const db = admin.firestore();

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('FATAL: JWT_SECRET environment variable is not set. Authentication will fail.');
}


// Database Schema Collections:
// - users: { email, passwordHash, createdAt, role }
// - subscriptions: { userId, plan, status, expiresAt, apiQuota, apiUsed }
// - admins: { email, passwordHash, permissions, createdAt }
// - accessTokens: { token, createdBy, expiresAt, quotaLimit, quotaUsed }

// Sign Up - Regular User
exports.signUp = functions.https.onCall(async (data) => {
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
exports.login = functions.https.onCall(async (data) => {
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
exports.adminLogin = functions.https.onCall(async (data) => {
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
exports.verifyToken = functions.https.onCall(async (data) => {
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
exports.trackApiUsage = functions.https.onCall(async (data) => {
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
exports.getQuotaStatus = functions.https.onCall(async (data) => {
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

// ============================================================
// Gemini AI - Secure Backend Proxy (keeps API key off client)
// ============================================================
exports.geminiAI = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
  }

  const { operation, payload } = data;
  if (!operation || !payload) {
    throw new functions.https.HttpsError('invalid-argument', 'operation and payload required');
  }

  const { GoogleGenAI } = require('@google/genai');
  const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

  try {
    let result;

    if (operation === 'generateImage') {
      const { prompt } = payload;
      const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: { numberOfImages: 1, aspectRatio: '1:1' }
      });
      const imageBytes = response.generatedImages?.[0]?.image?.imageBytes;
      if (!imageBytes) {
        throw new functions.https.HttpsError('internal', 'No image generated');
      }
      return { imageData: `data:image/png;base64,${imageBytes}` };
    }

    if (operation === 'generateContent') {
      const { topic, platform } = payload;
      const prompt = `Generate high-quality social media content for the topic: "${topic}"${platform ? ` specifically for ${platform}` : ''}. Provide a headline, body text, and a visual brief for an image generator.`;
      result = await ai.models.generateContent({
        model: 'gemini-3.1-pro',
        contents: [{ role: 'user', parts: [{ text: prompt }] }]
      });
      return { text: result.text };
    }

    if (operation === 'enhancePrompt') {
      const { prompt, type } = payload;
      const systemPrompt = `You are a professional prompt engineer for ${type} generation AI. Enhance the user's prompt to be more detailed, cinematic, and effective. Output only the enhanced prompt and technical parameters in JSON format: { "enhancedPrompt": "...", "technicalParams": "..." }`;
      result = await ai.models.generateContent({
        model: 'gemini-3.1-pro',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: { systemInstruction: systemPrompt }
      });
      const text = result.text;
      const jsonMatch = text.match(/\{.*\}/s);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : { enhancedPrompt: text, technicalParams: '' };
    }

    if (operation === 'analyzeWebsite') {
      const { url } = payload;

      // Fetch the actual website content so Gemini can analyze real data
      let siteContent = '';
      try {
        const https = require('https');
        const http = require('http');
        const client = url.startsWith('https') ? https : http;

        siteContent = await new Promise((resolve, reject) => {
          const req = client.get(url, { timeout: 8000, headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
            // Follow one redirect
            if ((res.statusCode === 301 || res.statusCode === 302) && res.headers.location) {
              const redirectUrl = res.headers.location;
              const redirectClient = redirectUrl.startsWith('https') ? https : http;
              redirectClient.get(redirectUrl, { timeout: 8000, headers: { 'User-Agent': 'Mozilla/5.0' } }, (res2) => {
                let data = '';
                res2.on('data', chunk => { if (data.length < 50000) data += chunk; });
                res2.on('end', () => resolve(data));
                res2.on('error', reject);
              }).on('error', reject);
            } else {
              let data = '';
              res.on('data', chunk => { if (data.length < 50000) data += chunk; });
              res.on('end', () => resolve(data));
              res.on('error', reject);
            }
          });
          req.on('error', reject);
          req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
        });

        // Strip scripts/styles/tags, keep readable text
        siteContent = siteContent
          .replace(/<script[\s\S]*?<\/script>/gi, '')
          .replace(/<style[\s\S]*?<\/style>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
          .slice(0, 6000);
      } catch (fetchErr) {
        console.warn('Could not fetch website, falling back to URL inference:', fetchErr.message);
      }

      const context = siteContent
        ? `Website URL: ${url}\n\nWebsite content:\n${siteContent}`
        : `Website URL: ${url}`;

      const systemPrompt = `You are a brand analyst. Analyze the following website information and extract brand details.\n\n${context}\n\nOutput ONLY valid JSON (no markdown, no explanation): { "name": "Brand Name", "industry": "Industry", "tone": "Professional|Friendly|Luxury|Bold|Playful|Educational|Minimalist", "description": "Short 1-2 sentence brand description", "color": "#hexcode" }`;
      result = await ai.models.generateContent({
        model: 'gemini-3.1-pro',
        contents: [{ role: 'user', parts: [{ text: systemPrompt }] }]
      });
      const text = result.text.trim();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    }

    if (operation === 'formatContent') {
      const { content, platform, brandKit } = payload;
      const configs = {
        Instagram: { maxLength: 2200, hashtagCount: 15, emojiEmphasis: true, tone: 'Creative, visually-focused, trendy' },
        LinkedIn:  { maxLength: 3000, hashtagCount: 5,  emojiEmphasis: false, tone: 'Professional, thought leadership' },
        Twitter:   { maxLength: 280,  hashtagCount: 3,  emojiEmphasis: true,  tone: 'Concise, engaging, trendy' },
        Facebook:  { maxLength: 63206, hashtagCount: 8, emojiEmphasis: true,  tone: 'Conversational, community-focused' },
      };
      const config = configs[platform] || configs.Instagram;
      const tone = brandKit?.tone || config.tone;
      const systemPrompt = `Format this content for ${platform}. Max ${config.maxLength} characters. Add ${config.hashtagCount} relevant hashtags. ${config.emojiEmphasis ? 'Use strategic emojis.' : 'Minimal emojis.'} Tone: ${tone}. Include CTA if relevant. Return ONLY formatted post.`;
      result = await ai.models.generateContent({
        model: 'gemini-3.1-pro',
        contents: [{ role: 'user', parts: [{ text: `Content: ${content}` }] }],
        config: { systemInstruction: systemPrompt }
      });
      return { text: result.text.trim() };
    }

    if (operation === 'analyzeCoherence') {
      const { prompt, type } = payload;
      const systemPrompt = `Analyze the following ${type} generation prompt for coherence and potential conflicts. Provide a score from 1-10 and brief advice. Output in JSON: { "score": 8, "advice": "..." }`;
      result = await ai.models.generateContent({
        model: 'gemini-3.1-pro',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: { systemInstruction: systemPrompt }
      });
      const text = result.text;
      const jsonMatch = text.match(/\{.*\}/s);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : { score: 5, advice: 'Unable to analyze.' };
    }

    if (operation === 'editImage') {
      const { imageUrl, instructions } = payload;
      const https = require('https');
      const http = require('http');
      const client = imageUrl.startsWith('https') ? https : http;
      const imageBuffer = await new Promise((resolve, reject) => {
        const req = client.get(imageUrl, { timeout: 10000 }, (res) => {
          const chunks = [];
          res.on('data', chunk => chunks.push(chunk));
          res.on('end', () => resolve(Buffer.concat(chunks)));
          res.on('error', reject);
        });
        req.on('error', reject);
        req.on('timeout', () => { req.destroy(); reject(new Error('Image fetch timeout')); });
      });
      const base64Image = imageBuffer.toString('base64');
      const editResponse = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: instructions,
        config: {
          numberOfImages: 1,
          aspectRatio: '1:1',
          referenceImages: [{ referenceType: 'REFERENCE_TYPE_RAW', referenceImage: { imageBytes: base64Image } }]
        }
      });
      const editedBytes = editResponse.generatedImages?.[0]?.image?.imageBytes;
      if (!editedBytes) throw new functions.https.HttpsError('internal', 'No edited image returned');
      return { imageData: `data:image/png;base64,${editedBytes}` };
    }

    throw new functions.https.HttpsError('invalid-argument', `Unknown operation: ${operation}`);
  } catch (error) {
    console.error('geminiAI error:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// Gemini Live Chat - Text-based conversational assistant with navigation support
exports.geminiLiveChat = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  try {
    const { message, history = [], systemContext = '' } = data;

    if (!message) {
      throw new functions.https.HttpsError('invalid-argument', 'Message is required');
    }

    const { GoogleGenAI } = require('@google/genai');
    const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

    // Build conversation with context — skip leading non-user messages
    const contents = [];

    if (history && history.length > 0) {
      let userMessageFound = false;
      for (const msg of history) {
        if (!userMessageFound && msg.role !== 'user') continue;
        userMessageFound = true;
        contents.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }]
        });
      }
    }

    // Add current user message
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const systemPrompt = systemContext || 'You are Stax, a helpful AI assistant for a social media marketing platform called Social StaX.';

    const result = await ai.models.generateContent({
      model: 'gemini-3.1-pro',
      contents,
      config: { systemInstruction: systemPrompt }
    });

    const responseText = result.text;

    return {
      success: true,
      text: responseText,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Gemini Live Chat error:', error);
    throw new functions.https.HttpsError('internal', 'Chat error: ' + error.message);
  }
});

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
    const { GoogleGenAI } = require('@google/genai');
    const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

    // Prepare the audio part
    const audioPart = {
      inlineData: {
        data: audioContent, // Base64 encoded audio
        mimeType: mimeType
      }
    };

    // Send to Gemini with audio
    const result = await ai.models.generateContent({
      model: 'gemini-3.1-pro',
      contents: [{ role: 'user', parts: [{ text: 'You are a helpful voice assistant. Listen to the user\'s voice input and provide a natural, concise response. Respond in a conversational manner.' }, audioPart] }]
    });

    const responseText = result.text;

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

// Manual Usage Reset - Admin only
exports.manualusagereset = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
  }

  const adminDoc = await db.collection('users').doc(context.auth.uid).get();
  if (!adminDoc.exists || adminDoc.data().role !== 'admin') {
    throw new functions.https.HttpsError('permission-denied', 'Admin access required');
  }

  try {
    const usersSnapshot = await db.collection('users').get();
    const batches = [];
    let batch = db.batch();
    let opCount = 0;

    for (const userDoc of usersSnapshot.docs) {
      batch.update(userDoc.ref, {
        'usage.contentGenerations': 0,
        'usage.imageGenerations': 0,
        'usage.voiceAssistantMinutes': 0,
        'usage.apiCalls': 0,
        'usage.lastReset': admin.firestore.FieldValue.serverTimestamp(),
      });
      opCount++;
      if (opCount === 499) {
        batches.push(batch.commit());
        batch = db.batch();
        opCount = 0;
      }
    }
    if (opCount > 0) batches.push(batch.commit());
    await Promise.all(batches);

    return { status: 'success', message: `Reset usage for ${usersSnapshot.size} users` };
  } catch (error) {
    console.error('manualusagereset error:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});


// One-time Admin Bootstrap - DELETE after first admin is created
exports.bootstrapAdmin = functions.https.onRequest(async (req, res) => {
  const secret = req.headers['x-setup-secret'] || req.query.secret;
  if (!secret || secret !== process.env.ADMIN_SETUP_SECRET) {
    res.status(403).json({ error: 'Forbidden - provide x-setup-secret header' });
    return;
  }
  const { email, password, displayName = 'Admin' } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'email and password required in request body' });
    return;
  }
  try {
    let userRecord;
    try { userRecord = await admin.auth().getUserByEmail(email); }
    catch { userRecord = await admin.auth().createUser({ email, password, displayName, emailVerified: true }); }
    await admin.auth().setCustomUserClaims(userRecord.uid, { admin: true, role: 'admin' });
    const trialExp = new Date(); trialExp.setFullYear(trialExp.getFullYear() + 10);
    await db.collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid, email, displayName, role: 'admin', planTier: 'enterprise',
      credits: 999999, creditsUsed: 0, createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(), autoDeleteGeneratedContent: false,
      storageUsed: 0,
      subscription: { status: 'active', plan: 'enterprise', expiresAt: admin.firestore.Timestamp.fromDate(trialExp), autoRenew: true },
      usage: { contentGenerations: 0, imageGenerations: 0, voiceAssistantMinutes: 0, apiCalls: 0, lastReset: admin.firestore.FieldValue.serverTimestamp() },
    }, { merge: true });
    await db.collection('admins').doc(userRecord.uid).set({
      uid: userRecord.uid, email, displayName, role: 'admin',
      permissions: ['manage_users', 'manage_subscriptions', 'generate_tokens', 'view_analytics', 'manage_admins'],
      status: 'active', createdAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
    res.json({ success: true, uid: userRecord.uid, email, message: 'Admin created. Sign in at the app with these credentials.' });
  } catch (err) {
    console.error('bootstrapAdmin error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = exports;

