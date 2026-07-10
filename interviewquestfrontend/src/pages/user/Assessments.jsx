import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  ArrowLeft, Timer, BookOpen, Calendar, Award, CheckCircle2,
  XCircle, AlertCircle, Loader2, PlayCircle, History, RefreshCw,
  Plus, Edit3, Trash2, ChevronRight, ChevronDown, Check, HelpCircle,
  Layers, Sparkles, PlusCircle, Trash, Menu, LogOut, Search, X
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
  const [lockedQuestions, setLockedQuestions] = useState({}); // { questionId: true }
  const [currentIdx, setCurrentIdx] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  // Mixed quiz states
  const [isMixQuiz, setIsMixQuiz] = useState(false);
  const [mixSubjectSlugs, setMixSubjectSlugs] = useState('');
  const [mixSetupOpen, setMixSetupOpen] = useState(false);
  const [selectedMixSubjects, setSelectedMixSubjects] = useState([]);
  const [mixLimit, setMixLimit] = useState(15);
  // Sidebar state for active quiz navigation
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Admin Modals & Forms States
  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const [quizTitle, setQuizTitle] = useState('General');
  const [quizTopicId, setQuizTopicId] = useState('');
  const [isTitleEditedManual, setIsTitleEditedManual] = useState(false);
  const [isAiGenerated, setIsAiGenerated] = useState(false);
  const [selectedAiDifficulties, setSelectedAiDifficulties] = useState(['MEDIUM']);
  const [aiNumQuestions, setAiNumQuestions] = useState(5);
  const [quizSaving, setQuizSaving] = useState(false);
  const [modalError, setModalError] = useState('');

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
      setLockedQuestions({});
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
      const queryParams = new URLSearchParams(location.search);
      const limit = queryParams.get('limit') || '15';
      const response = await API.get(`/api/public/quizzes/mix/${slugs}?limit=${limit}`);
      const questions = response.data || [];
      if (questions.length === 0) {
        throw new Error('No practice questions found for these subjects.');
      }
      setQuizQuestions(questions);
      setAnswers({});
      setLockedQuestions({});
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

  const checkAnswerCorrectness = (submitted, correct) => {
    if (!submitted || !correct) return false;
    const subList = submitted.split('||').map(s => s.trim().toLowerCase()).sort();
    const corList = correct.split('||').map(s => s.trim().toLowerCase()).sort();
    if (subList.length !== corList.length) return false;
    return subList.every((val, index) => val === corList[index]);
  };

  const selectOption = (questionId, option, isMultiCorrect) => {
    if (lockedQuestions[questionId]) return;

    if (isMultiCorrect) {
      setAnswers(prev => {
        const currentAns = prev[questionId] || '';
        const selectedList = currentAns.split('||').map(s => s.trim()).filter(Boolean);
        let nextList;
        if (selectedList.includes(option)) {
          nextList = selectedList.filter(s => s !== option);
        } else {
          nextList = [...selectedList, option];
        }
        return {
          ...prev,
          [questionId]: nextList.join('||')
        };
      });
    } else {
      setAnswers(prev => ({
        ...prev,
        [questionId]: option
      }));
      setLockedQuestions(prev => ({
        ...prev,
        [questionId]: true
      }));
    }
  };

  const handleSubmitQuestionAnswer = (questionId) => {
    setLockedQuestions(prev => ({
      ...prev,
      [questionId]: true
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

  // Admin: Create Quiz helper handlers
  const handleOpenCreateQuiz = () => {
    setQuizTitle('General');
    setQuizTopicId('');
    setIsTitleEditedManual(false);
    setIsAiGenerated(false);
    setSelectedAiDifficulties(['MEDIUM']);
    setAiNumQuestions(5);
    setModalError('');
    setQuizModalOpen(true);
  };

  const handleQuizTopicChange = (topicId) => {
    setQuizTopicId(topicId);
    if (!isTitleEditedManual) {
      if (!topicId) {
        setQuizTitle('General');
      } else {
        const topic = activeSubject.topics.find(t => t.id.toString() === topicId.toString());
        if (topic) {
          setQuizTitle(topic.title);
        }
      }
    }
  };

  const handleQuizTitleChange = (val) => {
    setQuizTitle(val);
    setIsTitleEditedManual(true);
  };

  // Admin: Create Quiz shell or AI generation
  const handleSaveQuiz = async (e) => {
    e.preventDefault();
    setModalError('');
    if (!quizTitle.trim()) {
      setModalError('Please enter a quiz title.');
      return;
    }

    try {
      setQuizSaving(true);
      const difficultyStr = selectedAiDifficulties.length > 0 ? selectedAiDifficulties.join(',') : 'MEDIUM';
      const payload = {
        title: quizTitle.trim(),
        subjectId: activeSubject.id,
        syllabusTopicId: quizTopicId ? parseInt(quizTopicId) : null,
        aiGenerated: isAiGenerated,
        difficulty: difficultyStr,
        numQuestions: aiNumQuestions
      };

      let response;
      if (isAiGenerated) {
        response = await API.post('/api/admin/quizzes/generate-ai', payload);
      } else {
        response = await API.post('/api/admin/quizzes', payload);
      }

      setQuizModalOpen(false);
      setQuizTitle('General');
      setQuizTopicId('');
      setIsTitleEditedManual(false);
      setIsAiGenerated(false);
      setSelectedAiDifficulties(['MEDIUM']);
      setModalError('');
      fetchQuizzesForSubject(activeSubject.slug);
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || '';
      let friendlyMsg = 'Failed to configure quiz category. Please try again.';
      
      if (errMsg.includes('503') || errMsg.includes('demand') || errMsg.includes('Gemini') || errMsg.includes('UNAVAILABLE')) {
        friendlyMsg = 'The AI generator is temporarily overloaded due to high demand. Please wait a moment and try again, or add questions manually.';
      } else if (errMsg.includes('API key') || errMsg.includes('401') || errMsg.includes('Unauthorized') || errMsg.includes('API Key')) {
        friendlyMsg = 'Invalid or missing API key. Please check your Gemini API key configuration in your Profile.';
      } else if (errMsg) {
        friendlyMsg = errMsg;
      }
      setModalError(friendlyMsg);
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
    setModalError('');
    setMcqModalOpen(true);
  };

  const handleSaveMcq = async (e) => {
    e.preventDefault();
    setModalError('');
    if (!mcqText.trim() || !mcqCorrectAnswer.trim()) {
      setModalError('Please complete all question fields and select the correct option(s).');
      return;
    }

    // Verify all correct options match one of the options
    const corrects = mcqCorrectAnswer.split('||').map(s => s.trim()).filter(Boolean);
    const allValid = corrects.every(c => mcqOptions.map(o => o.trim()).includes(c));
    if (corrects.length === 0 || !allValid) {
      setModalError('Every correct answer choice must match one of the options.');
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
      setModalError('');
      fetchQuizzesForSubject(activeSubject.slug);
      setExpandedQuizReviewId(selectedQuizForMcq.id); // Expand review checklist
    } catch (err) {
      setModalError(err.response?.data?.message || err.message || 'Failed to add MCQ.');
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
  // VIEW A: Active Quiz execution screen (HackerRank Split Layout)
  // -------------------------------------------------------------
  if (activeQuiz && quizQuestions.length > 0) {
    const currentQuestion = quizQuestions[currentIdx];
    return (
      <div className="flex h-screen bg-zinc-950 text-zinc-100 overflow-hidden font-sans select-none">
        
        {/* Collapsible Left Sidebar for Question Navigation */}
        <div className={`transition-all duration-300 border-r border-zinc-900 bg-zinc-900/60 backdrop-blur-md flex flex-col shrink-0 ${isSidebarOpen ? 'w-64' : 'w-0 overflow-hidden'}`}>
          <div className="p-4 border-b border-zinc-900 flex justify-between items-center shrink-0">
            <div>
              <h2 className="text-xs font-black uppercase text-zinc-400 tracking-wider">Practice Module</h2>
              <h3 className="text-sm font-black text-white truncate max-w-[160px] mt-0.5">
                {isMixQuiz ? 'Mixed Subject Practice' : activeSubject?.title}
              </h3>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg transition cursor-pointer border-none bg-transparent"
              title="Hide Sidebar"
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-grow overflow-y-auto p-4 space-y-1.5">
            <span className="block text-[9px] font-black text-zinc-500 uppercase tracking-wider mb-2">Question Navigation</span>
            {quizQuestions.map((q, idx) => {
              const isCurrent = currentIdx === idx;
              const isLocked = !!lockedQuestions[q.id];
              const isCorrect = checkAnswerCorrectness(answers[q.id], q.correctAnswer);

              let statusText = 'Unanswered';
              let statusColor = 'text-zinc-500 hover:bg-zinc-800/40 hover:text-zinc-300';
              let Icon = HelpCircle;

              if (isCurrent) {
                statusColor = 'bg-indigo-600/15 border border-indigo-500/35 text-indigo-400 font-extrabold';
              } else if (isLocked) {
                if (isCorrect) {
                  statusText = 'Correct';
                  statusColor = 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold';
                  Icon = CheckCircle2;
                } else {
                  statusText = 'Incorrect';
                  statusColor = 'bg-rose-500/10 border border-rose-500/20 text-rose-400 font-bold';
                  Icon = XCircle;
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => setCurrentIdx(idx)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl transition duration-150 flex items-center justify-between border border-transparent cursor-pointer text-xs ${statusColor}`}
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate font-semibold">Question {idx + 1}</span>
                  </div>
                  {isLocked && <span className="text-[8px] font-black uppercase tracking-wider">{statusText}</span>}
                </button>
              );
            })}
          </div>

          <div className="p-4 border-t border-zinc-900 bg-zinc-950/40 shrink-0 text-center">
            <button
              onClick={() => {
                if (window.confirm('Leave active practice session? Progress will be lost.')) {
                  navigate(-1);
                }
              }}
              className="w-full py-2 bg-zinc-900 hover:bg-rose-950/20 hover:text-rose-400 border border-zinc-800 hover:border-rose-900 text-zinc-400 font-bold text-[10px] uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center justify-center space-x-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Quit Practice</span>
            </button>
          </div>
        </div>

        {/* Main Split Interface Area */}
        <div className="flex-grow flex flex-col overflow-hidden bg-zinc-950">
          
          {/* Top Navbar */}
          <header className="h-16 border-b border-zinc-900 px-6 flex items-center justify-between bg-zinc-900/10 backdrop-blur-md shrink-0">
            <div className="flex items-center space-x-3.5">
              {!isSidebarOpen && (
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="p-2 hover:bg-zinc-900 text-zinc-400 hover:text-white rounded-xl transition cursor-pointer border-none bg-transparent"
                  title="Show Sidebar"
                >
                  <Menu className="w-5 h-5" />
                </button>
              )}
              <div>
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Attempting Quiz</span>
                <h1 className="text-sm font-black text-white flex items-center gap-2 mt-0.5">
                  {isMixQuiz ? 'Mixed Subject Practice' : activeSubject?.title}
                </h1>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <span className="text-[10px] font-mono font-bold text-zinc-400 px-3.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl">
                Question {currentIdx + 1} / {quizQuestions.length}
              </span>
            </div>
          </header>

          {/* Split Pane Container */}
          <div className="flex-grow flex overflow-hidden">
            
            {/* Left Side: Question Pane */}
            <div className="w-1/2 border-r border-zinc-900 p-8 overflow-y-auto bg-zinc-950 flex flex-col justify-between">
              <div className="space-y-6">
                <div className="flex items-center space-x-2">
                  <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                    currentQuestion.difficulty === 'EASY'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : currentQuestion.difficulty === 'HARD'
                        ? 'bg-rose-500/10 text-rose-455 border border-rose-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}>
                    {currentQuestion.difficulty}
                  </span>
                  
                  {lockedQuestions[currentQuestion.id] && (
                    <span className={`text-[9px] font-extrabold uppercase px-2.5 py-0.5 rounded-md flex items-center gap-1 ${
                      checkAnswerCorrectness(answers[currentQuestion.id], currentQuestion.correctAnswer)
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-455 border border-rose-500/20'
                    }`}>
                      {checkAnswerCorrectness(answers[currentQuestion.id], currentQuestion.correctAnswer) ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>Correct</span>
                        </>
                      ) : (
                        <>
                          <X className="w-3 h-3 text-rose-455" />
                          <span>Incorrect</span>
                        </>
                      )}
                    </span>
                  )}
                </div>

                <div className="prose prose-invert max-w-none">
                  <h2 className="text-lg font-black text-white leading-relaxed">
                    {currentQuestion.questionText}
                  </h2>
                </div>
              </div>

              {/* Tips / Chrome footer on left side */}
              <div className="pt-6 border-t border-zinc-900 text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-12">
                Evaluate carefully. Only 1 attempt per question is allowed.
              </div>
            </div>

            {/* Right Side: Options / Actions Pane */}
            <div className="w-1/2 p-8 overflow-y-auto bg-[#0d0d11]/30 flex flex-col justify-between">
              <div className="space-y-6">
                <span className="block text-[10px] font-black text-zinc-500 uppercase tracking-wider">Select Option</span>
                
                <div className="space-y-3">
                  {(() => {
                    const correctAnswers = currentQuestion.correctAnswer.split('||').map(s => s.trim()).filter(Boolean);
                    const isMultiCorrect = correctAnswers.length > 1;
                    const selectedList = (answers[currentQuestion.id] || '').split('||').map(s => s.trim()).filter(Boolean);
                    const isLocked = !!lockedQuestions[currentQuestion.id];

                    return (
                      <>
                        <div className="space-y-3">
                          {currentQuestion.options.map((option, optIdx) => {
                            const isSelected = selectedList.includes(option);
                            const isCorrectOption = correctAnswers.includes(option);

                            let optionBtnStyle = '';
                            let IndicatorIcon = null;

                            if (isLocked) {
                              if (isCorrectOption) {
                                optionBtnStyle = 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400 font-extrabold';
                                IndicatorIcon = <Check className="w-4 h-4 text-emerald-400" />;
                              } else if (isSelected) {
                                optionBtnStyle = 'border-rose-500/50 bg-rose-500/10 text-rose-455 font-extrabold';
                                IndicatorIcon = <X className="w-4 h-4 text-rose-455" />;
                              } else {
                                optionBtnStyle = 'border-zinc-900 bg-zinc-950/20 text-zinc-650 opacity-40 cursor-not-allowed';
                              }
                            } else {
                              optionBtnStyle = 'border-zinc-800 bg-zinc-900/40 text-zinc-300 hover:bg-zinc-900 hover:border-zinc-700 hover:text-white';
                            }

                            return (
                              <button
                                key={optIdx}
                                type="button"
                                disabled={isLocked}
                                onClick={() => selectOption(currentQuestion.id, option, isMultiCorrect)}
                                className={`w-full text-left px-5 py-4 border rounded-2xl text-xs font-bold transition duration-200 flex justify-between items-center ${
                                  isLocked ? '' : 'cursor-pointer'
                                } ${optionBtnStyle}`}
                              >
                                <span className="pr-4">{option}</span>
                                <div className="flex items-center space-x-2 shrink-0">
                                  {IndicatorIcon ? (
                                    IndicatorIcon
                                  ) : (
                                    <div className={`w-4 h-4 border flex items-center justify-center transition-all ${
                                      isMultiCorrect ? 'rounded-md' : 'rounded-full'
                                    } ${
                                      isSelected ? 'border-indigo-500 bg-indigo-500' : 'border-zinc-750'
                                    }`}>
                                      {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                                    </div>
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>

                        {/* Submit Button for Multiple Correct Answers */}
                        {isMultiCorrect && !isLocked && (
                          <button
                            type="button"
                            disabled={selectedList.length === 0}
                            onClick={() => handleSubmitQuestionAnswer(currentQuestion.id)}
                            className="w-full mt-4 py-3.5 bg-indigo-650 hover:bg-indigo-500 disabled:bg-zinc-900 disabled:text-zinc-600 border-none rounded-2xl text-xs font-bold text-white shadow transition cursor-pointer flex items-center justify-center space-x-2"
                          >
                            <Check className="w-4 h-4" />
                            <span>Submit Multi-Option Answer ({selectedList.length} Selected)</span>
                          </button>
                        )}
                      </>
                    );
                  })()}
                </div>

                {/* Immediate Explanation Display */}
                {lockedQuestions[currentQuestion.id] && (
                  <div className="p-5 bg-zinc-950/60 border border-zinc-900 rounded-2xl space-y-2.5 animate-fadeIn">
                    <div className="flex items-center space-x-2 text-indigo-400 font-bold text-xs">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span className="uppercase tracking-wider">Explanation</span>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed font-semibold">
                      {currentQuestion.explanation || "No explanation provided for this question."}
                    </p>
                    <div className="pt-1.5 text-[9px] font-black text-zinc-500 uppercase tracking-wider">
                      Correct Option: <span className="text-emerald-400 font-black">{currentQuestion.correctAnswer}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation buttons */}
              <div className="flex justify-between items-center mt-12 border-t border-zinc-900 pt-6">
                <button
                  disabled={currentIdx === 0}
                  onClick={() => setCurrentIdx(currentIdx - 1)}
                  className="px-4 py-2 bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-white rounded-xl text-xs font-bold transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer border border-zinc-800"
                >
                  Previous
                </button>

                {currentIdx + 1 === quizQuestions.length ? (
                  <button
                    onClick={handleQuizSubmit}
                    disabled={submitting}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800/40 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition border-none"
                  >
                    {submitting ? 'Evaluating...' : 'Complete Practice'}
                  </button>
                ) : (
                  <button
                    onClick={() => setCurrentIdx(currentIdx + 1)}
                    className="px-5 py-2.5 bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-bold rounded-xl transition cursor-pointer border-none"
                  >
                    Next Question
                  </button>
                )}
              </div>
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
            <p className="text-zinc-455 text-[10px] font-bold uppercase tracking-wider mt-1">{result.subjectTitle} • {result.quizTitle}</p>

            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mt-8 mb-6">
              <div className="bg-white dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-900 p-4 rounded-xl shadow-sm">
                <p className="text-[9px] text-zinc-400 font-extrabold uppercase">Total Questions</p>
                <p className="text-xl font-bold mt-1 text-zinc-700 dark:text-zinc-300">{result.totalQuestions}</p>
              </div>
              <div className="bg-white dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-900 p-4 rounded-xl shadow-sm">
                <p className="text-[9px] text-zinc-400 font-extrabold uppercase">Your Score</p>
                <p className="text-xl font-bold mt-1 text-purple-600 dark:text-purple-400">{result.score}</p>
              </div>
              <div className="bg-white dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-900 p-4 rounded-xl shadow-sm">
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
                  <span className={`px-2.5 py-1 rounded-full text-[9px] font-extrabold flex items-center space-x-1 shrink-0 ${detail.correct ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-red-500/10 text-red-600 dark:text-red-400'
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
                    <span className={`font-bold mt-1 block ${detail.correct ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-655 dark:text-red-400'}`}>
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
                  <p className="text-xs text-zinc-655 dark:text-zinc-400 leading-relaxed font-semibold">
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
                <h1 className="text-2xl font-black text-zinc-955 dark:text-white flex items-center gap-2">
                  {activeSubject.title} Quizzes
                </h1>
                <p className="text-[10px] text-zinc-400 font-bold uppercase mt-0.5">
                  Select quiz module to evaluate your skills
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate(`/practice-quiz/mix/${activeSubject.slug}`)}
                className="flex items-center justify-center space-x-1.5 text-xs bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold px-4 py-2.5 rounded-xl transition cursor-pointer shadow border-none"
              >
                <Sparkles className="w-4 h-4" />
                <span>Start Subject Practice Quiz</span>
              </button>
              {isAdmin && (
                <button
                  onClick={handleOpenCreateQuiz}
                  className="flex items-center justify-center space-x-1.5 text-xs bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 font-bold px-4 py-2.5 rounded-xl transition cursor-pointer shadow border-none"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Quiz Category</span>
                </button>
              )}
            </div>
          </header>

          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-655 dark:text-red-400 text-xs text-center mb-6">
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
                  className={`border rounded-2xl transition duration-200 p-6 ${isGroupActive
                    ? 'border-purple-500 bg-purple-500/[0.02] shadow-sm'
                    : 'border-zinc-200 dark:border-zinc-900 bg-zinc-50/20 dark:bg-zinc-950/10'
                    }`}
                >
                  <div className="flex items-center justify-between mb-5">
                    <h3 className={`text-sm font-black uppercase tracking-wider ${isGroupActive ? 'text-purple-600 dark:text-purple-400' : 'text-zinc-500 dark:text-zinc-450'
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
                                <span className={`px-2.5 py-1 rounded-full text-[9px] font-extrabold shrink-0 ${quiz.latestPercentage >= 70
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
                                        className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-red-555 hover:text-red-500 rounded transition cursor-pointer border-none bg-transparent"
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
        </div>        {/* MODAL: ADMIN CREATE QUIZ (Split-Pane LeetCode Style) */}
        {quizModalOpen && (
          <div className="fixed inset-0 bg-zinc-950 z-50 overflow-hidden flex flex-col font-sans select-none text-zinc-100 animate-scaleIn">
            
            {/* Header bar */}
            <div className="h-16 border-b border-zinc-900 px-6 flex items-center justify-between bg-zinc-900/10 backdrop-blur-md shrink-0">
              <div className="flex items-center space-x-3">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <div>
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Administrative Panel</span>
                  <h1 className="text-sm font-black text-white mt-0.5">Configure New Quiz Category — {activeSubject?.title}</h1>
                </div>
              </div>
              
              <button
                type="button"
                onClick={() => setQuizModalOpen(false)}
                className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-900 transition cursor-pointer border-none bg-transparent"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-4 bg-rose-500/10 border-b border-rose-900 flex items-center space-x-2 text-rose-400 font-bold text-xs animate-fadeIn shrink-0">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{modalError}</span>
              </div>
            )}

            {/* Split Form View */}
            <form onSubmit={handleSaveQuiz} className="flex-grow flex overflow-hidden">
              
              {/* Left Column: Quiz Info */}
              <div className="w-1/2 border-r border-zinc-900 p-8 overflow-y-auto bg-zinc-950 flex flex-col justify-between">
                <div className="space-y-6">
                  <span className="block text-[10px] font-black text-zinc-400 uppercase tracking-wider">Quiz Details</span>

                  {/* Title */}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-wider">Quiz Title *</label>
                    <input
                      type="text"
                      value={quizTitle}
                      onChange={(e) => handleQuizTitleChange(e.target.value)}
                      placeholder="e.g. ACID Properties Basics"
                      className="w-full bg-zinc-900/40 border border-zinc-850 focus:border-indigo-500 rounded-2xl px-4 py-3 text-xs font-bold text-zinc-200 focus:outline-none"
                      required
                    />
                  </div>

                  {/* Topic Select */}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-wider">Syllabus Topic Category</label>
                    <select
                      value={quizTopicId}
                      onChange={(e) => handleQuizTopicChange(e.target.value)}
                      className="w-full bg-zinc-900/40 border border-zinc-850 focus:border-indigo-500 rounded-2xl px-3 py-3 text-xs font-bold text-zinc-300 focus:outline-none"
                    >
                      <option value="">General Quizzes (No specific topic)</option>
                      {activeSubject.topics && activeSubject.topics.map(t => (
                        <option key={t.id} value={t.id}>{t.title}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="pt-6 border-t border-zinc-900 text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                  Create general quizzes or target specific syllabus topics.
                </div>
              </div>

              {/* Right Column: AI Generation Settings */}
              <div className="w-1/2 p-8 overflow-y-auto bg-[#0d0d11]/30 flex flex-col justify-between">
                <div className="space-y-6">
                  <span className="block text-[10px] font-black text-zinc-500 uppercase tracking-wider">Question Provisions</span>

                  {/* AI Toggle */}
                  <label className="flex items-center space-x-3 p-4 border border-zinc-850 bg-zinc-900/40 hover:border-indigo-500/50 rounded-2xl cursor-pointer transition select-none">
                    <input
                      type="checkbox"
                      checked={isAiGenerated}
                      onChange={(e) => setIsAiGenerated(e.target.checked)}
                      className="w-4 h-4 rounded border-zinc-300 dark:border-zinc-800 text-indigo-650 bg-zinc-100 dark:bg-zinc-950 focus:ring-indigo-500 cursor-pointer"
                    />
                    <div>
                      <span className="block text-xs font-black text-white">Generate Questions with AI</span>
                    </div>
                  </label>

                  {/* AI Difficulty Checkboxes & Limit */}
                  {isAiGenerated && (
                    <div className="grid grid-cols-2 gap-4 animate-fadeIn">
                      <div className="space-y-2">
                        <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-wider">AI Difficulty (Mix options)</label>
                        <div className="flex flex-wrap gap-3 mt-2 bg-zinc-900/25 border border-zinc-850 p-2.5 rounded-xl">
                          {['EASY', 'MEDIUM', 'HARD'].map((diff) => {
                            const isChecked = selectedAiDifficulties.includes(diff);
                            return (
                              <label key={diff} className="flex items-center space-x-1.5 cursor-pointer select-none">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedAiDifficulties(prev => [...prev, diff]);
                                    } else {
                                      setSelectedAiDifficulties(prev => prev.filter(d => d !== diff));
                                    }
                                  }}
                                  className="w-4 h-4 rounded border-zinc-700 text-indigo-500 bg-zinc-950 focus:ring-indigo-500 cursor-pointer"
                                />
                                <span className="text-[10px] font-bold text-zinc-300 uppercase">{diff}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-wider">No. of MCQs</label>
                        <select
                          value={aiNumQuestions}
                          onChange={(e) => setAiNumQuestions(parseInt(e.target.value))}
                          className="w-full bg-zinc-900/40 border border-zinc-850 focus:border-indigo-500 rounded-2xl px-3 py-3 text-xs font-bold text-zinc-300 focus:outline-none"
                        >
                          <option value="5">5 Questions</option>
                          <option value="10">10 Questions</option>
                          <option value="15">15 Questions</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Save / Cancel */}
                <div className="flex space-x-3.5 pt-6 border-t border-zinc-900 shrink-0">
                  <button
                    type="button"
                    onClick={() => setQuizModalOpen(false)}
                    className="w-1/2 py-3 bg-zinc-900 hover:bg-zinc-850 border border-zinc-850 text-zinc-400 hover:text-white text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    Cancel Builder
                  </button>
                  <button
                    type="submit"
                    disabled={quizSaving}
                    className="w-1/2 py-3 bg-indigo-650 hover:bg-indigo-600 disabled:bg-indigo-850/40 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-md flex justify-center items-center border-none"
                  >
                    {quizSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white mr-1.5" />
                        <span>{isAiGenerated ? 'Drafting MCQs...' : 'Saving...'}</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-1.5" />
                        <span>Save Quiz</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

            </form>
          </div>
        )}        {/* MODAL: ADMIN ADD QUESTION MANUALLY (Split-Pane LeetCode Style) */}
        {mcqModalOpen && (
          <div className="fixed inset-0 bg-zinc-950 z-50 overflow-hidden flex flex-col font-sans select-none text-zinc-100 animate-scaleIn">
            
            {/* Header bar */}
            <div className="h-16 border-b border-zinc-900 px-6 flex items-center justify-between bg-zinc-900/10 backdrop-blur-md shrink-0">
              <div className="flex items-center space-x-3">
                <PlusCircle className="w-5 h-5 text-emerald-450" />
                <div>
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Administrative Panel</span>
                  <h1 className="text-sm font-black text-white mt-0.5">Add MCQ Question to "{selectedQuizForMcq?.title}"</h1>
                </div>
              </div>
              
              <button
                type="button"
                onClick={() => setMcqModalOpen(false)}
                className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-900 transition cursor-pointer border-none bg-transparent"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-4 bg-rose-500/10 border-b border-rose-900 flex items-center space-x-2 text-rose-400 font-bold text-xs animate-fadeIn shrink-0">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{modalError}</span>
              </div>
            )}

            {/* Split Form View */}
            <form onSubmit={handleSaveMcq} className="flex-grow flex overflow-hidden">
              
              {/* Left Column: Question Context Editor */}
              <div className="w-1/2 border-r border-zinc-900 p-8 overflow-y-auto bg-zinc-950 flex flex-col justify-between">
                <div className="space-y-6">
                  {/* Title / Difficulty */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">Question Context</span>
                    
                    <div className="flex space-x-1.5 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
                      {['EASY', 'MEDIUM', 'HARD'].map((diff) => (
                        <button
                          key={diff}
                          type="button"
                          onClick={() => setMcqDifficulty(diff)}
                          className={`px-3 py-1 rounded-lg text-[9px] font-extrabold transition cursor-pointer uppercase border border-transparent ${
                            mcqDifficulty === diff
                              ? diff === 'EASY'
                                ? 'bg-emerald-500/15 text-emerald-400 font-extrabold border-emerald-500/20'
                                : diff === 'HARD'
                                  ? 'bg-rose-500/15 text-rose-455 font-extrabold border-rose-500/20'
                                  : 'bg-amber-500/15 text-amber-400 font-extrabold border-amber-500/20'
                              : 'bg-transparent text-zinc-500 hover:text-zinc-350'
                          }`}
                        >
                          {diff}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Textarea Input */}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-wider">Question Text *</label>
                    <textarea
                      value={mcqText}
                      onChange={(e) => setMcqText(e.target.value)}
                      placeholder="Type the question context or prompt here... Supporting markdown style codes."
                      className="w-full bg-zinc-900/40 border border-zinc-850 focus:border-indigo-500 rounded-2xl px-4 py-3.5 text-xs font-semibold resize-none text-zinc-200 focus:outline-none h-60"
                      required
                    />
                  </div>
                </div>

                <div className="pt-6 border-t border-zinc-900 text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                  Fill in the question details on the left, and options/explanation on the right.
                </div>
              </div>

              {/* Right Column: Choices & Explanations */}
              <div className="w-1/2 p-8 overflow-y-auto bg-[#0d0d11]/30 flex flex-col justify-between">
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">Answer Choices</span>
                    <span className="text-[9px] text-zinc-450 font-semibold italic">Toggle correct answer indicator</span>
                  </div>

                  <div className="space-y-3.5">
                    {mcqOptions.map((opt, idx) => {
                      const optLetter = String.fromCharCode(65 + idx);
                      const currentCorrects = mcqCorrectAnswer.split('||').map(s => s.trim()).filter(Boolean);
                      const isCorrect = opt.trim() !== '' && currentCorrects.includes(opt.trim());

                      return (
                        <div
                          key={idx}
                          className={`w-full px-5 py-3 border rounded-2xl text-xs font-bold flex items-center justify-between transition duration-200 ${
                            isCorrect
                              ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400 font-extrabold'
                              : 'border-zinc-855 bg-zinc-900/40 text-zinc-300'
                          }`}
                        >
                          <div className="flex items-center flex-grow mr-4 min-w-0">
                            <span className="text-[10px] font-black text-zinc-500 w-5 select-none">{optLetter}</span>
                            <input
                              type="text"
                              value={opt}
                              onChange={(e) => {
                                const nextOpts = [...mcqOptions];
                                nextOpts[idx] = e.target.value;
                                setMcqOptions(nextOpts);
                                if (currentCorrects.includes(opt)) {
                                  const updatedCorrects = currentCorrects.map(s => s === opt ? e.target.value : s);
                                  setMcqCorrectAnswer(updatedCorrects.join('||'));
                                }
                              }}
                              placeholder={`Option ${optLetter} text...`}
                              className="flex-grow bg-transparent border-none focus:outline-none focus:ring-0 text-xs font-bold p-0 text-zinc-100"
                              required
                            />
                          </div>

                          <button
                            type="button"
                            disabled={!opt.trim()}
                            onClick={() => {
                              const trimmed = opt.trim();
                              let nextCorrects;
                              if (isCorrect) {
                                nextCorrects = currentCorrects.filter(s => s !== trimmed);
                              } else {
                                nextCorrects = [...currentCorrects, trimmed];
                              }
                              setMcqCorrectAnswer(nextCorrects.join('||'));
                            }}
                            className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                              !opt.trim()
                                ? 'opacity-30 cursor-not-allowed border-zinc-800'
                                : isCorrect
                                  ? 'border-emerald-500 bg-emerald-500 text-white'
                                  : 'border-zinc-700 hover:border-emerald-500 cursor-pointer'
                            }`}
                            title="Toggle correct option"
                          >
                            {isCorrect && <Check className="w-3.5 h-3.5 text-white" />}
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation card input */}
                  <div className="p-5 bg-zinc-950 border border-zinc-900 rounded-2xl space-y-2">
                    <label className="block text-[9px] font-black text-zinc-500 uppercase tracking-wider">Explanation Text *</label>
                    <textarea
                      value={mcqExplanation}
                      onChange={(e) => setMcqExplanation(e.target.value)}
                      placeholder="Explain why the designated option is correct..."
                      rows="3"
                      className="w-full bg-zinc-900/40 border border-zinc-850 focus:border-indigo-500 rounded-xl px-4 py-3 focus:outline-none text-xs font-semibold resize-none text-zinc-200"
                      required
                    />
                  </div>
                </div>

                {/* Footer Save / Cancel */}
                <div className="flex space-x-3.5 pt-6 border-t border-zinc-900 shrink-0">
                  <button
                    type="button"
                    onClick={() => setMcqModalOpen(false)}
                    className="w-1/2 py-3 bg-zinc-900 hover:bg-zinc-850 border border-zinc-850 text-zinc-400 hover:text-white text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    Cancel Builder
                  </button>
                  <button
                    type="submit"
                    disabled={mcqSaving}
                    className="w-1/2 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800/40 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-md flex justify-center items-center border-none"
                  >
                    {mcqSaving ? <Loader2 className="w-4 h-4 animate-spin text-white mr-1.5" /> : <Plus className="w-4 h-4 mr-1.5" />}
                    <span>Save Question</span>
                  </button>
                </div>
              </div>

            </form>
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
              className="p-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-150 dark:hover:bg-zinc-800 rounded-xl transition text-zinc-500 hover:text-zinc-955 dark:hover:text-white cursor-pointer mr-2"
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
            {/* Mix Practice Setup trigger */}
            {subjects.length >= 2 && (
              <button
                onClick={() => {
                  setSelectedMixSubjects(subjects.map(s => s.slug)); // select all by default
                  setMixLimit(15);
                  setMixSetupOpen(true);
                }}
                className="flex items-center space-x-1.5 text-xs bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-650 hover:from-indigo-400 hover:via-purple-400 hover:to-indigo-550 text-white font-bold px-4 py-2.5 rounded-xl transition cursor-pointer shadow-md shadow-indigo-500/10 border-none"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Custom Mix Quiz Generator</span>
              </button>
            )}
          </div>
        </header>

        {/* Subject Cards Catalog */}
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

                    <div className="pt-4 border-t border-zinc-200 dark:border-zinc-900 flex justify-between gap-3">
                      <button
                        onClick={() => navigate(`/practice-quiz/${subj.slug}`)}
                        className="flex-1 text-center py-2 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-755 dark:text-zinc-300 text-xs font-bold rounded-lg transition cursor-pointer border border-zinc-200 dark:border-zinc-855"
                      >
                        View Quizzes
                      </button>
                      <button
                        onClick={() => navigate(`/practice-quiz/mix/${subj.slug}`)}
                        className="flex-1 text-center py-2 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 text-xs font-bold rounded-lg transition cursor-pointer hover:bg-zinc-900 dark:hover:bg-zinc-200 border border-transparent flex items-center justify-center gap-1 shadow-sm"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Subject Quiz</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* MODAL: CUSTOM MIX QUIZ GENERATOR */}
      {mixSetupOpen && (
        <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 relative shadow-2xl flex flex-col max-h-[90vh] text-zinc-900 dark:text-zinc-100 animate-scaleIn">
            <button
              onClick={() => setMixSetupOpen(false)}
              className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-lg transition cursor-pointer border-none bg-transparent"
            >
              <X className="w-4 h-4" />
            </button>

            <h2 className="text-lg font-black mb-1.5 flex items-center border-b border-zinc-100 dark:border-zinc-850 pb-3 shrink-0">
              <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mr-2" />
              Mixed Quiz Generator
            </h2>
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-4">
              Select multiple subjects to create a custom practice evaluation
            </p>

            <div className="flex-grow overflow-y-auto space-y-5 pr-1 pb-4">
              {/* Subjects Checklist */}
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-wider">Include Subjects *</label>
                <div className="grid grid-cols-1 gap-2">
                  {subjects.map((subj) => {
                    const isChecked = selectedMixSubjects.includes(subj.slug);
                    return (
                      <label
                        key={subj.id}
                        className={`flex items-center space-x-3 p-3.5 border rounded-2xl cursor-pointer transition select-none ${
                          isChecked
                            ? 'border-indigo-500/50 bg-indigo-500/5 text-indigo-600 dark:text-indigo-400 font-bold'
                            : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/40 text-zinc-700 dark:text-zinc-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedMixSubjects(prev => [...prev, subj.slug]);
                            } else {
                              setSelectedMixSubjects(prev => prev.filter(slug => slug !== subj.slug));
                            }
                          }}
                          className="w-4 h-4 rounded border-zinc-300 dark:border-zinc-800 text-indigo-650 bg-zinc-100 dark:bg-zinc-950 focus:ring-indigo-500 cursor-pointer"
                        />
                        <span className="text-xs font-bold leading-tight">{subj.title}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Number of Questions */}
              <div>
                <label className="block text-[10px] font-black text-zinc-400 mb-1.5 uppercase tracking-wider">No. of Questions</label>
                <select
                  value={mixLimit}
                  onChange={(e) => setMixLimit(parseInt(e.target.value))}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 focus:outline-none text-xs text-zinc-650"
                >
                  <option value="5">5 Questions</option>
                  <option value="10">10 Questions</option>
                  <option value="15">15 Questions (Recommended)</option>
                  <option value="20">20 Questions</option>
                  <option value="25">25 Questions</option>
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-3 pt-4 border-t border-zinc-100 dark:border-zinc-850 shrink-0 font-sans">
              <button
                type="button"
                onClick={() => setMixSetupOpen(false)}
                className="w-1/2 py-2.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 text-xs font-bold rounded-xl transition cursor-pointer border-none"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={selectedMixSubjects.length === 0}
                onClick={() => {
                  const slugs = selectedMixSubjects.join('~');
                  setMixSetupOpen(false);
                  navigate(`/practice-quiz/mix/${slugs}?limit=${mixLimit}`);
                }}
                className="w-1/2 py-2.5 bg-indigo-650 hover:bg-indigo-600 disabled:bg-indigo-950/40 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-md border-none"
              >
                Launch Mixed Quiz
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Assessments;