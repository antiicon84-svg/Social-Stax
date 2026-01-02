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

export const formatContentForPlatform = async (
  content: string,
  platform: string = 'Instagram'
): Promise<string> => {
  try {
    if (!content || content.trim().length === 0) {
      return content;
    }

    // Clean the content first - remove explanations and formatting markers
    let cleanedContent = cleanContent(content);

    const platformConfigs: Record<string, any> = {
      Instagram: {
        maxHashtags: 30,
        emoji: '📸',
        hashtags: ['#ContentCreator', '#SocialMedia', '#DigitalMarketing', '#BrandStrategy', '#CreativeContent', '#InstaReels', '#AIGenerated', '#SocialMediaMarketing'],
      },
      LinkedIn: {
        maxHashtags: 5,
        emoji: '💼',
        hashtags: ['#Professional', '#Business', '#Innovation', '#Leadership', '#Strategy'],
      },
      Twitter: {
        maxHashtags: 3,
        emoji: '🐦',
        hashtags: ['#SocialMedia', '#Trending', '#Tech'],
      },
      Facebook: {
        maxHashtags: 5,
        emoji: '👍',
        hashtags: ['#Community', '#Engagement', '#Brand', '#Marketing', '#SocialMedia'],
      },
    };

    const config = platformConfigs[platform] || platformConfigs.Instagram;
    
    // Add emoji at the beginning
    let formattedContent = `${config.emoji} ${cleanedContent}`;

    // Add hashtags at the end
    const hashtagString = config.hashtags.slice(0, config.maxHashtags).join(' ');
    formattedContent = `${formattedContent}\n\n${hashtagString}`;

    return formattedContent;
  } catch (error) {
    console.error('Error formatting content:', error);
    return content;
  }
};

export default formatContentForPlatform;