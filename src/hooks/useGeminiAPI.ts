import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
if (!API_KEY) {
  throw new Error('VITE_GOOGLE_API_KEY is not set. Please add it to your .env file.');
}
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
