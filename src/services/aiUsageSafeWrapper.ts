import { UserProfile, Usage } from '../types';
import { canPerformAction, incrementUsage } from './usageTrackingService';
import { getUserUsage } from './usageTrackingService';

/**
 * The type of usage to track, corresponding to keys in the Usage object.
 */
export type UsageType = keyof Omit<Usage, 'lastReset'>;

/**
 * A higher-order function that wraps an AI operation with a usage check.
 * It verifies the user's quota before executing the function and increments
 * their usage count upon successful completion.
 *
 * @param userProfile The full profile of the user performing the action. Must include UID.
 * @param usageType The type of resource being consumed (e.g., 'contentGenerations').
 * @param aiFunction The asynchronous AI function to execute if the user has quota.
 * @param amount The amount of usage this action will consume (default is 1).
 * @returns The result of the AI function.
 * @throws An error if the user has insufficient quota or if the user profile is missing a UID.
 */
export const withUsageCheck = async <T>(
  userProfile: UserProfile,
  usageType: UsageType,
  aiFunction: () => Promise<T>,
  amount: number = 1
): Promise<T> => {
  if (!userProfile.uid) {
    throw new Error("User profile must have a UID to check usage.");
  }

  // 1. Check if the user is allowed to perform the action
  const canPerform = await canPerformAction(userProfile, usageType, amount);

  if (!canPerform) {
    throw new Error(`Usage limit reached for ${usageType}. Please upgrade your plan or wait for the next billing cycle.`);
  }

  // 2. If allowed, execute the underlying AI function
  const result = await aiFunction();

  // 3. After successful execution, increment the usage counter
  // This won't run if aiFunction() throws an error, which is the desired behavior.
  await incrementUsage(userProfile.uid, usageType, amount);

  return result;
};

/**
 * Get formatted quota display data for a user
 * Returns usage data organized for UI display with used/limit values
 */
export const getUserQuotaDisplay = async (
 uid: string,
 email: string,
 plan: string
): Promise<{
 contentGenerations: { used: number; limit: number };
 imageGenerations: { used: number; limit: number };
 voiceAssistant: { used: number; limit: number };
 apiCalls: { used: number; limit: number };
}> => {
 // Default limits based on plan
 const planLimits = {
 free: {
 contentGenerations: 10,
 imageGenerations: 5,
 voiceAssistant: 60,
 apiCalls: 100,
 },
 pro: {
 contentGenerations: 100,
 imageGenerations: 50,
 voiceAssistant: 300,
 apiCalls: 1000,
 },
 enterprise: {
 contentGenerations: -1,
 imageGenerations: -1,
 voiceAssistant: -1,
 apiCalls: -1,
 },
 };

 const limits = planLimits[plan as keyof typeof planLimits] || planLimits.free;

 try {
 const usage = await getUserUsage(uid);

 return {
 contentGenerations: {
 used: usage?.contentGenerations || 0,
 limit: limits.contentGenerations,
 },
 imageGenerations: {
 used: usage?.imageGenerations || 0,
 limit: limits.imageGenerations,
 },
 voiceAssistant: {
 used: 0, // Not tracked in Usage type yet
 limit: limits.voiceAssistant,
 },
 apiCalls: {
 used: 0, // Not tracked in Usage type yet
 limit: limits.apiCalls,
 },
 };
 } catch (error) {
 console.error('Error getting quota display:', error);
 return {
 contentGenerations: { used: 0, limit: 0 },
 imageGenerations: { used: 0, limit: 0 },
 voiceAssistant: { used: 0, limit: 0 },
 apiCalls: { used: 0, limit: 0 },
 };
 }
};

