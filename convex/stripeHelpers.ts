import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";

// ─── fulfillCheckout ──────────────────────────────────────────────────────────

/**
 * Internal action called by the Stripe webhook handler after a successful
 * checkout.session.completed event. Runs in the default Convex runtime
 * (NOT "use node") so it can call internal mutations.
 *
 * Delegates to createPaidSession which handles idempotency internally.
 */
export const fulfillCheckout = internalAction({
  args: {
    stripeSessionId: v.string(),
    metadata: v.object({
      userId: v.string(),
      path: v.string(),
      name: v.string(),
      description: v.string(),
    }),
    paymentIntentId: v.string(),
    amountCents: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.runMutation(internal.sessions.createPaidSession, {
      userId: args.metadata.userId,
      name: args.metadata.name,
      path: args.metadata.path as "exploration" | "evaluation",
      description: args.metadata.description || undefined,
      amountCents: args.amountCents,
      stripeSessionId: args.stripeSessionId,
      stripePaymentIntentId: args.paymentIntentId,
    });
  },
});
