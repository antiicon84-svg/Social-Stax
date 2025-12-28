import { GoogleGenerativeAI } from "@google/generative-ai";
import { GOOGLE_API_KEY } from "@/config/constants";

const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);

// Use gemini-1.5-flash for low-cost generation
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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
export const analyzeWebsite = async (url: string) => {
  const systemPrompt = `Analyze the website URL provided and infer brand details like name, industry, tone, description, and primary color.
  URL: ${url}
  Output JSON: { "name": "...", "industry": "...", "tone": "...", "description": "...", "color": "#..." }`;

  try {
    const result = await model.generateContent([systemPrompt]);
    const response = await result.response;
    const text = response.text();
    const jsonMatch = text.match(/\{.*\}/s);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return null;
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
