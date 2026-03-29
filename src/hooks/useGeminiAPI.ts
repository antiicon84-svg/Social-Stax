import { generateImage, editImageService, generateVideo as generateVideoService, generateContent as generateContentService } from '~/services/aiService';

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

export async function generateVideo(prompt: string, aspectRatio: string = '16:9'): Promise<string> {
  try {
    const result = await generateVideoService(prompt, aspectRatio);
    return result.videoData;
  } catch (error) {
    console.error('Generate video error:', error);
    throw error;
  }
}

export async function generateTextContent(topic: string, platform?: string): Promise<string> {
  try {
    const text = await generateContentService(topic, platform);
    return text || '';
  } catch (error) {
    console.error('Generate text content error:', error);
    throw error;
  }
}
