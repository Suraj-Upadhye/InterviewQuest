import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../../services/api';
import {
  ArrowLeft, Timer, BookOpen, Calendar, Award, CheckCircle2,
  XCircle, AlertCircle, Loader2, PlayCircle, History, RefreshCw
} from 'lucide-react';

const Assessments = () => {
  const navigate = useNavigate();
  const { topicSlug } = useParams();

  const topics = ['DSA', 'DBMS', 'OS', 'CN', 'OOP', 'APTITUDE'];

  const [attempts, setAttempts] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('new'); // 'new' or 'history'

  // Test session state
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({}); // { questionId: selectedOption }
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Active exam states
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [examActive, setExamActive] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetchAttemptsHistory();
  }, []);

  useEffect(() => {
    if (topicSlug) {
      const matched = topics.find(t => t.toUpperCase() === topicSlug.toUpperCase());
      if (matched) {
        startTest(matched);
      }
    }
  }, [topicSlug]);

  // Timer countdown hook
  useEffect(() => {
    if (!examActive) return;
    if (timeLeft <= 0) {
      handleAutoSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, examActive]);

  const fetchAttemptsHistory = async () => {
    try {
      setHistoryLoading(true);
      const response = await API.get('/api/assessments/attempts');
      setAttempts(response.data || []);
    } catch (err) {
      console.error('Failed to load assessment history');
    } finally {
      setHistoryLoading(false);
    }
  };

  const startTest = async (topicName) => {
    try {
      setError('');
      setLoading(true);
      setSelectedTopic(topicName);

      const response = await API.get(`/api/assessments/start?topic=${topicName}&limit=10`);
      setQuestions(response.data || []);
      setAnswers({});
      setCurrentIdx(0);
      setTimeLeft(600); // 10 mins
      setResult(null);
      setExamActive(true);
    } catch (err) {
      setError('Could not load test questions. Please ensure the MCQ bank is populated.');
      setSelectedTopic(null);
    } finally {
      setLoading(false);
    }
  };

  const selectOption = (questionId, option) => {
    setAnswers({
      ...answers,
      [questionId]: option
    });
  };

  const handleSubmit = async () => {
    if (submitting) return;

    try {
      setSubmitting(true);
      setError('');
      setExamActive(false);

      const formattedAnswers = Object.entries(answers).map(([qId, val]) => ({
        questionId: parseInt(qId),
        submittedAnswer: val
      }));

      // Make sure we include unanswered questions as well!
      questions.forEach(q => {
        if (!answers[q.id]) {
          formattedAnswers.push({
            questionId: q.id,
            submittedAnswer: ''
          });
        }
      });

      const payload = {
        topic: selectedTopic,
        answers: formattedAnswers
      };

      const response = await API.post('/api/assessments/submit', payload);
      setResult(response.data);
      fetchAttemptsHistory(); // Refresh history logs
    } catch (err) {
      setError('Failed to submit assessment results.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAutoSubmit = () => {
    alert("Time's up! Your answers are being submitted automatically.");
    handleSubmit();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const resetExamPanel = () => {
    setSelectedTopic(null);
    setQuestions([]);
    setAnswers({});
    setResult(null);
    setExamActive(false);
    setActiveTab('new');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 flex flex-col justify-center items-center">
        <Loader2 className="w-10 h-10 animate-spin text-zinc-750 dark:text-zinc-400 mb-4" />
        <p className="text-zinc-500 dark:text-zinc-450 text-xs">Building assessment session...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 p-6 relative overflow-hidden transition-colors duration-300">
      <div className="max-w-3xl mx-auto z-10 relative">

        {/* Header */}
        <header className="flex items-center justify-between mb-8 border-b border-zinc-200 dark:border-zinc-900 pb-5">
          <div className="flex items-center space-x-4">
            <button
              onClick={selectedTopic ? resetExamPanel : () => navigate('/dashboard')}
              className="p-2.5 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-xl transition text-zinc-550 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-extrabold text-zinc-950 dark:text-white">
                Practice Quiz
              </h1>
              <p className="text-xs text-zinc-550 dark:text-zinc-400">
                {examActive ? `Active Timed Quiz: ${selectedTopic}` : 'Challenge yourself with timed practice quizzes'}
              </p>
            </div>
          </div>

          {examActive && (
            <div className={`flex items-center space-x-2 px-4 py-2 border rounded-xl font-mono text-xs font-bold transition ${timeLeft < 60
                ? 'border-red-500/40 bg-red-500/10 text-red-600 dark:text-red-400 animate-pulse'
                : 'border-zinc-200 dark:border-zinc-805 bg-zinc-100 dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400'
              }`}>
              <Timer className="w-4 h-4 shrink-0" />
              <span>{formatTime(timeLeft)}</span>
            </div>
          )}
        </header>

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-650 dark:text-red-400 text-xs text-center mb-6">
            {error}
          </div>
        )}

        {/* Normal Mode Selection Tab */}
        {!selectedTopic && !result && (
          <div className="space-y-6">
            <div className="flex border-b border-zinc-200 dark:border-zinc-900 overflow-x-auto space-x-6 scrollbar-none">
              <button
                onClick={() => setActiveTab('new')}
                className={`flex items-center space-x-2 pb-4 border-b-2 font-bold text-xs transition cursor-pointer ${activeTab === 'new'
                    ? 'border-zinc-950 dark:border-white text-zinc-950 dark:text-white'
                    : 'border-transparent text-zinc-450 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                  }`}
              >
                <PlayCircle className="w-4 h-4" />
                <span>Start New Test</span>
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`flex items-center space-x-2 pb-4 border-b-2 font-bold text-xs transition cursor-pointer ${activeTab === 'history'
                    ? 'border-zinc-950 dark:border-white text-zinc-950 dark:text-white'
                    : 'border-transparent text-zinc-450 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                  }`}
              >
                <History className="w-4 h-4" />
                <span>History & Scores</span>
              </button>
            </div>

            {activeTab === 'new' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {topics.map((topic, idx) => (
                  <div
                    key={idx}
                    className="bg-zinc-50 dark:bg-[#0d0d11] border border-zinc-200 dark:border-zinc-900 rounded-xl p-6 hover:border-zinc-400 dark:hover:border-zinc-700 transition flex justify-between items-center group"
                  >
                    <div>
                      <h3 className="font-bold text-zinc-900 dark:text-zinc-200 group-hover:text-zinc-950 dark:group-hover:text-white transition">{topic} Exam</h3>
                      <p className="text-[10px] text-zinc-500 dark:text-zinc-450 mt-1">10 Questions | 10 Minutes</p>
                    </div>
                    <button
                      onClick={() => startTest(topic)}
                      className="bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 text-xs font-bold px-4 py-2 rounded-lg transition cursor-pointer hover:bg-zinc-850 dark:hover:bg-zinc-200"
                    >
                      Start Test
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              // Attempts History Logs
              <div className="space-y-3">
                {historyLoading ? (
                  <div className="text-center py-12"><Loader2 className="w-8 h-8 animate-spin text-zinc-500 mx-auto" /></div>
                ) : attempts.length === 0 ? (
                  <div className="text-center py-12 bg-zinc-50 dark:bg-zinc-950/20 border border-zinc-200 dark:border-zinc-850 border-dashed rounded-2xl text-zinc-500">
                    <History className="w-8 h-8 mx-auto mb-3 text-zinc-400 dark:text-zinc-650" />
                    <p className="text-xs">No exam history recorded yet.</p>
                  </div>
                ) : (
                  attempts.map((attempt, idx) => {
                    const pct = Math.round((attempt.score / attempt.totalQuestions) * 100);
                    return (
                      <div key={idx} className="bg-zinc-50 dark:bg-[#0d0d11] border border-zinc-200 dark:border-zinc-900 rounded-xl p-5 flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                          <div className={`p-3 rounded-xl font-bold text-xs ${pct >= 70 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : pct >= 40 ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'bg-red-500/10 text-red-600 dark:text-red-400'}`}>
                            {pct}%
                          </div>
                          <div>
                            <h4 className="font-bold text-zinc-900 dark:text-zinc-200 text-xs">{attempt.topic} Assessment</h4>
                            <p className="text-[10px] text-zinc-500 dark:text-zinc-450 mt-1 flex items-center">
                              <Calendar className="w-3.5 h-3.5 mr-1" />
                              {new Date(attempt.completedAt || attempt.startedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold text-zinc-750 dark:text-zinc-300">{attempt.score} / {attempt.totalQuestions}</p>
                          <p className="text-[9px] text-zinc-500 dark:text-zinc-450 mt-1">Scorecard Saved</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        )}

        {/* Timed Exam Active State Panel */}
        {examActive && questions.length > 0 && (
          <div className="space-y-6">
            {/* Question Index Grid Selection */}
            <div className="bg-zinc-50 dark:bg-[#0d0d11] border border-zinc-200 dark:border-zinc-900 rounded-xl p-4 flex flex-wrap gap-2 justify-center">
              {questions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIdx(idx)}
                  className={`w-9 h-9 text-xs font-bold rounded-xl border transition cursor-pointer ${currentIdx === idx
                      ? 'bg-zinc-950 dark:bg-white border-zinc-950 dark:border-white text-white dark:text-zinc-950'
                      : answers[q.id]
                        ? 'bg-zinc-200 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200'
                        : 'bg-white dark:bg-zinc-950/40 border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 hover:border-zinc-400 dark:hover:border-zinc-700'
                    }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>

            {/* Question Card */}
            <div className="bg-zinc-50 dark:bg-[#0d0d11] border border-zinc-200 dark:border-zinc-900 rounded-xl p-8 shadow-sm">
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-200 leading-relaxed mb-6">
                {questions[currentIdx].questionText}
              </h2>

              <div className="space-y-3">
                {questions[currentIdx].options.map((option, idx) => {
                  const isSelected = answers[questions[currentIdx].id] === option;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => selectOption(questions[currentIdx].id, option)}
                      className={`w-full text-left px-5 py-4 border rounded-xl text-xs font-semibold transition duration-205 flex justify-between items-center cursor-pointer ${isSelected
                          ? 'border-zinc-950 dark:border-white bg-zinc-100 dark:bg-zinc-900 text-zinc-950 dark:text-zinc-200'
                          : 'border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-950/40 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:border-zinc-400 dark:hover:border-zinc-700'
                        }`}
                    >
                      <span>{option}</span>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'border-zinc-950 dark:border-white bg-zinc-950 dark:bg-white' : 'border-zinc-300 dark:border-zinc-700'}`}>
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white dark:bg-zinc-950" />}
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
                  &larr; Previous
                </button>

                {currentIdx + 1 === questions.length ? (
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow-sm cursor-pointer transition disabled:opacity-50"
                  >
                    {submitting ? 'Submitting...' : 'Submit Assessment'}
                  </button>
                ) : (
                  <button
                    onClick={() => setCurrentIdx(currentIdx + 1)}
                    className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg text-xs font-bold transition cursor-pointer text-zinc-700 dark:text-zinc-300"
                  >
                    Next &rarr;
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Graded Exam Result Screen */}
        {result && (
          <div className="space-y-6">
            <div className="bg-zinc-50 dark:bg-[#0d0d11] border border-zinc-200 dark:border-zinc-900 rounded-2xl p-8 text-center shadow-sm">
              <Award className="w-16 h-16 mx-auto text-indigo-600 dark:text-indigo-400 mb-4 animate-bounce" />
              <h2 className="text-2xl font-bold mb-2">Assessment Graded!</h2>
              <p className="text-zinc-500 dark:text-zinc-405 text-xs mb-6">Your attempt for {result.topic} has been processed successfully.</p>

              <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-8">
                <div className="bg-white dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-900 p-4 rounded-xl">
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold uppercase">Total Questions</p>
                  <p className="text-xl font-bold mt-1 text-zinc-700 dark:text-zinc-300">{result.totalQuestions}</p>
                </div>
                <div className="bg-white dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-900 p-4 rounded-xl">
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold uppercase">Score</p>
                  <p className="text-xl font-bold mt-1 text-indigo-600 dark:text-indigo-400">{result.score}</p>
                </div>
                <div className="bg-white dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-900 p-4 rounded-xl">
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold uppercase">Percentage</p>
                  <p className="text-xl font-bold mt-1 text-emerald-650 dark:text-emerald-400">{result.percentage}%</p>
                </div>
              </div>

              <button
                onClick={resetExamPanel}
                className="bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 font-bold px-6 py-2.5 rounded-xl text-xs transition cursor-pointer hover:bg-zinc-850 dark:hover:bg-zinc-200"
              >
                Done
              </button>
            </div>

            {/* Detailed Question Review List */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-200">Question-by-Question Review</h3>
              {result.details.map((detail, idx) => (
                <div key={idx} className="bg-zinc-50 dark:bg-[#0d0d11] border border-zinc-200 dark:border-zinc-900 rounded-xl p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <h4 className="text-xs font-bold leading-relaxed pr-6 text-zinc-900 dark:text-zinc-200">
                      {idx + 1}. {detail.questionText}
                    </h4>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center space-x-1 shrink-0 ${detail.correct ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : 'bg-red-500/10 text-red-700 dark:text-red-400'
                      }`}>
                      {detail.correct ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                          <span>Correct</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5 mr-1" />
                          <span>Incorrect</span>
                        </>
                      )}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="p-3 bg-white dark:bg-zinc-955/60 border border-zinc-200 dark:border-zinc-900 rounded-xl">
                      <span className="text-zinc-500 dark:text-zinc-400 block font-semibold">Your Answer:</span>
                      <span className={`font-bold mt-1 block ${detail.correct ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                        {detail.submittedAnswer || "(No answer submitted)"}
                      </span>
                    </div>
                    <div className="p-3 bg-white dark:bg-zinc-955/60 border border-zinc-200 dark:border-zinc-900 rounded-xl">
                      <span className="text-zinc-500 dark:text-zinc-400 block font-semibold">Correct Answer:</span>
                      <span className="text-emerald-650 dark:text-emerald-400 font-bold mt-1 block">
                        {detail.correctAnswer}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 bg-zinc-100 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-900 rounded-xl">
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold uppercase flex items-center">
                      <AlertCircle className="w-3.5 h-3.5 mr-1" /> Explanation
                    </span>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed mt-1.5 font-medium">
                      {detail.explanation || "No detailed explanation available."}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Assessments;
