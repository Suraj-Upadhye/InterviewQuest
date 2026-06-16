import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, BookOpen, Compass, Code, Brain, User as UserIcon, Calendar } from 'lucide-react';
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
    { title: 'Placement Experiences', icon: Compass, desc: 'Browse and search structured, stage-wise reviews from seniors.', link: '/experiences', color: 'from-amber-500 to-orange-500' },
    { title: 'My Profile', icon: UserIcon, desc: 'Edit your education, projects, skills, and coding profiles.', link: '/profile', color: 'from-pink-500 to-rose-500' }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[100px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/10 blur-[100px]" />

      <div className="max-w-6xl mx-auto z-10 relative">
        {/* Navigation */}
        <header className="flex justify-between items-center mb-12 border-b border-slate-900 pb-5">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              InterviewQuest
            </h1>
            <p className="text-xs text-slate-500">Welcome back, {user?.username} ({user?.role?.replace('ROLE_', '')})</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white px-4 py-2 rounded-xl transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </header>

        {/* Hero Welcome banner */}
        <section className="bg-gradient-to-r from-slate-900 to-slate-900/40 border border-slate-800 rounded-3xl p-8 mb-10 relative overflow-hidden">
          <div className="max-w-xl">
            <h2 className="text-3xl font-bold mb-3 text-slate-100">Unlock your placement success</h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-5">
              Practice computer science core subjects, challenge yourself with timed tests, read reviews from seniors, and simulate AI-powered interviews.
            </p>
            <div className="flex space-x-4">
              <button onClick={() => navigate('/mock-interview')} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-medium transition cursor-pointer">
                Start Mock Interview
              </button>
              <button onClick={() => navigate('/practice')} className="px-5 py-2.5 bg-slate-950/60 border border-slate-800 hover:border-slate-700 rounded-xl text-sm font-medium transition cursor-pointer">
                Practice DSA
              </button>
            </div>
          </div>
        </section>

        {/* Action Options Cards Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                onClick={() => navigate(item.link)}
                className="bg-slate-900/50 backdrop-blur border border-slate-900 hover:border-slate-800 rounded-2xl p-6 transition duration-300 group cursor-pointer hover:shadow-xl hover:shadow-indigo-950/20"
              >
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${item.color} text-white mb-4 shadow-md transition group-hover:scale-110`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold mb-2 group-hover:text-indigo-400 transition">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
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
