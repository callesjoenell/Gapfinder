"use node";

import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import Stripe from "stripe";

// ─── Checkout Session Creation ─────────────────────────────────────────────

/**
 * POST /api/stripe/create-checkout
 *
 * Creates a Stripe Checkout session for purchasing a Gap Finder session.
 * Requires a valid Clerk JWT (authenticated user).
 * Returns { url: string } — the Stripe-hosted checkout page URL.
 */
export const createCheckoutSession = httpAction(async (ctx, request) => {
  // Authenticate
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return new Response(JSON.stringify({ error: "Not authenticated" }), {
      status: 401,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": process.env.APP_URL!,
      },
    });
  }

  // Parse body
  let body: { path?: string; name?: string; description?: string; amountCents?: number };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": process.env.APP_URL!,
      },
    });
  }

  const { path, name, description, amountCents } = body;

  if (!path || !name || amountCents === undefined || amountCents === null) {
    return new Response(
      JSON.stringify({ error: "Missing required fields: path, name, amountCents" }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": process.env.APP_URL!,
        },
      }
    );
  }

  const userId = identity.subject;

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: amountCents,
          product_data: {
            name:
              "Gap Finder — " +
              (path === "exploration" ? "Explore" : "Evaluate") +
              " Session",
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      userId,
      path,
      name: name.substring(0, 40),
      description: (description || "").substring(0, 500),
    },
    success_url: process.env.APP_URL + "?payment=success",
    cancel_url: process.env.APP_URL + "?payment=cancelled",
  });

  return new Response(JSON.stringify({ url: session.url }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": process.env.APP_URL!,
    },
  });
});

// ─── Stripe Webhook Handler ────────────────────────────────────────────────

/**
 * POST /api/stripe/webhook
 *
 * Receives Stripe webhook events. Verifies the Stripe signature and handles
 * checkout.session.completed by atomically creating a session + payment record.
 *
 * IMPORTANT: Uses request.text() (not request.json()) to preserve raw body
 * for signature verification.
 */
export const stripeWebhook = httpAction(async (ctx, request) => {
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return new Response(JSON.stringify({ error: "Missing stripe-signature header" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Read raw body — NEVER use request.json() here (breaks signature verification)
  const payload = await request.text();

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Webhook signature verification failed" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const metadata = session.metadata!;

    await ctx.runAction(internal.stripeHelpers.fulfillCheckout, {
      stripeSessionId: session.id,
      metadata: {
        userId: metadata.userId,
        path: metadata.path,
        name: metadata.name,
        description: metadata.description,
      },
      paymentIntentId: (session.payment_intent as string) || "",
      amountCents: session.amount_total || 0,
    });
  }

  // Always return 200 — Stripe will retry if it gets anything else
  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
