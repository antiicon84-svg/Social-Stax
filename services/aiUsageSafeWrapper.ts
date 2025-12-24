import { UserProfile, Usage } from '../types';
import { canPerformAction, incrementUsage } from './usageTrackingService';

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