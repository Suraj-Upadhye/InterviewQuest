import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import API from '../../services/api';
import { 
  ArrowLeft, Brain, Send, User as UserIcon, Loader2, Sparkles, 
  Settings2, Key, Info, Award, AlertCircle, RefreshCw, LogOut, History,
  Mic, MicOff, Volume2, VolumeX
} from 'lucide-react';import '../../App.css';
import Navbar from '../../components/Navbar';

const MockInterview = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const messagesEndRef = useRef(null);

  const [sessions, setSessions] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('new'); // 'new' or 'history'

  // Config setup states
  const [companyName, setCompanyName] = useState('');
  const [topicOrSkills, setTopicOrSkills] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const topicParam = params.get('topic');
    if (topicParam) {
      setTopicOrSkills(topicParam);
    }
  }, [location.search]);
  const [interviewType, setInterviewType] = useState('TECHNICAL');
  const [userApiKey, setUserApiKey] = useState('');

  // Active interview states
  const [activeSession, setActiveSession] = useState(null);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [error, setError] = useState('');

  // Speech and Audio States
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(() => {
    return localStorage.getItem('interview_muted') === 'true';
  });
  const recognitionRef = useRef(null);

  useEffect(() => {
    fetchSessionHistory();
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const speakText = (text) => {
    if (!('speechSynthesis' in window) || isMuted) return;

    window.speechSynthesis.cancel();

    // Remove markdown symbols for cleaner speech readout
    const cleanedText = text
      .replace(/###/g, '')
      .replace(/\*\*/g, '')
      .replace(/-\s/g, '')
      .replace(/`+/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanedText);
    utterance.rate = 1.15; // Speed up voice for a more natural conversation rate
    
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes('google')) || 
                  voices.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes('natural')) ||
                  voices.find(v => v.lang.startsWith('en'));
    
    if (voice) {
      utterance.voice = voice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const toggleMute = () => {
    setIsMuted(prev => {
      const newVal = !prev;
      localStorage.setItem('interview_muted', String(newVal));
      if (newVal && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      }
      return newVal;
    });
  };

  const toggleListening = async () => {
    // Detect Brave Browser compatibility block
    const isBrave = navigator.brave && typeof navigator.brave.isBrave === 'function' && await navigator.brave.isBrave();
    if (isBrave) {
      setError('Brave Browser blocks the native Speech Recognition API for privacy reasons (due to sending audio to Google). Please use Google Chrome, Microsoft Edge, or Safari for voice capabilities.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.');
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setIsListening(true);
        setError('');
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          setIsSpeaking(false);
        }
      };

      rec.onresult = (event) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        setChatInput(transcript);
      };

      rec.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (event.error !== 'no-speech') {
          setError(`Microphone error: ${event.error}. Please check permissions.`);
        }
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (e) {
      console.error('Failed to start speech recognition:', e);
      setError('Could not access microphone.');
      setIsListening(false);
    }
  };

  useEffect(() => {
    if (activeSession && activeSession.conversation.length > 0) {
      const messages = activeSession.conversation;
      const lastMessage = messages[messages.length - 1];
      if (lastMessage && lastMessage.role === 'assistant') {
        speakText(lastMessage.content);
      }
    }
  }, [activeSession?.conversation?.length]);

  useEffect(() => {
    scrollToBottom();
  }, [activeSession?.conversation, chatLoading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchSessionHistory = async () => {
    try {
      setHistoryLoading(true);
      const response = await API.get('/api/mock-interviews');
      setSessions(response.data || []);
    } catch (err) {
      console.error('Failed to load mock interview history');
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleStart = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setChatLoading(true);

      const payload = {
        companyName: companyName.trim() || 'General',
        topicOrSkills: topicOrSkills.trim() || 'Core Software Engineering',
        interviewType
      };

      const headers = {};
      if (userApiKey.trim()) {
        headers['X-Groq-Api-Key'] = userApiKey.trim();
      }

      const response = await API.post('/api/mock-interviews/start', payload, { headers });
      setActiveSession(response.data);
      setChatInput('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to start AI interview. Make sure you provided a valid Groq API Key.');
    } finally {
      setChatLoading(false);
    }
  };

  const handleSendResponse = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    const textToSend = chatInput.trim();
    setChatInput('');
    setError('');

    // Optimistically update conversation UI local state
    const optimisticMessage = { role: 'user', content: textToSend, timestamp: new Date().toISOString() };
    const updatedConversation = [...activeSession.conversation, optimisticMessage];
    setActiveSession({
      ...activeSession,
      conversation: updatedConversation
    });

    try {
      setChatLoading(true);
      const headers = {};
      if (userApiKey.trim()) {
        headers['X-Groq-Api-Key'] = userApiKey.trim();
      }

      const response = await API.post(
        `/api/mock-interviews/${activeSession.id}/chat`,
        { response: textToSend },
        { headers }
      );
      setActiveSession(response.data);
    } catch (err) {
      setError('Connection to Groq API was lost. Could not load next response.');
    } finally {
      setChatLoading(false);
    }
  };

  const handleEvaluate = async () => {
    if (evaluating) return;

    try {
      setError('');
      setEvaluating(true);
      
      const headers = {};
      if (userApiKey.trim()) {
        headers['X-Groq-Api-Key'] = userApiKey.trim();
      }

      const response = await API.post(`/api/mock-interviews/${activeSession.id}/evaluate`, {}, { headers });
      setActiveSession(response.data);
      fetchSessionHistory(); // Update logs
    } catch (err) {
      setError('Evaluation failed. Could not generate scorecard.');
    } finally {
      setEvaluating(false);
    }
  };

  const resumeSession = (session) => {
    setActiveSession(session);
  };

  const resetInterviewPanel = () => {
    setActiveSession(null);
    setError('');
    setActiveTab('new');
  };

  // Check if session has evaluation scorecard in conversation list
  const getScorecardMessage = () => {
    if (!activeSession) return null;
    return activeSession.conversation.find(
      msg => msg.role === 'assistant' && msg.content.includes('### Mock Interview Scorecard')
    );
  };

  const isEvaluated = () => {
    return getScorecardMessage() !== null;
  };

  if (historyLoading && !activeSession) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 flex flex-col justify-center items-center">
        <Loader2 className="w-10 h-10 animate-spin text-zinc-750 dark:text-zinc-400 mb-4" />
        <p className="text-zinc-500 dark:text-zinc-400 text-xs">Loading interview panel...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-105 relative overflow-hidden flex flex-col transition-colors duration-300">
      {!activeSession && <Navbar variant="app" />}
      <div className={`max-w-4xl mx-auto w-full z-10 relative flex-grow flex flex-col ${!activeSession ? 'pt-28 px-6 pb-12' : 'p-6'}`}>
        
        {/* Header */}
        <header className="flex items-center justify-between mb-8 border-b border-zinc-200 dark:border-zinc-900 pb-5 shrink-0">
          <div className="flex items-center space-x-4">
            <button
              onClick={activeSession ? resetInterviewPanel : () => navigate('/dashboard')}
              className="p-2.5 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-xl transition text-zinc-550 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-extrabold text-zinc-950 dark:text-white flex items-center">
                <Brain className="w-5 h-5 text-indigo-650 dark:text-indigo-400 mr-2 shrink-0" />
                AI Mock Interviews
              </h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {activeSession 
                  ? `Interview with AI (${activeSession.companyName} - ${activeSession.interviewType})`
                  : 'Simulate HR & technical rounds using Groq AI'}
              </p>
            </div>
          </div>
        </header>

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-650 dark:text-red-400 text-xs text-center mb-6 shrink-0 flex items-center justify-center space-x-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* SETUP SCREEN */}
        {!activeSession && (
          <div className="space-y-6 shrink-0">
            <div className="flex border-b border-zinc-200 dark:border-zinc-900 space-x-6">
              <button
                onClick={() => setActiveTab('new')}
                className={`flex items-center space-x-2 pb-4 border-b-2 font-bold text-xs transition cursor-pointer ${
                  activeTab === 'new' 
                    ? 'border-zinc-950 dark:border-white text-zinc-950 dark:text-white' 
                    : 'border-transparent text-zinc-450 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Configure New Interview</span>
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`flex items-center space-x-2 pb-4 border-b-2 font-bold text-xs transition cursor-pointer ${
                  activeTab === 'history' 
                    ? 'border-zinc-950 dark:border-white text-zinc-950 dark:text-white' 
                    : 'border-transparent text-zinc-450 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                <History className="w-4 h-4" />
                <span>Interview History</span>
              </button>
            </div>

            {activeTab === 'new' ? (
              <form onSubmit={handleStart} className="bg-zinc-50 dark:bg-[#0d0d11] border border-zinc-200 dark:border-zinc-900 rounded-xl p-8 space-y-6 max-w-xl mx-auto shadow-sm">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-650 dark:text-zinc-450 mb-1.5 flex items-center">
                      <Settings2 className="w-3.5 h-3.5 mr-1" /> Target Company
                    </label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Google, Amazon"
                      className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-650 text-xs text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-650 dark:text-zinc-450 mb-1.5 flex items-center">
                      <Settings2 className="w-3.5 h-3.5 mr-1" /> Topic / Focus Skills
                    </label>
                    <input
                      type="text"
                      value={topicOrSkills}
                      onChange={(e) => setTopicOrSkills(e.target.value)}
                      placeholder="e.g. Java, System Design"
                      className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-650 text-xs text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-650 dark:text-zinc-400 mb-1.5">Interview Round Type</label>
                  <select
                    value={interviewType}
                    onChange={(e) => setInterviewType(e.target.value)}
                    className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-650 text-xs text-zinc-900 dark:text-zinc-100 cursor-pointer"
                  >
                    <option value="TECHNICAL">Technical Round (Coding & Design)</option>
                    <option value="HR">HR Round (Behavioral & Resume)</option>
                    <option value="SKILL_SPECIFIC">Skill-Specific Assessment (Core concepts)</option>
                  </select>
                </div>

                {/* API Key settings */}
                <div className="p-4 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-3">
                  <div className="flex items-start space-x-2 text-xs text-zinc-600 dark:text-zinc-450 leading-relaxed font-medium">
                    <Info className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>
                      You can optionally input your own **Groq API Key** to bypass system credit limits. Your key remains private and is only used to route requests.
                    </span>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-550">
                      <Key className="h-4 w-4" />
                    </div>
                    <input
                      type="password"
                      value={userApiKey}
                      onChange={(e) => setUserApiKey(e.target.value)}
                      placeholder="gsk_..."
                      className="block w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-650 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={chatLoading}
                  className="w-full py-3 bg-zinc-950 dark:bg-white hover:bg-zinc-850 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 font-bold rounded-xl transition cursor-pointer text-xs flex justify-center items-center"
                >
                  {chatLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Loading Interviewer...
                    </>
                  ) : (
                    'Start AI Interview'
                  )}
                </button>
              </form>
            ) : (
              // Historical log sessions list
              <div className="space-y-3">
                {sessions.length === 0 ? (
                  <div className="text-center py-12 bg-zinc-50 dark:bg-zinc-950/20 border border-zinc-200 dark:border-zinc-850 border-dashed rounded-2xl text-zinc-500">
                    <Brain className="w-8 h-8 mx-auto mb-3 text-zinc-400 dark:text-zinc-650" />
                    <p className="text-xs">No mock interview sessions recorded yet.</p>
                  </div>
                ) : (
                  sessions.map((session, idx) => (
                    <div
                      key={idx}
                      className="bg-zinc-50 dark:bg-[#0d0d11] border border-zinc-200 dark:border-zinc-900 rounded-xl p-5 flex justify-between items-center hover:border-zinc-400 dark:hover:border-zinc-700 transition duration-200"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-xl">
                          <Brain className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-zinc-900 dark:text-zinc-250 text-xs">{session.companyName} Mock Session</h4>
                          <p className="text-[10px] text-zinc-500 dark:text-zinc-450 mt-1">
                            Type: {session.interviewType} | Focus: {session.topicOrSkills}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => resumeSession(session)}
                        className="bg-zinc-150 dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-750 dark:text-zinc-300 px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer"
                      >
                        Review / Open
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* ACTIVE MOCK INTERVIEW CHAT BOARD */}
        {activeSession && (
          <div className="flex-grow flex flex-col h-[550px] bg-zinc-50 dark:bg-[#0d0d11] border border-zinc-200 dark:border-zinc-900 rounded-2xl overflow-hidden shadow-sm relative">
            
            {/* Top Details Header */}
            <div className="px-6 py-4 bg-zinc-100/60 dark:bg-zinc-900/60 border-b border-zinc-200 dark:border-zinc-900 flex justify-between items-center shrink-0">
              <div>
                <h3 className="font-bold text-zinc-900 dark:text-zinc-200 text-xs">
                  Interviewer AI ({activeSession.companyName})
                </h3>
                <p className="text-[9px] text-zinc-550 dark:text-zinc-455 mt-0.5">Topic: {activeSession.topicOrSkills}</p>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={toggleMute}
                  className={`p-2 rounded-lg border transition cursor-pointer ${
                    isMuted 
                      ? 'bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300' 
                      : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20'
                  }`}
                  title={isMuted ? "Unmute AI Voice" : "Mute AI Voice"}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>

                {!isEvaluated() && (
                  <button
                    onClick={handleEvaluate}
                    disabled={evaluating}
                    className="flex items-center space-x-1.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/45 px-3.5 py-2 rounded-lg transition text-xs font-semibold cursor-pointer disabled:opacity-50"
                  >
                    {evaluating ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Grading...</span>
                      </>
                    ) : (
                      <>
                        <LogOut className="w-3.5 h-3.5" />
                        <span>End & Evaluate</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Message list window */}
            <div className="flex-grow p-6 overflow-y-auto space-y-4 min-h-0 bg-white dark:bg-zinc-950/20">
              {(() => {
                const visibleMessages = activeSession.conversation.filter(msg => msg.role !== 'system');
                return visibleMessages.map((msg, index) => {
                  const isAssistant = msg.role === 'assistant';
                  const isScorecard = msg.content.includes('### Mock Interview Scorecard');
                  const isLastMessage = index === visibleMessages.length - 1;

                  if (isScorecard) {
                    return (
                      <div key={index} className="max-w-2xl mx-auto bg-zinc-100 dark:bg-zinc-900/40 border border-zinc-250 dark:border-zinc-800 rounded-xl p-6 my-4 shadow-sm animate-fadeIn">
                        <Award className="w-6 h-6 text-indigo-655 dark:text-indigo-400 mb-3" />
                        <div className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-line prose-invert font-medium">
                          {msg.content}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={index}
                      className={`flex ${isAssistant ? 'justify-start' : 'justify-end'} animate-fadeIn`}
                    >
                      <div className={`flex items-start space-x-2.5 max-w-[80%] ${isAssistant ? 'flex-row' : 'flex-row-reverse space-x-reverse'}`}>
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 relative ${
                          isAssistant ? 'bg-zinc-150 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-zinc-250 dark:border-zinc-800' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-750'
                        }`}>
                          {isAssistant && isLastMessage && isSpeaking && (
                            <span className="absolute inset-0 rounded-lg bg-zinc-550/10 border border-zinc-500/20 animate-ping" />
                          )}
                          {isAssistant ? <Brain className="w-4 h-4" /> : <UserIcon className="w-4 h-4" />}
                        </div>
                        <div className={`p-4 rounded-xl text-xs leading-relaxed font-medium ${
                          isAssistant 
                            ? 'bg-zinc-100/80 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-900 text-zinc-800 dark:text-zinc-250 rounded-tl-none' 
                            : 'bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 rounded-tr-none'
                        }`}>
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}

              {chatLoading && (
                <div className="flex justify-start">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-lg bg-zinc-150 dark:bg-zinc-900 text-zinc-850 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center shrink-0">
                      <Brain className="w-4 h-4" />
                    </div>
                    <div className="px-4 py-3 bg-zinc-100/80 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-900 rounded-xl rounded-tl-none flex items-center">
                      <div className="flex space-x-1">
                        <div className="w-1.5 h-1.5 bg-zinc-450 rounded-full animate-bounce" />
                        <div className="w-1.5 h-1.5 bg-zinc-450 rounded-full animate-bounce [animation-delay:0.2s]" />
                        <div className="w-1.5 h-1.5 bg-zinc-450 rounded-full animate-bounce [animation-delay:0.4s]" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Real-time Voice Sound Wave Visualizer */}
            {isListening && (
              <div className="px-6 py-2 bg-zinc-100 dark:bg-zinc-950/20 border-t border-zinc-200 dark:border-zinc-900 flex items-center justify-between shrink-0 animate-fadeIn">
                <div className="flex items-center space-x-2.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                  <span className="text-[10px] text-zinc-550 dark:text-zinc-400 font-bold uppercase tracking-wider">Listening for voice...</span>
                </div>
                <div className="flex items-end space-x-1 h-5">
                  <div className="w-0.5 bg-zinc-400 dark:bg-zinc-600 rounded animate-[soundWave_1s_ease-in-out_infinite_delay-100ms] h-1" style={{ animation: 'soundWave 1s ease-in-out infinite 0.1s' }} />
                  <div className="w-0.5 bg-zinc-400 dark:bg-zinc-600 rounded animate-[soundWave_1s_ease-in-out_infinite_delay-300ms] h-1" style={{ animation: 'soundWave 1s ease-in-out infinite 0.3s' }} />
                  <div className="w-0.5 bg-zinc-400 dark:bg-zinc-600 rounded animate-[soundWave_1s_ease-in-out_infinite_delay-600ms] h-1" style={{ animation: 'soundWave 1s ease-in-out infinite 0.6s' }} />
                  <div className="w-0.5 bg-zinc-400 dark:bg-zinc-600 rounded animate-[soundWave_1s_ease-in-out_infinite_delay-200ms] h-1" style={{ animation: 'soundWave 1s ease-in-out infinite 0.2s' }} />
                  <div className="w-0.5 bg-zinc-400 dark:bg-zinc-600 rounded animate-[soundWave_1s_ease-in-out_infinite_delay-400ms] h-1" style={{ animation: 'soundWave 1s ease-in-out infinite 0.4s' }} />
                </div>
              </div>
            )}

            {/* Input Form at bottom */}
            {!isEvaluated() && (
              <form onSubmit={handleSendResponse} className="p-4 bg-zinc-100/60 dark:bg-zinc-905/65 border-t border-zinc-200 dark:border-zinc-900 flex items-center space-x-3 shrink-0">
                <div className="flex-grow relative">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    disabled={chatLoading}
                    placeholder={
                      chatLoading 
                        ? "Waiting for AI..." 
                        : isListening 
                          ? "Listening... Speak clearly." 
                          : "Type your response or click the mic to speak..."
                    }
                    className="w-full bg-white dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-800 rounded-xl pl-4 pr-12 py-3 text-xs focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-650 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600"
                  />
                  <button
                    type="button"
                    onClick={toggleListening}
                    disabled={chatLoading}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition cursor-pointer disabled:opacity-45 ${
                      isListening
                        ? 'text-red-655 bg-red-500/10 hover:bg-red-500/25 animate-pulse'
                        : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800/40'
                    }`}
                    title={isListening ? "Stop Listening" : "Speak Response (Microphone)"}
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={!chatInput.trim() || chatLoading}
                  className="p-3 bg-zinc-950 dark:bg-white hover:bg-zinc-850 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 rounded-xl transition cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MockInterview;
