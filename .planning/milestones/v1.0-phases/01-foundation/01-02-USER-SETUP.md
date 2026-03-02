# Plan 01-02 User Setup: Magic Link Authentication

This plan requires external service configuration before the authentication flow will work.

## Required: Resend API Key

Magic link emails are sent via Resend. You need an API key.

### Steps

1. **Create Resend account** (if you don't have one)
   - Go to https://resend.com/signup
   - Verify your email

2. **Get API Key**
   - Go to Resend Dashboard -> API Keys
   - Click "Create API Key"
   - Copy the key (starts with `re_`)

3. **Set in Convex**
   ```bash
   npx convex env set AUTH_RESEND_KEY "re_your_actual_key_here"
   ```

4. **Verify**
   ```bash
   npx convex env list | grep AUTH_RESEND_KEY
   ```
   Should show the key is set (not the actual value).

## Optional: Custom Sending Domain

The current config uses `onboarding@resend.dev` which Resend allows for testing. For production:

1. **Add Domain in Resend**
   - Go to Resend Dashboard -> Domains
   - Click "Add Domain"
   - Follow DNS verification steps

2. **Update from address**
   Edit `convex/auth.ts` and change:
   ```typescript
   from: "Gap Finder <onboarding@resend.dev>",
   ```
   To:
   ```typescript
   from: "Gap Finder <noreply@yourdomain.com>",
   ```

3. **Redeploy**
   ```bash
   npx convex dev --once
   ```

## Testing the Auth Flow

Once AUTH_RESEND_KEY is set:

1. Start the app: `npm run dev`
2. Go to http://localhost:5173
3. Enter your email and click "Send magic link"
4. Check your email (may be in spam if using test sender)
5. Click the link - you should be authenticated

## Already Configured (no action needed)

These were set up automatically during plan execution:

- `AUTH_SECRET` - Session encryption key
- `JWT_PRIVATE_KEY` - JWT signing key
- `JWKS` - JWT public key set
- `SITE_URL` - http://localhost:5173

## Troubleshooting

**"Failed to send email" error:**
- Check AUTH_RESEND_KEY is set correctly
- Verify key is valid in Resend dashboard

**Email not received:**
- Check spam folder
- Verify Resend dashboard shows sent emails
- Try using the Resend test email feature

**Link doesn't work:**
- Links expire after 15 minutes
- Each link can only be used once
- Make sure SITE_URL matches your app URL
