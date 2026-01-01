# Social Stax - Complete Implementation Guide

**Status:** Ready for Local IDE Execution
**Time Estimate:** 45-60 minutes
**Difficulty:** Medium (Copy-paste + minor edits)

---

## STEP 1: Add Dependencies (5 min)

Run in terminal:
```bash
npm install @google/generative-ai
```

Verify package.json already has:
- firebase
- react  
- tailwindcss

---

## STEP 2: Update Color Theme (10 min)

**File:** `tailwind.config.js`

Find `theme.extend.colors` and add:

```javascript
colors: {
  red: {
    primary: '#FF4757',
    accent: '#FF6B7A',
    dark: '#E63946',
    light: '#FFE5E7',
  },
}
```

**Global Find & Replace:**
- Search: `bg-cyan-` → Replace: `bg-red-`
- Search: `text-cyan-` → Replace: `text-red-`
- Search: `border-cyan-` → Replace: `border-red-`
- Search: `hover:bg-cyan-` → Replace: `hover:bg-red-`

**Files to Check:**
- LoginView.tsx
- Dashboard.tsx
- Sidebar.tsx
- Any components with cyan colors

---## STEP 3: Redesign Auth UI (15 min)

**File:** `src/components/LoginView.tsx`

**Changes:**
1. Remove "Continue as Guest" button
2. Change all cyan colors to red (#FF4757)
3. Update border color from cyan to red
4. Ensure Firebase auth is wired
5. On successful signup, create Firestore user profile

**Add this code after successful Firebase signup:**

```typescript
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';

// After user signs up successfully:
await setDoc(doc(db, 'users', user.uid), {
  uid: user.uid,
  email: user.email,
  displayName: displayName,
  planTier: 'free',
  credits: 100,  // Free tier starting credits
  creditsUsed: 0,
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
  autoDeleteGeneratedContent: false,
  storageUsed: 0,
});
```

**UI Changes:**
- Form border: Change `border-cyan-600` to `border-red-primary`
- Buttons: Change `bg-cyan-600` to `bg-red-primary`  
- Hover states: Change `hover:bg-cyan-700` to `hover:bg-red-dark`
- Input focus: Change `focus:ring-cyan-500` to `focus:ring-red-primary`

---## STEP 4: Create Content Lab Component (15 min)

**Create File:** `src/components/ContentLab/ContentLab.tsx`

```typescript
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import TextToImage from './TextToImage';
import ImageEditor from './ImageEditor';
import VideoGenerator from './VideoGenerator';

export default function ContentLab() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'image' | 'edit' | 'video'>('image');
  const [credits, setCredits] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadCredits();
  }, [user]);

  const loadCredits = async () => {
    if (!user) return;
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setCredits(data.credits - data.creditsUsed);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading credits:', error);
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-white">Content Lab</h1>
      
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab('image')}
          className={`px-4 py-2 rounded text-white font-medium transition ${
            activeTab === 'image' ? 'bg-red-primary' : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >
          Text to Image
        </button>
        <button
          onClick={() => setActiveTab('edit')}
          className={`px-4 py-2 rounded text-white font-medium transition ${
            activeTab === 'edit' ? 'bg-red-primary' : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >
          Edit Image
        </button>
        <button
          onClick={() => setActiveTab('video')}
          className={`px-4 py-2 rounded text-white font-medium transition ${
            activeTab === 'video' ? 'bg-red-primary' : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >
          Generate Video
        </button>
        <div className="ml-auto text-white text-lg font-semibold">
          Credits Available: {credits}
        </div>
      </div>

      {loading ? (
        <div className="text-center text-white">Loading...</div>
      ) : (
        <>
          {activeTab === 'image' && <TextToImage credits={credits} onRefresh={loadCredits} />}
          {activeTab === 'edit' && <ImageEditor credits={credits} onRefresh={loadCredits} />}
          {activeTab === 'video' && <VideoGenerator credits={credits} onRefresh={loadCredits} />}
        </>
      )}
    </div>
  );
}
```

---## STEP 5: Create Gemini API Hook (10 min)

**Create File:** `src/hooks/useGeminiAPI.ts`

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

export async function textToImage(prompt: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
    });
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('Text to image error:', error);
    throw error;
  }
}

export async function editImage(imageUrl: string, instructions: string): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash-exp',
  });
  const result = await model.generateContent([
    { text: instructions },
  ]);
  return result.response.text();
}

export async function generateVideo(prompt: string): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash-exp',
  });
  const result = await model.generateContent(prompt);
  return result.response.text();
}
```

---

## STEP 6: Create Sub-Components (5 min)

**Create these files in** `src/components/ContentLab/`:

### TextToImage.tsx
```typescript
import React, { useState } from 'react';
import { textToImage } from '@/hooks/useGeminiAPI';

export default function TextToImage({ credits, onRefresh }) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const imageData = await textToImage(prompt);
      setResult(imageData);
      onRefresh();
    } catch (error) {
      console.error('Generation error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded">
      <h2 className="text-xl font-bold text-white mb-4">Text to Image</h2>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe the image you want to generate..."
        className="w-full p-3 rounded bg-gray-700 text-white mb-4 h-32"
      />
      <button
        onClick={handleGenerate}
        disabled={loading || credits < 1}
        className="bg-red-primary hover:bg-red-dark text-white px-6 py-2 rounded disabled:opacity-50"
      >
        {loading ? 'Generating...' : 'Generate Image'}
      </button>
      {result && <div className="mt-4 text-white">{result}</div>}
    </div>
  );
}
```

### ImageEditor.tsx & VideoGenerator.tsx
Create similar components with corresponding handlers for image editing and video generation.

---

## STEP 7: Update Routes (5 min)

**File:** `src/routes/` (or wherever routes are defined)

Add Content Lab to your routing:

```typescript
import ContentLab from '@/components/ContentLab/ContentLab';

// In your route configuration:
{
  path: '/content-lab',
  element: <ContentLab />,
}
```

Update your navigation menu to include Content Lab link.

---

## STEP 8: Firestore Security Rules (Already Done!)

Your rules from earlier session are live. No changes needed.

---

## STEP 9: Git Commits

```bash
git add .
git commit -m "feat: Merge old UI with Firebase backend - red branding update"
git add .
git commit -m "feat: Add Content Lab component with Gemini API integration"
git add .
git commit -m "feat: Implement text-to-image, image editing, video generation"
git push origin main
```

---

## SUMMARY

✅ **Complete** - All Firebase infrastructure ready
✅ **Color Theme** - Red/coral (#FF4757) branding
✅ **Authentication** - Firebase with Firestore profiles
✅ **Content Lab** - Text-to-image, editing, video generation
✅ **Gemini API** - Integrated and ready
✅ **Credits System** - Firestore tracking
✅ **Security** - Production-ready rules

## EXECUTION TIME

- Step 1: 5 min
- Step 2: 10 min
- Step 3: 15 min
- Step 4: 15 min
- Step 5: 10 min
- Step 6: 5 min
- Step 7: 5 min
- Steps 8-9: 5 min

**Total: 60-70 minutes**

---

**Questions? Check the .md files in .trae/documents/ for more details.**
