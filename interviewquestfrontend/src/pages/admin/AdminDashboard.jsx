import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, ShieldAlert, Users, Building2, CheckCircle, 
  XCircle, Trash2, Edit3, Plus, Loader2, Filter, X, ChevronLeft, 
  ChevronRight, ArrowLeft, BookOpen, AlertCircle, ExternalLink, HelpCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Tab State: 'questions' | 'companies'
  const [activeTab, setActiveTab] = useState('questions');

  // Stats Counters
  const [companiesCount, setCompaniesCount] = useState(0);

  // General States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // MCQ Question Bank States
  const [questions, setQuestions] = useState([]);
  const [qPage, setQPage] = useState(0);
  const [qTotalPages, setQTotalPages] = useState(0);
  const [topicFilter, setTopicFilter] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');

  // Question Form Modal States
  const [questionModalOpen, setQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [qTopic, setQTopic] = useState('DSA');
  const [qDifficulty, setQDifficulty] = useState('EASY');
  const [qText, setQText] = useState('');
  const [qOptions, setQOptions] = useState(['', '', '', '']);
  const [qCorrectOptionIdx, setQCorrectOptionIdx] = useState(0);
  const [qExplanation, setQExplanation] = useState('');
  const [qSubmitting, setQSubmitting] = useState(false);

  const topics = ['DSA', 'DBMS', 'OS', 'CN', 'OOP', 'APTITUDE'];
  const difficulties = ['EASY', 'MEDIUM', 'HARD'];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    fetchCompaniesCount();
  }, []);

  useEffect(() => {
    setError('');
    setSuccess('');
    if (activeTab === 'questions') {
      fetchQuestions();
    }
  }, [activeTab, qPage, topicFilter, difficultyFilter]);

  const fetchCompaniesCount = async () => {
    try {
      const response = await API.get('/api/public/companies');
      setCompaniesCount(response.data?.length || 0);
    } catch (err) {
      console.error('Failed to load companies count', err);
    }
  };

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const params = {
        page: qPage,
        size: 8
      };
      if (topicFilter) params.topic = topicFilter;
      if (difficultyFilter) params.difficulty = difficultyFilter;

      const response = await API.get('/api/admin/questions', { params });
      setQuestions(response.data?.content || []);
      setQTotalPages(response.data?.totalPages || 0);
    } catch (err) {
      setError('Failed to fetch MCQ questions.');
    } finally {
      setLoading(false);
    }
  };

  // Question CRUD Handlers
  const handleOpenAddQuestion = () => {
    setEditingQuestion(null);
    setQTopic('DSA');
    setQDifficulty('EASY');
    setQText('');
    setQOptions(['', '', '', '']);
    setQCorrectOptionIdx(0);
    setQExplanation('');
    setError('');
    setSuccess('');
    setQuestionModalOpen(true);
  };

  const handleOpenEditQuestion = (q) => {
    setEditingQuestion(q);
    setQTopic(q.topic);
    setQDifficulty(q.difficulty);
    setQText(q.questionText);
    setQOptions(q.options && q.options.length === 4 ? [...q.options] : ['', '', '', '']);

    const idx = q.options.findIndex(opt => opt.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase());
    setQCorrectOptionIdx(idx !== -1 ? idx : 0);
    setQExplanation(q.explanation || '');
    setError('');
    setSuccess('');
    setQuestionModalOpen(true);
  };

  const handleOptionChange = (index, value) => {
    const updated = [...qOptions];
    updated[index] = value;
    setQOptions(updated);
  };

  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    if (!qText.trim()) {
      setError('Question text is required.');
      return;
    }
    if (qOptions.some(opt => !opt.trim())) {
      setError('All 4 option choices are required.');
      return;
    }

    try {
      setQSubmitting(true);
      setError('');

      const payload = {
        topic: qTopic,
        difficulty: qDifficulty,
        questionText: qText.trim(),
        options: qOptions.map(o => o.trim()),
        correctAnswer: qOptions[qCorrectOptionIdx].trim(),
        explanation: qExplanation.trim() || null
      };

      if (editingQuestion) {
        await API.put(`/api/admin/questions/${editingQuestion.id}`, payload);
        setSuccess('Question updated successfully!');
      } else {
        await API.post('/api/admin/questions', payload);
        setSuccess('Question created successfully in MCQ bank!');
      }
      setQuestionModalOpen(false);
      fetchQuestions();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save question.');
    } finally {
      setQSubmitting(false);
    }
  };

  const handleDeleteQuestion = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this question from the MCQ bank?')) return;
    try {
      setError('');
      setSuccess('');
      await API.delete(`/api/admin/questions/${id}`);
      setSuccess('Question deleted successfully from database!');
      fetchQuestions();
    } catch (err) {
      setError('Failed to delete question.');
    }
  };

  const resetQuestionFilters = () => {
    setTopicFilter('');
    setDifficultyFilter('');
    setQPage(0);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 relative overflow-hidden">
      {/* Visual background decor */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-rose-500/5 blur-[100px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/5 blur-[100px]" />

      <div className="max-w-6xl mx-auto z-10 relative">
        {/* Navigation header */}
        <header className="flex justify-between items-center mb-10 border-b border-slate-900 pb-5">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-xl transition text-slate-400 hover:text-white cursor-pointer mr-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-rose-400 to-orange-400 bg-clip-text text-transparent flex items-center">
                <ShieldAlert className="w-6 h-6 text-rose-500 mr-2 shrink-0 animate-pulse" />
                Moderator Central
              </h1>
              <p className="text-xs text-slate-500">Welcome, Administrator {user?.username}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white px-4 py-2 rounded-xl transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </header>

        {/* Feedback alerts */}
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-6 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm mb-6 flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Overview Stats Row */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
          <div className="bg-slate-900/40 border border-slate-900 p-5 rounded-2xl flex items-center space-x-4">
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl"><Building2 className="w-6 h-6" /></div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Registered Companies</p>
              <p className="text-2xl font-bold text-slate-200 mt-0.5">{companiesCount}</p>
            </div>
          </div>
          <div className="bg-slate-900/40 border border-slate-900 p-5 rounded-2xl flex items-center space-x-4">
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl"><Users className="w-6 h-6" /></div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Access Privilege</p>
              <p className="text-md font-bold text-indigo-400 mt-1">Super User (Admin)</p>
            </div>
          </div>
        </section>

        {/* Interactive Tab Switcher */}
        <section className="flex border-b border-slate-900 mb-8 space-x-8">
          <button
            onClick={() => setActiveTab('questions')}
            className={`pb-4 text-sm font-semibold transition cursor-pointer flex items-center space-x-2 relative ${
              activeTab === 'questions' ? 'text-orange-400 border-b-2 border-orange-500' : 'text-slate-500 hover:text-slate-350'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>MCQ Question Bank</span>
          </button>
          <button
            onClick={() => setActiveTab('companies')}
            className={`pb-4 text-sm font-semibold transition cursor-pointer flex items-center space-x-2 relative ${
              activeTab === 'companies' ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-500 hover:text-slate-355'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Manage Companies</span>
          </button>
        </section>

        {/* TAB CONTENTS */}
        <section className="min-h-[300px]">
          {loading && (
            <div className="flex flex-col justify-center items-center py-16 text-slate-500">
              <Loader2 className="w-10 h-10 animate-spin text-orange-500 mb-4" />
              <p className="text-xs">Processing database queries...</p>
            </div>
          )}

          {/* TAB 2: MCQ QUESTION BANK MANAGEMENT */}
          {!loading && activeTab === 'questions' && (
            <div className="space-y-6">
              {/* Toolbar & Filters */}
              <div className="flex flex-col sm:flex-row justify-between gap-4 bg-slate-900/20 border border-slate-900 p-4 rounded-2xl">
                <div className="flex flex-wrap gap-3 items-center">
                  <div className="flex items-center space-x-2 text-xs text-slate-400 uppercase tracking-wider font-semibold">
                    <Filter className="w-4 h-4 text-orange-400" />
                    <span>Filter:</span>
                  </div>
                  <select
                    value={topicFilter}
                    onChange={(e) => { setTopicFilter(e.target.value); setQPage(0); }}
                    className="bg-slate-950 border border-slate-850 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none"
                  >
                    <option value="">All Topics</option>
                    {topics.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <select
                    value={difficultyFilter}
                    onChange={(e) => { setDifficultyFilter(e.target.value); setQPage(0); }}
                    className="bg-slate-950 border border-slate-850 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none"
                  >
                    <option value="">All Difficulties</option>
                    {difficulties.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  {(topicFilter || difficultyFilter) && (
                    <button
                      onClick={resetQuestionFilters}
                      className="text-xs font-semibold text-orange-400 hover:underline cursor-pointer"
                    >
                      Reset Filters
                    </button>
                  )}
                </div>

                <button
                  onClick={handleOpenAddQuestion}
                  className="flex items-center justify-center space-x-1.5 text-xs bg-orange-600 hover:bg-orange-500 text-white font-medium px-4 py-2 rounded-xl transition cursor-pointer shadow-md self-end sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Question</span>
                </button>
              </div>

              {/* Questions Grid */}
              {questions.length === 0 ? (
                <div className="text-center py-16 bg-slate-900/10 border border-slate-900 border-dashed rounded-3xl text-slate-500">
                  <HelpCircle className="w-12 h-12 mx-auto mb-3 text-slate-800" />
                  <p className="text-sm">No MCQ questions registered in database.</p>
                  <button onClick={handleOpenAddQuestion} className="mt-3 text-xs text-orange-400 hover:underline cursor-pointer">Register one now</button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {questions.map((q) => (
                    <div
                      key={q.id}
                      className="bg-slate-900/30 border border-slate-900 hover:border-slate-800 rounded-2xl p-5 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex space-x-2">
                            <span className="px-2 py-0.5 rounded bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[9px] font-bold">
                              {q.topic}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                              q.difficulty === 'EASY' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-455' :
                              q.difficulty === 'MEDIUM' ? 'bg-amber-500/10 border-amber-500/20 text-amber-455' :
                              'bg-rose-500/10 border-rose-500/20 text-rose-455'
                            }`}>
                              {q.difficulty}
                            </span>
                          </div>
                          <div className="flex space-x-1">
                            <button
                              onClick={() => handleOpenEditQuestion(q)}
                              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg cursor-pointer"
                              title="Edit Question"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteQuestion(q.id)}
                              className="p-1.5 bg-red-950/40 hover:bg-red-950/80 text-red-400 border border-red-900/30 rounded-lg cursor-pointer"
                              title="Delete Question"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <p className="text-xs text-slate-350 font-medium mb-4 leading-relaxed line-clamp-3">
                          {q.questionText}
                        </p>
                      </div>

                      <div className="border-t border-slate-900 pt-3">
                        <p className="text-[10px] text-slate-500 font-semibold uppercase">Correct Answer:</p>
                        <p className="text-xs font-semibold text-emerald-400 mt-1 truncate">
                          {q.correctAnswer}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Questions Pagination */}
              {qTotalPages > 1 && (
                <footer className="flex justify-between items-center py-4 border-t border-slate-900 mt-4">
                  <button
                    disabled={qPage === 0}
                    onClick={() => setQPage(qPage - 1)}
                    className="p-2 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs text-slate-500">Page {qPage + 1} of {qTotalPages}</span>
                  <button
                    disabled={qPage + 1 >= qTotalPages}
                    onClick={() => setQPage(qPage + 1)}
                    className="p-2 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </footer>
              )}
            </div>
          )}

          {/* TAB 3: COMPANIES DIRECTORY LINK */}
          {!loading && activeTab === 'companies' && (
            <div className="bg-slate-900/20 border border-slate-900 rounded-3xl p-8 max-w-xl mx-auto text-center">
              <Building2 className="w-14 h-14 mx-auto text-indigo-400 mb-4 animate-pulse" />
              <h3 className="text-lg font-bold mb-2">Company Registry Panel</h3>
              <p className="text-slate-500 text-xs leading-relaxed mb-6 max-w-md mx-auto">
                Company additions, deletions, descriptions, and recruitment logos are managed directly inside the central Companies Directory module.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button
                  onClick={() => navigate('/companies')}
                  className="flex items-center justify-center space-x-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-505 text-white font-medium rounded-xl transition cursor-pointer text-xs shadow-md"
                >
                  <span>Open Companies Directory</span>
                  <ExternalLink className="w-4 h-4" />
                </button>
                <button
                  onClick={() => navigate('/companies?add=true')}
                  className="flex items-center justify-center space-x-1 px-5 py-3 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white font-medium rounded-xl transition cursor-pointer text-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Register a Recruiter</span>
                </button>
              </div>
            </div>
          )}
        </section>

        {/* MODAL WINDOW 1: INSPECT PENDING EXPERIENCES DETAIL - REMOVED */}

        {/* MODAL WINDOW 2: CREATE / EDIT MCQ QUESTION */}
        {questionModalOpen && (
          <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 relative shadow-2xl flex flex-col max-h-[90vh] animate-scaleIn">
              <button
                onClick={() => setQuestionModalOpen(false)}
                className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white rounded-lg transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <h2 className="text-lg font-bold mb-4 text-slate-200 flex items-center border-b border-slate-850 pb-3 shrink-0">
                <BookOpen className="w-5 h-5 text-orange-400 mr-2" />
                {editingQuestion ? 'Edit MCQ Question' : 'Add Question to MCQ Bank'}
              </h2>

              <form onSubmit={handleSaveQuestion} className="flex-grow flex flex-col overflow-hidden">
                <div className="flex-grow overflow-y-auto space-y-4 pr-2 pb-4 mb-4">
                  {/* Select filters */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-1.5 uppercase">Topic</label>
                      <select
                        value={qTopic}
                        onChange={(e) => setQTopic(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 focus:outline-none focus:border-orange-500 text-xs text-slate-300"
                      >
                        {topics.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-1.5 uppercase">Difficulty</label>
                      <select
                        value={qDifficulty}
                        onChange={(e) => setQDifficulty(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 focus:outline-none focus:border-orange-500 text-xs text-slate-300"
                      >
                        {difficulties.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Question Text */}
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-1.5 uppercase">Question Text *</label>
                    <textarea
                      value={qText}
                      onChange={(e) => setQText(e.target.value)}
                      placeholder="Type the conceptual MCQ question here..."
                      rows="3"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 focus:outline-none focus:border-orange-500 text-xs text-slate-200 resize-none"
                    />
                  </div>

                  {/* Option Choices */}
                  <div className="space-y-3">
                    <label className="block text-[10px] font-semibold text-slate-500 uppercase">Option Choices *</label>
                    {qOptions.map((opt, idx) => (
                      <div key={idx} className="flex items-center space-x-3 bg-slate-950 border border-slate-850 p-2.5 rounded-xl">
                        <label className="flex items-center cursor-pointer shrink-0">
                          <input
                            type="radio"
                            name="correctAnswerIndex"
                            checked={qCorrectOptionIdx === idx}
                            onChange={() => setQCorrectOptionIdx(idx)}
                            className="w-4 h-4 text-orange-500 border-slate-800 focus:ring-orange-500 focus:ring-offset-slate-900 focus:ring-2 cursor-pointer bg-slate-900"
                          />
                          <span className="text-xs font-semibold text-slate-400 ml-2 uppercase">
                            Opt {String.fromCharCode(65 + idx)}
                          </span>
                        </label>
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => handleOptionChange(idx, e.target.value)}
                          placeholder={`Enter Option ${String.fromCharCode(65 + idx)} text`}
                          className="w-full bg-transparent border-none focus:outline-none text-xs text-slate-200"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Explanation */}
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-1.5 uppercase">Answer Explanation</label>
                    <textarea
                      value={qExplanation}
                      onChange={(e) => setQExplanation(e.target.value)}
                      placeholder="Add step-by-step reasoning or details for candidates..."
                      rows="2"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 focus:outline-none focus:border-orange-500 text-xs text-slate-200 resize-none"
                    />
                  </div>
                </div>

                {/* Form Action buttons */}
                <div className="flex space-x-3 pt-3 border-t border-slate-850 shrink-0">
                  <button
                    type="button"
                    onClick={() => setQuestionModalOpen(false)}
                    className="w-1/2 py-2.5 bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-semibold rounded-xl transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={qSubmitting}
                    className="w-1/2 py-2.5 bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold rounded-xl transition cursor-pointer shadow-md flex justify-center items-center"
                  >
                    {qSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Question'}
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

export default AdminDashboard;
