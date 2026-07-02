import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Scale } from 'lucide-react';

const TermsConditions = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 font-sans selection:bg-zinc-200 dark:selection:bg-zinc-800 overflow-x-hidden transition-colors duration-300 flex flex-col justify-between">
      <div>
        <Navbar variant="app" />

        <section className="pt-36 pb-24 px-6 max-w-3xl mx-auto">
          {/* Header */}
          <div className="flex items-center space-x-3.5 mb-8 pb-6 border-b border-zinc-200 dark:border-zinc-900">
            <div className="p-3 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl">
              <Scale className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-950 dark:text-white">
                Terms & Conditions
              </h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-bold uppercase mt-1">
                Last Updated: June 2026
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-10 text-zinc-650 dark:text-zinc-450 leading-relaxed text-sm sm:text-base font-medium">
            <p>
              Welcome to <strong>InterviewQuest</strong>. By accessing or using our website, you agree to comply with and be bound by the following terms and conditions. Please read them carefully.
            </p>

            {/* Section 1 */}
            <div className="space-y-3">
              <h2 className="text-lg sm:text-xl font-extrabold text-zinc-950 dark:text-white">
                1. Acceptance of Terms
              </h2>
              <p>
                By registering an account, viewing study materials, or completing assessments on InterviewQuest, you agree to these Terms and Conditions. If you do not agree, you must immediately cease using the platform.
              </p>
            </div>

            {/* Section 2 */}
            <div className="space-y-3">
              <h2 className="text-lg sm:text-xl font-extrabold text-zinc-950 dark:text-white">
                2. User Account Responsibility
              </h2>
              <p>
                To access certain features, you must register an account. You are responsible for:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-sm">
                <li>Maintaining the confidentiality of your account credentials.</li>
                <li>All activities that occur under your account.</li>
                <li>Providing accurate and complete registration details.</li>
              </ul>
            </div>

            {/* Section 3 */}
            <div className="space-y-3">
              <h2 className="text-lg sm:text-xl font-extrabold text-zinc-950 dark:text-white">
                3. Acceptable Use Policy
              </h2>
              <p>
                You agree not to use the platform in any way that causes damage, interrupts availability, or violates local laws. Specifically, you agree not to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-sm">
                <li>Attempt to scrape, copy, or redistribute study syllabus contents without permission.</li>
                <li>Abuse the AI mock interview system by sending spam, offensive material, or excessive requests.</li>
                <li>Use automated scripts or bots to attempt quizzes or manipulate score statistics.</li>
              </ul>
            </div>

            {/* Section 4 */}
            <div className="space-y-3">
              <h2 className="text-lg sm:text-xl font-extrabold text-zinc-950 dark:text-white">
                4. Intellectual Property
              </h2>
              <p>
                All study modules, questions, explanations, graphics, and codebase are the intellectual property of InterviewQuest, unless otherwise stated. You are granted a limited, non-transferable license to access the materials for personal, non-commercial educational use.
              </p>
            </div>

            {/* Section 5 */}
            <div className="space-y-3">
              <h2 className="text-lg sm:text-xl font-extrabold text-zinc-950 dark:text-white">
                5. Disclaimer of Warranties
              </h2>
              <p>
                InterviewQuest is provided "as is" without any warranties of any kind, express or implied. While we strive for absolute accuracy in our study guides and quiz explanations, we do not warrant that all content is free of errors or that the service will be uninterrupted.
              </p>
            </div>

            {/* Section 6 */}
            <div className="space-y-3">
              <h2 className="text-lg sm:text-xl font-extrabold text-zinc-950 dark:text-white">
                6. Modifications to Terms
              </h2>
              <p>
                We reserve the right to modify these terms at any time. Any updates will be posted on this page with an updated "Last Updated" date. Continued use of the platform after changes constitutes acceptance of the new terms.
              </p>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default TermsConditions;
