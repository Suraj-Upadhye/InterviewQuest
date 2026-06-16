import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, ShieldAlert, Users, Building2, BookCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-rose-500/5 blur-[100px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-orange-500/5 blur-[100px]" />

      <div className="max-w-6xl mx-auto z-10 relative">
        {/* Navigation */}
        <header className="flex justify-between items-center mb-12 border-b border-slate-900 pb-5">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-rose-400 to-orange-400 bg-clip-text text-transparent flex items-center space-x-2">
              <ShieldAlert className="w-6 h-6 text-rose-500 mr-2" />
              InterviewQuest Admin
            </h1>
            <p className="text-xs text-slate-500">Welcome, Moderator {user?.username}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white px-4 py-2 rounded-xl transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </header>

        {/* Info panel */}
        <section className="bg-gradient-to-r from-slate-900 to-slate-900/40 border border-slate-800 rounded-3xl p-8 mb-10">
          <h2 className="text-2xl font-bold mb-3 text-slate-100">Moderator Control Panel</h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Review user submissions, approve placement experience reviews, update question banks, and monitor user statuses.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl flex items-center space-x-4">
              <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl"><Users className="w-5 h-5" /></div>
              <div>
                <p className="text-xs text-slate-500">Total Candidates</p>
                <p className="text-lg font-semibold text-slate-300">--</p>
              </div>
            </div>
            <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl flex items-center space-x-4">
              <div className="p-3 bg-orange-500/10 text-orange-400 rounded-xl"><Building2 className="w-5 h-5" /></div>
              <div>
                <p className="text-xs text-slate-500">Tracked Companies</p>
                <p className="text-lg font-semibold text-slate-300">--</p>
              </div>
            </div>
            <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl flex items-center space-x-4">
              <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl"><BookCheck className="w-5 h-5" /></div>
              <div>
                <p className="text-xs text-slate-500">Pending Reviews</p>
                <p className="text-lg font-semibold text-slate-300">--</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;
