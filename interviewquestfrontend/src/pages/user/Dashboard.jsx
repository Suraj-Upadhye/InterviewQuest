import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, BookOpen, Code, Brain } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminDashboard from '../admin/AdminDashboard';

const Dashboard = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (isAdmin) {
    return <AdminDashboard />;
  }

  const menuItems = [
    { 
      title: 'Resources', 
      icon: BookOpen, 
      desc: 'Access comprehensive study roadmaps and theory chapters for computer science.', 
      link: '/resources/operating-systems' 
    },
    { 
      title: 'Practice Quiz', 
      icon: Code, 
      desc: 'Take timed tests to assess your knowledge and track your stats.', 
      link: '/practice-quiz' 
    },
    { 
      title: 'AI Mock Interviews', 
      icon: Brain, 
      desc: 'Conduct simulated HR & technical interviews powered by Groq AI.', 
      link: '/mock-interview' 
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 p-6 relative overflow-hidden transition-colors duration-300">
      <div className="max-w-6xl mx-auto z-10 relative">

        {/* Navigation */}
        <header className="flex justify-between items-center mb-12 border-b border-zinc-200 dark:border-zinc-900 pb-5">
          <div>
            <h1 className="text-2xl font-extrabold text-zinc-950 dark:text-white flex items-center gap-1.5">
              InterviewQuest
            </h1>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-4 py-2 rounded-xl transition cursor-pointer text-xs font-semibold"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </header>

        {/* Action Options Cards Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {menuItems.map((item, idx) => {
            const Icon = item.icon;
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
                <p className="text-xs text-zinc-500 dark:text-zinc-450 leading-relaxed font-medium">
                  {item.desc}
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
