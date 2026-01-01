import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
if (!API_KEY) {
  throw new Error('VITE_GOOGLE_API_KEY is not set. Please add it to your .env file.');
}
const genAI = new GoogleGenerativeAI(API_KEY);

export async function textToImage(prompt: string): Promise<string> {
  try {
    // This is a placeholder as direct image generation is not supported in the client-side SDK
    // In a real application, this would be a call to a backend that uses Vertex AI or a similar service.
    console.warn('Image generation is not supported in this environment. Returning a placeholder.');
    return `https://via.placeholder.com/512x512.png?text=${encodeURIComponent(prompt)}`;
  } catch (error) {
    console.error('Text to image error:', error);
    throw error;
  }
}
/*
export async function editImage(image: File, instructions: string): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-pro-vision',
  });
  const imagePart = await fileToGenerativePart(image);
  const result = await model.generateContent([instructions, imagePart]);
  return result.response.text();
}

export async function generateVideo(prompt: string): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-pro-vision',
  });
  const result = await model.generateContent(prompt);
  return result.response.text();
}
*/
