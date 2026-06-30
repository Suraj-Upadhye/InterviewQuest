import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  ArrowLeft, Timer, BookOpen, Calendar, Award, CheckCircle2,
  XCircle, AlertCircle, Loader2, PlayCircle, History, RefreshCw,
  Plus, Edit3, Trash2, ChevronRight, ChevronDown, Check, HelpCircle,
  Layers, Sparkles, PlusCircle, Trash, Menu, LogOut, Search
} from 'lucide-react';
import Navbar from '../../components/Navbar';


const iconMap = {
  Cpu: Layers,
  Database: Layers,
  Globe: Layers,
  GitFork: Layers,
  Code: Layers,
  Layers: Layers,
  BookOpen: BookOpen
};

const Assessments = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { subjectSlug, topicSlug, quizId, subjectSlugs } = useParams();
  const { user, isAdmin } = useAuth();

  // Core data states
  const [subjects, setSubjects] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [activeSubject, setActiveSubject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Quiz execution states
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [answers, setAnswers] = useState({}); // { questionId: selectedOption }
  const [currentIdx, setCurrentIdx] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  // Mixed quiz states
  const [isMixQuiz, setIsMixQuiz] = useState(false);
  const [mixSubjectSlugs, setMixSubjectSlugs] = useState('');



  // Admin Modals & Forms States
  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const [quizTitle, setQuizTitle] = useState('');
  const [quizTopicId, setQuizTopicId] = useState('');
  const [isAiGenerated, setIsAiGenerated] = useState(false);
  const [aiDifficulty, setAiDifficulty] = useState('MEDIUM');
  const [aiNumQuestions, setAiNumQuestions] = useState(5);
  const [quizSaving, setQuizSaving] = useState(false);

  // Admin MCQ Management Modal
  const [mcqModalOpen, setMcqModalOpen] = useState(false);
  const [selectedQuizForMcq, setSelectedQuizForMcq] = useState(null);
  const [mcqText, setMcqText] = useState('');
  const [mcqOptions, setMcqOptions] = useState(['', '', '', '']);
  const [mcqCorrectAnswer, setMcqCorrectAnswer] = useState('');
  const [mcqExplanation, setMcqExplanation] = useState('');
  const [mcqDifficulty, setMcqDifficulty] = useState('MEDIUM');
  const [mcqSaving, setMcqSaving] = useState(false);

  // Admin review questions state
  const [expandedQuizReviewId, setExpandedQuizReviewId] = useState(null);

  // Fetch subjects list & attempts history on mount
  useEffect(() => {
    fetchInitialData();
  }, []);

  // Sync logic when routes change
  useEffect(() => {
    if (subjects.length === 0) return;
    resolveRouteState();
  }, [location.pathname, subjects]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const response = await API.get('/api/public/subjects');
      const loadedSubjects = response.data || [];
      setSubjects(loadedSubjects);
    } catch (err) {
      console.error('Failed to load initial quiz data', err);
      setError('Could not load subjects. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resolveRouteState = async () => {
    try {
      setError('');
      // Case 1: Active Quiz Attempt page
      if (location.pathname.startsWith('/practice-quiz/attempt/')) {
        setIsMixQuiz(false);
        await loadQuizSession(quizId);
      }
      // Case 2: Mix Quiz Attempt page
      else if (location.pathname.startsWith('/practice-quiz/mix/')) {
        setIsMixQuiz(true);
        setMixSubjectSlugs(subjectSlugs);
        await loadMixQuizSession(subjectSlugs);
      }
      // Case 3: Subject Specific page
      else if (subjectSlug) {
        setIsMixQuiz(false);
        setActiveQuiz(null);
        setResult(null);

        // Find subject by slug or code
        const subject = subjects.find(
          s => s.slug === subjectSlug || s.code.toLowerCase() === subjectSlug.toLowerCase()
        );

        if (subject) {
          setActiveSubject(subject);
          await fetchQuizzesForSubject(subject.slug);
        } else {
          setError('Subject category not found.');
          setActiveSubject(null);
        }
      }
      // Case 4: Practice Quiz landing page
      else {
        setIsMixQuiz(false);
        setActiveSubject(null);
        setActiveQuiz(null);
        setResult(null);
      }
    } catch (err) {
      setError('Failed to resolve page state.');
    }
  };

  const fetchQuizzesForSubject = async (slug) => {
    try {
      const response = await API.get(`/api/public/subjects/${slug}/quizzes`);
      setQuizzes(response.data || []);
    } catch (err) {
      console.error('Failed to fetch quizzes', err);
      setError('Failed to fetch quizzes list.');
    }
  };

  const loadQuizSession = async (qId) => {
    try {
      setLoading(true);
      const response = await API.get(`/api/public/quizzes/${qId}`);
      const questions = response.data || [];
      if (questions.length === 0) {
        throw new Error('This quiz has no questions yet.');
      }
      setQuizQuestions(questions);
      setAnswers({});
      setCurrentIdx(0);
      setResult(null);
      setActiveQuiz({ id: qId, title: 'Quiz Session' });
    } catch (err) {
      setError(err.message || 'Could not load quiz questions.');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const loadMixQuizSession = async (slugs) => {
    try {
      setLoading(true);
      const response = await API.get(`/api/public/quizzes/mix/${slugs}?limit=15`);
      const questions = response.data || [];
      if (questions.length === 0) {
        throw new Error('No practice questions found for these subjects.');
      }
      setQuizQuestions(questions);
      setAnswers({});
      setCurrentIdx(0);
      setResult(null);
      setActiveQuiz({ id: 'mix', title: 'Mixed Subjects Practice' });
    } catch (err) {
      setError(err.message || 'Could not load mixed practice questions.');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const selectOption = (questionId, option) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: option
    }));
  };

  const handleQuizSubmit = async () => {
    if (submitting) return;

    try {
      setSubmitting(true);
      setError('');

      const formattedAnswers = quizQuestions.map(q => ({
        questionId: q.id,
        submittedAnswer: answers[q.id] || ''
      }));

      const payload = { answers: formattedAnswers };
      let response;

      if (isMixQuiz) {
        response = await API.post(`/api/public/quizzes/mix/${mixSubjectSlugs}/submit`, payload);
      } else {
        response = await API.post(`/api/public/quizzes/${quizId}/submit`, payload);
      }

      setResult(response.data);
      setActiveQuiz(null);
    } catch (err) {
      setError('Failed to submit results. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Admin: Create Quiz shell or AI generation
  const handleSaveQuiz = async (e) => {
    e.preventDefault();
    if (!quizTitle.trim()) {
      alert('Please enter a quiz title.');
      return;
    }

    try {
      setQuizSaving(true);
      const payload = {
        title: quizTitle.trim(),
        subjectId: activeSubject.id,
        syllabusTopicId: quizTopicId ? parseInt(quizTopicId) : null,
        aiGenerated: isAiGenerated,
        difficulty: aiDifficulty,
        numQuestions: aiNumQuestions
      };

      let response;
      if (isAiGenerated) {
        response = await API.post('/api/admin/quizzes/generate-ai', payload);
      } else {
        response = await API.post('/api/admin/quizzes', payload);
      }

      setQuizModalOpen(false);
      setQuizTitle('');
      setQuizTopicId('');
      setIsAiGenerated(false);
      fetchQuizzesForSubject(activeSubject.slug);
    } catch (err) {
      alert('Failed to save quiz: ' + (err.response?.data?.message || err.message));
    } finally {
      setQuizSaving(false);
    }
  };

  // Admin: Delete Quiz
  const handleDeleteQuiz = async (id, title) => {
    if (!window.confirm(`Are you sure you want to permanently delete the quiz "${title}"?`)) return;
    try {
      await API.delete(`/api/admin/quizzes/${id}`);
      fetchQuizzesForSubject(activeSubject.slug);
    } catch (err) {
      alert('Failed to delete quiz.');
    }
  };

  // Admin: Add Question Manually
  const handleOpenAddMcq = (quiz) => {
    setSelectedQuizForMcq(quiz);
    setMcqText('');
    setMcqOptions(['', '', '', '']);
    setMcqCorrectAnswer('');
    setMcqExplanation('');
    setMcqDifficulty('MEDIUM');
    setMcqModalOpen(true);
  };

  const handleSaveMcq = async (e) => {
    e.preventDefault();
    if (!mcqText.trim() || !mcqCorrectAnswer.trim()) {
      alert('Please complete all question fields.');
      return;
    }

    if (!mcqOptions.includes(mcqCorrectAnswer)) {
      alert('Correct answer must match one of the options.');
      return;
    }

    try {
      setMcqSaving(true);
      const payload = {
        questionText: mcqText.trim(),
        options: mcqOptions.map(o => o.trim()),
        correctAnswer: mcqCorrectAnswer.trim(),
        explanation: mcqExplanation.trim(),
        difficulty: mcqDifficulty
      };

      await API.post(`/api/admin/quizzes/${selectedQuizForMcq.id}/questions`, payload);
      setMcqModalOpen(false);
      fetchQuizzesForSubject(activeSubject.slug);
      setExpandedQuizReviewId(selectedQuizForMcq.id); // Expand review checklist
    } catch (err) {
      alert('Failed to add MCQ: ' + (err.response?.data?.message || err.message));
    } finally {
      setMcqSaving(false);
    }
  };

  const handleDeleteMcq = async (mcqId) => {
    if (!window.confirm('Delete this question?')) return;
    try {
      await API.delete(`/api/admin/questions/${mcqId}`);
      fetchQuizzesForSubject(activeSubject.slug);
    } catch (err) {
      alert('Failed to delete question.');
    }
  };

  // UI helpers
  const getSubjectColor = (slug) => {
    const colors = {
      "operating-systems": "text-pink-500 border-pink-500/20 dark:bg-pink-500/5",
      "database-management-systems": "text-purple-500 border-purple-500/20 dark:bg-purple-500/5",
      "computer-networks": "text-emerald-500 border-emerald-500/20 dark:bg-emerald-500/5",
      "object-oriented-programming": "text-amber-500 border-amber-500/20 dark:bg-amber-500/5",
      "data-structures-and-algorithms": "text-blue-500 border-blue-500/20 dark:bg-blue-500/5"
    };
    return colors[slug] || "text-indigo-500 border-indigo-500/20 dark:bg-indigo-500/5";
  };

  // Calculate subject completed vs total quizzes
  const getProgressStats = () => {
    if (quizzes.length === 0) return { attemptedCount: 0, totalCount: 0, pct: 0 };
    const attemptedCount = quizzes.filter(q => q.attempted).length;
    const totalCount = quizzes.length;
    const pct = Math.round((attemptedCount / totalCount) * 100);
    return { attemptedCount, totalCount, pct };
  };

  // Dynamic grouping of quizzes by SyllabusTopic defined by Admin
  const groupQuizzesByTopic = () => {
    if (!activeSubject) return {};
    const groups = {};

    // Initialize subject's topics
    if (activeSubject.topics) {
      activeSubject.topics.forEach(topic => {
        groups[topic.slug] = {
          title: topic.title,
          slug: topic.slug,
          quizzes: []
        };
      });
    }

    // Add a default General group
    groups['general'] = {
      title: 'General Practice Quizzes',
      slug: 'general',
      quizzes: []
    };

    // Distribute quizzes into groups
    quizzes.forEach(quiz => {
      const topicSlug = quiz.syllabusTopicSlug;
      if (topicSlug && groups[topicSlug]) {
        groups[topicSlug].quizzes.push(quiz);
      } else {
        groups['general'].quizzes.push(quiz);
      }
    });

    return groups;
  };

  const groupedQuizCatalog = groupQuizzesByTopic();

  // Loader state
  if (loading && !activeQuiz) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 flex flex-col justify-center items-center">
        <Loader2 className="w-10 h-10 animate-spin text-purple-600 dark:text-purple-400 mb-4" />
        <p className="text-zinc-500 dark:text-zinc-400 text-xs">Loading practice modules...</p>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW A: Active Quiz execution screen (NO TIMER, Clean styling)
  // -------------------------------------------------------------
  if (activeQuiz && quizQuestions.length > 0) {
    const currentQuestion = quizQuestions[currentIdx];
    return (
      <div className="min-h-screen bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 p-6 flex flex-col justify-between">
        <div className="max-w-3xl mx-auto w-full pt-10">
          {/* Header */}
          <header className="flex justify-between items-center mb-8 border-b border-zinc-150 dark:border-zinc-900 pb-5">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => {
                  if (window.confirm('Leave active practice session? Progress will be lost.')) {
                    navigate(-1);
                  }
                }}
                className="p-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-150 dark:hover:bg-zinc-800 rounded-xl transition text-zinc-500 hover:text-zinc-950 dark:hover:text-white cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h1 className="text-xl font-extrabold text-zinc-950 dark:text-white">
                  {isMixQuiz ? 'Mixed Subject Practice' : activeSubject?.title}
                </h1>
                <p className="text-[10px] text-zinc-400 font-bold uppercase mt-0.5">
                  {isMixQuiz ? '15 Questions Practice' : 'Topic-Specific Quiz'}
                </p>
              </div>
            </div>

            <div className="px-3.5 py-1.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[10px] font-mono font-bold rounded-lg text-zinc-500">
              Question {currentIdx + 1} of {quizQuestions.length}
            </div>
          </header>

          {/* Question Grid Selection */}
          <div className="bg-zinc-50/50 dark:bg-[#0d0d11]/40 border border-zinc-200/60 dark:border-zinc-900/60 rounded-xl p-4 flex flex-wrap gap-2 justify-center mb-6">
            {quizQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIdx(idx)}
                className={`w-9 h-9 text-xs font-bold rounded-xl border transition cursor-pointer ${
                  currentIdx === idx
                    ? 'bg-zinc-950 dark:bg-white border-zinc-950 dark:border-white text-white dark:text-zinc-950'
                    : answers[q.id]
                    ? 'bg-purple-100 dark:bg-purple-950/40 border-purple-300 dark:border-purple-900/80 text-purple-750 dark:text-purple-400'
                    : 'bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-850 text-zinc-400 dark:text-zinc-500 hover:border-zinc-400 dark:hover:border-zinc-700'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          {/* Question Display Card */}
          <div className="bg-zinc-50 dark:bg-[#0d0d11] border border-zinc-200 dark:border-zinc-900 rounded-2xl p-8 shadow-sm">
            <div className="flex items-center space-x-2 mb-4">
              <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                currentQuestion.difficulty === 'EASY'
                  ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                  : currentQuestion.difficulty === 'HARD'
                  ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                  : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
              }`}>
                {currentQuestion.difficulty}
              </span>
            </div>

            <h2 className="text-base sm:text-lg font-bold text-zinc-950 dark:text-zinc-100 leading-relaxed mb-6">
              {currentQuestion.questionText}
            </h2>

            {/* Answer Options list */}
            <div className="space-y-3">
              {currentQuestion.options.map((option, optIdx) => {
                const isSelected = answers[currentQuestion.id] === option;
                return (
                  <button
                    key={optIdx}
                    onClick={() => selectOption(currentQuestion.id, option)}
                    className={`w-full text-left px-5 py-4 border rounded-xl text-xs font-semibold transition duration-200 flex justify-between items-center cursor-pointer ${
                      isSelected
                        ? 'border-purple-600 dark:border-purple-400 bg-purple-500/5 text-purple-700 dark:text-purple-300'
                        : 'border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-950/40 text-zinc-650 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:border-zinc-450 dark:hover:border-zinc-700'
                    }`}
                  >
                    <span>{option}</span>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      isSelected ? 'border-purple-600 dark:border-purple-400 bg-purple-600 dark:bg-purple-400' : 'border-zinc-300 dark:border-zinc-700'
                    }`}>
                      {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Navigation buttons */}
            <div className="flex justify-between items-center mt-8 border-t border-zinc-200 dark:border-zinc-900 pt-6">
              <button
                disabled={currentIdx === 0}
                onClick={() => setCurrentIdx(currentIdx - 1)}
                className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg text-xs font-bold transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer text-zinc-700 dark:text-zinc-300"
              >
                Previous
              </button>

              {currentIdx + 1 === quizQuestions.length ? (
                <button
                  onClick={handleQuizSubmit}
                  disabled={submitting}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition disabled:opacity-50"
                >
                  {submitting ? 'Evaluating...' : 'Complete Practice'}
                </button>
              ) : (
                <button
                  onClick={() => setCurrentIdx(currentIdx + 1)}
                  className="px-5 py-2 bg-zinc-950 dark:bg-white hover:bg-zinc-850 dark:hover:bg-zinc-250 text-white dark:text-zinc-950 text-xs font-bold rounded-lg transition cursor-pointer"
                >
                  Next
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW B: Quiz Graded review scorecard screen
  // -------------------------------------------------------------
  if (result) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 relative overflow-hidden transition-colors duration-300">
        <Navbar variant="app" />
        <div className="max-w-3xl mx-auto w-full pt-28 px-6 pb-12 space-y-6 z-10 relative">
          {/* Main Card */}
          <div className="bg-zinc-50 dark:bg-[#0d0d11] border border-zinc-200 dark:border-zinc-900 rounded-2xl p-8 text-center shadow-sm relative overflow-hidden">
            <Award className="w-14 h-14 mx-auto text-purple-600 dark:text-purple-400 mb-4 animate-bounce" />
            <h2 className="text-xl font-extrabold text-zinc-950 dark:text-white">Practice Graded Successfully!</h2>
            <p className="text-zinc-450 text-[10px] font-bold uppercase tracking-wider mt-1">{result.subjectTitle} • {result.quizTitle}</p>

            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mt-8 mb-6">
              <div className="bg-white dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-900 p-4 rounded-xl shadow-sm">
                <p className="text-[9px] text-zinc-400 font-extrabold uppercase">Total Questions</p>
                <p className="text-xl font-bold mt-1 text-zinc-700 dark:text-zinc-300">{result.totalQuestions}</p>
              </div>
              <div className="bg-white dark:bg-zinc-955 border border-zinc-150 dark:border-zinc-900 p-4 rounded-xl shadow-sm">
                <p className="text-[9px] text-zinc-400 font-extrabold uppercase">Your Score</p>
                <p className="text-xl font-bold mt-1 text-purple-600 dark:text-purple-400">{result.score}</p>
              </div>
              <div className="bg-white dark:bg-zinc-955 border border-zinc-150 dark:border-zinc-900 p-4 rounded-xl shadow-sm">
                <p className="text-[9px] text-zinc-400 font-extrabold uppercase">Percentage</p>
                <p className={`text-xl font-bold mt-1 ${result.percentage >= 70 ? 'text-emerald-500' : result.percentage >= 40 ? 'text-amber-500' : 'text-red-500'}`}>{result.percentage}%</p>
              </div>
            </div>

            <button
              onClick={() => {
                setResult(null);
                setActiveQuiz(null);
                const lastSlug = activeSubject?.slug || sessionStorage.getItem('lastActiveSubjectSlug');
                if (lastSlug) {
                  navigate(`/practice-quiz/${lastSlug}`);
                } else {
                  navigate('/practice-quiz');
                }
              }}
              className="bg-zinc-950 dark:bg-white hover:bg-zinc-850 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 font-bold px-6 py-2.5 rounded-xl text-xs transition cursor-pointer shadow-md border-none"
            >
              Done Reviewing
            </button>
          </div>

          {/* Question-by-Question detailed review */}
          <div className="space-y-4">
            <h3 className="text-base font-black text-zinc-900 dark:text-white uppercase tracking-wider">Question-by-Question Review</h3>
            {result.details.map((detail, idx) => (
              <div key={idx} className="bg-zinc-50 dark:bg-[#0d0d11] border border-zinc-200 dark:border-zinc-900 rounded-xl p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <h4 className="text-xs font-bold leading-relaxed pr-6 text-zinc-900 dark:text-zinc-200">
                    {idx + 1}. {detail.questionText}
                  </h4>
                  <span className={`px-2.5 py-1 rounded-full text-[9px] font-extrabold flex items-center space-x-1 shrink-0 ${
                    detail.correct ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-red-500/10 text-red-600 dark:text-red-400'
                  }`}>
                    {detail.correct ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        <span>Correct</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3 mr-1" />
                        <span>Incorrect</span>
                      </>
                    )}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                  <div className="p-3 bg-white dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-900 rounded-xl">
                    <span className="text-zinc-400 block font-bold uppercase text-[9px]">Your Answer:</span>
                    <span className={`font-bold mt-1 block ${detail.correct ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-650 dark:text-red-400'}`}>
                      {detail.submittedAnswer || "(Skipped)"}
                    </span>
                  </div>
                  <div className="p-3 bg-white dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-900 rounded-xl">
                    <span className="text-zinc-400 block font-bold uppercase text-[9px]">Correct Answer:</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold mt-1 block">
                      {detail.correctAnswer}
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-zinc-100/60 dark:bg-zinc-900/40 border border-zinc-200/50 dark:border-zinc-900 rounded-xl">
                  <span className="text-[9px] text-zinc-400 font-extrabold uppercase flex items-center mb-1">
                    <AlertCircle className="w-3.5 h-3.5 mr-1" /> Explanation
                  </span>
                  <p className="text-xs text-zinc-650 dark:text-zinc-400 leading-relaxed font-semibold">
                    {detail.explanation || "No explanation registered for this MCQ."}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW C: Subject Specific quiz list page (dynamic topics list)
  // -------------------------------------------------------------
  if (activeSubject) {
    const { attemptedCount, totalCount, pct } = getProgressStats();
    return (
      <div className="min-h-screen bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 relative overflow-hidden transition-colors duration-300">
        <Navbar variant="app" />
        <div className="max-w-5xl mx-auto w-full pt-28 px-6 pb-12 relative z-10">
          
          {/* Header row */}
          <header className="flex justify-between items-center mb-8 border-b border-zinc-155 dark:border-zinc-900 pb-5">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/practice-quiz')}
                className="p-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-150 dark:hover:bg-zinc-800 rounded-xl transition text-zinc-500 hover:text-zinc-950 dark:hover:text-white cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h1 className="text-2xl font-black text-zinc-950 dark:text-white flex items-center gap-2">
                  {activeSubject.title} Quizzes
                </h1>
                <p className="text-[10px] text-zinc-400 font-bold uppercase mt-0.5">
                  Select quiz module to evaluate your skills
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {isAdmin && (
                <button
                  onClick={() => setQuizModalOpen(true)}
                  className="flex items-center justify-center space-x-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2.5 rounded-xl transition cursor-pointer shadow border-none"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Quiz Category</span>
                </button>
              )}
            </div>
          </header>

          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-650 dark:text-red-400 text-xs text-center mb-6">
              {error}
            </div>
          )}

          {/* Progress dashboard header */}
          {totalCount > 0 && (
            <div className="bg-zinc-50 dark:bg-[#0d0d11] border border-zinc-200 dark:border-zinc-900 rounded-2xl p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
              <div className="flex items-center space-x-4">
                <div className="p-3.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl font-black text-sm border border-indigo-500/20">
                  {pct}%
                </div>
                <div>
                  <h3 className="font-extrabold text-zinc-900 dark:text-zinc-250 text-xs">Subject Practice Progress</h3>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase mt-0.5">{attemptedCount} of {totalCount} completed</p>
                </div>
              </div>
              {/* Progress bar */}
              <div className="flex-1 w-full max-w-md bg-zinc-200 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-indigo-600 dark:bg-indigo-400 h-full rounded-full transition-all duration-300"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )}

          {/* Subjects content categorizations */}
          <div className="space-y-8">
            {Object.values(groupedQuizCatalog).map((group) => {
              if (group.quizzes.length === 0 && group.slug === 'general') return null;
              
              // Determine if this group should be highlighted (if referenced in URL)
              const isGroupActive = topicSlug && topicSlug.toLowerCase() === group.slug.toLowerCase();

              return (
                <div
                  key={group.slug}
                  className={`border rounded-2xl transition duration-200 p-6 ${
                    isGroupActive
                      ? 'border-purple-500 bg-purple-500/[0.02] shadow-sm'
                      : 'border-zinc-200 dark:border-zinc-900 bg-zinc-50/20 dark:bg-zinc-950/10'
                  }`}
                >
                  <div className="flex items-center justify-between mb-5">
                    <h3 className={`text-sm font-black uppercase tracking-wider ${
                      isGroupActive ? 'text-purple-600 dark:text-purple-400' : 'text-zinc-500 dark:text-zinc-450'
                    }`}>
                      {group.title}
                    </h3>
                    <span className="text-[10px] text-zinc-400 font-bold uppercase">
                      {group.quizzes.length} {group.quizzes.length === 1 ? 'Quiz' : 'Quizzes'} Available
                    </span>
                  </div>

                  {group.quizzes.length === 0 ? (
                    <div className="text-center py-6 bg-white dark:bg-[#0c0c10] border border-zinc-200 dark:border-zinc-900 border-dashed rounded-xl text-zinc-500 text-xs font-semibold">
                      No quizzes registered for this topic yet.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {group.quizzes.map((quiz) => {
                        const isReviewExpanded = expandedQuizReviewId === quiz.id;
                        return (
                          <div
                            key={quiz.id}
                            className="bg-white dark:bg-[#0d0d11] border border-zinc-200 dark:border-zinc-900 hover:border-zinc-400 dark:hover:border-zinc-800 rounded-xl p-5 flex flex-col justify-between group transition relative"
                          >
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h4 className="font-extrabold text-zinc-900 dark:text-zinc-100 text-xs">
                                  {quiz.title}
                                </h4>
                                <p className="text-[10px] text-zinc-400 font-bold uppercase mt-1">
                                  {quiz.totalQuestions} Questions
                                </p>
                              </div>

                              {quiz.attempted && (
                                <span className={`px-2.5 py-1 rounded-full text-[9px] font-extrabold shrink-0 ${
                                  quiz.latestPercentage >= 70
                                    ? 'bg-emerald-500/10 text-emerald-600'
                                    : quiz.latestPercentage >= 40
                                    ? 'bg-amber-500/10 text-amber-600'
                                    : 'bg-red-500/10 text-red-600'
                                }`}>
                                  Score: {quiz.latestScore}/{quiz.latestTotalQuestions}
                                </span>
                              )}
                            </div>

                            {/* Admin-only MCQ review pane */}
                            {isAdmin && isReviewExpanded && quiz.questions && (
                              <div className="border-t border-zinc-150 dark:border-zinc-850 mt-3 pt-3 space-y-2">
                                <h5 className="text-[9px] font-black uppercase text-zinc-400 mb-2">MCQs Review ({quiz.questions.length})</h5>
                                {quiz.questions.length === 0 ? (
                                  <p className="text-[10px] text-zinc-500 italic">No questions added yet.</p>
                                ) : (
                                  quiz.questions.map((q, qIdx) => (
                                    <div key={q.id} className="flex justify-between items-start text-[10px] bg-zinc-50 dark:bg-zinc-950 p-2 rounded-lg border border-zinc-150 dark:border-zinc-900">
                                      <div className="pr-3 flex-1 font-semibold leading-relaxed">
                                        {qIdx + 1}. {q.questionText}
                                      </div>
                                      <button
                                        onClick={() => handleDeleteMcq(q.id)}
                                        className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-red-550 hover:text-red-500 rounded transition cursor-pointer border-none bg-transparent"
                                        title="Delete Question"
                                      >
                                        <Trash className="w-3 h-3" />
                                      </button>
                                    </div>
                                  ))
                                )}
                              </div>
                            )}

                            {/* Actions panel */}
                            <div className="mt-4 pt-4 border-t border-zinc-150 dark:border-zinc-900/60 flex items-center justify-between gap-3">
                              <button
                                onClick={() => {
                                  if (activeSubject) {
                                    sessionStorage.setItem('lastActiveSubjectSlug', activeSubject.slug);
                                  }
                                  navigate(`/practice-quiz/attempt/${quiz.id}`);
                                }}
                                className="flex-1 text-center py-2 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 text-[10px] font-bold rounded-lg transition cursor-pointer hover:bg-zinc-850 dark:hover:bg-zinc-200 border border-transparent"
                              >
                                Start Practice
                              </button>

                              {isAdmin && (
                                <div className="flex items-center space-x-1.5 shrink-0">
                                  <button
                                    onClick={() => handleOpenAddMcq(quiz)}
                                    className="p-2 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-emerald-500 rounded-lg transition cursor-pointer border border-zinc-200 dark:border-zinc-800"
                                    title="Add MCQ Manually"
                                  >
                                    <PlusCircle className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => setExpandedQuizReviewId(isReviewExpanded ? null : quiz.id)}
                                    className="p-2 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-500 rounded-lg transition cursor-pointer border border-zinc-200 dark:border-zinc-800"
                                    title="Review Questions"
                                  >
                                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isReviewExpanded ? 'rotate-180' : ''}`} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteQuiz(quiz.id, quiz.title)}
                                    className="p-2 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-rose-500 rounded-lg transition cursor-pointer border border-zinc-200 dark:border-zinc-800"
                                    title="Delete Quiz"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* MODAL: ADMIN CREATE QUIZ */}
        {quizModalOpen && (
          <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 relative shadow-2xl flex flex-col max-h-[90vh] text-zinc-900 dark:text-zinc-100 animate-scaleIn">
              <h2 className="text-lg font-black mb-4 flex items-center border-b border-zinc-100 dark:border-zinc-850 pb-3 shrink-0">
                <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mr-2" />
                Configure Quiz Module
              </h2>

              <form onSubmit={handleSaveQuiz} className="flex-grow flex flex-col overflow-hidden space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-zinc-400 mb-1.5 uppercase">Quiz Title *</label>
                  <input
                    type="text"
                    value={quizTitle}
                    onChange={(e) => setQuizTitle(e.target.value)}
                    placeholder="e.g. Acid Properties Basics"
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-indigo-500 text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-zinc-400 mb-1.5 uppercase">Syllabus Topic Category</label>
                  <select
                    value={quizTopicId}
                    onChange={(e) => setQuizTopicId(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-500 text-xs text-zinc-600 dark:text-zinc-300"
                  >
                    <option value="">General Quizzes (No specific topic)</option>
                    {activeSubject.topics && activeSubject.topics.map(t => (
                      <option key={t.id} value={t.id}>{t.title}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center py-2.5 border-t border-b border-zinc-100 dark:border-zinc-855">
                  <label className="flex items-center cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isAiGenerated}
                      onChange={(e) => setIsAiGenerated(e.target.checked)}
                      className="w-4 h-4 rounded border-zinc-300 dark:border-zinc-800 text-indigo-650 bg-zinc-100 dark:bg-zinc-950 focus:ring-indigo-500 cursor-pointer"
                    />
                    <span className="text-xs text-zinc-700 dark:text-zinc-300 font-extrabold ml-2">Generate Questions with AI</span>
                  </label>
                </div>

                {isAiGenerated && (
                  <div className="grid grid-cols-2 gap-4 animate-fadeIn">
                    <div>
                      <label className="block text-[10px] font-black text-zinc-400 mb-1.5 uppercase">AI Difficulty</label>
                      <select
                        value={aiDifficulty}
                        onChange={(e) => setAiDifficulty(e.target.value)}
                        className="w-full bg-zinc-50 dark:bg-zinc-955 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 focus:outline-none text-xs text-zinc-650"
                      >
                        <option value="EASY">EASY</option>
                        <option value="MEDIUM">MEDIUM</option>
                        <option value="HARD">HARD</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-zinc-400 mb-1.5 uppercase">No. of MCQs</label>
                      <select
                        value={aiNumQuestions}
                        onChange={(e) => setAiNumQuestions(parseInt(e.target.value))}
                        className="w-full bg-zinc-50 dark:bg-zinc-955 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 focus:outline-none text-xs text-zinc-655"
                      >
                        <option value="5">5 Questions</option>
                        <option value="10">10 Questions</option>
                        <option value="15">15 Questions</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Form Actions */}
                <div className="flex space-x-3 pt-4 border-t border-zinc-100 dark:border-zinc-850 shrink-0">
                  <button
                    type="button"
                    onClick={() => setQuizModalOpen(false)}
                    className="w-1/2 py-2.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 text-xs font-bold rounded-xl transition cursor-pointer border-none"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={quizSaving}
                    className="w-1/2 py-2.5 bg-indigo-650 hover:bg-indigo-600 disabled:bg-indigo-850/55 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-md flex justify-center items-center border-none"
                  >
                    {quizSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white mr-1.5" />
                        <span>{isAiGenerated ? 'Drafting MCQs...' : 'Saving...'}</span>
                      </>
                    ) : (
                      'Save Quiz'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: ADMIN ADD QUESTION MANUALLY */}
        {mcqModalOpen && (
          <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 relative shadow-2xl flex flex-col max-h-[90vh] text-zinc-900 dark:text-zinc-100 animate-scaleIn">
              <h2 className="text-lg font-black mb-4 flex items-center border-b border-zinc-100 dark:border-zinc-850 pb-3 shrink-0">
                <PlusCircle className="w-5 h-5 text-emerald-500 mr-2" />
                Add Question Manually
              </h2>

              <form onSubmit={handleSaveMcq} className="flex-grow flex flex-col overflow-y-auto space-y-4 pr-1">
                <div>
                  <label className="block text-[10px] font-black text-zinc-450 mb-1.5 uppercase">Question Text *</label>
                  <textarea
                    value={mcqText}
                    onChange={(e) => setMcqText(e.target.value)}
                    placeholder="Enter question context or prompt..."
                    rows="3"
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-indigo-500 text-xs resize-none"
                    required
                  />
                </div>

                <div className="space-y-2.5">
                  <label className="block text-[10px] font-black text-zinc-450 uppercase">Configure Options *</label>
                  {mcqOptions.map((opt, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <span className="text-[10px] font-black text-zinc-400 w-4">{String.fromCharCode(65 + idx)}</span>
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const nextOpts = [...mcqOptions];
                          nextOpts[idx] = e.target.value;
                          setMcqOptions(nextOpts);
                        }}
                        placeholder={`Option ${String.fromCharCode(65 + idx)} description...`}
                        className="flex-1 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500 text-xs"
                        required
                      />
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-zinc-450 mb-1.5 uppercase">Correct Answer *</label>
                    <select
                      value={mcqCorrectAnswer}
                      onChange={(e) => setMcqCorrectAnswer(e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-500 text-xs text-zinc-600 dark:text-zinc-300"
                      required
                    >
                      <option value="">Select Option</option>
                      {mcqOptions.map((opt, idx) => (
                        <option key={idx} value={opt} disabled={!opt.trim()}>{opt ? `${String.fromCharCode(65 + idx)}. ${opt}` : `Empty Option`}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-zinc-450 mb-1.5 uppercase">Difficulty</label>
                    <select
                      value={mcqDifficulty}
                      onChange={(e) => setMcqDifficulty(e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-zinc-955 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-500 text-xs text-zinc-655"
                    >
                      <option value="EASY">EASY</option>
                      <option value="MEDIUM">MEDIUM</option>
                      <option value="HARD">HARD</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-zinc-455 mb-1.5 uppercase">Explanation</label>
                  <textarea
                    value={mcqExplanation}
                    onChange={(e) => setMcqExplanation(e.target.value)}
                    placeholder="Provide context explaining the correct answer choice..."
                    rows="2"
                    className="w-full bg-zinc-50 dark:bg-zinc-955 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 focus:outline-none focus:border-indigo-500 text-xs resize-none"
                  />
                </div>

                {/* Form Actions */}
                <div className="flex space-x-3 pt-4 border-t border-zinc-100 dark:border-zinc-800 shrink-0">
                  <button
                    type="button"
                    onClick={() => setMcqModalOpen(false)}
                    className="w-1/2 py-2.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 text-xs font-bold rounded-xl transition cursor-pointer border-none"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={mcqSaving}
                    className="w-1/2 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800/50 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-md flex justify-center items-center border-none"
                  >
                    {mcqSaving ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : 'Save Question'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW D: Practice Quiz root dashboard page (lists subjects)
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 relative overflow-hidden transition-colors duration-300">
      <Navbar variant="app" />
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-10%] w-[35%] h-[35%] rounded-full bg-indigo-500/5 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[35%] h-[35%] rounded-full bg-purple-500/5 blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto z-10 relative pt-28 px-6 pb-12">
        {/* Navigation header */}
        <header className="flex justify-between items-center mb-10 border-b border-zinc-150 dark:border-zinc-900 pb-5">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-150 dark:hover:bg-zinc-800 rounded-xl transition text-zinc-500 hover:text-zinc-950 dark:hover:text-white cursor-pointer mr-2"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-2xl font-black text-zinc-950 dark:text-white">
                Practice Quizzes
              </h1>
              <p className="text-[10px] text-zinc-400 font-bold uppercase mt-0.5">
                Challenge yourself on core computer science subjects
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Mix Practice shortcut */}
            {subjects.length >= 2 && (
              <button
                onClick={() => {
                  // Mix first few subject codes
                  const slugs = subjects.slice(0, 3).map(s => s.slug).join('-');
                  navigate(`/practice-quiz/mix/${slugs}`);
                }}
                className="flex items-center space-x-1.5 text-xs bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-400 hover:via-purple-400 hover:to-pink-400 text-white font-bold px-4 py-2.5 rounded-xl transition cursor-pointer shadow-md shadow-purple-500/10 border-none"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Start Mix Subjects Quiz</span>
              </button>
            )}
          </div>
        </header>        {/* Subject Cards Catalog */}
        <div className="space-y-6">
          {subjects.length === 0 ? (
            <div className="text-center py-16 bg-zinc-50 dark:bg-zinc-900/10 border border-zinc-200 dark:border-zinc-900 border-dashed rounded-3xl text-zinc-500">
              <Layers className="w-12 h-12 mx-auto mb-3 text-zinc-300 dark:text-zinc-800" />
              <p className="text-sm">No subject categories populated yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {subjects.map((subj) => {
                const subjectStyles = getSubjectColor(subj.slug);
                return (
                  <div
                    key={subj.id}
                    className="bg-zinc-50 dark:bg-[#0d0d11] border border-zinc-200 dark:border-zinc-900 hover:border-zinc-400 dark:hover:border-zinc-700 rounded-xl p-6 transition-all duration-200 flex flex-col justify-between hover:shadow-sm animate-fadeIn"
                  >
                    <div>
                      <div className={`inline-flex p-3 rounded-lg border mb-6 transition shadow-sm bg-white dark:bg-zinc-950 ${subjectStyles}`}>
                        <Layers className="w-6 h-6" />
                      </div>
                      <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-3">
                        {subj.title}
                      </h3>
                      <p className="text-zinc-500 dark:text-zinc-400 text-xs leading-relaxed mb-6 font-medium line-clamp-3">
                        {subj.description || `Evaluate and polish your skills in ${subj.title} via interactive mock modules.`}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-zinc-200 dark:border-zinc-900 flex justify-between gap-4">
                      <button
                        onClick={() => navigate(`/practice-quiz/${subj.slug}`)}
                        className="flex-1 text-center py-2 bg-zinc-950 dark:bg-white text-white dark:text-zinc-955 text-xs font-bold rounded-lg transition cursor-pointer hover:bg-zinc-900 dark:hover:bg-zinc-200 border border-transparent"
                      >
                        View Quizzes
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Assessments;
