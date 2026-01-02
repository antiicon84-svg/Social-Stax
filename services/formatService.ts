/**
 * Platform-specific content formatting service
 * Converts generated content to be ready-to-post format
 * Removes explanations, removes *** formatting, adds hashtags
 */

export const cleanContent = (content: string): string => {
  // Remove lines that start with "**" or contain "***"
  const lines = content.split('\n');
  const cleaned = lines
    .filter(line => !line.includes('***') && !line.startsWith('**'))
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join(' ');
  
  return cleaned;
};

export const formatContentForPlatform = async (content: string, platform: string = 'Instagram'): Promise<string> => { try { if (!content || content.trim().length === 0) return content; let cleaned = content; cleaned = cleaned.replace(/\*\*\*/g, '').replace(/\*\*/g, '').replace(/^.*?\b(Okay|Here|I've|Let me|Sure|Well|just|so|alright)\b.*?:/gim, '').replace(/^(Option|Alternative|Step|Tip)\s+\d+:?\s*-?\s*/gim, '').replace(/\[.*?\]/g, '').replace(/^[-*]\s+/gm, '').replace(/^\d+\.\s+/gm, '').replace(/\n\n+/g, '\n').replace(/^\s+|\s+$/g, ''); if (cleaned.trim().length < 10) return content; const platformConfigs: Record<string, { emoji: string; hashtags: string[] }> = { Instagram: { emoji: '📸', hashtags: ['#ContentCreator', '#SocialMedia', '#DigitalMarketing', '#BrandStrategy', '#Creative', '#Content', '#Marketing'] }, LinkedIn: { emoji: '💼', hashtags: ['#Professional', '#Business', '#Innovation', '#Leadership', '#Strategy', '#CareerGrowth'] }, Twitter: { emoji: '🐦', hashtags: ['#SocialMedia', '#Trending', '#Tech', '#News'] }, Facebook: { emoji: '👍', hashtags: ['#Community', '#Engagement', '#Brand', '#Marketing', '#SocialMediaMarketing'] } }; const config = platformConfigs[platform] || platformConfigs.Instagram; const formatted = `${config.emoji} ${cleaned.trim()}\n\n${config.hashtags.join(' ')}`; return formatted; } catch (error) { return content; } }; export default formatContentForPlatform;