import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, ArrowLeft, Sun, Moon, Loader2, BookOpen,
  Cpu, Database, Globe, GitFork, Code, Layers,
  Plus, Edit3, Trash2, X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';

const iconMap = {
  Cpu,
  Database,
  Globe,
  GitFork,
  Code,
  Layers,
  BookOpen
};

const AdminDashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  // General States
  const [subjects, setSubjects] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);

  // Theme states
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') ||
      (document.documentElement.classList.contains('dark') ? 'dark' : 'light');
  });

  // Subject Edit States for Admin
  const [subjectModalOpen, setSubjectModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [subjectTitle, setSubjectTitle] = useState('');
  const [subjectCode, setSubjectCode] = useState('');
  const [subjectSlugState, setSubjectSlugState] = useState('');
  const [subjectDescription, setSubjectDescription] = useState('');
  const [subjectIconName, setSubjectIconName] = useState('Cpu');
  const [subjectShowOnLanding, setSubjectShowOnLanding] = useState(true);
  const [subjectSubmitting, setSubjectSubmitting] = useState(false);

  const iconOptions = ['Cpu', 'Database', 'Globe', 'GitFork', 'Code', 'Layers', 'BookOpen'];

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

  // Fetch all subjects from database
  const fetchAllSubjects = async () => {
    try {
      setLoadingSubjects(true);
      const response = await API.get('/api/public/subjects');
      setSubjects(response.data || []);
    } catch (err) {
      console.error("Failed to load subjects for admin dashboard:", err);
    } finally {
      setLoadingSubjects(false);
    }
  };

  useEffect(() => {
    fetchAllSubjects();
  }, []);

  const handleSubjectTitleChange = (val) => {
    setSubjectTitle(val);
    if (!editingSubject) {
      setSubjectSlugState(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    }
  };

  const handleOpenAddSubject = () => {
    setEditingSubject(null);
    setSubjectTitle('');
    setSubjectCode('');
    setSubjectSlugState('');
    setSubjectDescription('');
    setSubjectIconName('Cpu');
    setSubjectShowOnLanding(true);
    setSubjectModalOpen(true);
  };

  const handleOpenEditSubject = (subj) => {
    setEditingSubject(subj);
    setSubjectTitle(subj.title);
    setSubjectCode(subj.code);
    setSubjectSlugState(subj.slug);
    setSubjectDescription(subj.description || '');
    setSubjectIconName(subj.iconName || 'Cpu');
    setSubjectShowOnLanding(subj.showOnLandingPage);
    setSubjectModalOpen(true);
  };

  const handleSaveSubject = async (e) => {
    e.preventDefault();
    if (!subjectTitle.trim() || !subjectCode.trim() || !subjectSlugState.trim()) {
      alert('Subject title, code, and slug are required.');
      return;
    }

    try {
      setSubjectSubmitting(true);
      const payload = {
        title: subjectTitle.trim(),
        code: subjectCode.trim(),
        slug: subjectSlugState.trim(),
        description: subjectDescription.trim(),
        iconName: subjectIconName,
        showOnLandingPage: subjectShowOnLanding
      };

      if (editingSubject) {
        await API.put(`/api/admin/subjects/${editingSubject.id}`, payload);
      } else {
        await API.post('/api/admin/subjects', payload);
      }
      setSubjectModalOpen(false);
      fetchAllSubjects();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save subject.');
    } finally {
      setSubjectSubmitting(false);
    }
  };

  const handleDeleteSubject = async (subjId) => {
    if (!window.confirm('Are you sure you want to permanently delete this subject category? All its roadmap syllabus chapters and theory content will be permanently lost.')) return;
    try {
      await API.delete(`/api/admin/subjects/${subjId}`);
      fetchAllSubjects();
    } catch (err) {
      alert('Failed to delete subject.');
    }
  };

  const getIconComponent = (name) => {
    return iconMap[name] || BookOpen;
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
              className="p-2.5 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-xl transition text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white cursor-pointer mr-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-extrabold text-zinc-950 dark:text-white flex items-center gap-1.5 font-sans animate-fadeIn">
                Interview Quest Admin Panel
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Theme toggle switch */}
            <button
              onClick={toggleTheme}
              className="p-2.5 text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition cursor-pointer"
              title="Change System Theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-4 py-2 rounded-xl transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </header>

        {/* Global Toolbar Options */}
        <div className="flex justify-between items-center mb-8 bg-zinc-50 dark:bg-[#0d0d11]/30 border border-zinc-200 dark:border-zinc-900 p-4 rounded-2xl">
          <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            Syllabus Subjects Catalogue ({subjects.length})
          </span>
          <button
            onClick={handleOpenAddSubject}
            className="flex items-center justify-center space-x-1.5 text-xs bg-zinc-950 dark:bg-white hover:bg-zinc-900 dark:hover:bg-zinc-100 text-white dark:text-zinc-950 font-bold px-4 py-2.5 rounded-xl transition cursor-pointer shadow"
          >
            <Plus className="w-4 h-4" />
            <span>Add Subject Category</span>
          </button>
        </div>

        {/* Content Section: Load Subjects dynamically */}
        {loadingSubjects ? (
          <div className="flex flex-col justify-center items-center py-16 text-zinc-500">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-600 dark:text-indigo-400 mb-4" />
            <p className="text-xs">Loading subjects from database...</p>
          </div>
        ) : subjects.length === 0 ? (
          <div className="text-center py-16 bg-zinc-50 dark:bg-zinc-900/10 border border-zinc-200 dark:border-zinc-900 border-dashed rounded-3xl text-zinc-500">
            <Layers className="w-12 h-12 mx-auto mb-3 text-zinc-300 dark:text-zinc-800" />
            <p className="text-sm">No subjects populated in database.</p>
            <button onClick={handleOpenAddSubject} className="mt-3 text-xs text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer">Register one now</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {subjects.map((subj, idx) => {
              const Icon = getIconComponent(subj.iconName);
              return (
                <div
                  key={subj.id || idx}
                  className="bg-zinc-50 dark:bg-[#0d0d11] border border-zinc-200 dark:border-zinc-900 hover:border-zinc-400 dark:hover:border-zinc-700 rounded-xl p-6 transition-all duration-200 flex flex-col justify-between hover:shadow-sm animate-fadeIn relative group"
                >
                  {/* Absolute positioned subject edit controls */}
                  <div className="absolute top-4 right-4 flex space-x-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleOpenEditSubject(subj)}
                      className="p-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg transition shadow-sm cursor-pointer border-none"
                      title="Edit Subject"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteSubject(subj.id)}
                      className="p-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-red-400 hover:text-red-500 rounded-lg transition shadow-sm cursor-pointer border-none"
                      title="Delete Subject"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div>
                    <div className="inline-flex p-3 rounded-lg bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 mb-6 transition shadow-sm">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-3">
                      {subj.title}
                    </h3>
                    <p className="text-zinc-500 dark:text-zinc-400 text-xs leading-relaxed mb-8 font-medium line-clamp-3">
                      {subj.description}
                    </p>
                  </div>
                  
                  {/* Two distinct options: Manage Resources and Manage Practice Quiz */}
                  <div className="mt-4 pt-6 border-t border-zinc-200 dark:border-zinc-900 flex justify-between gap-4">
                    <button
                      onClick={() => navigate(`/resources/${subj.slug}`)}
                      className="flex-1 text-center py-2 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[10px] font-bold rounded-lg transition cursor-pointer border border-zinc-200 dark:border-zinc-800"
                    >
                      Manage Resources
                    </button>
                    <button
                      onClick={() => navigate(`/practice-quiz/${subj.code.toLowerCase()}`)}
                      className="flex-1 text-center py-2 bg-zinc-950 dark:bg-white text-white dark:text-zinc-955 text-[10px] font-bold rounded-lg transition cursor-pointer hover:bg-zinc-900 dark:hover:bg-zinc-200 border border-transparent"
                    >
                      Manage Quiz
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* SUBJECTS FORM MODAL */}
      {subjectModalOpen && (
        <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 relative shadow-2xl flex flex-col max-h-[90vh] text-zinc-900 dark:text-zinc-100 animate-scaleIn">
            <button
              onClick={() => setSubjectModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-lg transition cursor-pointer border-none bg-transparent"
            >
              <X className="w-4 h-4" />
            </button>

            <h2 className="text-lg font-black mb-4 flex items-center border-b border-zinc-100 dark:border-zinc-800 pb-3 shrink-0">
              <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mr-2" />
              {editingSubject ? 'Edit Subject Category' : 'Create New Subject'}
            </h2>

            <form onSubmit={handleSaveSubject} className="flex-grow flex flex-col overflow-hidden">
              <div className="flex-grow overflow-y-auto space-y-4 pr-2 pb-4 mb-4">
                
                {/* Title & Code */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-black text-zinc-500 mb-1.5 uppercase">Subject Title *</label>
                    <input
                      type="text"
                      value={subjectTitle}
                      onChange={(e) => handleSubjectTitleChange(e.target.value)}
                      placeholder="e.g. Operating Systems"
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-indigo-500 text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-zinc-500 mb-1.5 uppercase">Code *</label>
                    <input
                      type="text"
                      value={subjectCode}
                      onChange={(e) => setSubjectCode(e.target.value)}
                      placeholder="e.g. OS"
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-indigo-500 text-xs"
                      required
                    />
                  </div>
                </div>

                {/* Slug */}
                <div>
                  <label className="block text-[10px] font-black text-zinc-500 mb-1.5 uppercase">URL Slug (Generated) *</label>
                  <input
                    type="text"
                    value={subjectSlugState}
                    onChange={(e) => setSubjectSlugState(e.target.value)}
                    placeholder="e.g. operating-systems"
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-indigo-500 text-xs font-mono"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[10px] font-black text-zinc-500 mb-1.5 uppercase">Description</label>
                  <textarea
                    value={subjectDescription}
                    onChange={(e) => setSubjectDescription(e.target.value)}
                    placeholder="Enter subject catalog description overview..."
                    rows="3"
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-indigo-500 text-xs resize-none"
                  />
                </div>

                {/* Icon Selection & Show on Landing Toggle */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-zinc-500 mb-1.5 uppercase">Lucide Icon</label>
                    <select
                      value={subjectIconName}
                      onChange={(e) => setSubjectIconName(e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-500 text-xs text-zinc-600 dark:text-zinc-300"
                    >
                      {iconOptions.map(icon => <option key={icon} value={icon}>{icon}</option>)}
                    </select>
                  </div>
                  <div className="flex items-center pt-5">
                    <label className="flex items-center cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={subjectShowOnLanding}
                        onChange={(e) => setSubjectShowOnLanding(e.target.checked)}
                        className="w-4 h-4 rounded border-zinc-300 dark:border-zinc-800 text-indigo-600 bg-zinc-100 dark:bg-zinc-950 focus:ring-indigo-500 cursor-pointer"
                      />
                      <span className="text-xs text-zinc-500 dark:text-zinc-400 font-bold ml-2">Show on Landing</span>
                    </label>
                  </div>
                </div>

              </div>

              {/* Form Actions */}
              <div className="flex space-x-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 shrink-0">
                <button
                  type="button"
                  onClick={() => setSubjectModalOpen(false)}
                  className="w-1/2 py-2.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 text-xs font-bold rounded-xl transition cursor-pointer border-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={subjectSubmitting}
                  className="w-1/2 py-2.5 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 text-xs font-bold rounded-xl transition cursor-pointer shadow-md flex justify-center items-center border-none"
                >
                  {subjectSubmitting ? <Loader2 className="w-4 h-4 animate-spin text-zinc-800" /> : 'Save Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
