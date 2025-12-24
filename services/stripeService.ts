import { httpsCallable } from "firebase/functions";
import { functions } from "./firebase"; // Assuming you have a firebase export file

/**
 * @file stripeService.ts
 * @description Handles all Stripe-related payment and subscription actions.
 */

/**
 * Defines the structure for the data required to create a checkout session.
 */
export interface CreateCheckoutSessionData {
  priceId: string;
  successUrl: string;
  cancelUrl: string;
}

/**
 * Defines the expected response structure from the createCheckoutSession cloud function.
 */
interface CreateCheckoutSessionResponse {
  sessionId?: string;
  error?: string;
}

/**
 * Creates a Stripe Checkout session by calling a Firebase Cloud Function.
 *
 * This function is called from the client-side (e.g., when a user clicks "Upgrade").
 * It securely requests the creation of a checkout session on the server-side.
 *
 * @param {CreateCheckoutSessionData} data - The data needed to create the session.
 * @returns {Promise<string>} The ID of the Stripe Checkout session.
 * @throws Will throw an error if the cloud function fails or returns an error.
 */
export const createCheckoutSession = async (
  data: CreateCheckoutSessionData
): Promise<string> => {
  try {
    const createSession = httpsCallable<
      CreateCheckoutSessionData,
      CreateCheckoutSessionResponse
    >(functions, "createCheckoutSession");

    const result = await createSession(data);

    if (result.data.error || !result.data.sessionId) {
      throw new Error(result.data.error || "Failed to create a checkout session.");
    }

    return result.data.sessionId;
  } catch (error) {
    console.error("Error creating Stripe checkout session:", error);
    throw new Error("Could not initiate the payment process. Please try again.");
  }
};