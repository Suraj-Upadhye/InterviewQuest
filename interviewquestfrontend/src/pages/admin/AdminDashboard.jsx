import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, ArrowLeft, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AdminDashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  // Theme states
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') ||
      (document.documentElement.classList.contains('dark') ? 'dark' : 'light');
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 p-6 relative overflow-hidden transition-colors duration-300">
      {/* Visual background decor */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-rose-500/5 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/5 blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto z-10 relative">
        {/* Navigation header */}
        <header className="flex justify-between items-center mb-10 border-b border-zinc-200 dark:border-zinc-900 pb-5">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/')}
              className="p-2.5 bg-zinc-100 dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-xl transition text-zinc-650 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white cursor-pointer mr-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-extrabold text-zinc-950 dark:text-white flex items-center gap-1.5">
                Interview Quest Admin Panel
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Theme toggle switch */}
            <button
              onClick={toggleTheme}
              className="p-2.5 text-zinc-555 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition cursor-pointer"
              title="Change System Theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 bg-zinc-100 dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-4 py-2 rounded-xl transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </header>

        {/* Admin Navigation Options */}
        <div className="flex border-b border-zinc-200 dark:border-zinc-900 mb-8 space-x-6">
          <button
            onClick={() => navigate('/resources/operating-systems')}
            className="pb-4 border-b-2 border-transparent font-bold text-xs text-zinc-450 dark:text-zinc-500 hover:text-zinc-950 dark:hover:text-white hover:border-zinc-300 dark:hover:border-zinc-700 transition cursor-pointer"
          >
            Resources
          </button>
          <button
            onClick={() => navigate('/practice-quiz')}
            className="pb-4 border-b-2 border-transparent font-bold text-xs text-zinc-450 dark:text-zinc-500 hover:text-zinc-950 dark:hover:text-white hover:border-zinc-300 dark:hover:border-zinc-700 transition cursor-pointer"
          >
            Practice Quiz
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
