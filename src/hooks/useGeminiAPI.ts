import { generateImage, editImageService } from '~/services/aiService';

const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
if (!API_KEY) {
  console.warn('VITE_GOOGLE_API_KEY is not set. AI features will be disabled.');
}

export async function textToImage(prompt: string): Promise<string> {
  try {
    const result = await generateImage(prompt);
    return (result as { imageData?: string }).imageData || '';
  } catch (error) {
    console.error('Text to image error:', error);
    throw error;
  }
}

export async function editImage(imageUrl: string, instructions: string): Promise<string> {
  try {
    const result = await editImageService(imageUrl, instructions);
    return (result as { imageData?: string }).imageData || '';
  } catch (error) {
    console.error('Edit image error:', error);
    throw error;
  }
}
