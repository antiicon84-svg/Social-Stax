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

export const formatSocialMediaContent = async (
  content: string,
  platform: 'Instagram' | 'LinkedIn' | 'Twitter' | 'Facebook',
  brandKit?: Record<string, unknown>
): Promise<string> => {
  const data = await callGemini('formatContent', { content, platform, brandKit });
  return (data as { text?: string }).text as string;
};
