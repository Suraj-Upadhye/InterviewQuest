import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Shield } from 'lucide-react';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 font-sans selection:bg-zinc-200 dark:selection:bg-zinc-800 overflow-x-hidden transition-colors duration-300 flex flex-col justify-between">
      <div>
        <Navbar variant="app" />

        <section className="pt-36 pb-24 px-6 max-w-3xl mx-auto">
          {/* Header */}
          <div className="flex items-center space-x-3.5 mb-8 pb-6 border-b border-zinc-200 dark:border-zinc-900">
            <div className="p-3 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl">
              <Shield className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-950 dark:text-white">
                Privacy Policy
              </h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-bold uppercase mt-1">
                Last Updated: June 2026
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-10 text-zinc-650 dark:text-zinc-455 leading-relaxed text-sm sm:text-base font-medium">
            <p>
              At <strong>InterviewQuest</strong>, we value your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, and safeguard your information when you use our platform.
            </p>

            {/* Section 1 */}
            <div className="space-y-3">
              <h2 className="text-lg sm:text-xl font-extrabold text-zinc-950 dark:text-white">
                1. Information We Collect
              </h2>
              <p>
                We collect information to provide a personalized learning and assessment experience. This includes:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-sm">
                <li><strong>Account Information:</strong> Your username, email address, and hashed password created during registration.</li>
                <li><strong>Activity Data:</strong> Record of your study progress, quiz scores, attempt times, and answers.</li>
                <li><strong>Mock Interview Inputs:</strong> Text transcripts or audio responses submitted during AI mock interviews to generate feedback.</li>
              </ul>
            </div>

            {/* Section 2 */}
            <div className="space-y-3">
              <h2 className="text-lg sm:text-xl font-extrabold text-zinc-950 dark:text-white">
                2. How We Use Your Information
              </h2>
              <p>
                The information we collect is used solely for the following purposes:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-sm">
                <li>To maintain your account, track study progress, and display dashboard statistics.</li>
                <li>To process and evaluate your quiz submissions and provide detailed explanations.</li>
                <li>To generate AI-powered feedback and score recommendations for your mock interviews.</li>
                <li>To monitor and improve the performance and security of our platform.</li>
              </ul>
            </div>

            {/* Section 3 */}
            <div className="space-y-3">
              <h2 className="text-lg sm:text-xl font-extrabold text-zinc-950 dark:text-white">
                3. Data Security
              </h2>
              <p>
                We implement robust security measures to protect your personal information:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-sm">
                <li>All passwords are hashed using industry-standard hashing algorithms before being stored in the database.</li>
                <li>All data transmissions between your browser and our servers are encrypted using Secure Socket Layer (SSL) / Transport Layer Security (TLS).</li>
                <li>We restrict access to personal data to authorized administrators who need the information to manage the platform.</li>
              </ul>
            </div>

            {/* Section 4 */}
            <div className="space-y-3">
              <h2 className="text-lg sm:text-xl font-extrabold text-zinc-950 dark:text-white">
                4. Third-Party Integrations
              </h2>
              <p>
                We may share your mock interview responses with third-party Large Language Model (LLM) providers (such as OpenAI or Anthropic) solely for the purpose of generating evaluation feedback. We do not send your personal account details (like email or username) to these external services.
              </p>
            </div>

            {/* Section 5 */}
            <div className="space-y-3">
              <h2 className="text-lg sm:text-xl font-extrabold text-zinc-950 dark:text-white">
                5. Account Deletion and Rights
              </h2>
              <p>
                You have the right to access, update, or delete your account and associated history. If you wish to delete your account, you can contact us directly or use the profile settings. Upon deletion, all your quiz history and mock interview data will be permanently removed.
              </p>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default Privacy;
