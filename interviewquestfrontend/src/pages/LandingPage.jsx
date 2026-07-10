import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ArrowRight, BookOpen,
  Search, X, ArrowUpRight,
  Edit3, Trash2, Plus, Loader2
} from 'lucide-react';
import API from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import IconPicker, { getIconComponent } from '../components/IconPicker';

const LandingPage = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef(null);

  const [subjects, setSubjects] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);

  // Subject Edit States for Admins
  const [subjectModalOpen, setSubjectModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [subjectTitle, setSubjectTitle] = useState('');
  const [subjectDescription, setSubjectDescription] = useState('');
  const [subjectIconName, setSubjectIconName] = useState('Cpu');
  const [subjectSubmitting, setSubjectSubmitting] = useState(false);
  const [subjectIconPickerOpen, setSubjectIconPickerOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const generateCodeFromTitle = (title) => {
    return title.trim().split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 10) || 'SUB';
  };

  const generateSlugFromTitle = (title) => {
    return title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'subject';
  };

  const handleSubjectTitleChange = (val) => {
    setSubjectTitle(val);
  };

  const handleOpenAddSubject = () => {
    setEditingSubject(null);
    setSubjectTitle('');
    setSubjectDescription('');
    setSubjectIconName('Cpu');
    setErrorMsg('');
    setSuccessMsg('');
    setSubjectModalOpen(true);
  };

  const handleOpenEditSubject = (subj) => {
    setEditingSubject(subj);
    setSubjectTitle(subj.title);
    setSubjectDescription(subj.description || '');
    setSubjectIconName(subj.iconName || 'Cpu');
    setErrorMsg('');
    setSuccessMsg('');
    setSubjectModalOpen(true);
  };

  const handleSaveSubject = async (e) => {
    e.preventDefault();
    if (!subjectTitle.trim()) {
      setErrorMsg('Subject title is required.');
      return;
    }

    try {
      setSubjectSubmitting(true);
      setErrorMsg('');
      setSuccessMsg('');
      const trimmedTitle = subjectTitle.trim();
      const payload = {
        title: trimmedTitle,
        code: editingSubject && editingSubject.title === trimmedTitle
          ? editingSubject.code
          : generateCodeFromTitle(trimmedTitle),
        slug: editingSubject && editingSubject.title === trimmedTitle
          ? editingSubject.slug
          : generateSlugFromTitle(trimmedTitle),
        description: subjectDescription.trim(),
        iconName: subjectIconName,
        showOnLandingPage: editingSubject ? editingSubject.showOnLandingPage : false
      };

      if (editingSubject) {
        await API.put(`/api/admin/subjects/${editingSubject.id}`, payload);
        setSuccessMsg('Subject updated successfully!');
      } else {
        await API.post('/api/admin/subjects', payload);
        setSuccessMsg('Subject created successfully!');
      }
      setSubjectModalOpen(false);
      // Reload subjects list from backend
      const response = await API.get('/api/public/subjects/landing');
      setSubjects(response.data || []);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to save subject.');
    } finally {
      setSubjectSubmitting(false);
    }
  };

  const handleDeleteSubject = async (subjId) => {
    if (!window.confirm('Are you sure you want to permanently delete this subject category? All its roadmap syllabus chapters and theory content will be permanently lost.')) return;
    try {
      setErrorMsg('');
      setSuccessMsg('');
      await API.delete(`/api/admin/subjects/${subjId}`);
      setSuccessMsg('Subject deleted successfully.');
      const response = await API.get('/api/public/subjects/landing');
      setSubjects(response.data || []);
    } catch (err) {
      setErrorMsg('Failed to delete subject.');
    }
  };



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

  // Fetch subjects from dynamic API
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await API.get('/api/public/subjects/landing');
        setSubjects(response.data || []);
      } catch (err) {
        console.error('Failed to fetch subjects', err);
      } finally {
        setLoadingSubjects(false);
      }
    };
    fetchSubjects();
  }, []);

  // Focus input when search modal opens
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);



  const getSubjectLink = (subj) => {
    const firstTopicSlug = subj.topics && subj.topics.length > 0 ? subj.topics[0].slug : 'intro';
    return `/resources/${subj.slug}/${firstTopicSlug}`;
  };



  // Filter subjects based on query
  const filteredSubjects = subjects.filter(subj =>
    subj.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (subj.description || '').toLowerCase().includes(searchQuery.toLowerCase())
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
      <Navbar variant="landing" onSearchOpen={() => setIsSearchOpen(true)} />

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
        <div className="text-center max-w-2xl mx-auto mb-16 relative">
          <h2 className="text-4xl sm:text-5xl font-black mb-4 tracking-tight text-zinc-950 dark:text-white">
            Curriculum Topics
          </h2>
          <p className="text-base sm:text-lg text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
            A focused reference directory designed to verify candidate theoretical comprehension.
          </p>
          {isAdmin && (
            <button
              onClick={handleOpenAddSubject}
              className="mt-6 inline-flex items-center space-x-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2.5 rounded-full transition shadow cursor-pointer border-none"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Subject Category</span>
            </button>
          )}
        </div>

        {isAdmin && errorMsg && (
          <div className="max-w-md mx-auto mb-8 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-xs text-center font-bold">
            {errorMsg}
          </div>
        )}
        {isAdmin && successMsg && (
          <div className="max-w-md mx-auto mb-8 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl text-xs text-center font-bold">
            {successMsg}
          </div>
        )}

        {/* Subjects Card Grid */}
        {loadingSubjects ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="bg-zinc-50 dark:bg-[#0d0d11] border border-zinc-200 dark:border-zinc-900 rounded-xl p-8 animate-pulse flex flex-col justify-between h-[320px]"
              >
                <div>
                  <div className="w-12 h-12 rounded-lg bg-zinc-200 dark:bg-zinc-800 mb-6" />
                  <div className="h-6 w-3/4 bg-zinc-200 dark:bg-zinc-800 rounded mb-4" />
                  <div className="h-4 w-full bg-zinc-200 dark:bg-zinc-800 rounded mb-2" />
                  <div className="h-4 w-5/6 bg-zinc-200 dark:bg-zinc-800 rounded mb-2" />
                </div>
                <div className="h-4 w-1/3 bg-zinc-200 dark:bg-zinc-800 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {subjects.map((subj, idx) => {
              const Icon = getIconComponent(subj.iconName);
              return (
                <div
                  key={subj.id || idx}
                  onClick={() => navigate(getSubjectLink(subj))}
                  className="bg-zinc-50 dark:bg-[#0d0d11] border border-zinc-200 dark:border-zinc-900 hover:border-zinc-400 dark:hover:border-zinc-700 rounded-xl p-8 transition-all duration-200 group flex flex-col justify-between animate-fadeIn relative cursor-pointer hover:shadow-md"
                >
                  {isAdmin && (
                    <div className="absolute top-4 right-4 flex space-x-1.5 opacity-60 hover:opacity-100 transition-opacity z-10">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleOpenEditSubject(subj); }}
                        className="p-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 text-zinc-650 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg transition shadow-sm cursor-pointer border-none"
                        title="Edit Subject"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteSubject(subj.id); }}
                        className="p-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 text-zinc-650 dark:text-red-400 hover:text-red-500 rounded-lg transition shadow-sm cursor-pointer border-none"
                        title="Delete Subject"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                  <div>
                    <div className="inline-flex p-3 rounded-lg bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 mb-6 group-hover:border-zinc-400 dark:group-hover:border-zinc-600 transition shadow-sm">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white mb-3">
                      {subj.title}
                    </h3>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm sm:text-base leading-relaxed mb-8 font-medium line-clamp-3">
                      {subj.description}
                    </p>
                  </div>
                  <button
                    className="inline-flex items-center text-sm font-bold text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white cursor-pointer group-hover:translate-x-0.5 transition-transform border-none bg-transparent"
                  >
                    <span>Launch Study</span>
                    <ArrowUpRight className="w-4 h-4 ml-1 text-zinc-400 group-hover:text-zinc-950 dark:group-hover:text-white transition" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* FOOTER */}
      <Footer />

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
                    onClick={() => handleSearchResultClick(getSubjectLink(subj))}
                    className="pt-3 pb-2 px-3 hover:bg-zinc-100 dark:hover:bg-zinc-950 rounded-lg cursor-pointer transition flex justify-between items-center group"
                  >
                    <div>
                      <h4 className="text-sm sm:text-base font-bold text-zinc-950 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                        {subj.title}
                      </h4>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-semibold mt-0.5 line-clamp-1">
                        {subj.description}
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

      {/* ICON PICKER MODAL */}
      {subjectIconPickerOpen && (
        <IconPicker
          value={subjectIconName}
          onChange={setSubjectIconName}
          onClose={() => setSubjectIconPickerOpen(false)}
        />
      )}

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
              {React.createElement(getIconComponent(subjectIconName), { className: 'w-5 h-5 text-indigo-600 dark:text-indigo-400 mr-2' })}
              {editingSubject ? 'Edit Subject Category' : 'Create New Subject'}
            </h2>

            <form onSubmit={handleSaveSubject} className="flex-grow flex flex-col overflow-hidden">
              <div className="flex-grow overflow-y-auto space-y-4 pr-2 pb-4 mb-4">

                {/* Subject Title */}
                <div>
                  <label className="block text-[10px] font-black text-zinc-500 mb-1.5 uppercase">Subject Title *</label>
                  <input
                    type="text"
                    value={subjectTitle}
                    onChange={(e) => handleSubjectTitleChange(e.target.value)}
                    placeholder="e.g. Operating Systems"
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-indigo-500 text-xs"
                    required
                  />
                  {subjectTitle.trim() && (
                    <p className="text-[10px] text-zinc-400 mt-1.5 font-mono">
                      Code: <span className="text-indigo-500 font-bold">{generateCodeFromTitle(subjectTitle)}</span>
                      {' · '}Slug: <span className="text-indigo-500 font-bold">{generateSlugFromTitle(subjectTitle)}</span>
                    </p>
                  )}
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

                {/* Icon Selection */}
                <div>
                  <label className="block text-[10px] font-black text-zinc-500 mb-1.5 uppercase">Lucide Icon</label>
                  <button
                    type="button"
                    onClick={() => setSubjectIconPickerOpen(true)}
                    className="w-full flex items-center gap-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:border-indigo-400 dark:hover:border-indigo-600 rounded-xl px-3.5 py-2.5 transition cursor-pointer text-left group"
                  >
                    <div className="p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm shrink-0 group-hover:border-indigo-300 dark:group-hover:border-indigo-700 transition">
                      {React.createElement(getIconComponent(subjectIconName), { className: 'w-5 h-5 text-indigo-600 dark:text-indigo-400' })}
                    </div>
                    <div className="flex-grow min-w-0">
                      <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block">{subjectIconName}</span>
                      <span className="text-[10px] text-zinc-400">Click to browse all icons</span>
                    </div>
                    <Search className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                  </button>
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

export default LandingPage;
