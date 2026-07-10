import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Loader2, BookOpen,
  Plus, Edit3, Trash2, X, Search, UserCheck, UserX,
  ChevronLeft, ChevronRight, Pin, PinOff,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import Navbar from '../../components/Navbar';
import IconPicker, { getIconComponent } from '../../components/IconPicker';

const AdminDashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  // General States
  const [subjects, setSubjects] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [activeTab, setActiveTab] = useState('subjects'); // 'subjects' | 'users'
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [userPage, setUserPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);

  const fetchUsers = async (page = 0, search = '') => {
    try {
      setUsersLoading(true);
      const response = await API.get(`/api/admin/users`, {
        params: {
          page: page,
          size: 10,
          search: search,
          sortBy: 'updatedAt',
          direction: 'desc'
        }
      });
      setUsers(response.data.content || []);
      setTotalPages(response.data.totalPages || 0);
      setTotalUsers(response.data.totalElements || 0);
    } catch (err) {
      console.error("Failed to load users:", err);
    } finally {
      setUsersLoading(false);
    }
  };

  const handleToggleBlock = async (userId) => {
    try {
      await API.put(`/api/admin/users/${userId}/toggle-block`);
      fetchUsers(userPage, userSearch);
    } catch (err) {
      alert("Failed to update user status: " + (err.response?.data?.message || err.message));
    }
  };

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers(userPage, userSearch);
    }
  }, [activeTab, userPage]);

  // Subject Edit States for Admin
  const [subjectModalOpen, setSubjectModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [subjectTitle, setSubjectTitle] = useState('');
  const [subjectDescription, setSubjectDescription] = useState('');
  const [subjectIconName, setSubjectIconName] = useState('Cpu');
  const [subjectSubmitting, setSubjectSubmitting] = useState(false);
  const [subjectIconPickerOpen, setSubjectIconPickerOpen] = useState(false);

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
  };

  // Auto-generate code and slug from title
  const generateCodeFromTitle = (title) => {
    return title
      .trim()
      .split(/\s+/)
      .map(w => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 10) || 'SUB';
  };

  const generateSlugFromTitle = (title) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'subject';
  };

  // How many subjects are currently pinned on the landing page
  const pinnedCount = subjects.filter(s => s.showOnLandingPage).length;

  const handleTogglePin = async (subj) => {
    if (!subj.showOnLandingPage && pinnedCount >= 6) {
      alert('You can pin at most 6 subjects to the landing page. Please unpin one first.');
      return;
    }
    try {
      const payload = {
        title: subj.title,
        code: subj.code,
        slug: subj.slug,
        description: subj.description,
        iconName: subj.iconName,
        showOnLandingPage: !subj.showOnLandingPage
      };
      await API.put(`/api/admin/subjects/${subj.id}`, payload);
      fetchAllSubjects();
    } catch (err) {
      alert('Failed to update pin status.');
    }
  };

  const handleOpenAddSubject = () => {
    setEditingSubject(null);
    setSubjectTitle('');
    setSubjectDescription('');
    setSubjectIconName('Cpu');
    setSubjectModalOpen(true);
  };

  const handleOpenEditSubject = (subj) => {
    setEditingSubject(subj);
    setSubjectTitle(subj.title);
    setSubjectDescription(subj.description || '');
    setSubjectIconName(subj.iconName || 'Cpu');
    setSubjectModalOpen(true);
  };

  const handleSaveSubject = async (e) => {
    e.preventDefault();
    if (!subjectTitle.trim()) {
      alert('Subject title is required.');
      return;
    }

    try {
      setSubjectSubmitting(true);
      const trimmedTitle = subjectTitle.trim();
      const payload = {
        title: trimmedTitle,
        // Auto-generate code and slug; when editing, preserve existing ones if title unchanged
        code: editingSubject && editingSubject.title === trimmedTitle
          ? editingSubject.code
          : generateCodeFromTitle(trimmedTitle),
        slug: editingSubject && editingSubject.title === trimmedTitle
          ? editingSubject.slug
          : generateSlugFromTitle(trimmedTitle),
        description: subjectDescription.trim(),
        iconName: subjectIconName,
        // Preserve existing pin status when editing; default false for new subjects
        showOnLandingPage: editingSubject ? editingSubject.showOnLandingPage : false
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



  const formatDateTime = (dtStr) => {
    if (!dtStr) return 'N/A';
    try {
      const dt = new Date(dtStr);
      return dt.toLocaleDateString(undefined, { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dtStr;
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 relative overflow-hidden transition-colors duration-300">
      <Navbar variant="app" />

      {/* Visual background decor */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-rose-500/5 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/5 blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto z-10 relative pt-28 px-6 pb-12">

        {/* Tab Selection Headers */}
        <div className="flex border-b border-zinc-200 dark:border-zinc-800 mb-8 space-x-6 shrink-0 select-none">
          <button
            onClick={() => setActiveTab('subjects')}
            className={`pb-4 text-xs font-black uppercase tracking-wider transition-all duration-150 cursor-pointer ${
              activeTab === 'subjects'
                ? 'border-b-2 border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400'
                : 'text-zinc-400 hover:text-zinc-655 dark:hover:text-zinc-300'
            }`}
          >
            Subjects & Roadmap
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-4 text-xs font-black uppercase tracking-wider transition-all duration-150 cursor-pointer ${
              activeTab === 'users'
                ? 'border-b-2 border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400'
                : 'text-zinc-400 hover:text-zinc-655 dark:hover:text-zinc-300'
            }`}
          >
            User Management
          </button>
        </div>

        {activeTab === 'subjects' ? (
          <>
            {/* Global Toolbar Options */}
            <div className="flex justify-between items-center mb-8 bg-zinc-50 dark:bg-[#0d0d11]/30 border border-zinc-200 dark:border-zinc-900 p-4 rounded-2xl">
              <div>
                <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Syllabus Subjects Catalogue ({subjects.length})
                </span>
                <div className="flex items-center mt-1 gap-1.5">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-4 h-1.5 rounded-full transition-colors ${
                        i < pinnedCount
                          ? 'bg-indigo-500 dark:bg-indigo-400'
                          : 'bg-zinc-200 dark:bg-zinc-800'
                      }`}
                    />
                  ))}
                  <span className="text-[10px] font-bold text-zinc-400 ml-1">{pinnedCount}/6 pinned to landing</span>
                </div>
              </div>
              <button
                onClick={handleOpenAddSubject}
                className="flex items-center justify-center space-x-1.5 text-xs bg-zinc-950 dark:bg-white hover:bg-zinc-900 dark:hover:bg-zinc-100 text-white dark:text-zinc-950 font-bold px-4 py-2.5 rounded-xl transition cursor-pointer shadow border-none"
              >
                <Plus className="w-4 h-4" />
                <span>Add Subject</span>
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
                  const isPinned = subj.showOnLandingPage;
                  const canPin = !isPinned && pinnedCount < 6;
                  return (
                    <div
                      key={subj.id || idx}
                      className={`bg-zinc-50 dark:bg-[#0d0d11] border rounded-xl p-6 transition-all duration-200 flex flex-col justify-between hover:shadow-sm animate-fadeIn relative group ${
                        isPinned
                          ? 'border-indigo-300 dark:border-indigo-800 ring-1 ring-indigo-400/20'
                          : 'border-zinc-200 dark:border-zinc-900 hover:border-zinc-400 dark:hover:border-zinc-700'
                      }`}
                    >
                      {/* Pin badge */}
                      {isPinned && (
                        <div className="absolute top-3 left-3 flex items-center gap-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                          <Pin className="w-2.5 h-2.5" />
                          <span>Pinned</span>
                        </div>
                      )}

                      {/* Absolute positioned subject edit controls */}
                      <div className="absolute top-3 right-3 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {/* Pin / Unpin */}
                        <button
                          onClick={() => handleTogglePin(subj)}
                          className={`p-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg transition shadow-sm cursor-pointer border-none ${
                            isPinned
                              ? 'text-indigo-500 hover:text-indigo-700 dark:hover:text-indigo-300'
                              : canPin
                              ? 'text-zinc-400 hover:text-indigo-500 dark:hover:text-indigo-400'
                              : 'text-zinc-300 dark:text-zinc-700 cursor-not-allowed opacity-50'
                          }`}
                          title={isPinned ? 'Unpin from landing page' : pinnedCount >= 6 ? 'Max 6 pins reached' : 'Pin to landing page'}
                          disabled={!isPinned && pinnedCount >= 6}
                        >
                          {isPinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => handleOpenEditSubject(subj)}
                          className="p-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg transition shadow-sm cursor-pointer border-none"
                          title="Edit Subject"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteSubject(subj.id)}
                          className="p-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-red-400 hover:text-red-500 rounded-lg transition shadow-sm cursor-pointer border-none"
                          title="Delete Subject"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="mt-7">
                        <div className={`inline-flex p-3 rounded-lg border mb-5 transition shadow-sm ${
                          isPinned
                            ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20'
                            : 'bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-800'
                        }`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
                          {subj.title}
                        </h3>
                        <p className="text-zinc-500 dark:text-zinc-400 text-xs leading-relaxed mb-6 font-medium line-clamp-3">
                          {subj.description}
                        </p>
                      </div>
                      
                      {/* Two distinct options: Manage Resources and Manage Practice Quiz */}
                      <div className="mt-2 pt-4 border-t border-zinc-200 dark:border-zinc-900 flex justify-between gap-3">
                        <button
                          onClick={() => navigate(`/resources/${subj.slug}`)}
                          className="flex-1 text-center py-2 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[10px] font-bold rounded-lg transition cursor-pointer border border-zinc-200 dark:border-zinc-800"
                        >
                          Manage Resources
                        </button>
                        <button
                          onClick={() => navigate(`/practice-quiz/${subj.code.toLowerCase()}`)}
                          className="flex-1 text-center py-2 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 text-[10px] font-bold rounded-lg transition cursor-pointer hover:bg-zinc-900 dark:hover:bg-zinc-200 border border-transparent"
                        >
                          Manage Quiz
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          <div className="space-y-6 animate-fadeIn font-sans">
            {/* Search & Statistics Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-zinc-50 dark:bg-[#0d0d11]/30 border border-zinc-200 dark:border-zinc-900 p-4 rounded-2xl">
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  setUserPage(0);
                  fetchUsers(0, userSearch);
                }}
                className="w-full sm:max-w-md flex items-center relative"
              >
                <Search className="w-4 h-4 text-zinc-400 absolute left-3.5" />
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-10 pr-24 py-2.5 focus:outline-none focus:border-indigo-500 text-xs font-semibold text-zinc-900 dark:text-zinc-100"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 px-3 py-1.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold text-[10px] rounded-lg cursor-pointer hover:opacity-90 border-none transition"
                >
                  Search
                </button>
              </form>

              <div className="text-[10px] font-bold text-zinc-450 dark:text-zinc-500 uppercase tracking-wider">
                Total Registered Users: <span className="text-zinc-800 dark:text-white font-black">{totalUsers}</span>
              </div>
            </div>

            {/* Users Table */}
            {usersLoading ? (
              <div className="flex flex-col justify-center items-center py-24 text-zinc-500">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-600 dark:text-indigo-400 mb-4" />
                <p className="text-xs">Loading registered users...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-20 bg-zinc-50 dark:bg-zinc-900/10 border border-zinc-200 dark:border-zinc-900 border-dashed rounded-3xl text-zinc-550">
                <Layers className="w-12 h-12 mx-auto mb-3 text-zinc-350 dark:text-zinc-800" />
                <p className="text-sm">No matching users found in registry.</p>
              </div>
            ) : (
              <div className="bg-white dark:bg-[#0d0d11]/40 border border-zinc-200 dark:border-zinc-900 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-200 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-950/20 text-[10px] font-black text-zinc-400 uppercase tracking-wider">
                        <th className="py-4 px-6">User</th>
                        <th className="py-4 px-6">Email</th>
                        <th className="py-4 px-6">Role</th>
                        <th className="py-4 px-6">Joined Date</th>
                        <th className="py-4 px-6">Last Active</th>
                        <th className="py-4 px-6 text-center">Status</th>
                        <th className="py-4 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-900 text-xs">
                      {users.map((u) => {
                        const initials = u.username ? u.username.slice(0, 2).toUpperCase() : 'US';
                        return (
                          <tr key={u.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-950/10 transition-colors">
                            {/* User details */}
                            <td className="py-4 px-6 flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 text-white flex items-center justify-center font-bold text-xs shadow-sm select-none">
                                {initials}
                              </div>
                              <span className="font-extrabold text-zinc-900 dark:text-white">{u.username}</span>
                            </td>

                            {/* Email */}
                            <td className="py-4 px-6 text-zinc-500 dark:text-zinc-400 font-semibold">{u.email}</td>

                            {/* Role */}
                            <td className="py-4 px-6">
                              <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${
                                u.role === 'ROLE_ADMIN' 
                                  ? 'bg-indigo-500/10 text-indigo-600 border border-indigo-500/20' 
                                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-650 dark:text-zinc-400 border border-zinc-200/50 dark:border-zinc-700/50'
                              }`}>
                                {u.role === 'ROLE_ADMIN' ? 'Admin' : 'Candidate'}
                              </span>
                            </td>

                            {/* Created At */}
                            <td className="py-4 px-6 text-zinc-450 dark:text-zinc-500 font-mono text-[10px] font-bold">
                              {formatDateTime(u.createdAt)}
                            </td>

                            {/* Last Active */}
                            <td className="py-4 px-6 text-zinc-650 dark:text-zinc-400 font-semibold">
                              {formatDateTime(u.updatedAt)}
                            </td>

                            {/* Status */}
                            <td className="py-4 px-6 text-center">
                              <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase ${
                                u.blocked 
                                  ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20' 
                                  : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                              }`}>
                                {u.blocked ? 'Blocked' : 'Active'}
                              </span>
                            </td>

                            {/* Actions */}
                            <td className="py-4 px-6 text-right">
                              <button
                                onClick={() => handleToggleBlock(u.id)}
                                className={`px-3 py-1.5 rounded-lg font-bold text-[10px] border transition cursor-pointer flex items-center gap-1.5 ml-auto border-none ${
                                  u.blocked 
                                    ? 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-650 dark:text-emerald-400' 
                                    : 'bg-rose-500/15 hover:bg-rose-500/25 text-rose-650 dark:text-rose-400'
                                }`}
                              >
                                {u.blocked ? (
                                  <>
                                    <UserCheck className="w-3.5 h-3.5" />
                                    <span>Unblock</span>
                                  </>
                                ) : (
                                  <>
                                    <UserX className="w-3.5 h-3.5" />
                                    <span>Block</span>
                                  </>
                                )}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-950/20 px-6 py-4 border-t border-zinc-200 dark:border-zinc-900 select-none">
                    <button
                      disabled={userPage === 0}
                      onClick={() => setUserPage(prev => Math.max(prev - 1, 0))}
                      className="px-3.5 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-650 dark:text-zinc-400 font-bold text-xs rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-850 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span>Previous</span>
                    </button>

                    <div className="text-[10px] font-bold text-zinc-450 uppercase">
                      Page {userPage + 1} of {totalPages}
                    </div>

                    <button
                      disabled={userPage + 1 >= totalPages}
                      onClick={() => setUserPage(prev => prev + 1)}
                      className="px-3.5 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-655 dark:text-zinc-400 font-bold text-xs rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-850 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1"
                    >
                      <span>Next</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

      </div>

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

export default AdminDashboard;
