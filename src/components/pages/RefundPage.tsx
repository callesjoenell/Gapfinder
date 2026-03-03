import { useEffect } from "react";
import { PublicPageLayout } from "../layout/PublicPageLayout";

export function RefundPage() {
  useEffect(() => {
    document.title = "Refund Policy | What To Build";
  }, []);

  return (
    <PublicPageLayout>
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Refund Policy
          </h1>
          <p className="text-sm text-gray-400">Last updated: March 2026</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">14-Day Money-Back Guarantee</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            If you are not satisfied with your purchase, you may request a full refund within
            14 days of payment. This applies to all paid sessions. No questions asked.
          </p>
          <p className="text-sm text-gray-500 leading-relaxed">
            The 14-day period is chosen to comply with the EU Consumer Rights Directive
            (Directive 2011/83/EU), which grants consumers a 14-day withdrawal period for
            digital services. This exceeds many national minimums and provides safe coverage
            across all markets.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">How to Request a Refund</h2>
          <p className="text-gray-600 leading-relaxed">
            Email us at{" "}
            <a
              href="mailto:hello@startbuildingnow.com"
              className="text-primary-600 hover:text-primary-700 underline"
            >
              hello@startbuildingnow.com
            </a>{" "}
            with your account email and we will process your refund within 5 business days.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">After the 14-Day Period</h2>
          <p className="text-gray-600 leading-relaxed">
            Refunds after 14 days are considered on a case-by-case basis. Contact us and we
            will do our best to help.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Governing Law</h2>
          <p className="text-gray-600 leading-relaxed">
            This refund policy is governed by Swedish law. Skip Intro AB is registered in Sweden.
          </p>
        </div>
      </div>
    </PublicPageLayout>
  );
}
