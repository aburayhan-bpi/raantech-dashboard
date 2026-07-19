"use client";

import { motion } from "framer-motion";
import { FileText, ShieldCheck } from "lucide-react";

export default function PolicyTab() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full flex flex-col gap-6"
    >
      {/* Privacy Policy Card */}
      <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 flex flex-col w-full max-w-2xl mx-auto shadow-sm text-muted-foreground text-sm leading-relaxed">
        <div className="flex items-center gap-3 mb-6">
          <ShieldCheck className="w-5 h-5 text-foreground" />
          <h2 className="text-xl font-semibold text-foreground">
            Privacy Policy
          </h2>
        </div>

        <div className="flex flex-col gap-6">
          <p>Last Updated: June 2026</p>
          <p>
            Welcome to Will Knowledge. We respect your privacy and are committed
            to protecting your personal information.
          </p>

          <div className="flex flex-col gap-2">
            <h3 className="text-foreground font-medium">1. Information We Collect</h3>
            <p>We may collect:</p>
            <ul className="list-disc pl-5 flex flex-col gap-1">
              <li>Name and email address</li>
              <li>Account information</li>
              <li>Subscription details</li>
              <li>Usage activity</li>
              <li>Device and technical information</li>
              <li>Trading preferences and watchlist data</li>
            </ul>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="text-foreground font-medium">2. How We Use Your Information</h3>
            <p>We use your information to:</p>
            <ul className="list-disc pl-5 flex flex-col gap-1">
              <li>Provide and improve our services</li>
              <li>Personalize your dashboard experience</li>
              <li>Manage your account</li>
              <li>Send alerts and notifications</li>
              <li>Process subscriptions and payments</li>
              <li>Improve platform performance</li>
            </ul>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="text-foreground font-medium">3. Data Security</h3>
            <p>
              We use reasonable security measures to protect your information from
              unauthorized access, misuse, or disclosure.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="text-foreground font-medium">4. Trading Data</h3>
            <p>
              Will Knowledge provides market analysis tools, indicators, and
              insights. We do not guarantee trading results or financial
              outcomes.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="text-foreground font-medium">5. Third-Party Services</h3>
            <p>We may use third-party services for:</p>
            <ul className="list-disc pl-5 flex flex-col gap-1">
              <li>Payment processing</li>
              <li>Market data</li>
              <li>Analytics</li>
              <li>Authentication</li>
            </ul>
            <p className="mt-2">
              These services may collect information according to their own
              privacy policies.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="text-foreground font-medium">6. Your Rights</h3>
            <p>You may:</p>
            <ul className="list-disc pl-5 flex flex-col gap-1">
              <li>Update your account information</li>
              <li>Manage notifications</li>
              <li>Request account deletion</li>
              <li>Contact us regarding privacy concerns</li>
            </ul>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="text-foreground font-medium">7. Contact Us</h3>
            <p>
              If you have any questions about this Privacy Policy, please contact
              us.
            </p>
          </div>
        </div>
      </div>

      {/* Term & Conditions Card */}
      <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 flex flex-col w-full max-w-2xl mx-auto shadow-sm text-muted-foreground text-sm leading-relaxed">
        <div className="flex items-center gap-3 mb-6">
          <FileText className="w-5 h-5 text-foreground" />
          <h2 className="text-xl font-semibold text-foreground">
            Term & Conditions
          </h2>
        </div>

        <div className="flex flex-col gap-6">
          <p>Last Updated: June 2026</p>
          <p>
            Welcome to Will Knowledge. By using our platform, you agree to these
            Terms & Conditions.
          </p>

          <div className="flex flex-col gap-2">
            <h3 className="text-foreground font-medium">1. Platform Usage</h3>
            <p>
              Will Knowledge provides AI-assisted market analysis, trading
              insights, alerts, and educational tools.
            </p>
            <p>
              Users must use the platform responsibly and follow applicable laws.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="text-foreground font-medium">2. No Financial Advice</h3>
            <p>
              The information provided by Will Knowledge is for educational and
              informational purposes only.
            </p>
            <p>
              We do not provide financial advice, investment recommendations, or
              guarantees of profit.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="text-foreground font-medium">3. Account Responsibilities</h3>
            <p>Users are responsible for:</p>
            <ul className="list-disc pl-5 flex flex-col gap-1">
              <li>Keeping account credentials secure</li>
              <li>Maintaining accurate information</li>
              <li>All activities performed through their account</li>
            </ul>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="text-foreground font-medium">4. Subscription & Payments</h3>
            <p>Premium features may require a paid subscription.</p>
            <p>
              Subscriptions may automatically renew unless canceled according to
              the subscription terms.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="text-foreground font-medium">5. Data Accuracy</h3>
            <p>
              Market information and analysis may come from third-party sources.
              While we aim for accuracy, we do not guarantee that all
              information is complete or error free.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="text-foreground font-medium">6. Prohibited Activities</h3>
            <p>Users may not:</p>
            <ul className="list-disc pl-5 flex flex-col gap-1">
              <li>Misuse the platform</li>
              <li>Attempt unauthorized access</li>
              <li>Copy or distribute platform content without permission</li>
            </ul>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="text-foreground font-medium">7. Limitation of Liability</h3>
            <p>
              Will Knowledge is not responsible for financial losses, trading
              decisions, or outcomes based on platform information.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="text-foreground font-medium">8. Changes to Terms</h3>
            <p>
              We may update these Terms & Conditions from time to time. Continued
              use of the platform means you accept the updated terms.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="text-foreground font-medium">Contact</h3>
            <p>
              For questions regarding these terms, please contact our support
              team.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
