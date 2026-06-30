import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { BookOpen, Award, Sparkles, Target } from 'lucide-react';

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 font-sans selection:bg-zinc-200 dark:selection:bg-zinc-800 overflow-x-hidden transition-colors duration-300 flex flex-col justify-between">
      <div>
        {/* HEADER NAVBAR */}
        <Navbar variant="app" />

        {/* HERO SECTION */}
        <section className="pt-36 pb-16 px-6 max-w-4xl mx-auto text-center relative">
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-72 h-72 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl -z-10" />
          
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-550/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 mb-6 uppercase tracking-wider">
            <Sparkles className="w-3 h-3" /> About InterviewQuest
          </span>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight mb-6 text-zinc-950 dark:text-white leading-[1.15]">
            Empowering the Next Generation of <span className="text-indigo-600 dark:text-indigo-400">Software Engineers</span>
          </h1>

          <p className="text-zinc-650 dark:text-zinc-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            We believe that mastering core computer science fundamentals shouldn't be gated behind convoluted resources. Our platform provides structured study guides, timed assessments, and AI-powered feedback to help you succeed in your technical journey.
          </p>
        </section>

        {/* PILLARS / FEATURES */}
        <section className="pb-24 px-6 max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Pillar 1 */}
            <div className="bg-zinc-50 dark:bg-[#0d0d11] border border-zinc-200 dark:border-zinc-900 rounded-2xl p-8 hover:border-zinc-300 dark:hover:border-zinc-800 transition-all duration-200 group">
              <div className="inline-flex p-3 rounded-xl bg-white dark:bg-zinc-900 text-indigo-605 dark:text-indigo-400 border border-zinc-200 dark:border-zinc-800 mb-6 group-hover:scale-105 transition-transform shadow-sm">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-zinc-950 dark:text-white mb-3">Core Syllabus</h3>
              <p className="text-zinc-550 dark:text-zinc-400 text-sm leading-relaxed">
                Dive deep into Operating Systems, Database Management, Computer Networks, and key software architectures with curated guides.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="bg-zinc-50 dark:bg-[#0d0d11] border border-zinc-200 dark:border-zinc-900 rounded-2xl p-8 hover:border-zinc-300 dark:hover:border-zinc-800 transition-all duration-200 group">
              <div className="inline-flex p-3 rounded-xl bg-white dark:bg-zinc-900 text-indigo-605 dark:text-indigo-400 border border-zinc-200 dark:border-zinc-800 mb-6 group-hover:scale-105 transition-transform shadow-sm">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-zinc-955 dark:text-white mb-3">Interactive Quizzes</h3>
              <p className="text-zinc-550 dark:text-zinc-400 text-sm leading-relaxed">
                Test your knowledge retention with timed assessments tailored to specific subjects or mixed topics for a realistic challenge.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="bg-zinc-50 dark:bg-[#0d0d11] border border-zinc-200 dark:border-zinc-900 rounded-2xl p-8 hover:border-zinc-300 dark:hover:border-zinc-800 transition-all duration-200 group">
              <div className="inline-flex p-3 rounded-xl bg-white dark:bg-zinc-900 text-indigo-605 dark:text-indigo-400 border border-zinc-200 dark:border-zinc-800 mb-6 group-hover:scale-105 transition-transform shadow-sm">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-zinc-955 dark:text-white mb-3">AI Mock Interviews</h3>
              <p className="text-zinc-550 dark:text-zinc-400 text-sm leading-relaxed">
                Refine your communication and technical explanation skills using our interactive, voice/text AI interviewer.
              </p>
            </div>
          </div>
        </section>

        {/* MISSION & VISION */}
        <section className="py-20 bg-zinc-50 dark:bg-[#0c0c0e] border-t border-b border-zinc-200 dark:border-zinc-900 px-6">
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-black tracking-tight text-zinc-950 dark:text-white mb-4">
                Why InterviewQuest?
              </h2>
              <p className="text-zinc-650 dark:text-zinc-400 text-sm sm:text-base leading-relaxed mb-4">
                Most platforms focus heavily on coding puzzles, leaving computer science theory and system design concepts overlooked. Yet, these are the very topics that top-tier companies test to evaluate your foundational understanding.
              </p>
              <p className="text-zinc-650 dark:text-zinc-400 text-sm sm:text-base leading-relaxed">
                InterviewQuest bridges this gap by providing a modern, immersive studying workspace that simulates actual interview questions and tests your limits.
              </p>
            </div>
            <div className="relative rounded-2xl overflow-hidden aspect-video border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center p-8">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-transparent" />
              <div className="text-center space-y-2 z-10">
                <div className="text-4xl font-extrabold text-indigo-600 dark:text-indigo-400">100%</div>
                <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Free & Open Source Study Curriculum</div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* FOOTER */}
      <Footer />
    </div>
  );
};

export default AboutUs;
