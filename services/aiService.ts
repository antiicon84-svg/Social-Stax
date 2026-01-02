import { GoogleGenerativeAI } from "@google/generative-ai";
import { GOOGLE_API_KEY } from "@/config/constants";

const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);

// Use gemini-2.0-flash for low-cost generation
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

/**
 * Enhances a given prompt using AI
 */
export const enhancePromptWithAI = async (prompt: string, type: 'video' | 'image' | 'both') => {
  const systemPrompt = `You are a professional prompt engineer for ${type} generation AI. 
  Enhance the user's prompt to be more detailed, cinematic, and effective. 
  Output only the enhanced prompt and technical parameters in JSON format: { "enhancedPrompt": "...", "technicalParams": "..." }`;

  try {
    const result = await model.generateContent([systemPrompt, prompt]);
    const response = await result.response;
    const text = response.text();
    const jsonMatch = text.match(/\{.*\}/s);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return { enhancedPrompt: text, technicalParams: "" };
  } catch (error) {
    console.error("Enhancement failed", error);
    throw error;
  }
};

/**
 * Analyzes prompt coherence
 */
export const analyzePromptCoherence = async (prompt: string, type: 'video' | 'image' | 'both') => {
  const systemPrompt = `Analyze the following ${type} generation prompt for coherence and potential conflicts. 
  Provide a score from 1-10 and brief advice. 
  Output in JSON: { "score": 8, "advice": "..." }`;

  try {
    const result = await model.generateContent([systemPrompt, prompt]);
    const response = await result.response;
    const text = response.text();
    const jsonMatch = text.match(/\{.*\}/s);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return { score: 5, advice: "Unable to analyze." };
  } catch (error) {
    console.error("Analysis failed", error);
    throw error;
  }
};

/**
 * Analyzes a website to extract brand information
 */
import { getFunctions, httpsCallable } from "firebase/functions";
import { getApp } from "firebase/app";

/**
 * Analyzes a website to extract brand information using Cloud Function (Server-side scraping + Gemini)
 */
export const analyzeWebsite = async (url: string) => {
  try {
    const functions = getFunctions(getApp());
    const analyzeFunction = httpsCallable(functions, 'analyzeWebsite');
    const result = await analyzeFunction({ url });
    return result.data as any; // Type assertion as response structure is dynamic
  } catch (error) {
    console.error("Website analysis failed", error);
    throw error;
  }
};

/**
 * General purpose content generation
 */
export const generateContent = async (topic: string, platform?: string) => {
  const prompt = `Generate high-quality social media content for the topic: "${topic}"${platform ? ` specifically for ${platform}` : ""}. 
  Provide a headline, body text, and a visual brief for an image generator.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Content generation failed", error);
    throw error;
  }
};

/**
 * Formats generated content for specific social media platforms
 * Includes platform-specific character limits, hashtags, emojis, and brand kit alignment
 */
export const formatSocialMediaContent = async (
  content: string,
  platform: 'Instagram' | 'LinkedIn' | 'Twitter' | 'Facebook',
  brandKit?: any
): Promise<string> => {
  const platformConfigs = {
    Instagram: {
      maxLength: 2200,
      hashtagCount: 15,
      emojiEmphasis: true,
      tone: 'Creative, visually-focused, trendy'
    },
    LinkedIn: {
      maxLength: 3000,
      hashtagCount: 5,
      emojiEmphasis: false,
      tone: 'Professional, thought leadership, industry insights'
    },
    Twitter: {
      maxLength: 280,
      hashtagCount: 3,
      emojiEmphasis: true,
      tone: 'Concise, engaging, trendy'
    },
    Facebook: {
      maxLength: 63206,
      hashtagCount: 8,
      emojiEmphasis: true,
      tone: 'Conversational, community-focused, storytelling'
    }
  };

  const config = platformConfigs[platform];
  const brandTone = brandKit?.tone || config.tone;

  try {
    const systemPrompt = `Format this content for ${platform}.
    - Max ${config.maxLength} characters
    - Add ${config.hashtagCount} relevant hashtags
    - ${config.emojiEmphasis ? 'Use strategic emojis' : 'Minimal emojis'}
    - Tone: ${brandTone}
    - Include CTA if relevant
    Return ONLY formatted post.`;

    const result = await model.generateContent([systemPrompt, `Content: ${content}`]);
    return result.response.text().trim();
  } catch (error) {
    console.error('Formatting failed', error);
    return content;
  }
};
