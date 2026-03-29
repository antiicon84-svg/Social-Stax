import { httpsCallable } from 'firebase/functions';
import { getFirebaseFunctions } from '@/config/firebase';

const callGemini = async (operation: string, payload: Record<string, unknown>) => {
  const functions = getFirebaseFunctions();
  const geminiAI = httpsCallable(functions, 'geminiAI');
  const result = await geminiAI({ operation, payload });
  return result.data as unknown;
};

export const generateImage = async (prompt: string) => {
  return callGemini('generateImage', { prompt });
};

export const enhancePromptWithAI = async (prompt: string, type: 'video' | 'image' | 'both') => {
  return callGemini('enhancePrompt', { prompt, type });
};

export const analyzePromptCoherence = async (prompt: string, type: 'video' | 'image' | 'both') => {
  return callGemini('analyzeCoherence', { prompt, type });
};

export const analyzeWebsite = async (url: string) => {
  return callGemini('analyzeWebsite', { url });
};

export const generateContent = async (topic: string, platform?: string) => {
  const data = await callGemini('generateContent', { topic, platform });
  return (data as { text?: string }).text as string;
};

export const editImageService = async (imageUrl: string, instructions: string) => {
  return callGemini('editImage', { imageUrl, instructions });
};

export const formatSocialMediaContent = async (
  content: string,
  platform: 'Instagram' | 'LinkedIn' | 'Twitter' | 'Facebook',
  brandKit?: Record<string, unknown>
): Promise<string> => {
  const data = await callGemini('formatContent', { content, platform, brandKit });
  return (data as { text?: string }).text as string;
};

export const generateVideo = async (prompt: string, aspectRatio: string = '16:9'): Promise<{ videoData: string }> => {
  const fns = getFirebaseFunctions();
  const fn = httpsCallable(fns, 'generateVideoAI', { timeout: 550000 }); // 550s — exceeds CF max so client never times out first
  const result = await fn({ prompt, aspectRatio });
  return result.data as { videoData: string };
};
