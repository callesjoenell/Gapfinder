import { useEffect } from "react";
import { PublicPageLayout } from "../layout/PublicPageLayout";

export function ContactPage() {
  useEffect(() => {
    document.title = "Contact | What To Build";
  }, []);

  return (
    <PublicPageLayout>
      <div className="max-w-2xl mx-auto px-6 py-16">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Get in Touch</h1>
          <p className="text-gray-600 leading-relaxed mb-4">
            Have a question, found a bug, or just want to share how your building journey
            is going? We'd love to hear from you.
          </p>
          <p className="text-gray-600 leading-relaxed mb-8">
            We read every message and typically respond within one business day.
          </p>
          {/* TODO: replace with actual email */}
          <a
            href="mailto:hello@startbuildingnow.com"
            className="inline-flex items-center px-6 py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors"
          >
            Send us an email
          </a>
          <div className="mt-8 pt-8 border-t border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Other ways to reach us</h2>
            <p className="text-gray-600 leading-relaxed">
              For urgent issues with your account or a session, email is the fastest way
              to reach us. We don't currently have a support ticket system — a direct
              email gets you a direct answer.
            </p>
          </div>
        </div>
      </div>
    </PublicPageLayout>
  );
}
