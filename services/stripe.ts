import { onCall, HttpsError } from "firebase-functions/v2/https";
import { onRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import Stripe from "stripe";
import { defineString } from 'firebase-functions/params';

const stripeSecretKey = defineString('STRIPE_SECRET_KEY');
const stripeWebhookSecret = defineString('STRIPE_WEBHOOK_SECRET');


// Initialize Stripe with the secret key from Firebase environment configuration
const stripe = new Stripe(stripeSecretKey.value(), {
    apiVersion: "2024-06-20" as any,
});

/**
 * Gets or creates a Stripe Customer object for a given Firebase user.
 *
 * It first checks if a `stripeCustomerId` exists in the user's Firestore document.
 * If not, it creates a new Stripe Customer and saves the ID to the user's document.
 *
 * @param {string} userId The Firebase UID of the user.
 * @param {string} email The user's email address.
 * @returns {Promise<string>} The Stripe Customer ID.
 */
const getOrCreateStripeCustomer = async (
    userId: string,
    email: string
): Promise<string> => {
    const userDocRef = admin.firestore().collection("users").doc(userId);
    const userSnapshot = await userDocRef.get();
    const userData = userSnapshot.data();

    if (userData?.stripeCustomerId) {
        return userData.stripeCustomerId;
    }

    // Create a new Stripe customer
    const customer = await stripe.customers.create({
        email: email,
        metadata: {
            firebaseUID: userId,
        },
    });

    // Save the new Stripe customer ID to the user's Firestore document
    await userDocRef.update({
        stripeCustomerId: customer.id,
    });

    return customer.id;
};

/**
 * Creates a Stripe Checkout session for a one-time payment or subscription.
 * This is an HttpsCallable function, invoked from the client-side `stripeService`.
 */
export const createCheckoutSession = onCall(
    async (request) => {
        // Ensure the user is authenticated
        if (!request.auth) {
            throw new HttpsError(
                "unauthenticated",
                "You must be logged in to make a purchase."
            );
        }

        const { priceId, successUrl, cancelUrl } = request.data;
        const userId = request.auth.uid;
        const userEmail = request.auth.token.email || "";

        try {
            const customerId = await getOrCreateStripeCustomer(userId, userEmail);

            // Create a Stripe Checkout session
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ["card"],
                mode: "subscription", // Or "payment" for one-time purchases
                customer: customerId,
                line_items: [{ price: priceId, quantity: 1 }],
                success_url: successUrl,
                cancel_url: cancelUrl,
            });

            return { sessionId: session.id };
        } catch (error) {
            console.error("Stripe Checkout Session creation failed:", error);
            throw new HttpsError("internal", "Unable to create checkout session.");
        }
    }
);

/**
 * A Stripe webhook handler to process subscription events.
 * This is an HTTP-triggered function that Stripe will call.
 */
export const stripeWebhook = onRequest(async (req, res) => {
    const sig = req.headers["stripe-signature"] as string;
    // Get the webhook signing secret from Firebase config.
    const endpointSecret = stripeWebhookSecret.value();

    let event: Stripe.Event;

    try {
        // Verify the event came from Stripe
        event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
    } catch (err: any) {
        console.error("Webhook signature verification failed.", err.message);
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }

    // Handle the event
    switch (event.type) {
        case "checkout.session.completed": {
            const session = event.data.object as Stripe.Checkout.Session;
            console.log(`Processing checkout.session.completed for session ${session.id}`);

            if (!session.customer) {
                console.error("Webhook Error: Checkout session completed without a customer ID.");
                break;
            }

            // Retrieve customer to get Firebase UID from metadata
            const customer = await stripe.customers.retrieve(session.customer as string) as Stripe.Customer;
            const userId = customer.metadata.firebaseUID;

            if (!userId) {
                console.error("Webhook Error: Customer object is missing firebaseUID metadata.");
                break;
            }

            // Update the user's document in Firestore
            const userDocRef = admin.firestore().collection("users").doc(userId);
            await userDocRef.update({
                stripeSubscriptionId: session.subscription,
                subscriptionStatus: "active", // or 'trialing' if you have trials
            });

            console.log(`Successfully updated subscription for user ${userId}.`);
            break;
        }

        case "customer.subscription.deleted": {
            const subscription = event.data.object as Stripe.Subscription;
            console.log(`Processing customer.subscription.deleted for subscription ${subscription.id}`);

            // Find user by subscription ID and update their status
            const usersRef = admin.firestore().collection("users");
            const q = usersRef.where("stripeSubscriptionId", "==", subscription.id);
            const querySnapshot = await q.get();

            if (querySnapshot.empty) {
                console.error(`Webhook Error: No user found with subscription ID ${subscription.id}`);
                break;
            }

            querySnapshot.forEach(async (doc) => {
                await doc.ref.update({ subscriptionStatus: "cancelled" });
                console.log(`Successfully cancelled subscription for user ${doc.id}.`);
            });
            break;
        }

        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    res.status(200).send();
});