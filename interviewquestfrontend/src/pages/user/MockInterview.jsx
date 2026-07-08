import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import API from '../../services/api';
import {
  ArrowLeft, Brain, Send, User as UserIcon, Loader2, Sparkles,
  Settings2, Key, Info, Award, AlertCircle, RefreshCw, LogOut, History,
  Mic, MicOff, Volume2, VolumeX
} from 'lucide-react';
import '../../App.css';
import Navbar from '../../components/Navbar';

const MockInterview = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const messagesEndRef = useRef(null);

  const [sessions, setSessions] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('new'); // 'new' or 'history'

  // Config setup states
  const [interviewType, setInterviewType] = useState('SUBJECT');
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [hasApiKey, setHasApiKey] = useState(false);
  const [resumeUploaded, setResumeUploaded] = useState(false);
  const [validatingProfile, setValidatingProfile] = useState(true);

  // Real-time audio session states
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('DISCONNECTED'); // DISCONNECTED, CONNECTING, ACTIVE, MUTED, COMPLETED
  const [transcript, setTranscript] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [codeOrDesignInput, setCodeOrDesignInput] = useState('');
  const [error, setError] = useState('');
  const [selectedSessionDetails, setSelectedSessionDetails] = useState(null);

  // Refs for Web Audio API & WebSockets
  const wsRef = useRef(null);
  const audioCtxRef = useRef(null);       // Mic capture context (16kHz)
  const playbackCtxRef = useRef(null);    // Playback context (24kHz)
  const scriptNodeRef = useRef(null);
  const micStreamRef = useRef(null);
  const nextStartTimeRef = useRef(0);

  useEffect(() => {
    fetchProfileStatuses();
    fetchSubjectsList();
    fetchSessionHistory();
    return () => {
      stopAudioStreaming();
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [transcript]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchProfileStatuses = async () => {
    try {
      setValidatingProfile(true);
      const keyRes = await API.get('/api/users/profile/api-key/status');
      setHasApiKey(keyRes.data.hasKey);

      const resumeRes = await API.get('/api/users/profile/resume').catch(() => null);
      if (resumeRes && resumeRes.data) {
        setResumeUploaded(true);
      }
    } catch (err) {
      console.error('Failed to validate profile parameters', err);
    } finally {
      setValidatingProfile(false);
    }
  };

  const fetchSubjectsList = async () => {
    try {
      const response = await API.get('/api/public/subjects');
      setSubjects(response.data || []);
      if (response.data && response.data.length > 0) {
        setSelectedSubjectId(response.data[0].id.toString());
      }
    } catch (err) {
      console.error('Failed to retrieve subjects list', err);
    }
  };

  const fetchSessionHistory = async () => {
    try {
      setHistoryLoading(true);
      const response = await API.get('/api/interview-sessions');
      setSessions(response.data || []);
    } catch (err) {
      console.error('Failed to load session histories', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleStartInterview = async (e) => {
    e.preventDefault();
    if (!hasApiKey) {
      setError('You must configure your Gemini API Key in your Profile settings first.');
      return;
    }

    if ((interviewType === 'RESUME' || interviewType === 'HR_RESUME') && !resumeUploaded) {
      setError('You must upload a PDF resume in your Profile settings before starting a Resume-based interview.');
      return;
    }

    try {
      setError('');
      setConnectionStatus('CONNECTING');
      setTranscript([]);
      setIsSpeaking(false);
      nextStartTimeRef.current = 0;

      // 1. Initialize AudioContexts: mic capture at 16kHz, playback at 24kHz
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      const micCtx = new AudioContextClass({ sampleRate: 16000 });
      audioCtxRef.current = micCtx;
      const playCtx = new AudioContextClass({ sampleRate: 24000 });
      playbackCtxRef.current = playCtx;

      // 2. Request mic permissions and create source
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;

      const source = micCtx.createMediaStreamSource(stream);

      // 3. Create ScriptProcessor to route Float32 mic input to Int16 PCM chunks
      const scriptNode = micCtx.createScriptProcessor(2048, 1, 1);
      scriptNodeRef.current = scriptNode;

      source.connect(scriptNode);
      scriptNode.connect(micCtx.destination);

      // 4. Resolve active session ID to generate stream
      const token = localStorage.getItem('token') || '';

      // Derive WebSocket host from the configured API URL (VITE_API_URL),
      // NOT from window.location.host (which would be the Vercel frontend domain).
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      const apiUrl = new URL(apiBase);
      const wsProtocol = apiUrl.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsHost = apiUrl.host;
      const wsUrl = `${wsProtocol}//${wsHost}/api/v1/mock-interview/stream?token=${token}&interviewType=${interviewType}&subjectId=${selectedSubjectId}`;

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;
      ws.binaryType = 'arraybuffer';

      ws.onopen = () => {
        setConnectionStatus('ACTIVE');
        setActiveSessionId('active_ws_session');

        // Hook processor to stream chunks
        scriptNode.onaudioprocess = (e) => {
          const inputData = e.inputBuffer.getChannelData(0);
          const pcmData = new Int16Array(inputData.length);
          for (let i = 0; i < inputData.length; i++) {
            const s = Math.max(-1, Math.min(1, inputData[i]));
            pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
          }
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(pcmData.buffer);
          }
        };
      };

      ws.onmessage = async (event) => {
        if (typeof event.data === 'string') {
          const data = JSON.parse(event.data);

          // Handle error messages from backend
          if (data.error) {
            console.error('Gemini backend error:', data.error);
            setError(data.error);
            setConnectionStatus('DISCONNECTED');
            stopAudioStreaming();
            return;
          }

          // Stream completed notification
          if (data.sessionState === 'COMPLETED') {
            setConnectionStatus('COMPLETED');
            stopAudioStreaming();
            fetchSessionHistory();
            return;
          }

          // 1. Parse interviewer output transcription if present
          let assistantTranscript = '';
          if (data.outputTranscription?.text) {
            assistantTranscript = data.outputTranscription.text;
          } else if (data.serverContent?.outputTranscription?.text) {
            assistantTranscript = data.serverContent.outputTranscription.text;
          }

          if (assistantTranscript) {
            setIsSpeaking(true);
            setTranscript(prev => {
              const last = prev[prev.length - 1];
              if (last && last.role === 'assistant') {
                return [...prev.slice(0, -1), { role: 'assistant', text: last.text + assistantTranscript }];
              } else {
                return [...prev, { role: 'assistant', text: assistantTranscript }];
              }
            });
          }

          // 2. Parse candidate input transcription if present
          let userTranscript = '';
          if (data.inputTranscription?.text) {
            userTranscript = data.inputTranscription.text;
          } else if (data.serverContent?.inputTranscription?.text) {
            userTranscript = data.serverContent.inputTranscription.text;
          }

          if (userTranscript) {
            setTranscript(prev => {
              const last = prev[prev.length - 1];
              if (last && last.role === 'user') {
                return [...prev.slice(0, -1), { role: 'user', text: last.text + userTranscript }];
              } else {
                return [...prev, { role: 'user', text: userTranscript }];
              }
            });
          }

          // 3. Extract binary audio packets (ignore part.text to hide internal thinking/reasoning steps)
          if (data.serverContent?.modelTurn?.parts) {
            const parts = data.serverContent.modelTurn.parts;
            setIsSpeaking(true);

            for (const part of parts) {
              if (part.inlineData && part.inlineData.mimeType.startsWith('audio/pcm')) {
                playAudioPacket(part.inlineData.data);
              }
            }
          }

          if (data.serverContent?.turnComplete) {
            setIsSpeaking(false);
          }
        }
      };

      ws.onerror = (err) => {
        console.error('WebSocket client error:', err);
        setError('Real-time connection error occurred.');
        stopAudioStreaming();
      };

      ws.onclose = () => {
        // Only transition to DISCONNECTED if not already COMPLETED by server message
        setConnectionStatus(prev => prev === 'COMPLETED' ? prev : 'DISCONNECTED');
      };

    } catch (err) {
      console.error('Failed to launch real-time mock session:', err);
      setError('Failed to initiate microphone or audio components. Please check site permissions.');
      setConnectionStatus('DISCONNECTED');
    }
  };

  const playAudioPacket = (base64Data) => {
    if (!playbackCtxRef.current) return;
    const playCtx = playbackCtxRef.current;

    const binaryString = window.atob(base64Data);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const int16Buffer = new Int16Array(bytes.buffer);
    const float32Buffer = new Float32Array(int16Buffer.length);
    for (let i = 0; i < int16Buffer.length; i++) {
      float32Buffer[i] = int16Buffer[i] / 32768.0;
    }

    // Gemini Live API outputs audio at 24000Hz — use the dedicated playback AudioContext
    const audioBuffer = playCtx.createBuffer(1, float32Buffer.length, 24000);
    audioBuffer.getChannelData(0).set(float32Buffer);

    const source = playCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(playCtx.destination);

    const now = playCtx.currentTime;
    if (nextStartTimeRef.current < now) {
      nextStartTimeRef.current = now;
    }
    source.start(nextStartTimeRef.current);
    nextStartTimeRef.current += audioBuffer.duration;
  };

  const handleSendCodeText = (e) => {
    e.preventDefault();
    if (!codeOrDesignInput.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    // Send code to WS endpoint
    wsRef.current.send(JSON.stringify({ codeAnswer: codeOrDesignInput.trim() }));
    setTranscript(prev => [...prev, { role: 'user', text: "[Coding/Design response submitted: See text box]" }]);
    setCodeOrDesignInput('');
  };

  const stopAudioStreaming = async () => {
    if (scriptNodeRef.current) {
      scriptNodeRef.current.disconnect();
      scriptNodeRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(track => track.stop());
      micStreamRef.current = null;
    }
    if (wsRef.current) {
      if (wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
      wsRef.current = null;
    }
    // Close mic capture AudioContext (16kHz)
    if (audioCtxRef.current) {
      if (audioCtxRef.current.state !== 'closed') {
        await audioCtxRef.current.close().catch(err => console.error('Error closing mic AudioContext:', err));
      }
      audioCtxRef.current = null;
    }
    // Close playback AudioContext (24kHz)
    if (playbackCtxRef.current) {
      if (playbackCtxRef.current.state !== 'closed') {
        await playbackCtxRef.current.close().catch(err => console.error('Error closing playback AudioContext:', err));
      }
      playbackCtxRef.current = null;
    }
  };

  const resetInterviewPanel = () => {
    stopAudioStreaming();
    setActiveSessionId(null);
    setSelectedSessionDetails(null);
    setConnectionStatus('DISCONNECTED');
    setTranscript([]);
    setError('');
    setActiveTab('new');
  };

  if (validatingProfile) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 flex flex-col justify-center items-center">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-650 dark:text-indigo-400 mb-4" />
        <p className="text-zinc-500 dark:text-zinc-400 text-xs">Verifying profile configuration...</p>
      </div>
    );
  }

  const showSubjectSelection = interviewType === 'SUBJECT' || interviewType === 'HR_TECHNICAL';

  return (
    <div className="min-h-screen bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 relative overflow-hidden flex flex-col transition-colors duration-300">
      {!activeSessionId && !selectedSessionDetails && <Navbar variant="app" />}
      <div className={`max-w-4xl mx-auto w-full z-10 relative flex-grow flex flex-col ${(!activeSessionId && !selectedSessionDetails) ? 'pt-28 px-6 pb-12' : 'p-6'}`}>

        {/* Header */}
        <header className="flex items-center justify-between mb-8 border-b border-zinc-200 dark:border-zinc-900 pb-5 shrink-0">
          <div className="flex items-center space-x-4">
            <button
              onClick={resetInterviewPanel}
              className="p-2.5 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-xl transition text-zinc-550 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-extrabold text-zinc-950 dark:text-white flex items-center">
                <Brain className="w-5 h-5 text-indigo-655 dark:text-indigo-400 mr-2 shrink-0" />
                AI Audio Mock Interviews
              </h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Simulate HR & technical rounds verbally with real-time audio.
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
        {!activeSessionId && !selectedSessionDetails && (
          <div className="space-y-6 shrink-0">
            <div className="flex border-b border-zinc-200 dark:border-zinc-900 space-x-6">
              <button
                onClick={() => setActiveTab('new')}
                className={`flex items-center space-x-2 pb-4 border-b-2 font-bold text-xs transition cursor-pointer ${activeTab === 'new'
                  ? 'border-zinc-950 dark:border-white text-zinc-950 dark:text-white'
                  : 'border-transparent text-zinc-450 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                  }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Configure New Interview</span>
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`flex items-center space-x-2 pb-4 border-b-2 font-bold text-xs transition cursor-pointer ${activeTab === 'history'
                  ? 'border-zinc-950 dark:border-white text-zinc-950 dark:text-white'
                  : 'border-transparent text-zinc-450 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                  }`}
              >
                <History className="w-4 h-4" />
                <span>Interview Scorecards</span>
              </button>
            </div>

            {activeTab === 'new' ? (
              <div className="space-y-6">
                {!hasApiKey && (
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs leading-relaxed flex items-start space-x-2">
                    <Info className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <strong>Custom Gemini Key Missing:</strong> You must configure a personal Gemini API Key in your profile settings to access real-time audio mock interviews.
                      <button
                        onClick={() => navigate('/profile')}
                        className="block mt-2 font-bold underline cursor-pointer hover:text-amber-500"
                      >
                        Navigate to Profile settings &rarr;
                      </button>
                    </div>
                  </div>
                )}

                <form onSubmit={handleStartInterview} className="bg-zinc-50 dark:bg-[#0d0d11] border border-zinc-200 dark:border-zinc-900 rounded-xl p-8 space-y-6 max-w-xl mx-auto shadow-sm">
                  <div>
                    <label className="block text-xs font-bold text-zinc-650 dark:text-zinc-400 mb-1.5">Interview Round Type</label>
                    <select
                      value={interviewType}
                      onChange={(e) => setInterviewType(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500 text-xs text-zinc-900 dark:text-zinc-100 cursor-pointer"
                    >
                      <option value="SUBJECT">Subject Wise Mock Interview</option>
                      <option value="HR">HR Interview</option>
                      <option value="RESUME">Resume Based Interview</option>
                      <option value="HR_RESUME">HR + Resume Based Interview</option>
                      <option value="HR_TECHNICAL">HR + Technical Interview</option>
                    </select>
                  </div>

                  {showSubjectSelection && (
                    <div className="animate-fadeIn">
                      <label className="block text-xs font-bold text-zinc-655 dark:text-zinc-450 mb-1.5 flex items-center">
                        <Settings2 className="w-3.5 h-3.5 mr-1" /> Select Target Subject
                      </label>
                      <select
                        value={selectedSubjectId}
                        onChange={(e) => setSelectedSubjectId(e.target.value)}
                        className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500 text-xs text-zinc-900 dark:text-zinc-100 cursor-pointer"
                      >
                        {subjects.map(sub => (
                          <option key={sub.id} value={sub.id}>{sub.title} ({sub.code})</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {(interviewType === 'RESUME' || interviewType === 'HR_RESUME') && (
                    <div className={`p-3.5 rounded-xl border text-[11px] leading-relaxed flex items-start space-x-2 ${resumeUploaded ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400'}`}>
                      <Info className="w-4 h-4 shrink-0 mt-0.5" />
                      <div>
                        {resumeUploaded ? (
                          <>
                            <strong>Resume Verified:</strong> We will construct questions based on your uploaded PDF resume.
                          </>
                        ) : (
                          <>
                            <strong>No Resume Configured:</strong> Please upload your resume first.
                            <button
                              type="button"
                              onClick={() => navigate('/profile')}
                              className="block mt-1 font-bold underline cursor-pointer hover:text-red-500"
                            >
                              Upload Resume PDF &rarr;
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={!hasApiKey || ((interviewType === 'RESUME' || interviewType === 'HR_RESUME') && !resumeUploaded)}
                    className="w-full py-3 bg-zinc-950 dark:bg-white hover:bg-zinc-850 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 font-bold rounded-xl transition cursor-pointer text-xs flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Start Real-Time Audio Interview
                  </button>
                </form>
              </div>
            ) : (
              /* Historical scorecards lists */
              <div className="space-y-3">
                {sessions.length === 0 ? (
                  <div className="text-center py-12 bg-zinc-50 dark:bg-zinc-950/20 border border-zinc-200 dark:border-zinc-850 border-dashed rounded-2xl text-zinc-500">
                    <Brain className="w-8 h-8 mx-auto mb-3 text-zinc-400 dark:text-zinc-650" />
                    <p className="text-xs">No mock interview evaluations recorded yet.</p>
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
                          <h4 className="font-bold text-zinc-900 dark:text-zinc-250 text-xs">
                            {session.interviewType.replace('_', ' + ')} Mock Round
                          </h4>
                          <p className="text-[10px] text-zinc-550 dark:text-zinc-455 mt-1">
                            Date: {new Date(session.createdAt).toLocaleDateString()} | Scores: Tech {session.technicalScore}/10, Comm {session.communicationScore}/10
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedSessionDetails(session)}
                        className="bg-zinc-150 dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-750 dark:text-zinc-300 px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer"
                      >
                        Open Scorecard
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* ACTIVE MOCK INTERVIEW CHAT BOARD */}
        {activeSessionId && (
          <div className="flex-grow flex flex-col md:flex-row gap-6 min-h-[500px]">
            {/* Left Column: Conversational Stream & Transcription */}
            <div className="flex-grow flex flex-col bg-zinc-50 dark:bg-[#0d0d11] border border-zinc-200 dark:border-zinc-900 rounded-2xl overflow-hidden shadow-sm relative">
              <div className="px-6 py-4 bg-zinc-100/60 dark:bg-zinc-900/60 border-b border-zinc-200 dark:border-zinc-900 flex justify-between items-center shrink-0">
                <div>
                  <h3 className="font-bold text-zinc-900 dark:text-zinc-200 text-xs">
                    Interviewer AI (Gemini Live Stream)
                  </h3>
                  <p className="text-[9px] text-zinc-550 dark:text-zinc-455 mt-0.5">Round: {interviewType.replace('_', ' + ')}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${connectionStatus === 'ACTIVE' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">{connectionStatus}</span>
                </div>
              </div>

              {/* Message list window */}
              <div className="flex-grow p-6 overflow-y-auto space-y-4 min-h-[300px] bg-white dark:bg-zinc-950/20">
                {transcript.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-zinc-400">
                    <Loader2 className="w-8 h-8 animate-spin text-zinc-400 mb-2" />
                    <p className="text-[10px]">Interviewer is warming up...</p>
                  </div>
                ) : (
                  transcript.map((msg, index) => {
                    const isAssistant = msg.role === 'assistant';
                    return (
                      <div
                        key={index}
                        className={`flex ${isAssistant ? 'justify-start' : 'justify-end'} animate-fadeIn`}
                      >
                        <div className={`flex items-start space-x-2.5 max-w-[80%] ${isAssistant ? 'flex-row' : 'flex-row-reverse space-x-reverse'}`}>
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isAssistant ? 'bg-zinc-150 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-zinc-250 dark:border-zinc-800' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-750'
                            }`}>
                            {isAssistant ? <Brain className="w-4 h-4" /> : <UserIcon className="w-4 h-4" />}
                          </div>
                          <div className={`p-4 rounded-xl text-xs leading-relaxed font-medium ${isAssistant
                            ? 'bg-zinc-100/80 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-900 text-zinc-800 dark:text-zinc-250 rounded-tl-none'
                            : 'bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 rounded-tr-none'
                            }`}>
                            <p className="whitespace-pre-wrap">{msg.text}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Speaking Visualizer Wave */}
              <div className="px-6 py-3 bg-zinc-100 dark:bg-zinc-950/20 border-t border-zinc-200 dark:border-zinc-900 flex items-center justify-between shrink-0">
                <div className="flex items-center space-x-2">
                  <span className="relative flex h-2 w-2">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isSpeaking ? 'bg-indigo-500' : 'bg-emerald-500'}`}></span>
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${isSpeaking ? 'bg-indigo-600' : 'bg-emerald-500'}`}></span>
                  </span>
                  <span className="text-[10px] text-zinc-550 dark:text-zinc-400 font-bold uppercase tracking-wider">
                    {isSpeaking ? 'Interviewer is speaking...' : 'Speak Now — AI is Listening'}
                  </span>
                </div>
                {isSpeaking ? (
                  <div className="flex items-end space-x-0.5 h-4">
                    <div className="w-0.5 bg-indigo-500 rounded animate-soundWave h-3" />
                    <div className="w-0.5 bg-indigo-500 rounded animate-soundWave h-1 [animation-delay:0.2s]" />
                    <div className="w-0.5 bg-indigo-500 rounded animate-soundWave h-2 [animation-delay:0.4s]" />
                  </div>
                ) : (
                  <div className="flex items-end space-x-0.5 h-4">
                    <div className="w-0.5 bg-emerald-500 rounded h-1" />
                    <div className="w-0.5 bg-emerald-500 rounded h-1" />
                    <div className="w-0.5 bg-emerald-500 rounded h-1" />
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Code/Design response editor */}
            <div className="w-full md:w-80 flex flex-col bg-zinc-50 dark:bg-[#0d0d11] border border-zinc-200 dark:border-zinc-900 rounded-2xl p-5 shadow-sm shrink-0">
              <h3 className="font-bold text-zinc-900 dark:text-zinc-200 text-xs mb-1 flex items-center">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600 mr-1.5" /> Code & Design Canvas
              </h3>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mb-4 leading-relaxed">
                If the interviewer requests code syntax or architectural design layout, input your response here to feed it directly as a text frame.
              </p>
              <form onSubmit={handleSendCodeText} className="flex-grow flex flex-col gap-3">
                <textarea
                  value={codeOrDesignInput}
                  onChange={(e) => setCodeOrDesignInput(e.target.value)}
                  placeholder="Paste code or sketch design configurations here..."
                  className="w-full flex-grow min-h-[200px] bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 focus:outline-none focus:border-indigo-500 text-xs font-mono resize-none leading-relaxed text-zinc-900 dark:text-zinc-100"
                />
                <button
                  type="submit"
                  disabled={!codeOrDesignInput.trim()}
                  className="w-full py-2.5 bg-zinc-950 dark:bg-white hover:bg-zinc-850 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 text-xs font-bold rounded-xl transition cursor-pointer flex justify-center items-center shadow-sm disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5 mr-1.5" /> Submit Solution
                </button>
              </form>
            </div>
          </div>
        )}

        {/* COMPLETED SCORECARD DETAIL VIEW */}
        {selectedSessionDetails && (
          <div className="bg-zinc-50 dark:bg-[#0d0d11] border border-zinc-200 dark:border-zinc-900 rounded-xl p-8 max-w-2xl mx-auto shadow-sm space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center border-b border-zinc-200 dark:border-zinc-800 pb-4">
              <div>
                <h3 className="font-extrabold text-zinc-900 dark:text-white text-base">
                  {selectedSessionDetails.interviewType.replace('_', ' + ')} Mock Scorecard
                </h3>
                <p className="text-[10px] text-zinc-550 dark:text-zinc-400 mt-0.5">
                  Date Evaluated: {new Date(selectedSessionDetails.createdAt).toLocaleString()}
                </p>
              </div>
              <Award className="w-8 h-8 text-indigo-600 dark:text-indigo-400 shrink-0" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-900 rounded-xl text-center">
                <span className="text-[10px] text-zinc-550 dark:text-zinc-400 block font-bold uppercase tracking-wider">Technical Score</span>
                <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400 mt-1 block">{selectedSessionDetails.technicalScore}/10</span>
              </div>
              <div className="p-4 bg-white dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-900 rounded-xl text-center">
                <span className="text-[10px] text-zinc-550 dark:text-zinc-400 block font-bold uppercase tracking-wider">Communication Score</span>
                <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400 mt-1 block">{selectedSessionDetails.communicationScore}/10</span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-250 uppercase tracking-wider mb-2 flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2" /> Key Strengths
                </h4>
                <div className="bg-white dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-900 rounded-xl p-4 text-xs text-zinc-705 dark:text-zinc-300 whitespace-pre-line leading-relaxed font-medium">
                  {selectedSessionDetails.keyStrengths}
                </div>
              </div>
              <div>
                <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-250 uppercase tracking-wider mb-2 flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-2" /> Critical Gaps
                </h4>
                <div className="bg-white dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-900 rounded-xl p-4 text-xs text-zinc-705 dark:text-zinc-300 whitespace-pre-line leading-relaxed font-medium">
                  {selectedSessionDetails.criticalGaps}
                </div>
              </div>
            </div>

            <button
              onClick={resetInterviewPanel}
              className="w-full py-2.5 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 font-bold rounded-xl transition text-xs"
            >
              Back to Interview List
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MockInterview;