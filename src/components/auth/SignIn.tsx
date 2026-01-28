import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";

export function SignIn() {
  const { signIn } = useAuthActions();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setError("");

    try {
      await signIn("resend", { email });
      setStatus("sent");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Failed to send magic link");
    }
  }

  if (status === "sent") {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Check your email</h2>
        <p className="text-gray-600">
          We sent a magic link to <span className="font-medium">{email}</span>
        </p>
        <p className="text-sm text-gray-500 mt-4">
          Click the link in your email to sign in. The link expires in 15 minutes.
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="mt-6 text-primary-600 hover:text-primary-700 text-sm"
        >
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-8">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Sign in to Gap Finder</h2>
        <p className="text-gray-600">Enter your email to receive a magic link</p>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email address
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          placeholder="you@example.com"
        />
      </div>

      {error && (
        <p className="text-red-600 text-sm">{error}</p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full bg-primary-500 text-white py-2 px-4 rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {status === "sending" ? "Sending..." : "Send magic link"}
      </button>
    </form>
  );
}
