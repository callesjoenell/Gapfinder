import { convexAuth } from "@convex-dev/auth/server";
import { Email } from "@convex-dev/auth/providers/Email";
import { query } from "./_generated/server";

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [
    Email({
      id: "resend",
      // For magic link behavior - no email resubmission needed
      authorize: undefined,
      maxAge: 15 * 60, // 15 minutes as per security best practices
      async sendVerificationRequest({ identifier: email, url }) {
        // Use fetch API instead of Resend SDK to avoid Node.js runtime dependencies
        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.AUTH_RESEND_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Gap Finder <onboarding@resend.dev>",
            to: email,
            subject: "Sign in to Gap Finder",
            html: `
              <h1>Sign in to Gap Finder</h1>
              <p>Click the link below to sign in:</p>
              <a href="${url}" style="display: inline-block; padding: 12px 24px; background-color: #22C55E; color: white; text-decoration: none; border-radius: 8px;">Sign In</a>
              <p style="color: #666; margin-top: 16px;">This link expires in 15 minutes.</p>
              <p style="color: #999; font-size: 12px;">If you didn't request this, you can safely ignore this email.</p>
            `,
            text: `Sign in to Gap Finder: ${url}\n\nThis link expires in 15 minutes.`,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(`Failed to send email: ${JSON.stringify(error)}`);
        }
      },
    }),
  ],
});

// Get current user
export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return null;
    return await ctx.db.get(userId);
  },
});
