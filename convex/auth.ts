import { query } from "./_generated/server";
import type { QueryCtx, MutationCtx, ActionCtx } from "./_generated/server";

// Helper to get authenticated user ID from Clerk JWT
export async function getAuthUserId(
  ctx: QueryCtx | MutationCtx | ActionCtx
): Promise<string | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;
  // Clerk provides subject as the user ID
  return identity.subject;
}

// Get current user info (from Clerk token)
export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    return {
      id: identity.subject,
      email: identity.email,
      name: identity.name,
    };
  },
});
