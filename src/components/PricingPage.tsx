import React, { useState } from "react";
import { createCheckoutSession } from "../services/stripeService";

/**
 * @file components/PricingPage.tsx
 * @description Displays the pricing tiers and handles initiating Stripe Checkout sessions.
 */

// Define the structure for a pricing plan
interface PricingPlan {
  id: string;
  name: string;
  price: string;
  description: string;
  features: string[];
  stripePriceId: string; // This will be the actual Stripe Price ID
}

// Define your pricing plans with placeholder Stripe Price IDs
// IMPORTANT: Replace these with your actual Stripe Price IDs from your Stripe Dashboard!
const pricingPlans: PricingPlan[] = [
  {
    id: "starter",
    name: "Starter",
    price: "$29/month",
    description: "Perfect for individuals and small teams.",
    features: [
      "50 Content Generations",
      "100 Image Generations",
      "Basic Analytics",
      "Email Support",
    ],
    stripePriceId: "price_1OQ23456789abcdefghijk", // Replace with actual Stripe Price ID
  },
  {
    id: "pro",
    name: "Pro",
    price: "$79/month",
    description: "For growing businesses needing more power.",
    features: [
      "500 Content Generations",
      "1000 Image Generations",
      "Advanced Analytics",
      "Priority Email Support",
      "Custom Integrations",
    ],
    stripePriceId: "price_2OQ23456789abcdefghijk", // Replace with actual Stripe Price ID
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "$299/month",
    description: "Unlimited usage for large organizations.",
    features: [
      "Unlimited Content Generations",
      "Unlimited Image Generations",
      "Dedicated Account Manager",
      "24/7 Phone Support",
      "On-premise Deployment Options",
    ],
    stripePriceId: "price_3OQ23456789abcdefghijk", // Replace with actual Stripe Price ID
  },
];

const PricingPage: React.FC = () => {
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async (plan: PricingPlan) => {
    setLoadingPlanId(plan.id);
    setError(null);
    try {
      // In a real app, you might want to dynamically generate these URLs
      // For now, we'll use the current origin and simple paths.
      const successUrl = `${window.location.origin}/dashboard?payment=success`;
      const cancelUrl = `${window.location.origin}/pricing?payment=cancelled`;

      const sessionId = await createCheckoutSession({
        priceId: plan.stripePriceId,
        successUrl,
        cancelUrl,
      });

      if (sessionId) {
        // Redirect to Stripe Checkout
        window.location.href = `https://checkout.stripe.com/pay/${sessionId}`;
      } else {
        setError("Failed to get Stripe Checkout session ID.");
      }
    } catch (err: any) {
      console.error("Subscription error:", err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoadingPlanId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
          Choose the plan that's right for you
        </h2>
        <p className="mt-4 text-lg text-gray-600">
          Start your free 14-day trial today, no credit card required.
        </p>
      </div>

      {error && (
        <div className="mt-8 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {pricingPlans.map((plan) => (
          <div
            key={plan.id}
            className="bg-white border border-gray-200 rounded-lg shadow-lg divide-y divide-gray-200"
          >
            <div className="p-6">
              <h2 className="text-2xl font-semibold text-gray-900">{plan.name}</h2>
              <p className="mt-4 text-gray-500">{plan.description}</p>
              <p className="mt-8">
                <span className="text-4xl font-extrabold text-gray-900">{plan.price}</span>
                <span className="text-base font-medium text-gray-500">/month</span>
              </p>
              <button
                onClick={() => handleSubscribe(plan)}
                disabled={loadingPlanId === plan.id}
                className="mt-8 block w-full bg-indigo-600 border border-transparent rounded-md py-3 text-base font-medium text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingPlanId === plan.id ? "Processing..." : "Start Free Trial"}
              </button>
            </div>
            <div className="pt-6 pb-8 px-6">
              <h3 className="text-xs font-medium text-gray-900 tracking-wide uppercase">
                What's included
              </h3>
              <ul role="list" className="mt-6 space-y-4">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex space-x-3">
                    {/* Heroicon check circle */}
                    <svg
                      className="flex-shrink-0 h-6 w-6 text-green-500"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-base text-gray-500">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PricingPage;