import { httpRouter, httpAction } from "convex/server";
import { createCheckoutSession, stripeWebhook } from "./stripe";

const http = httpRouter();

// ─── Stripe routes ────────────────────────────────────────────────────────────

// Create a Stripe Checkout session (browser POST from frontend)
http.route({
  path: "/api/stripe/create-checkout",
  method: "POST",
  handler: createCheckoutSession,
});

// CORS preflight for the checkout creation endpoint
http.route({
  path: "/api/stripe/create-checkout",
  method: "OPTIONS",
  handler: httpAction(async () =>
    new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": process.env.APP_URL!,
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    })
  ),
});

// Stripe webhook receiver (called by Stripe, not the browser)
http.route({
  path: "/api/stripe/webhook",
  method: "POST",
  handler: stripeWebhook,
});

export default http;
