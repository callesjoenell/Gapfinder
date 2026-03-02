import { useEffect, useState } from "react";
import { PublicPageLayout } from "../layout/PublicPageLayout";

interface FAQItemProps {
  question: string;
  answer: string;
}

function FAQItem({ question, answer }: FAQItemProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-gray-100 py-4">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between text-left font-medium text-gray-900"
      >
        {question}
        <span className="ml-4 flex-shrink-0 text-gray-400 text-lg">{open ? "−" : "+"}</span>
      </button>
      {open && (
        <p className="mt-3 text-gray-600 leading-relaxed">{answer}</p>
      )}
    </div>
  );
}

const FAQ_ITEMS: FAQItemProps[] = [
  {
    question: "How is this different from just chatting with an AI?",
    answer:
      "An AI without the right context, framework, and questioning methodology just tells you what you want to hear. It validates instead of challenges, generates generic lists instead of digging deep, and has no way to score whether an idea is actually worth pursuing. Start Building Now is built on proven frameworks — MILES, Ikigai, the Mom Test, Jobs to Be Done — that ask the questions you wouldn't think to ask yourself. During exploration, it pulls live signals from Reddit, Hacker News, Product Hunt, Stack Overflow, and general web search, then scores what it finds against your personal unfair advantages using depth, access, and energy metrics. Progress is gated on real evidence, not optimistic assumptions. You discover insights yourself through guided questions — the AI never generates ideas for you. The AI is the delivery mechanism. The methodology and research are what make it work.",
  },
  {
    question: "What is Start Building Now?",
    answer:
      "Start Building Now is an AI-guided platform that walks you through a proven, multi-phase process to either discover what to build (Explore path) or validate whether your existing idea is worth pursuing (Evaluate path). Each phase has specific frameworks, research tools, and completion criteria — it's closer to working with a structured coaching program than having a freeform conversation.",
  },
  {
    question: "How does the Explore path work?",
    answer:
      "The Explore path takes you through three phases. Phase 0 (Know Yourself) uses the MILES framework — Money, Intelligence/Insight, Location/Luck, Education/Expertise, Status — combined with Ikigai (the Japanese concept of purpose at the intersection of passion, skill, demand, and market) to excavate your unfair advantages and score them on depth, access, and energy. Phase 1 (Find Gaps) researches your strongest domains for real problems people have, using live data from Reddit, Hacker News, Product Hunt, and more. Phase 2 (Research) validates what you found using Mom Test principles: past behavior over future promises, real evidence over opinions. By the end, you have opportunity spaces grounded in who you actually are — not random ideas.",
  },
  {
    question: "How does the Evaluate path work?",
    answer:
      "The Evaluate path takes your idea through seven rigorous phases. You crystallize your idea (Phase 3), define specific customers using Jobs to Be Done switch-moment analysis (Phase 4), validate the problem through real conversations using Mom Test methodology (Phase 5), design your MVP (Phase 6), score viability across six dimensions (Phase 7), stress-test weaknesses with devil's advocate challenges (Phase 8), and create an actionable launch plan (Phase 9). Each phase has gated completion criteria — you can't skip ahead without evidence.",
  },
  {
    question: "What frameworks and research is this based on?",
    answer:
      "The methodology draws from multiple validated sources: the MILES framework (Ash Ali & Hasan Kubba, \"The Unfair Advantage\") for identifying personal advantages, Ikigai — the Japanese concept of finding purpose at the intersection of passion, skill, demand, and market — for ensuring opportunities align with who you are, the Mom Test (Rob Fitzpatrick) for customer validation, Jobs to Be Done theory (Clayton Christensen) for understanding why people switch solutions, the Need Depth Ladder for measuring how urgently people need what you're building, NBER research on founder-market fit and venture survival rates, and Paul Graham's Y Combinator research on how the best startup ideas grow from founders' own experiences. These aren't decorative references — they're embedded in the conversation logic of every phase.",
  },
  {
    question: "What is the Need Depth Ladder?",
    answer:
      "The Need Depth Ladder is the core scoring framework. Every idea sits somewhere on a five-level spectrum: Curiosity (\"that's cool\"), Interest (\"I'd try that\"), Desire (\"I wish that existed\"), Seeking (\"I've been looking for this\"), and Urgency (\"I NEED this\"). Most ideas start at level 1-2 for a broad audience. The process helps you find the specific segment of people for whom your idea sits at level 4-5 — where the product doesn't change, but the person does. That's the difference between a nice-to-have and a must-have.",
  },
  {
    question: "Will the AI just generate ideas for me?",
    answer:
      "No — and that's by design. The system is explicitly built so that you discover insights yourself through guided questions, not receive lists from the AI. Research shows that founders who generate their own ideas have higher commitment and better outcomes than those handed suggestions. The AI asks \"what patterns do YOU notice?\" rather than \"here are ideas for you.\" At key phases, you synthesize your own conclusions. You'll say \"I discovered this\" — not \"Claude suggested this.\"",
  },
  {
    question: "Is it free?",
    answer:
      "Your first Explore conversation and your first Evaluate conversation are completely free. After that, additional sessions are available for a one-time fee. Pricing starts low and increases over time, so earlier adopters get the best price. Once you pay for a session, it's yours — no subscriptions or recurring charges.",
  },
  {
    question: "Does the process use real market data?",
    answer:
      "Yes. The Explore path includes built-in research tools that pull live signals from Reddit (pain points and complaints), Hacker News (builder sentiment), Product Hunt (existing solutions), Stack Overflow (technical problems people face), and general web search. It also applies a distribution-first framework: Deep Needs + Deep Pockets + Cheap Reach = Opportunity. The goal is to find ideas you can actually reach people with, not just ideas that sound good on paper.",
  },
  {
    question: "Can I come back to my conversation later?",
    answer:
      "Absolutely. Every session is persistent — you can pick up exactly where you left off, no matter how much time has passed. Your conversation history, progress through phases, and all insights are saved to your account.",
  },
  {
    question: "Is my data private and secure?",
    answer:
      "Yes. Your conversations are stored securely and are private to your account. We do not sell or share your conversation data with third parties. You can request deletion of your data at any time by contacting us.",
  },
];

export function FAQPage() {
  useEffect(() => {
    document.title = "FAQ | Start Building Now";
  }, []);

  return (
    <PublicPageLayout>
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Frequently Asked Questions
          </h1>
          <p className="text-gray-500 mb-8">
            How it works, what it's based on, and why it's not just another chatbot.
          </p>
          <div>
            {FAQ_ITEMS.map((item) => (
              <FAQItem key={item.question} question={item.question} answer={item.answer} />
            ))}
          </div>
        </div>
      </div>
    </PublicPageLayout>
  );
}
