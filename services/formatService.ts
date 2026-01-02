/**
 * Platform-specific content formatting service
 * Adds hashtags, emojis, and platform-optimized formatting
 */

export const formatContentForPlatform = async (
  content: string,
  platform: string = 'Instagram'
): Promise<string> => {
  try {
    if (!content || content.trim().length === 0) {
      return content;
    }

    const platformConfigs: Record<string, any> = {
      Instagram: {
        maxHashtags: 30,
        emojiCount: 3,
        emojis: ['📸', '✨', '💡', '🎯', '🚀', '💯', '🔥', '⭐', '🌟', '💫'],
        hashtags: ['#ContentCreator', '#SocialMedia', '#DigitalMarketing', '#BrandStrategy', '#CreativeContent'],
      },
      LinkedIn: {
        maxHashtags: 5,
        emojiCount: 1,
        emojis: ['💼', '📊', '💡', '🎯', '📈', '🚀', '⭐', '🏆'],
        hashtags: ['#Professional', '#Business', '#Leadership', '#Innovation', '#Strategy'],
      },
      Twitter: {
        maxHashtags: 3,
        emojiCount: 2,
        emojis: ['🐦', '💬', '🎯', '🔥', '✨', '📢', '💡', '🚀'],
        hashtags: ['#SocialMedia', '#Tech', '#News', '#Trending', '#Marketing'],
      },
      Facebook: {
        maxHashtags: 5,
        emojiCount: 2,
        emojis: ['👍', '💙', '✨', '🎉', '💡', '🌟', '📣', '💫'],
        hashtags: ['#Community', '#Share', '#Engagement', '#Brand', '#Marketing'],
      },
    };

    const config = platformConfigs[platform] || platformConfigs.Instagram;
    let formattedContent = content;

    // Add platform-specific emoji
    if (config.emojiCount > 0) {
      const emoji = config.emojis[Math.floor(Math.random() * config.emojis.length)];
      formattedContent = emoji + ' ' + formattedContent;
    }

    // Add platform-specific hashtags
    const hashtagString = config.hashtags.slice(0, config.maxHashtags).join(' ');
    formattedContent = formattedContent + '\n\n' + hashtagString;

    return formattedContent;
  } catch (error) {
    console.error('Error formatting content:', error);
    return content;
  }
};

export default formatContentForPlatform;