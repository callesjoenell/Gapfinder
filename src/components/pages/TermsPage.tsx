import { useEffect } from "react";
import { Link } from "react-router-dom";
import { PublicPageLayout } from "../layout/PublicPageLayout";

export function TermsPage() {
  useEffect(() => {
    document.title = "Terms and Conditions | Start Building Now";
  }, []);

  return (
    <PublicPageLayout>
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Terms and Conditions
          </h1>
          <p className="text-sm text-gray-400">Last updated: March 2026</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
          <p className="text-gray-600 leading-relaxed">
            These terms govern your use of Start Building Now (whattobuild.app), a SaaS product
            operated by Skip Intro AB, a company registered in Sweden. By using the service, you
            agree to these terms.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. The Service</h2>
          <p className="text-gray-600 leading-relaxed">
            Start Building Now provides AI-guided methodology for business idea validation. The
            service includes conversational sessions, research tools, and scoring frameworks
            delivered through a web application.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Accounts and Access</h2>
          <p className="text-gray-600 leading-relaxed">
            You must create an account to use the service. You are responsible for maintaining
            the confidentiality of your account. We reserve the right to suspend or terminate
            accounts that violate these terms.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Payments and Refunds</h2>
          <p className="text-gray-600 leading-relaxed">
            Paid sessions are charged at the price displayed at checkout. Prices may change over
            time. All payments are processed through Stripe. For refund terms, see our{" "}
            <Link to="/refund" className="text-primary-600 hover:text-primary-700 underline">
              Refund Policy
            </Link>
            .
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Intellectual Property</h2>
          <p className="text-gray-600 leading-relaxed">
            The service, including its methodology, design, and code, is the intellectual property
            of Skip Intro AB. Content you create during sessions (your ideas, notes, and
            conversation history) belongs to you. We do not claim ownership of your content.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. AI-Generated Content</h2>
          <p className="text-gray-600 leading-relaxed">
            The service uses AI to facilitate conversations. AI responses are guides, not
            professional advice. We do not guarantee the accuracy, completeness, or suitability
            of AI-generated content for any particular purpose. You are responsible for your
            own business decisions.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Limitation of Liability</h2>
          <p className="text-gray-600 leading-relaxed">
            To the maximum extent permitted by law, Skip Intro AB shall not be liable for any
            indirect, incidental, special, consequential, or punitive damages, or any loss of
            profits or revenues, whether incurred directly or indirectly. Our total liability
            for any claim arising from the service shall not exceed the amount you paid us in
            the 12 months preceding the claim.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Termination</h2>
          <p className="text-gray-600 leading-relaxed">
            You may stop using the service at any time. We may suspend or terminate your access
            if you violate these terms or engage in abusive behavior. Upon termination, your
            right to use the service ceases. Your conversation data may be retained for a
            reasonable period per our data practices.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Changes to Terms</h2>
          <p className="text-gray-600 leading-relaxed">
            We may update these terms from time to time. Continued use of the service after
            changes constitutes acceptance. We will notify users of material changes.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Governing Law and Disputes</h2>
          <p className="text-gray-600 leading-relaxed">
            These terms are governed by the laws of Sweden. Any disputes shall be resolved in
            the courts of Sweden.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Contact</h2>
          <p className="text-gray-600 leading-relaxed">
            Questions about these terms?{" "}
            <Link to="/contact" className="text-primary-600 hover:text-primary-700 underline">
              Contact us
            </Link>{" "}
            and we will be happy to help.
          </p>
        </div>
      </div>
    </PublicPageLayout>
  );
}
