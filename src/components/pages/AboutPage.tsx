import { useEffect } from "react";
import { Link } from "react-router-dom";
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
            Now that anyone can build software, the question has shifted from
            &ldquo;can I build it?&rdquo; to &ldquo;what should I build?&rdquo;
            Start Building Now is a structured methodology — delivered through
            AI-guided conversation — that helps you answer that question based on
            who you actually are, not generic advice.
          </p>
        </div>

        {/* Not just a chatbot */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            This Is Not Just an AI Chat
          </h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            Asking an AI &ldquo;what should I build?&rdquo; gets you a list of
            generic ideas disconnected from your life. Start Building Now is
            different because the AI is the delivery mechanism — the methodology
            is what makes it work.
          </p>
          <div className="space-y-3 text-gray-600">
            <div className="flex gap-3">
              <span className="text-primary-500 font-bold flex-shrink-0">1.</span>
              <p><span className="font-medium text-gray-900">It starts from you</span> — your unfair advantages, not random ideation</p>
            </div>
            <div className="flex gap-3">
              <span className="text-primary-500 font-bold flex-shrink-0">2.</span>
              <p><span className="font-medium text-gray-900">It forces depth before breadth</span> — one thread explored fully before moving on</p>
            </div>
            <div className="flex gap-3">
              <span className="text-primary-500 font-bold flex-shrink-0">3.</span>
              <p><span className="font-medium text-gray-900">It never generates ideas for you</span> — you discover them yourself through guided questions</p>
            </div>
            <div className="flex gap-3">
              <span className="text-primary-500 font-bold flex-shrink-0">4.</span>
              <p><span className="font-medium text-gray-900">It gates progress on evidence</span> — not optimistic assumptions</p>
            </div>
            <div className="flex gap-3">
              <span className="text-primary-500 font-bold flex-shrink-0">5.</span>
              <p><span className="font-medium text-gray-900">It uses live market data</span> — Reddit, Hacker News, Product Hunt, and more</p>
            </div>
          </div>
        </div>

        {/* Two Paths */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Two Paths</h2>
          <div className="space-y-6">
            <div className="border-l-4 border-primary-500 pl-4">
              <h3 className="font-semibold text-gray-900 mb-2">Explore — &ldquo;What should I build?&rdquo;</h3>
              <p className="text-gray-600 leading-relaxed mb-3">
                Three phases that move from self-discovery to validated opportunity spaces:
              </p>
              <div className="space-y-2 text-sm text-gray-600">
                <p><span className="font-medium text-gray-800">Phase 0 · Know Yourself</span> — Uses the MILES framework (Money, Intelligence/Insight, Location/Luck, Education/Expertise, Status) and Ikigai (the intersection of passion, skill, demand, and market) to map your unfair advantages. Each area is scored on depth, access, and energy. Areas scoring highest become your hunting grounds.</p>
                <p><span className="font-medium text-gray-800">Phase 1 · Find Gaps</span> — Researches your strongest domains for real problems using live data from Reddit, Hacker News, Product Hunt, and Stack Overflow. Applies the distribution-first formula: Deep Needs + Deep Pockets + Cheap Reach = Opportunity.</p>
                <p><span className="font-medium text-gray-800">Phase 2 · Research</span> — Validates findings using Mom Test principles: past behavior over future promises, real evidence over opinions. You synthesize your own conclusions — the AI doesn't hand you answers.</p>
              </div>
            </div>
            <div className="border-l-4 border-amber-500 pl-4">
              <h3 className="font-semibold text-gray-900 mb-2">Evaluate — &ldquo;Is my idea strong enough?&rdquo;</h3>
              <p className="text-gray-600 leading-relaxed mb-3">
                Seven phases that stress-test your idea before you invest months building it:
              </p>
              <div className="space-y-2 text-sm text-gray-600">
                <p><span className="font-medium text-gray-800">Phase 3 · Your Idea</span> — Crystallize your concept into a clear, testable statement.</p>
                <p><span className="font-medium text-gray-800">Phase 4 · Customers</span> — Define who specifically needs this, using Jobs to Be Done switch-moment analysis to find people actively seeking a solution.</p>
                <p><span className="font-medium text-gray-800">Phase 5 · Problem</span> — Validate through real conversations with potential customers. Mom Test methodology ensures you learn from behavior, not compliments.</p>
                <p><span className="font-medium text-gray-800">Phase 6 · Solution</span> — Design an MVP that fits the validated need — not everything you could build, just what you should build first.</p>
                <p><span className="font-medium text-gray-800">Phase 7 · Score</span> — Rate viability across six dimensions. The Need Depth Ladder measures whether people merely think your idea is cool (level 1) or urgently need it (level 5).</p>
                <p><span className="font-medium text-gray-800">Phase 8 · Refine</span> — Devil's advocate stress-testing. Address weaknesses, sharpen positioning, gather pre-commitment evidence.</p>
                <p><span className="font-medium text-gray-800">Phase 9 · Launch</span> — Create an actionable three-step launch plan grounded in everything you've validated.</p>
              </div>
            </div>
          </div>
        </div>

        {/* The Science */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">The Science Behind It</h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            Every phase is built on validated frameworks and research — not opinions.
            These aren't decorative references; they're embedded in the conversation
            logic that guides your discovery.
          </p>
          <div className="space-y-4">
            <div className="border border-gray-100 rounded-xl p-4">
              <h3 className="font-semibold text-gray-900 mb-1">MILES Framework</h3>
              <p className="text-sm text-gray-500 mb-2">Ash Ali & Hasan Kubba — &ldquo;The Unfair Advantage&rdquo;</p>
              <p className="text-gray-600 text-sm leading-relaxed">Maps your personal advantages across five dimensions to find where you have an edge others don't. Used in Phase 0 to ensure ideas grow from your actual strengths.</p>
            </div>
            <div className="border border-gray-100 rounded-xl p-4">
              <h3 className="font-semibold text-gray-900 mb-1">Ikigai</h3>
              <p className="text-sm text-gray-500 mb-2">Japanese concept of purpose</p>
              <p className="text-gray-600 text-sm leading-relaxed">Ikigai finds your sweet spot at the intersection of four things: what you love (passion), what you're good at (skill), what the world needs (demand), and what you can be paid for (market). Used alongside MILES in Phase 0 to ensure the opportunities you pursue aren't just profitable — they're sustainable because they align with who you are.</p>
            </div>
            <div className="border border-gray-100 rounded-xl p-4">
              <h3 className="font-semibold text-gray-900 mb-1">The Mom Test</h3>
              <p className="text-sm text-gray-500 mb-2">Rob Fitzpatrick</p>
              <p className="text-gray-600 text-sm leading-relaxed">Customer validation framework that prioritizes past behavior over future promises. When someone says &ldquo;I'd buy that,&rdquo; it means nothing. When they show you what they did last time they faced the problem, that's data. Used in Phases 2, 5, and 6.</p>
            </div>
            <div className="border border-gray-100 rounded-xl p-4">
              <h3 className="font-semibold text-gray-900 mb-1">Jobs to Be Done</h3>
              <p className="text-sm text-gray-500 mb-2">Clayton Christensen</p>
              <p className="text-gray-600 text-sm leading-relaxed">People don't buy products — they hire them for a job. The framework maps the switch moment: what triggered the search, the timeline from first thought to decision, and the four forces (push, pull, anxiety, habit) that determine whether someone actually changes behavior. Used in Phases 4-5.</p>
            </div>
            <div className="border border-gray-100 rounded-xl p-4">
              <h3 className="font-semibold text-gray-900 mb-1">Need Depth Ladder</h3>
              <p className="text-sm text-gray-500 mb-2">Core scoring framework</p>
              <p className="text-gray-600 text-sm leading-relaxed">Measures need intensity on five levels: Curiosity, Interest, Desire, Seeking, Urgency. Most ideas sit at level 1-2 for a broad audience. The process helps you find the segment where your idea sits at level 4-5 — where the product doesn't change, but the person does. Used in Phase 7 scoring.</p>
            </div>
            <div className="border border-gray-100 rounded-xl p-4">
              <h3 className="font-semibold text-gray-900 mb-1">Founder-Market Fit</h3>
              <p className="text-sm text-gray-500 mb-2">NBER research & Paul Graham (Y Combinator)</p>
              <p className="text-gray-600 text-sm leading-relaxed">NBER research shows founders with industry-specific experience have substantially higher venture survival rates. Paul Graham's Y Combinator work found the most successful startups almost always begin with ideas that grow from founders' own experiences. This is why Phase 0 starts from you, not from market trends.</p>
            </div>
            <div className="border border-gray-100 rounded-xl p-4">
              <h3 className="font-semibold text-gray-900 mb-1">Distribution-First Validation</h3>
              <p className="text-sm text-gray-500 mb-2">Applied in Phases 1-2</p>
              <p className="text-gray-600 text-sm leading-relaxed">The formula: Deep Needs + Deep Pockets + Cheap Reach = Opportunity. An idea is only as good as your ability to reach the people who need it. The process maps audience willingness-to-pay against acquisition cost before you commit to building.</p>
            </div>
          </div>
        </div>

        {/* Why We Built This */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Why We Built This</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            Most people who want to start something get stuck at the very
            beginning — overwhelmed by possibilities, unsure if their idea is
            strong enough, or not sure where to even begin. The generic advice
            is &ldquo;just build something&rdquo; — but build what? For whom? And how
            do you know before you've wasted months?
          </p>
          <p className="text-gray-600 leading-relaxed">
            We built Start Building Now to be the structured thinking partner that
            helps you cut through the noise. Not an idea generator — a process that
            helps you discover the thing only you can build, then validates it
            before you invest your time.
          </p>
        </div>

        {/* Company Information */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Company Information</h2>
          <p className="text-gray-600 leading-relaxed">
            Start Building Now is operated by Skip Intro AB, a company registered in Sweden.
            For questions, visit our{" "}
            <Link to="/contact" className="text-primary-600 hover:text-primary-700 underline">
              Contact page
            </Link>
            {" "}or see our{" "}
            <Link to="/terms" className="text-primary-600 hover:text-primary-700 underline">
              Terms and Conditions
            </Link>
            {" "}and{" "}
            <Link to="/refund" className="text-primary-600 hover:text-primary-700 underline">
              Refund Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </PublicPageLayout>
  );
}
