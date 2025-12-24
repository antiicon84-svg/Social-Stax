
export type ClientType = 'Brand' | 'Influencer';

export interface SubscriptionPlan {
  status: 'trial' | 'active' | 'cancelled' | 'expired';
  plan: 'starter' | 'pro' | 'enterprise';
  expiresAt: Date;
  autoRenew: boolean;
  paymentMethod: string | null;
}

export interface Usage {
  contentGenerations: number;
  imageGenerations: number;
  voiceAssistantMinutes: number;
  apiCalls: number;
  lastReset: Date;
}

export interface UserProfile {
  uid?: string;
  email: string;
  name?: string; // Name can be optional
  role: 'admin' | 'user'; // Use role instead of isAdmin for consistency
  subscription?: SubscriptionPlan;
  usage?: Usage; // Add usage tracking to the user's profile
  cloudConfig?: {
    googleDrive?: {
      connected: boolean;
      clientId?: string;
      apiKey?: string;
      accessToken?: string;
    };
    dropboxConnected: boolean;
  };
  createdAt: Date;
}

export interface SocialAccount {
  platform: SocialPlatform;
  isConnected: boolean;
  username?: string;
  accessToken?: string;
  refreshToken?: string;
  accountId?: string;
  apiSecret?: string;
}

export interface Client {
  id: string;
  ownerEmail: string;
  ownerUid?: string;
  name: string;
  clientType: ClientType; 
  industry: string;
  brandTone: string;
  primaryBrandColor: string;
  logo?: string; 
  logoUsageGuideline?: string; 
  typographyGuideline?: string; 
  
  // Extended Brand Kit
  description?: string;
  mission?: string;
  tags?: string[]; 
  
  // Enhanced Contact Info
  website?: string;
  phoneNumber?: string;
  whatsapp?: string;
  contactInfo?: string; // General fallback
  socialLinks?: {
    instagram?: string;
    linkedin?: string;
    twitter?: string;
    facebook?: string;
  };

  additionalNotes?: string; // New field for specific AI instructions

  // Direct API Integration
  socialAccounts?: Partial<Record<SocialPlatform, SocialAccount>>;

  createdAt: Date;
}

export type SocialPlatform = 'Instagram' | 'LinkedIn' | 'Twitter' | 'Facebook';

export type PostFormat = 'Feed' | 'Story' | 'Reel' | 'Carousel';

export interface PostTarget {
  platform: SocialPlatform;
  format: PostFormat;
  aspectRatio: string; // '1:1', '9:16', '16:9'
}

export interface Post {
  id: string;
  clientId: string;
  ownerEmail: string; // Bind to user
  platform: SocialPlatform;
  format?: PostFormat; // Added format tracking
  content: string; // Text content
  imageUrl?: string; // Base64 image data
  status: 'scheduled' | 'draft' | 'published';
  scheduledAt: Date;
  createdAt: Date;
  apiResponse?: string; // Store ID returned from API
}

export interface SessionContent {
  id: string;
  type: 'text' | 'image';
  topic: string;
  platform?: string;
  content: string; // Text or Image URL
  timestamp: Date;
}

export interface ContentOption {
  id: number;
  angle: string; // e.g., "Educational", "Promotional"
  headline: string;
  body: string;
  visualBrief: string; // The prompt for the image generator
}

export interface AdaptedContent {
  platform: SocialPlatform;
  content: string;
}

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

export interface DropdownOption {
  value: string;
  label: string;
}

export type AIGenerationType = 'text' | 'visual';

/**
 * Represents a free access grant given to a user by an admin.
 * This is stored in the 'free_access' collection.
 */
export interface FreeAccessGrant {
  id?: string; // Document ID from Firestore
  userId: string; // The UID of the user receiving the grant
  userEmail: string; // The email of the user for easy identification
  plan: 'starter' | 'pro' | 'enterprise'; // The plan level granted
  expiresAt: Date | null; // Null for lifetime access
  grantedAt: Date;
  customLimits?: Partial<Usage>; // For admin-defined custom usage limits
  grantedBy?: string; // UID of the admin who granted it
}

// Declare global AppKit interface for native environment features
declare global {
  interface AppKit {
    ready: Promise<void>;
    platform: string; // e.g., 'ios', 'android', 'web'
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    appkit?: AppKit; // appkit is optional, might not be available in all environments
    gapi?: any;
    google?: any;
  }
}