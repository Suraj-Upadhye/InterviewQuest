import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowRight, BookOpen, Brain, Code, Compass, ShieldCheck, 
  Users, Building2, Star, CheckCircle, Menu, X, ArrowUpRight 
} from 'lucide-react';

const LandingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Smooth scroll helper
  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const features = [
    {
      title: "AI Mock Interviews",
      desc: "Simulate real-world technical and behavioral rounds with our Groq AI engine. Get immediate scorecards and actionable improvement feedback.",
      icon: Brain,
      color: "from-purple-500 to-indigo-500",
      accent: "text-purple-400"
    },
    {
      title: "Placement Experiences",
      desc: "Search through structured, stage-wise interview experiences shared by seniors. Learn exactly what recruiters ask in each round.",
      icon: Compass,
      color: "from-amber-500 to-orange-500",
      accent: "text-amber-400"
    },
    {
      title: "Skill Assessments",
      desc: "Test your skills under placement-like timed conditions. Complete assessments with auto-grading and detailed explanations.",
      icon: BookOpen,
      color: "from-emerald-500 to-teal-500",
      accent: "text-emerald-400"
    },
    {
      title: "Topic Practice",
      desc: "Master computer science fundamentals (DSA, DBMS, OS, Computer Networks) with our curated practice modules.",
      icon: Code,
      color: "from-blue-500 to-cyan-500",
      accent: "text-blue-400"
    }
  ];

  const stats = [
    { value: "10K+", label: "MCQ Questions Solved" },
    { value: "50+", label: "Tracked Recruiters" },
    { value: "98%", label: "Placement Rate" },
    { value: "2,000+", label: "Mock Interviews Conducted" }
  ];

  const testimonials = [
    {
      name: "Ananya Sharma",
      role: "Software Engineer @ Microsoft",
      review: "The stage-wise interview experiences helped me prepare exactly what Microsoft looked for in their technical rounds. The AI chatbot is an incredible preparation companion!",
      rating: 5
    },
    {
      name: "Rohit Verma",
      role: "Associate Developer @ Amazon",
      review: "Willingly practicing timed tests on DB systems and OS protocols under the Skill Assessments tab removed my exam-day pressure. Highly recommend InterviewQuest!",
      rating: 5
    },
    {
      name: "Siddharth Sen",
      role: "Cloud Engineer @ Google",
      review: "Conducting mock behavioral tests with the Groq AI evaluator pinpointed my resume gaps. Getting placed at Google was possible because of this platform.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30 overflow-x-hidden relative">
      {/* Background decorations */}
      <div className="absolute top-[5%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/5 blur-[150px] pointer-events-none" />
      <div className="absolute top-[40%] left-[-15%] w-[50%] h-[50%] rounded-full bg-purple-500/5 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[5%] right-[-5%] w-[45%] h-[45%] rounded-full bg-rose-500/5 blur-[150px] pointer-events-none" />

      {/* HEADER NAVBAR */}
      <header className="fixed top-0 inset-x-0 bg-slate-950/70 backdrop-blur-xl border-b border-slate-900 z-50 transition-all duration-300">
        <div className="max-w-6xl mx-auto px-6 h-20 flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center space-x-2.5 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <ShieldCheck className="w-5.5 h-5.5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent tracking-tight">
              InterviewQuest
            </span>
          </div>

          {/* Desktop Nav links */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-400">
            <button onClick={() => scrollToSection('features')} className="hover:text-slate-200 transition cursor-pointer">Features</button>
            <button onClick={() => scrollToSection('stats')} className="hover:text-slate-200 transition cursor-pointer">Statistics</button>
            <button onClick={() => scrollToSection('testimonials')} className="hover:text-slate-200 transition cursor-pointer">Success Stories</button>
          </nav>

          {/* Action CTAs */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition cursor-pointer shadow-md shadow-indigo-950/20"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="text-xs font-semibold text-slate-350 hover:text-white px-4 py-2 rounded-xl transition cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition cursor-pointer shadow-md"
                >
                  Get Started
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-white transition cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu expanded */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-950 border-b border-slate-900 px-6 py-6 space-y-4 animate-fadeIn">
            <button
              onClick={() => scrollToSection('features')}
              className="block w-full text-left text-sm text-slate-400 hover:text-white py-2 cursor-pointer"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection('stats')}
              className="block w-full text-left text-sm text-slate-400 hover:text-white py-2 cursor-pointer"
            >
              Statistics
            </button>
            <button
              onClick={() => scrollToSection('testimonials')}
              className="block w-full text-left text-sm text-slate-400 hover:text-white py-2 cursor-pointer"
            >
              Success Stories
            </button>
            <div className="pt-4 border-t border-slate-900 flex flex-col space-y-3">
              {user ? (
                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full text-center py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Go to Dashboard
                </button>
              ) : (
                <>
                  <button
                    onClick={() => navigate('/login')}
                    className="w-full text-center py-2.5 bg-slate-900 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer border border-slate-800"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => navigate('/register')}
                    className="w-full text-center py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Get Started
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* HERO SECTION */}
      <section className="pt-36 pb-20 px-6 max-w-6xl mx-auto flex flex-col items-center text-center z-10 relative">
        {/* Sub-label banner */}
        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold tracking-wide mb-6">
          <Star className="w-3.5 h-3.5 fill-indigo-400" />
          <span>Central Placement Preparation Platform</span>
        </div>

        {/* Hero title */}
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6 max-w-3xl leading-[1.15]">
          Master Your Career Journey with{" "}
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-rose-400 bg-clip-text text-transparent">
            InterviewQuest
          </span>
        </h1>

        {/* Hero description */}
        <p className="text-slate-400 text-base sm:text-lg max-w-2xl leading-relaxed mb-10">
          Simulate adaptive AI technical rounds, practice coding concepts, review historical placement questions, and stand out in corporate recruiting events.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
          {user ? (
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3.5 rounded-2xl font-semibold shadow-lg shadow-indigo-600/20 transition cursor-pointer hover:-translate-y-0.5 duration-200"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <>
              <button
                onClick={() => navigate('/register')}
                className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3.5 rounded-2xl font-semibold shadow-lg shadow-indigo-600/20 transition cursor-pointer hover:-translate-y-0.5 duration-200"
              >
                <span>Get Started Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => scrollToSection('features')}
                className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-slate-900/60 border border-slate-800 hover:border-slate-700 text-slate-350 hover:text-white px-8 py-3.5 rounded-2xl font-semibold transition cursor-pointer duration-200"
              >
                <span>Explore Features</span>
              </button>
            </>
          )}
        </div>
      </section>

      {/* STATS SECTION */}
      <section id="stats" className="py-16 bg-slate-900/20 border-y border-slate-900 relative z-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center">
                <p className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                  {stat.value}
                </p>
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-2">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES BENTO SECTION */}
      <section id="features" className="py-24 max-w-6xl mx-auto px-6 z-10 relative">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-bold mb-4 tracking-tight">Structured Prep, Proven Success</h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            Every module is designed to cover essential topics and concepts tested by top product and service-based tech recruiters.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div 
                key={idx}
                className="bg-slate-900/40 border border-slate-900 hover:border-slate-800/80 rounded-3xl p-8 hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/5 transition-all duration-300 group flex flex-col justify-between"
              >
                <div>
                  <div className={`inline-flex p-3.5 rounded-2xl bg-gradient-to-br ${feat.color} text-white mb-6 shadow-md transition group-hover:scale-105`}>
                    <Icon className="w-5.5 h-5.5" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-100 mb-3 group-hover:text-indigo-400 transition">
                    {feat.title}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-6">
                    {feat.desc}
                  </p>
                </div>
                <button 
                  onClick={() => navigate(user ? `/${feat.title.toLowerCase().replace(' ', '-')}` : '/login')}
                  className={`inline-flex items-center text-xs font-semibold ${feat.accent} hover:underline cursor-pointer`}
                >
                  <span>Launch Module</span>
                  <ArrowUpRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* TESTIMONIALS SLIDER SECTION */}
      <section id="testimonials" className="py-24 bg-slate-900/10 border-t border-slate-900 z-10 relative">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4 tracking-tight">Cracked by Seniors</h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              Read how candidates cracked their dream placements utilizing the placement experiences and mock interview setups.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((test, idx) => (
              <div 
                key={idx} 
                className="bg-slate-900/30 border border-slate-900 p-6.5 rounded-3xl flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center space-x-1 text-amber-400 mb-4">
                    {[...Array(test.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-slate-400 text-xs sm:text-sm leading-relaxed italic mb-6">
                    "{test.review}"
                  </p>
                </div>
                <div className="flex items-center space-x-3 border-t border-slate-900 pt-4">
                  <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-indigo-400 text-xs">
                    {test.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-200">{test.name}</h4>
                    <p className="text-[10px] text-slate-500">{test.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA SECTION */}
      <section className="py-24 max-w-4xl mx-auto px-6 text-center z-10 relative">
        <div className="bg-gradient-to-r from-indigo-900/30 via-purple-900/10 to-rose-900/10 border border-slate-900 rounded-3xl p-8 sm:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl" />
          <h2 className="text-2xl sm:text-4xl font-bold mb-4 tracking-tight">Ready to Land Your Dream Offer?</h2>
          <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed mb-8">
            Join candidates preparing for assessments, practice interviews, and building detailed profiles today.
          </p>
          <button 
            onClick={() => navigate(user ? '/dashboard' : '/register')}
            className="inline-flex items-center justify-center space-x-2 bg-white hover:bg-slate-200 text-slate-950 font-bold px-7 py-3.5 rounded-2xl transition cursor-pointer hover:shadow-xl hover:shadow-white/5"
          >
            <span>{user ? 'Go to Dashboard' : 'Create Free Account'}</span>
            <ArrowRight className="w-4 h-4 text-slate-950" />
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-900 py-10 text-center text-xs text-slate-600 relative z-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center font-bold text-white text-[10px]">IQ</div>
            <span className="font-semibold text-slate-400">InterviewQuest</span>
          </div>
          <p>&copy; {new Date().getFullYear()} InterviewQuest. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
