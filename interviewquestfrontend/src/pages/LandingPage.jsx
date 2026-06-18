import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ArrowRight, Globe, Cpu, Database, Code, GitFork, Layers,
  Search, Sun, Moon, Menu, X, ArrowUpRight
} from 'lucide-react';

const LandingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef(null);

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') ||
      (document.documentElement.classList.contains('dark') ? 'dark' : 'light');
  });

  // Apply theme class to html element
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Handle Ctrl+K shortcut for Search Bar
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus input when search modal opens
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const subjects = [
    {
      title: "Operating System",
      desc: "Learn core architectural concepts including CPU scheduling algorithms, virtual memory, process execution, thread synchronization, and deadlocks.",
      icon: Cpu,
      link: "/practice?topic=OS"
    },
    {
      title: "Database Management Systems",
      desc: "Understand relational databases, SQL queries, transaction ACID rules, schema normalization, indexing, and storage engine mechanics.",
      icon: Database,
      link: "/practice?topic=DBMS"
    },
    {
      title: "Computer Networks",
      desc: "Analyze the standard network stack, protocol layers, routing operations, subnetting, TCP/IP fundamentals, and connection security.",
      icon: Globe,
      link: "/practice?topic=CN"
    },
    {
      title: "Object Oriented Programming",
      desc: "Grasp core paradigms including abstraction, inheritance, encapsulation, and polymorphism with structural concepts supporting Java, C++, and Python.",
      icon: GitFork,
      link: "/practice?topic=OOP"
    },
    {
      title: "Data Structures and Algorithms",
      desc: "Examine time and space complexity models, core structures, graph theory, sorting, searching, and algorithmic strategies (conceptual theory only).",
      icon: Code,
      link: "/practice?topic=DSA"
    }
  ];

  // Filter subjects based on query
  const filteredSubjects = subjects.filter(subj =>
    subj.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    subj.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearchResultClick = (link) => {
    setIsSearchOpen(false);
    setSearchQuery('');

    if (link.startsWith('#')) {
      const el = document.getElementById(link.substring(1));
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate(link);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 font-sans selection:bg-zinc-200 dark:selection:bg-zinc-800 overflow-x-hidden transition-colors duration-300">

      {/* HEADER NAVBAR */}
      <header className={`fixed top-6 inset-x-4 max-w-6xl mx-auto bg-white/70 dark:bg-[#09090b]/70 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-900/80 rounded-2xl md:rounded-full z-50 shadow-lg shadow-zinc-100/50 dark:shadow-none transition-all duration-300 ${mobileMenuOpen ? 'overflow-hidden' : ''}`}>
        <div className="px-6 md:px-8 h-16 flex justify-between items-center">

          {/* Logo */}
          <div
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <span className="text-xl sm:text-2xl font-black tracking-tight text-zinc-950 dark:text-white">
              InterviewQuest
            </span>
          </div>

          {/* Desktop Nav links */}
          <nav className="hidden md:flex items-center space-x-8 text-base font-bold text-zinc-600 dark:text-zinc-400">
            <button
              onClick={() => {
                const el = document.getElementById('subjects');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="hover:text-zinc-950 dark:hover:text-zinc-50 transition cursor-pointer"
            >
              Study Modules
            </button>
            <button
              onClick={() => navigate('/assessments')}
              className="hover:text-zinc-950 dark:hover:text-zinc-50 transition cursor-pointer"
            >
              Timed Tests
            </button>
            <button
              onClick={() => navigate('/mock-interview')}
              className="hover:text-zinc-950 dark:hover:text-zinc-50 transition cursor-pointer"
            >
              Mock Interviews
            </button>
          </nav>

          {/* Right Section Actions & Theme Toggle */}
          <div className="hidden md:flex items-center space-x-5">

            {/* Search Pill Input (Triggers Modal) */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center space-x-3 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full px-4 py-2 text-sm text-zinc-500 dark:text-zinc-400 w-44 justify-between hover:border-zinc-300 dark:hover:border-zinc-700 transition cursor-pointer"
            >
              <div className="flex items-center space-x-2">
                <Search className="w-4 h-4 text-zinc-400" />
                <span>Search</span>
              </div>
              <kbd className="bg-zinc-200 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-[10px] font-sans font-bold text-zinc-500">Ctrl K</kbd>
            </button>

            {/* Theme toggle switch */}
            <button
              onClick={toggleTheme}
              className="p-2.5 text-zinc-500 dark:text-zinc-450 hover:text-zinc-950 dark:hover:text-zinc-100 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition cursor-pointer"
              title="Change System Theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {user ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center space-x-2 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 text-sm font-bold px-5 py-2.5 rounded-lg hover:bg-zinc-850 dark:hover:bg-zinc-200 transition cursor-pointer"
              >
                <span>Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate('/register')}
                  className="text-sm font-bold text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-50 px-3 py-2.5 transition cursor-pointer"
                >
                  Sign Up
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 text-sm font-bold px-5 py-2.5 rounded-lg hover:bg-zinc-850 dark:hover:bg-zinc-200 transition cursor-pointer"
                >
                  Log In
                </button>
              </>
            )}
          </div>

          {/* Mobile Actions Header */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2.5 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              onClick={toggleTheme}
              className="p-2.5 text-zinc-500 dark:text-zinc-400 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition cursor-pointer"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu expanded */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white/95 dark:bg-[#09090b]/95 border-t border-zinc-200 dark:border-zinc-900 px-6 py-6 space-y-4 animate-fadeIn transition-colors duration-300">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                const el = document.getElementById('subjects');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="block w-full text-left text-base font-bold text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white py-2 cursor-pointer"
            >
              Study Modules
            </button>
            <button
              onClick={() => { setMobileMenuOpen(false); navigate('/assessments'); }}
              className="block w-full text-left text-base font-bold text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white py-2 cursor-pointer"
            >
              Timed Tests
            </button>
            <button
              onClick={() => { setMobileMenuOpen(false); navigate('/mock-interview'); }}
              className="block w-full text-left text-base font-bold text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white py-2 cursor-pointer"
            >
              Mock Interviews
            </button>
            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-900 flex flex-col space-y-3">
              {user ? (
                <button
                  onClick={() => { setMobileMenuOpen(false); navigate('/dashboard'); }}
                  className="w-full text-center py-3 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 rounded-lg text-sm font-bold cursor-pointer"
                >
                  Go to Dashboard
                </button>
              ) : (
                <>
                  <button
                    onClick={() => { setMobileMenuOpen(false); navigate('/login'); }}
                    className="w-full text-center py-3 bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 rounded-lg text-sm font-bold cursor-pointer border border-zinc-300 dark:border-zinc-800"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => { setMobileMenuOpen(false); navigate('/register'); }}
                    className="w-full text-center py-3 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 rounded-lg text-sm font-bold cursor-pointer"
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
      <section className="pt-40 pb-28 px-6 max-w-6xl mx-auto flex flex-col items-center text-center relative">
        {/* Sub-label banner */}
        <p className="text-zinc-500 dark:text-zinc-400 text-sm sm:text-base font-bold tracking-wide uppercase mb-6 max-w-xl">
          Core computer science studies and interactive evaluations
        </p>

        {/* Hero title */}
        <h1 className="text-6xl sm:text-8xl font-black tracking-tight mb-8 text-zinc-950 dark:text-white leading-[1.1] sm:leading-[1.12] max-w-4xl">
          <span className="block">Solidify your</span>
          <span className="block text-indigo-600 dark:text-indigo-400">technical</span>
          <span className="block">foundations</span>
        </h1>

        {/* Hero description */}
        <p className="text-zinc-600 dark:text-zinc-400 text-base sm:text-xl max-w-2xl leading-relaxed mb-12">
          Study comprehensive theoretical content across essential computer engineering disciplines. Gauge your recall with timed test assessments and interactive mock interviews.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-5 w-full sm:w-auto">
          {user ? (
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full sm:w-auto flex items-center justify-center space-x-2.5 bg-zinc-950 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 px-8 py-4 rounded-lg text-base font-bold shadow-sm transition duration-200 cursor-pointer"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <>
              <button
                onClick={() => navigate('/login')}
                className="w-full sm:w-auto flex items-center justify-center space-x-2.5 bg-zinc-950 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 px-8 py-4 rounded-lg text-base font-bold shadow-sm transition duration-200 cursor-pointer"
              >
                <span>Get Started Now</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => {
                  const el = document.getElementById('subjects');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full sm:w-auto flex items-center justify-center space-x-2.5 bg-white dark:bg-transparent border border-zinc-300 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 px-8 py-4 rounded-lg text-base font-bold transition duration-200 cursor-pointer"
              >
                <span>Explore Subjects</span>
              </button>
            </>
          )}
        </div>
      </section>

      {/* SUBJECTS SECTION */}
      <section id="subjects" className="py-24 border-t border-zinc-200 dark:border-zinc-900 max-w-6xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-4xl sm:text-5xl font-black mb-4 tracking-tight text-zinc-950 dark:text-white">
            Curriculum Topics
          </h2>
          <p className="text-base sm:text-lg text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
            A focused reference directory designed to verify candidate theoretical comprehension.
          </p>
        </div>

        {/* Subjects Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {subjects.map((subj, idx) => {
            const Icon = subj.icon;
            return (
              <div
                key={idx}
                className="bg-zinc-50 dark:bg-[#0d0d11] border border-zinc-200 dark:border-zinc-900 hover:border-zinc-400 dark:hover:border-zinc-700 rounded-xl p-8 transition-all duration-200 group flex flex-col justify-between"
              >
                <div>
                  <div className="inline-flex p-3 rounded-lg bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 mb-6 group-hover:border-zinc-400 dark:group-hover:border-zinc-600 transition shadow-sm">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white mb-3">
                    {subj.title}
                  </h3>
                  <p className="text-zinc-500 dark:text-zinc-400 text-sm sm:text-base leading-relaxed mb-8 font-medium">
                    {subj.desc}
                  </p>
                </div>
                <button
                  onClick={() => navigate(subj.link)}
                  className="inline-flex items-center text-sm font-bold text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white cursor-pointer group-hover:translate-x-0.5 transition-transform"
                >
                  <span>Launch Study</span>
                  <ArrowUpRight className="w-4 h-4 ml-1 text-zinc-400 group-hover:text-zinc-950 dark:group-hover:text-white transition" />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-zinc-200 dark:border-zinc-900 pt-16 pb-12 bg-white dark:bg-[#09090b]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">

            {/* Left Brand Col */}
            <div className="md:col-span-1 space-y-4">
              <span className="font-black text-xl text-zinc-950 dark:text-white">InterviewQuest</span>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
                Verifying academic skills through comprehensive computer science syllabus catalogs and speech simulator feedback models.
              </p>
            </div>

            {/* Link Cols */}
            <div>
              <h4 className="text-sm font-bold text-zinc-950 dark:text-white uppercase tracking-wider mb-4">Resources</h4>
              <ul className="space-y-2.5 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-semibold">
                <li><button onClick={() => navigate('/practice?topic=DSA')} className="hover:text-zinc-950 dark:hover:text-white transition cursor-pointer">DSA Theory</button></li>
                <li><button onClick={() => navigate('/practice')} className="hover:text-zinc-950 dark:hover:text-white transition cursor-pointer">CS Fundamentals</button></li>
                <li><button onClick={() => navigate('/assessments')} className="hover:text-zinc-950 dark:hover:text-white transition cursor-pointer">Assessment Suite</button></li>
                <li><button onClick={() => navigate('/mock-interview')} className="hover:text-zinc-950 dark:hover:text-white transition cursor-pointer">Mock Interviews</button></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-bold text-zinc-950 dark:text-white uppercase tracking-wider mb-4">Community</h4>
              <ul className="space-y-2.5 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-semibold">
                <li><a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-zinc-950 dark:hover:text-white transition">LinkedIn</a></li>
                <li><a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-zinc-950 dark:hover:text-white transition">GitHub</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-bold text-zinc-950 dark:text-white uppercase tracking-wider mb-4">Other</h4>
              <ul className="space-y-2.5 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-semibold">
                <li><button className="hover:text-zinc-950 dark:hover:text-white transition cursor-pointer">About Us</button></li>
                <li><button className="hover:text-zinc-950 dark:hover:text-white transition cursor-pointer">Contact Us</button></li>
                <li><button className="hover:text-zinc-950 dark:hover:text-white transition cursor-pointer">Privacy Policy</button></li>
                <li><button className="hover:text-zinc-950 dark:hover:text-white transition cursor-pointer">Terms & Conditions</button></li>
              </ul>
            </div>

          </div>

          {/* Bottom Bar with Copyright & Theme Toggle */}
          <div className="border-t border-zinc-200 dark:border-zinc-900 pt-8 flex flex-col sm:flex-row justify-center items-center gap-4 text-xs sm:text-sm text-zinc-500">
            <p>&copy; {new Date().getFullYear()} InterviewQuest. All rights reserved.</p>


          </div>
        </div>
      </footer>

      {/* FULLY FUNCTIONAL SEARCH MODAL */}
      {isSearchOpen && (
        <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm z-50 flex justify-center pt-24 px-4 transition-all duration-300">
          <div className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xl flex flex-col h-fit max-h-[70vh]">

            {/* Search Input Container */}
            <div className="relative flex items-center mb-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
              <Search className="absolute left-3 w-5 h-5 text-zinc-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search topics, exams, or assessments..."
                className="w-full pl-10 pr-10 py-3 text-base bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-zinc-300 dark:focus:border-zinc-700 transition"
              />
              <button
                onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }}
                className="absolute right-3 p-1 text-zinc-400 hover:text-zinc-950 dark:hover:text-white rounded-lg transition"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Results Window */}
            <div className="overflow-y-auto space-y-2 divide-y divide-zinc-100 dark:divide-zinc-800">
              {filteredSubjects.length > 0 ? (
                filteredSubjects.map((subj, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSearchResultClick(subj.link)}
                    className="pt-3 pb-2 px-3 hover:bg-zinc-100 dark:hover:bg-zinc-950 rounded-lg cursor-pointer transition flex justify-between items-center group"
                  >
                    <div>
                      <h4 className="text-sm sm:text-base font-bold text-zinc-950 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                        {subj.title}
                      </h4>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-semibold mt-0.5 line-clamp-1">
                        {subj.desc}
                      </p>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-950 dark:group-hover:text-white transition shrink-0 ml-4" />
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-zinc-500 dark:text-zinc-400 text-sm font-semibold">
                  No matching subjects or assessments found.
                </div>
              )}
            </div>

            {/* Keyboard tips info */}
            <div className="mt-4 pt-3 border-t border-zinc-200 dark:border-zinc-800 text-[10px] text-zinc-400 dark:text-zinc-500 text-right uppercase tracking-wider font-bold">
              Press <kbd className="bg-zinc-100 dark:bg-zinc-950 px-1 py-0.5 border border-zinc-200 dark:border-zinc-800 rounded font-sans">ESC</kbd> to exit
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default LandingPage;
