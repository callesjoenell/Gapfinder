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
    question: "What is Start Building Now?",
    answer:
      "Start Building Now is an AI-guided platform that helps you discover what to build and validate whether your business idea is worth pursuing. Through structured conversations, it surfaces insights from your unique background, experiences, and networks — so you end up with an idea that only you can deliver.",
  },
  {
    question: "How does the Explore path work?",
    answer:
      "The Explore path is for people who aren't sure what to build yet. You start a conversation and the AI guides you through a series of phases — uncovering your talents, life experience, professional connections, and the problems you're best positioned to solve. By the end, you have a clear picture of opportunity spaces uniquely suited to you.",
  },
  {
    question: "How does the Evaluate path work?",
    answer:
      "The Evaluate path is for people who already have an idea and want to stress-test it. The AI walks you through a structured evaluation: mapping your idea against real human problems, emotional opportunities, and market gaps. You come out the other side with a sharper, stronger version of your concept — or clarity that it needs rethinking.",
  },
  {
    question: "Is it free?",
    answer:
      "Yes — your first Explore conversation and your first Evaluate conversation are completely free. After that, additional sessions are available for a one-time fee. Pricing starts low and increases over time, so the earlier you start, the better the deal.",
  },
  {
    question: "How is pricing determined?",
    answer:
      "Paid sessions are priced at a one-time fee that doubles weekly from our launch date. Early adopters get the best price. Once you pay for a session, that session is yours — there are no subscriptions or recurring charges.",
  },
  {
    question: "Is my data private and secure?",
    answer:
      "Yes. Your conversations are stored securely and are private to your account. We do not sell or share your conversation data with third parties. You can request deletion of your data at any time by contacting us.",
  },
  {
    question: "Can I come back to my conversation later?",
    answer:
      "Absolutely. Every session is persistent — you can pick up exactly where you left off, no matter how much time has passed. Your conversation history, progress through phases, and insights are all saved to your account.",
  },
  {
    question: "Who built this?",
    answer:
      "Start Building Now was built by a solo founder who wanted a better way to answer the question: \"Now that I can build anything, what should I build?\" It's designed to be the thinking partner you wish you had at the start of every new venture.",
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
            Everything you need to know about Start Building Now.
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
