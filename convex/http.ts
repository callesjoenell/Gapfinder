import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

const http = httpRouter();

// ─── Stripe: Create Checkout Session ────────────────────────────────────────

http.route({
  path: "/api/stripe/create-checkout",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const appUrl = process.env.APP_URL!;

    // Authenticate
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": appUrl,
        },
      });
    }

    // Parse body
    let body: { path?: string; name?: string; description?: string };
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": appUrl,
        },
      });
    }

    const { path, name } = body;

    if (!path || !name) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: path, name" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": appUrl,
          },
        }
      );
    }

    // Compute price server-side — never trust client-supplied amount
    const serverPrice = await ctx.runQuery(internal.pricing.getCurrentPriceInternal);
    if (!serverPrice || !serverPrice.priceCents) {
      return new Response(
        JSON.stringify({ error: "Pricing not configured" }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": appUrl,
          },
        }
      );
    }

    const amountCents = serverPrice.priceCents;

    const result = await ctx.runAction(internal.stripe.createCheckoutSessionAction, {
      userId: identity.subject,
      path,
      name,
      description: body.description || "",
      amountCents,
      appUrl,
    });

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": appUrl,
      },
    });
  }),
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

// ─── Stripe: Webhook Receiver ───────────────────────────────────────────────

http.route({
  path: "/api/stripe/webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const signature = request.headers.get("stripe-signature");
    if (!signature) {
      return new Response(JSON.stringify({ error: "Missing stripe-signature header" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Read raw body for signature verification
    const payload = await request.text();

    let result;
    try {
      result = await ctx.runAction(internal.stripe.verifyWebhookAction, {
        payload,
        signature,
      });
    } catch {
      return new Response(
        JSON.stringify({ error: "Webhook signature verification failed" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (result.handled && result.stripeSessionId) {
      await ctx.runAction(internal.stripeHelpers.fulfillCheckout, {
        stripeSessionId: result.stripeSessionId,
        metadata: result.metadata!,
        paymentIntentId: result.paymentIntentId!,
        amountCents: result.amountCents!,
      });
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

export default http;
