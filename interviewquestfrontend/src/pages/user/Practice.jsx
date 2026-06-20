import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import { ArrowLeft, BookOpen, Code, Award, CheckCircle2, XCircle, AlertCircle, Loader2, RefreshCw } from 'lucide-react';

const Practice = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const topics = [
    { name: 'DSA', desc: 'Data Structures & Algorithms', color: 'from-blue-500 to-indigo-600' },
    { name: 'DBMS', desc: 'Database Management Systems', color: 'from-purple-500 to-indigo-500' },
    { name: 'OS', desc: 'Operating Systems concepts', color: 'from-emerald-500 to-teal-600' },
    { name: 'CN', desc: 'Computer Networks protocols', color: 'from-pink-500 to-rose-600' },
    { name: 'OOP', desc: 'Object Oriented Programming', color: 'from-amber-500 to-orange-600' },
    { name: 'APTITUDE', desc: 'Quantitative & Logical reasoning', color: 'from-fuchsia-500 to-purple-600' }
  ];

  const [selectedTopic, setSelectedTopic] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Practice state
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const topicParam = params.get('topic');
    if (topicParam) {
      const matchedTopic = topics.find(t => t.name.toUpperCase() === topicParam.toUpperCase());
      if (matchedTopic) {
        startPractice(matchedTopic.name);
      }
    }
  }, [location.search]);

  const startPractice = async (topicName) => {
    try {
      setError('');
      setLoading(true);
      setSelectedTopic(topicName);
      
      const response = await API.get(`/api/questions/practice?topic=${topicName}&limit=10`);
      setQuestions(response.data || []);
      setCurrentIdx(0);
      setSelectedAnswer(null);
      setAnswered(false);
      setCorrectCount(0);
      setShowSummary(false);
    } catch (err) {
      setError('Failed to fetch practice questions. Please ensure the question bank is populated.');
      setSelectedTopic(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerClick = (option) => {
    if (answered) return;
    setSelectedAnswer(option);
    setAnswered(true);

    const isCorrect = questions[currentIdx].correctAnswer.trim().toLowerCase() === option.trim().toLowerCase();
    if (isCorrect) {
      setCorrectCount(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx(currentIdx + 1);
      setSelectedAnswer(null);
      setAnswered(false);
    } else {
      setShowSummary(true);
    }
  };

  const resetPractice = () => {
    setSelectedTopic(null);
    setQuestions([]);
    setShowSummary(false);
    navigate('/practice');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 flex flex-col justify-center items-center">
        <Loader2 className="w-10 h-10 animate-spin text-zinc-700 dark:text-zinc-400 mb-4" />
        <p className="text-zinc-500 dark:text-zinc-400 text-xs">Loading practice questions...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 p-6 relative overflow-hidden transition-colors duration-300">
      <div className="max-w-3xl mx-auto z-10 relative">
        
        {/* Header */}
        <header className="flex items-center space-x-4 mb-10 border-b border-zinc-200 dark:border-zinc-900 pb-5">
          <button
            onClick={selectedTopic ? resetPractice : () => navigate(user ? '/dashboard' : '/')}
            className="p-2.5 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-xl transition text-zinc-550 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-zinc-950 dark:text-white">
              Topic Practice
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {selectedTopic ? `Practicing ${selectedTopic}` : 'Select a category to practice placement questions'}
            </p>
          </div>
        </header>

        {error && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-650 dark:text-red-400 text-xs text-center mb-6">
            <AlertCircle className="w-5 h-5 mx-auto mb-2 text-red-500" />
            <p className="font-semibold">{error}</p>
            <button
              onClick={() => setSelectedTopic(null)}
              className="mt-3 text-xs bg-red-500/20 hover:bg-red-500/30 px-3 py-1.5 rounded-lg text-white transition cursor-pointer"
            >
              Choose another topic
            </button>
          </div>
        )}

        {/* Topic Selector View */}
        {!selectedTopic && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {topics.map((topic, idx) => (
              <div
                key={idx}
                onClick={() => startPractice(topic.name)}
                className="bg-zinc-50 dark:bg-[#0d0d11] border border-zinc-200 dark:border-zinc-900 hover:border-zinc-400 dark:hover:border-zinc-700 rounded-xl p-6 transition duration-200 group cursor-pointer hover:shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="inline-flex p-2.5 rounded-lg bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 mb-4 shadow-sm">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-zinc-900 dark:text-white group-hover:text-indigo-650 dark:group-hover:text-indigo-400 transition">{topic.name}</h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-405 leading-relaxed">{topic.desc}</p>
                </div>
                <div className="mt-4 text-xs font-semibold text-zinc-700 dark:text-zinc-300 group-hover:underline">
                  Start Practice &rarr;
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Active Practice Session View */}
        {selectedTopic && !showSummary && questions.length > 0 && (
          <div className="space-y-6">
            {/* Progress tracker */}
            <div className="flex justify-between items-center bg-zinc-50 dark:bg-[#0d0d11] border border-zinc-200 dark:border-zinc-900 rounded-xl px-5 py-3">
              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold uppercase tracking-wider">
                Question {currentIdx + 1} of {questions.length}
              </span>
              <div className="w-32 bg-zinc-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-zinc-950 dark:bg-white h-full transition-all duration-300"
                  style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Question Card */}
            <div className="bg-zinc-50 dark:bg-[#0d0d11] border border-zinc-200 dark:border-zinc-900 rounded-2xl p-8 shadow-sm">
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-200 leading-relaxed mb-6">
                {questions[currentIdx].questionText}
              </h2>

              <div className="space-y-3">
                {questions[currentIdx].options.map((option, idx) => {
                  const isUserSelection = selectedAnswer === option;
                  const isCorrectAnswer = questions[currentIdx].correctAnswer.trim().toLowerCase() === option.trim().toLowerCase();
                  
                  let buttonStyle = "border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-950/40 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:border-zinc-400 dark:hover:border-zinc-700";
                  let Icon = null;

                  if (answered) {
                    if (isCorrectAnswer) {
                      buttonStyle = "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-450";
                      Icon = CheckCircle2;
                    } else if (isUserSelection) {
                      buttonStyle = "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-450";
                      Icon = XCircle;
                    } else {
                      buttonStyle = "border-zinc-200/50 dark:border-zinc-900 bg-white/50 dark:bg-zinc-950/20 text-zinc-405 dark:text-zinc-600 opacity-60";
                    }
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={answered}
                      onClick={() => handleAnswerClick(option)}
                      className={`w-full text-left px-5 py-4 border rounded-xl text-xs font-semibold transition duration-200 flex justify-between items-center ${buttonStyle} ${!answered ? 'cursor-pointer' : ''}`}
                    >
                      <span>{option}</span>
                      {Icon && <Icon className="w-4 h-4 shrink-0 ml-4" />}
                    </button>
                  );
                })}
              </div>

              {/* Immediate Feedback Explanation */}
              {answered && (
                <div className="mt-8 border-t border-zinc-200 dark:border-zinc-900 pt-6 animate-fadeIn">
                  <div className="flex items-start space-x-3 mb-2">
                    <AlertCircle className="w-5 h-5 text-indigo-650 dark:text-indigo-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-200">Explanation</h4>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed mt-1">
                        {questions[currentIdx].explanation || "No detailed explanation provided for this question."}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleNext}
                    className="w-full mt-6 py-3 bg-zinc-950 dark:bg-white hover:bg-zinc-850 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 font-bold rounded-xl transition cursor-pointer text-xs"
                  >
                    {currentIdx + 1 === questions.length ? 'View Summary' : 'Next Question'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Practice Complete Summary View */}
        {showSummary && (
          <div className="bg-zinc-50 dark:bg-[#0d0d11] border border-zinc-200 dark:border-zinc-900 rounded-2xl p-8 text-center shadow-sm">
            <Award className="w-16 h-16 mx-auto text-indigo-600 dark:text-indigo-400 mb-4 animate-bounce" />
            <h2 className="text-2xl font-bold mb-2">Practice Complete!</h2>
            <p className="text-zinc-500 dark:text-zinc-400 text-xs mb-6">You did a great job reviewing topic questions for {selectedTopic}.</p>
            
            <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto mb-8">
              <div className="bg-white dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-900 p-4 rounded-xl">
                <p className="text-[10px] text-zinc-500 dark:text-zinc-455 font-bold uppercase">Total Questions</p>
                <p className="text-2xl font-extrabold mt-1">{questions.length}</p>
              </div>
              <div className="bg-white dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-900 p-4 rounded-xl">
                <p className="text-[10px] text-zinc-500 dark:text-zinc-455 font-bold uppercase">Correct Answers</p>
                <p className="text-2xl font-extrabold mt-1 text-emerald-600 dark:text-emerald-400">{correctCount}</p>
              </div>
            </div>

            <div className="flex justify-center space-x-4">
              <button
                onClick={() => startPractice(selectedTopic)}
                className="flex items-center space-x-2 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 px-5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer hover:bg-zinc-850 dark:hover:bg-zinc-200"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Practice Again</span>
              </button>
              <button
                onClick={resetPractice}
                className="bg-white dark:bg-transparent border border-zinc-250 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 px-5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Change Topic
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Practice;
