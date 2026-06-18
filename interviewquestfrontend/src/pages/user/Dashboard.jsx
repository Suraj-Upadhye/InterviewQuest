import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, BookOpen, Code, Brain, User as UserIcon, Calendar, Building2, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { title: 'Topic Practice', icon: Code, desc: 'Practice topic-wise MCQ questions on core computer subjects.', link: '/practice', color: 'from-blue-500 to-cyan-500' },
    { title: 'Skill Assessments', icon: BookOpen, desc: 'Take timed tests to assess your knowledge and track your stats.', link: '/assessments', color: 'from-emerald-500 to-teal-500' },
    { title: 'AI Mock Interviews', icon: Brain, desc: 'Conduct simulated HR & technical interviews powered by Groq AI.', link: '/mock-interview', color: 'from-purple-500 to-indigo-500' },
    { title: 'Companies Directory', icon: Building2, desc: 'Browse and follow tracked recruiters, or manage corporate panels.', link: '/companies', color: 'from-sky-500 to-indigo-500' },
    { title: 'My Profile', icon: UserIcon, desc: 'Edit your education, projects, skills, and coding profiles.', link: '/profile', color: 'from-pink-500 to-rose-500' }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 p-6 relative overflow-hidden transition-colors duration-300">
      <div className="max-w-6xl mx-auto z-10 relative">
        
        {/* Navigation */}
        <header className="flex justify-between items-center mb-12 border-b border-zinc-200 dark:border-zinc-900 pb-5">
          <div>
            <h1 className="text-2xl font-extrabold text-zinc-950 dark:text-white flex items-center gap-1.5">
              <span>🚀</span> InterviewQuest
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Welcome back, {user?.username} ({user?.role?.replace('ROLE_', '')})</p>
          </div>
          <div className="flex items-center space-x-3">
            {user?.role === 'ROLE_ADMIN' && (
              <button
                onClick={() => navigate('/admin')}
                className="flex items-center space-x-2 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-700 dark:text-red-350 px-4 py-2 rounded-xl transition cursor-pointer text-xs font-semibold"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Admin Panel</span>
              </button>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-4 py-2 rounded-xl transition cursor-pointer text-xs font-semibold"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </header>

        {/* Hero Welcome banner */}
        <section className="bg-zinc-50 dark:bg-[#0d0d11] border border-zinc-200 dark:border-zinc-905 rounded-2xl p-8 mb-10 relative overflow-hidden">
          <div className="max-w-xl">
            <h2 className="text-2xl font-bold mb-3 text-zinc-950 dark:text-white">Unlock your placement success</h2>
            <p className="text-zinc-500 dark:text-zinc-405 text-xs sm:text-sm leading-relaxed mb-6">
              Practice computer science core subjects, challenge yourself with timed tests, read reviews from seniors, and simulate AI-powered interviews.
            </p>
            <div className="flex space-x-4">
              <button 
                onClick={() => navigate('/mock-interview')} 
                className="px-5 py-2.5 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 hover:bg-zinc-850 dark:hover:bg-zinc-200 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Start Mock Interview
              </button>
              <button 
                onClick={() => navigate('/practice')} 
                className="px-5 py-2.5 bg-white dark:bg-transparent border border-zinc-250 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-350 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Practice DSA
              </button>
            </div>
          </div>
        </section>

        {/* Action Options Cards Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item, idx) => {
            const Icon = item.icon;
            // Map new visual settings to replace old gradient colors
            return (
              <div
                key={idx}
                onClick={() => navigate(item.link)}
                className="bg-zinc-50 dark:bg-[#0d0d11] border border-zinc-200 dark:border-zinc-900 hover:border-zinc-400 dark:hover:border-zinc-700 rounded-xl p-6 transition duration-200 group cursor-pointer hover:shadow-sm"
              >
                <div className="inline-flex p-2.5 rounded-lg bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 mb-4 group-hover:border-zinc-400 dark:group-hover:border-zinc-650 transition">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold mb-2 text-zinc-900 dark:text-white group-hover:text-indigo-650 dark:group-hover:text-indigo-400 transition">
                  {item.title}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  {item.title === 'My Profile' 
                    ? 'View details and upload/preview your Resume PDF.' 
                    : item.desc}
                </p>
              </div>
            );
          })}
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
