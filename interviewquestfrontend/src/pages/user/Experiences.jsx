import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Compass } from 'lucide-react';

const Experiences = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 flex flex-col items-center justify-center">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center">
        <Compass className="w-12 h-12 mx-auto text-amber-400 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Placement Experiences</h2>
        <p className="text-slate-500 text-sm mb-6">Browse, filter, and search structured placement reviews here.</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center space-x-2 bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white px-5 py-2.5 rounded-xl transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>
      </div>
    </div>
  );
};

export default Experiences;
