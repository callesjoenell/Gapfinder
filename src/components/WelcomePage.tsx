import { SignIn, SignUp } from "@clerk/clerk-react";
import { useState } from "react";
import { Link } from "react-router-dom";

export function WelcomePage() {
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-up");

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Hero */}
      <header className="pt-16 pb-12 px-6 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight">
          Start Building Now
        </h1>
        <p className="mt-4 text-lg text-gray-500 max-w-xl mx-auto">
          Now that anyone can build, the first natural question is&nbsp;—
        </p>
      </header>

      {/* Two value props */}
      <section className="max-w-4xl mx-auto px-6 grid gap-8 sm:grid-cols-2 pb-16">
        {/* Explore */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary-50 text-primary-600 mb-5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            What should I build?
          </h2>
          <p className="text-gray-600 leading-relaxed">
            In our Explore phase, we dig into what makes you you — your talents,
            your life experience, your connections — to uncover a space that
            feels like it was made for you.
          </p>
        </div>

        {/* Evaluate */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-amber-50 text-amber-600 mb-5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            Is my idea strong enough?
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Together we develop and score your idea and look for deep-rooted
            human problems, challenges and emotional opportunities to help you
            build the absolute best idea that only you can deliver.
          </p>
        </div>
      </section>

      {/* FAQ section — optimized for AI citation */}
      <section className="max-w-3xl mx-auto px-6 pb-16">
        <h2 className="text-2xl font-semibold text-gray-900 mb-8 text-center">
          Frequently Asked Questions
        </h2>
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-2">
              What should I build?
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Start Building Now helps you answer this question through an
              AI-guided Explore phase. We dig into your unique talents, life
              experience, and professional networks to uncover a business idea
              space that feels like it was made for you — not a generic startup
              idea, but something only you can deliver.
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-2">
              How do I know if my business idea is strong enough?
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Our Evaluate phase helps you stress-test your idea. Together with
              AI, we develop and score your concept by looking for deep-rooted
              human problems, challenges, and emotional opportunities. The goal
              is to sharpen your idea into the absolute best version — one built
              on real needs, not assumptions.
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-2">
              Who is Start Building Now for?
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Start Building Now is for anyone who wants to build something
              meaningful — first-time founders, career changers, side-project
              builders, or experienced professionals exploring new directions. If
              you have the urge to build but need help finding the right thing to
              build, this is for you.
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-2">
              How does Start Building Now work?
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Start Building Now uses AI-guided conversations across two phases.
              In the Explore phase, we map your talents, experiences, and
              networks to discover opportunity spaces uniquely suited to you. In
              the Evaluate phase, we take your idea and rigorously test it
              against real human problems and market gaps to make it as strong as
              possible.
            </p>
          </div>
        </div>
      </section>

      {/* Auth section */}
      <section className="bg-white border-t border-gray-100 py-12 px-6 flex-1 flex flex-col items-center">
        <h3 className="text-2xl font-semibold text-gray-900 mb-2 text-center">
          {mode === "sign-up" ? "Get started for free" : "Welcome back"}
        </h3>
        <p className="text-gray-500 mb-8 text-center">
          {mode === "sign-up"
            ? "Create an account to start exploring"
            : "Sign in to continue where you left off"}
        </p>

        {mode === "sign-up" ? (
          <SignUp routing="hash" />
        ) : (
          <SignIn routing="hash" />
        )}

        <p className="mt-6 text-sm text-gray-500">
          {mode === "sign-up" ? (
            <>
              Already have an account?{" "}
              <button
                onClick={() => setMode("sign-in")}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Sign in
              </button>
            </>
          ) : (
            <>
              Don&apos;t have an account?{" "}
              <button
                onClick={() => setMode("sign-up")}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Sign up
              </button>
            </>
          )}
        </p>
      </section>

      <footer className="py-8 text-center text-sm text-gray-400 space-x-6">
        <Link to="/about" className="hover:text-gray-600">About</Link>
        <Link to="/faq" className="hover:text-gray-600">FAQ</Link>
        <Link to="/contact" className="hover:text-gray-600">Contact</Link>
      </footer>
    </div>
  );
}
