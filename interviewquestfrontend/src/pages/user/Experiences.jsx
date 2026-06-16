import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { 
  ArrowLeft, Compass, Plus, ArrowUp, ThumbsUp, CheckCircle, 
  XCircle, Loader2, Sparkles, Filter, X, ChevronLeft, ChevronRight, AlertCircle, Trash2
} from 'lucide-react';

const Experiences = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  const [experiences, setExperiences] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters State
  const [filterCompany, setFilterCompany] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterSelected, setFilterSelected] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Detail Modal State
  const [activeDetail, setActiveDetail] = useState(null);

  // Submit Modal State
  const [submitOpen, setSubmitOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitCompanyId, setSubmitCompanyId] = useState('');
  const [submitRole, setSubmitRole] = useState('');
  const [submitYear, setSubmitYear] = useState(new Date().getFullYear());
  const [submitSelected, setSubmitSelected] = useState(true);
  const [submitStages, setSubmitStages] = useState([{ stageNumber: 1, stageName: '', content: '' }]);

  useEffect(() => {
    fetchExperiences();
    fetchCompanies();
  }, [filterCompany, filterYear, filterRole, filterSelected, currentPage]);

  const fetchExperiences = async () => {
    try {
      setLoading(true);
      
      const queryParams = new URLSearchParams();
      if (filterCompany) queryParams.append('companyId', filterCompany);
      if (filterYear) queryParams.append('year', filterYear);
      if (filterRole) queryParams.append('role', filterRole);
      if (filterSelected !== '') queryParams.append('isSelected', filterSelected);
      queryParams.append('page', currentPage);
      queryParams.append('size', 10);
      queryParams.append('sort', 'createdAt,desc');

      // Admins pull all records from the moderation path; regular users see approved ones
      const url = isAdmin 
        ? `/api/admin/experiences?${queryParams.toString()}`
        : `/api/public/experiences?${queryParams.toString()}`;

      const response = await API.get(url);
      setExperiences(response.data.content || []);
      setTotalPages(response.data.totalPages || 0);
    } catch (err) {
      setError('Failed to load experiences.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await API.get('/api/public/companies');
      setCompanies(response.data || []);
    } catch (err) {
      console.error('Failed to fetch companies list.');
    }
  };

  const handleOpenSubmitModal = () => {
    setSubmitCompanyId(companies[0]?.id || '');
    setSubmitRole('');
    setSubmitYear(new Date().getFullYear());
    setSubmitSelected(true);
    setSubmitStages([{ stageNumber: 1, stageName: '', content: '' }]);
    setError('');
    setSubmitOpen(true);
  };

  const addSubmitStage = () => {
    setSubmitStages([
      ...submitStages,
      { stageNumber: submitStages.length + 1, stageName: '', content: '' }
    ]);
  };

  const removeSubmitStage = (index) => {
    const filtered = submitStages.filter((_, idx) => idx !== index);
    // Reindex numbers
    const reindexed = filtered.map((stage, idx) => ({
      ...stage,
      stageNumber: idx + 1
    }));
    setSubmitStages(reindexed);
  };

  const updateStageField = (index, field, value) => {
    const updated = [...submitStages];
    updated[index][field] = value;
    setSubmitStages(updated);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!submitCompanyId || !submitRole.trim() || submitStages.some(s => !s.stageName.trim() || !s.content.trim())) {
      setError('Please fill in all fields and provide details for all stages.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const payload = {
        company: { id: parseInt(submitCompanyId) },
        role: submitRole.trim(),
        yearOfInterview: parseInt(submitYear),
        isSelected: submitSelected,
        stages: submitStages
      };

      await API.post('/api/experiences', payload);
      alert('Experience submitted successfully! It is pending moderator approval.');
      setSubmitOpen(false);
      setCurrentPage(0);
      fetchExperiences();
    } catch (err) {
      setError('Failed to submit placement review.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpvote = async (id, e) => {
    e.stopPropagation(); // Avoid opening detail card
    try {
      const response = await API.post(`/api/experiences/${id}/upvote`);
      setExperiences(experiences.map(exp => exp.id === id ? response.data : exp));
    } catch (err) {
      console.error('Failed to upvote experience');
    }
  };

  const handleStatusUpdate = async (id, status, e) => {
    e.stopPropagation();
    try {
      const response = await API.put(`/api/admin/experiences/${id}/status?status=${status}`);
      setExperiences(experiences.map(exp => exp.id === id ? response.data : exp));
    } catch (err) {
      setError('Failed to update status.');
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this placement review?')) {
      return;
    }

    try {
      await API.delete(`/api/admin/experiences/${id}`);
      setExperiences(experiences.filter(exp => exp.id !== id));
      setActiveDetail(null);
    } catch (err) {
      setError('Failed to delete review.');
    }
  };

  const handleResetFilters = () => {
    setFilterCompany('');
    setFilterYear('');
    setFilterRole('');
    setFilterSelected('');
    setCurrentPage(0);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 relative overflow-hidden flex flex-col">
      {/* Background decorations */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/5 blur-[100px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/5 blur-[100px]" />

      <div className="max-w-5xl mx-auto w-full z-10 relative flex-grow flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between mb-8 border-b border-slate-900 pb-5 shrink-0">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-xl transition text-slate-400 hover:text-white cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent flex items-center">
                <Compass className="w-6 h-6 text-indigo-400 mr-2 shrink-0 animate-pulse" />
                Interview Repository
              </h1>
              <p className="text-xs text-slate-500">Read structured placement reviews or submit your experience</p>
            </div>
          </div>

          <button
            onClick={handleOpenSubmitModal}
            className="flex items-center space-x-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2.5 rounded-xl transition cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Submit Review</span>
          </button>
        </header>

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center mb-6 shrink-0 flex items-center justify-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* SEARCH AND FILTER FORM PANEL */}
        <section className="bg-slate-900/40 border border-slate-900 rounded-3xl p-6 mb-8 shrink-0">
          <div className="flex items-center space-x-2 mb-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <Filter className="w-4 h-4 text-indigo-400" />
            <span>Filter Repository</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-[10px] font-medium text-slate-500 mb-1.5 uppercase">Company</label>
              <select
                value={filterCompany}
                onChange={(e) => { setFilterCompany(e.target.value); setCurrentPage(0); }}
                className="w-full bg-slate-950/40 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-300 focus:outline-none"
              >
                <option value="">All Companies</option>
                {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-medium text-slate-500 mb-1.5 uppercase">Year</label>
              <input
                type="number"
                value={filterYear}
                onChange={(e) => { setFilterYear(e.target.value); setCurrentPage(0); }}
                placeholder="e.g. 2024"
                className="w-full bg-slate-950/40 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-300 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-medium text-slate-500 mb-1.5 uppercase">Role / Job Title</label>
              <input
                type="text"
                value={filterRole}
                onChange={(e) => { setFilterRole(e.target.value); setCurrentPage(0); }}
                placeholder="e.g. Software Engineer"
                className="w-full bg-slate-950/40 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-300 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-medium text-slate-500 mb-1.5 uppercase">Status Outcome</label>
              <select
                value={filterSelected}
                onChange={(e) => { setFilterSelected(e.target.value); setCurrentPage(0); }}
                className="w-full bg-slate-950/40 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-300 focus:outline-none"
              >
                <option value="">All Results</option>
                <option value="true">Selected</option>
                <option value="false">Rejected</option>
              </select>
            </div>
          </div>
          {(filterCompany || filterYear || filterRole || filterSelected !== '') && (
            <button
              onClick={handleResetFilters}
              className="mt-4 text-xs font-semibold text-indigo-400 hover:text-indigo-300 hover:underline cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </section>

        {/* LIST VIEW */}
        <section className="space-y-4 flex-grow overflow-y-auto min-h-0 pr-1">
          {loading ? (
            <div className="text-center py-12"><Loader2 className="w-10 h-10 animate-spin text-slate-700 mx-auto" /></div>
          ) : experiences.length === 0 ? (
            <div className="text-center py-16 bg-slate-900/10 border border-slate-900 border-dashed rounded-3xl text-slate-500">
              <Compass className="w-12 h-12 mx-auto mb-3 text-slate-800" />
              <p className="text-sm">No interview experiences found.</p>
            </div>
          ) : (
            experiences.map((exp) => (
              <div
                key={exp.id}
                onClick={() => setActiveDetail(exp)}
                className="bg-slate-900/40 border border-slate-900 hover:border-slate-800/80 rounded-2xl p-6 transition duration-300 cursor-pointer flex justify-between items-start"
              >
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <span className="font-semibold text-slate-200">{exp.company?.name}</span>
                    <span className="text-slate-600">&bull;</span>
                    <span className="text-xs text-slate-400 font-medium">{exp.role}</span>
                    <span className="text-slate-600">&bull;</span>
                    <span className="text-xs text-slate-500">{exp.yearOfInterview}</span>
                  </div>

                  <div className="flex flex-wrap gap-2 items-center">
                    {/* Selected badge */}
                    <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                      exp.isSelected ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                    }`}>
                      {exp.isSelected ? <CheckCircle className="w-3.5 h-3.5 mr-1" /> : <XCircle className="w-3.5 h-3.5 mr-1" />}
                      <span>{exp.isSelected ? 'Selected' : 'Rejected'}</span>
                    </span>

                    {/* Moderation status badge (Admin only) */}
                    {isAdmin && (
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                        exp.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400' : exp.status === 'REJECTED' ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'
                      }`}>
                        Status: {exp.status}
                      </span>
                    )}

                    <span className="text-xs text-slate-500">
                      Contains {exp.stages?.length || 0} rounds
                    </span>
                  </div>
                </div>

                {/* Vote and Moderation actions */}
                <div className="flex flex-col items-end space-y-3 shrink-0">
                  <button
                    onClick={(e) => handleUpvote(exp.id, e)}
                    className="flex items-center space-x-1 px-3 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-850 rounded-xl transition text-xs font-semibold text-slate-400 hover:text-indigo-400 cursor-pointer"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>{exp.upvoteCount}</span>
                  </button>

                  {isAdmin && (
                    <div className="flex space-x-1.5">
                      {exp.status === 'PENDING' && (
                        <>
                          <button
                            onClick={(e) => handleStatusUpdate(exp.id, 'APPROVED', e)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg cursor-pointer"
                          >
                            Approve
                          </button>
                          <button
                            onClick={(e) => handleStatusUpdate(exp.id, 'REJECTED', e)}
                            className="bg-red-750 hover:bg-red-700 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg cursor-pointer"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      <button
                        onClick={(e) => handleDelete(exp.id, e)}
                        className="bg-slate-950 border border-slate-850 hover:bg-red-950/40 text-slate-500 hover:text-red-400 text-[10px] font-bold p-1.5 rounded-lg cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </section>

        {/* PAGINATION FOOTER */}
        {totalPages > 1 && !loading && (
          <footer className="flex justify-between items-center py-4 border-t border-slate-900 shrink-0 mt-4">
            <button
              disabled={currentPage === 0}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="p-2 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs text-slate-500">Page {currentPage + 1} of {totalPages}</span>
            <button
              disabled={currentPage + 1 >= totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="p-2 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </footer>
        )}

        {/* MODAL DETAIL WINDOW (Stage details view) */}
        {activeDetail && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 relative shadow-2xl flex flex-col max-h-[90vh] animate-scaleIn">
              <button
                onClick={() => setActiveDetail(null)}
                className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white rounded-lg transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="border-b border-slate-850 pb-4 mb-4 shrink-0 pr-8">
                <div className="flex items-center space-x-3">
                  <span className="text-lg font-bold text-slate-100">{activeDetail.company?.name}</span>
                  <span className="text-slate-600">&bull;</span>
                  <span className="text-sm text-slate-400 font-medium">{activeDetail.role}</span>
                  <span className="text-slate-600">&bull;</span>
                  <span className="text-sm text-slate-500">{activeDetail.yearOfInterview}</span>
                </div>
                <div className="flex items-center space-x-4 mt-2">
                  <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                    activeDetail.isSelected ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                  }`}>
                    {activeDetail.isSelected ? <CheckCircle className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                    <span>{activeDetail.isSelected ? 'Selected' : 'Rejected'}</span>
                  </span>
                  <span className="text-xs text-slate-500 flex items-center">
                    <ThumbsUp className="w-3.5 h-3.5 mr-1" /> {activeDetail.upvoteCount} Upvotes
                  </span>
                </div>
              </div>

              {/* Scrollable Stage-by-Stage List */}
              <div className="flex-grow overflow-y-auto space-y-6 pr-2">
                {activeDetail.stages?.map((stage, idx) => (
                  <div key={idx} className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-3">
                    <h4 className="font-semibold text-slate-200 text-sm flex items-center">
                      <span className="w-5 h-5 rounded-md bg-indigo-600/10 text-indigo-400 text-xs font-bold flex items-center justify-center border border-indigo-500/20 mr-2 shrink-0">
                        {stage.stageNumber}
                      </span>
                      {stage.stageName}
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed whitespace-pre-wrap">
                      {stage.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SUBMIT EXPERIENCE MODAL FORM */}
        {submitOpen && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 relative shadow-2xl flex flex-col max-h-[90vh] animate-scaleIn">
              <button
                onClick={() => setSubmitOpen(false)}
                className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white rounded-lg transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <h2 className="text-xl font-bold mb-4 text-slate-200 flex items-center shrink-0">
                <Plus className="w-5 h-5 text-indigo-400 mr-2" /> Submit Placement Experience
              </h2>

              <form onSubmit={handleCreateSubmit} className="flex-grow flex flex-col overflow-hidden">
                <div className="flex-grow overflow-y-auto space-y-5 pr-2 mb-4">
                  {/* General Review details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1.5">Target Company *</label>
                      <select
                        value={submitCompanyId}
                        onChange={(e) => setSubmitCompanyId(e.target.value)}
                        className="w-full bg-slate-950/40 border border-slate-800 rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500 text-sm text-slate-300"
                      >
                        {companies.map(c => <option key={c.id} value={c.id} className="bg-slate-950">{c.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1.5">Job Role / Title *</label>
                      <input
                        type="text"
                        value={submitRole}
                        onChange={(e) => setSubmitRole(e.target.value)}
                        placeholder="e.g. Associate Software Engineer"
                        className="w-full bg-slate-950/40 border border-slate-800 rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500 text-sm text-slate-200"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1.5">Interview Year *</label>
                      <input
                        type="number"
                        value={submitYear}
                        onChange={(e) => setSubmitYear(e.target.value)}
                        className="w-full bg-slate-950/40 border border-slate-800 rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500 text-sm text-slate-200"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1.5">Placement Outcome *</label>
                      <select
                        value={submitSelected ? 'true' : 'false'}
                        onChange={(e) => setSubmitSelected(e.target.value === 'true')}
                        className="w-full bg-slate-950/40 border border-slate-800 rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500 text-sm text-slate-300 cursor-pointer"
                      >
                        <option value="true" className="bg-slate-950">Selected (Offer Received)</option>
                        <option value="false" className="bg-slate-950">Rejected (Try Again)</option>
                      </select>
                    </div>
                  </div>

                  {/* Dynamic Round Stages Section */}
                  <div className="border-t border-slate-850 pt-5 space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-semibold text-slate-200">Interview Round Stages (Add Stage-wise Details)</h3>
                      <button
                        type="button"
                        onClick={addSubmitStage}
                        className="flex items-center space-x-1 text-[10px] bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-600/20 px-2.5 py-1.5 rounded-lg transition cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Stage</span>
                      </button>
                    </div>

                    {submitStages.map((stage, idx) => (
                      <div key={idx} className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 relative space-y-3">
                        <button
                          type="button"
                          disabled={submitStages.length === 1}
                          onClick={() => removeSubmitStage(idx)}
                          className="absolute top-4 right-4 p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <div className="pr-8 space-y-3">
                          <div className="flex items-center space-x-2">
                            <span className="w-5 h-5 rounded bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold flex items-center justify-center shrink-0">
                              {stage.stageNumber}
                            </span>
                            <input
                              type="text"
                              value={stage.stageName}
                              onChange={(e) => updateStageField(idx, 'stageName', e.target.value)}
                              placeholder="e.g. Round 1: Online Coding Test"
                              className="w-full bg-slate-950/40 border border-slate-800 rounded-xl px-3 py-1.5 focus:outline-none focus:border-indigo-500 text-xs text-slate-200"
                            />
                          </div>
                          <textarea
                            value={stage.content}
                            onChange={(e) => updateStageField(idx, 'content', e.target.value)}
                            placeholder="Detail what questions were asked, difficulty levels, duration, and tips..."
                            rows="2"
                            className="w-full bg-slate-950/40 border border-slate-800 rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500 text-xs text-slate-200 resize-none"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Submit actions */}
                <div className="flex space-x-3 pt-2 shrink-0 border-t border-slate-850">
                  <button
                    type="button"
                    onClick={() => setSubmitOpen(false)}
                    className="w-1/2 py-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-semibold rounded-xl transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-1/2 py-2.5 bg-indigo-600 hover:bg-indigo-505 text-white text-xs font-semibold rounded-xl transition cursor-pointer shadow-md flex justify-center items-center"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Placement Review'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Experiences;
