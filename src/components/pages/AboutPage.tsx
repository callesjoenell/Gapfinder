import { useEffect } from "react";
import { PublicPageLayout } from "../layout/PublicPageLayout";

export function AboutPage() {
  useEffect(() => {
    document.title = "About | Start Building Now";
  }, []);

  return (
    <PublicPageLayout>
      <div className="max-w-3xl mx-auto px-6 py-16">
        {/* Hero */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            About Start Building Now
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            Start Building Now helps people discover what to build and validate whether
            their ideas are worth pursuing — through AI-guided conversations that go deep
            into who you are and what only you can create.
          </p>
        </div>

        {/* What We Do */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">What We Do</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            We offer two AI-guided conversation paths tailored to where you are in your
            building journey:
          </p>
          <div className="space-y-4">
            <div className="border-l-4 border-primary-500 pl-4">
              <h3 className="font-semibold text-gray-900 mb-1">Explore Path</h3>
              <p className="text-gray-600 leading-relaxed">
                Not sure what to build? The Explore path digs into your unique talents,
                life experiences, and professional networks to surface opportunity spaces
                that feel like they were made for you — not a generic startup idea, but
                something only you can deliver.
              </p>
            </div>
            <div className="border-l-4 border-amber-500 pl-4">
              <h3 className="font-semibold text-gray-900 mb-1">Evaluate Path</h3>
              <p className="text-gray-600 leading-relaxed">
                Already have an idea? The Evaluate path stress-tests your concept by
                mapping it against real human problems, market gaps, and emotional
                opportunities. We sharpen your idea into the strongest version possible
                — built on truth, not assumptions.
              </p>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">How It Works</h2>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center font-semibold text-sm">
                1
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Start a conversation</h3>
                <p className="text-gray-600 leading-relaxed">
                  Choose whether you want to explore new ideas or evaluate an existing one,
                  then begin an AI-guided conversation at your own pace.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center font-semibold text-sm">
                2
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">AI guides the discovery</h3>
                <p className="text-gray-600 leading-relaxed">
                  The AI asks targeted questions across multiple phases — drawing out
                  insights about your background, motivations, and opportunities that you
                  might not have surfaced on your own.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center font-semibold text-sm">
                3
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Get actionable insights</h3>
                <p className="text-gray-600 leading-relaxed">
                  Each session is persistent — you can return to it anytime. By the end,
                  you have a clear picture of what to build and why it's uniquely suited
                  to you.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Why We Built This */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Why We Built This</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            Now that anyone can build software, the question has shifted from "can I build
            it?" to "what should I build?" Most people who want to start something get
            stuck right there — overwhelmed by possibilities, unsure if their idea is
            strong enough, or not sure where to even begin.
          </p>
          <p className="text-gray-600 leading-relaxed">
            We built Start Building Now to be the thinking partner that helps you cut
            through the noise. Not another idea generator — a structured process that
            helps you discover the thing only you can build.
          </p>
        </div>
      </div>
    </PublicPageLayout>
  );
}
