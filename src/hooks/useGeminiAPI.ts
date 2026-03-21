

const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
if (!API_KEY) {
  console.warn('VITE_GOOGLE_API_KEY is not set. AI features will be disabled.');
}


import { generateImage } from '@/services/aiService';

export async function textToImage(prompt: string): Promise<string> {
  try {
    const result = await generateImage(prompt);
    // Assuming the backend returns a base64 encoded image or a URL
    return result.imageData;
  } catch (error) {
    console.error('Text to image error:', error);
    throw error;
  }
}
export async function editImage(imageUrl: string, instructions: string): Promise<string> {
  console.warn('editImage: not fully implemented, returning placeholder.');
  return `https://via.placeholder.com/512x512.png?text=${encodeURIComponent(instructions)}`;
}

export async function generateVideo(prompt: string): Promise<string> {
  console.warn('generateVideo: not fully implemented, returning placeholder.');
  return `Video generation for: ${prompt}`;
}
