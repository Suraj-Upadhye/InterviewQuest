import React from 'react';
import { useNavigate } from 'react-router-dom';

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-900 pt-16 pb-12 bg-white dark:bg-[#09090b]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Left Brand Col */}
          <div className="md:col-span-1 space-y-4">
            <span 
              onClick={() => navigate('/')} 
              className="font-black text-xl text-zinc-955 dark:text-white cursor-pointer"
            >
              InterviewQuest
            </span>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
              Elevating computer science study and interactive prep.
            </p>
          </div>

          {/* Link Cols */}
          <div>
            <h4 className="text-sm font-bold text-zinc-955 dark:text-white uppercase tracking-wider mb-4">Resources</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-semibold">
              <li>
                <button 
                  onClick={() => navigate('/resources/database-management-systems/introduction-introduction-640')} 
                  className="hover:text-zinc-950 dark:hover:text-white transition cursor-pointer bg-transparent border-none p-0 text-left"
                >
                  CS Fundamentals
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('/practice-quiz')} 
                  className="hover:text-zinc-950 dark:hover:text-white transition cursor-pointer bg-transparent border-none p-0 text-left"
                >
                  Practice Quiz
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('/mock-interview')} 
                  className="hover:text-zinc-950 dark:hover:text-white transition cursor-pointer bg-transparent border-none p-0 text-left"
                >
                  Mock Interviews
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-zinc-955 dark:text-white uppercase tracking-wider mb-4">Contact</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-semibold">
              <li>
                <a 
                  href="https://linkedin.com/in/suraj-upadhye" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="hover:text-zinc-950 dark:hover:text-white transition"
                >
                  LinkedIn
                </a>
              </li>
              <li>
                <a 
                  href="https://github.com/suraj-upadhye" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="hover:text-zinc-950 dark:hover:text-white transition"
                >
                  GitHub
                </a>
              </li>
              <li>
                <a 
                  href="mailto:s.upadhye6782@gmail.com" 
                  className="hover:text-zinc-950 dark:hover:text-white transition"
                >
                  E-mail
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-zinc-950 dark:text-white uppercase tracking-wider mb-4">Other</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-zinc-550 dark:text-zinc-400 font-semibold">
              <li>
                <button 
                  onClick={() => navigate('/about-us')} 
                  className="hover:text-zinc-950 dark:hover:text-white transition cursor-pointer bg-transparent border-none p-0 text-left"
                >
                  About Us
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('/contact-us')} 
                  className="hover:text-zinc-950 dark:hover:text-white transition cursor-pointer bg-transparent border-none p-0 text-left"
                >
                  Contact Us
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('/privacy-policy')} 
                  className="hover:text-zinc-950 dark:hover:text-white transition cursor-pointer bg-transparent border-none p-0 text-left"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('/terms-conditions')} 
                  className="hover:text-zinc-950 dark:hover:text-white transition cursor-pointer bg-transparent border-none p-0 text-left"
                >
                  Terms & Conditions
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar with Copyright */}
        <div className="border-t border-zinc-200 dark:border-zinc-900 pt-8 flex flex-col sm:flex-row justify-center items-center gap-4 text-xs sm:text-sm text-zinc-500">
          <p>&copy; {new Date().getFullYear()} InterviewQuest. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
