import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  ArrowLeft, ArrowRight, BookOpen, Award, Sparkles,
  Menu, X, Sun, Moon, HelpCircle, ChevronRight, ChevronDown,
  Search, List, Terminal, Database, Cpu, Globe, GitFork, Code, Loader2,
  Plus, Edit3, Trash2, Layers
} from 'lucide-react';
import API from '../../services/api';

const iconMap = {
  Cpu,
  Database,
  Globe,
  GitFork,
  Code,
  List,
  Terminal,
  BookOpen
};

const getSubjectColor = (slug) => {
  const colors = {
    "operating-systems": "text-pink-500 dark:text-pink-400",
    "database-management-systems": "text-purple-500 dark:text-purple-400",
    "computer-networks": "text-emerald-500 dark:text-emerald-400",
    "object-oriented-programming": "text-amber-500 dark:text-amber-400",
    "data-structures-and-algorithms": "text-blue-500 dark:text-blue-400"
  };
  return colors[slug] || "text-indigo-500 dark:text-indigo-400";
};

// SVG Concept Diagram Component
const TopicDiagram = ({ slug }) => {
  if (slug === 'os-arch') {
    return (
      <div className="my-8 flex justify-center bg-zinc-50 dark:bg-zinc-950/30 border border-zinc-200 dark:border-zinc-900 rounded-2xl p-6">
        <svg viewBox="0 0 500 150" className="w-full max-w-md h-auto">
          {/* Apps Box */}
          <rect x="20" y="40" width="100" height="70" rx="12" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-zinc-400 dark:text-zinc-600" />
          <text x="70" y="80" textAnchor="middle" className="fill-zinc-800 dark:fill-zinc-200 font-extrabold text-sm">Apps</text>

          {/* Arrows */}
          <path d="M 130 65 L 170 65" stroke="currentColor" strokeWidth="2" fill="none" markerEnd="url(#arrow)" className="text-zinc-400 dark:text-zinc-600" />
          <path d="M 170 85 L 130 85" stroke="currentColor" strokeWidth="2" fill="none" markerEnd="url(#arrow)" className="text-zinc-400 dark:text-zinc-600" />

          {/* OS Box */}
          <rect x="180" y="30" width="140" height="90" rx="16" fill="none" stroke="currentColor" strokeWidth="3" className="text-indigo-600 dark:text-indigo-400" />
          <text x="250" y="80" textAnchor="middle" className="fill-zinc-900 dark:fill-white font-black text-base">OS</text>

          {/* Arrows */}
          <path d="M 330 65 L 370 65" stroke="currentColor" strokeWidth="2" fill="none" markerEnd="url(#arrow)" className="text-zinc-400 dark:text-zinc-600" />
          <path d="M 370 85 L 330 85" stroke="currentColor" strokeWidth="2" fill="none" markerEnd="url(#arrow)" className="text-zinc-400 dark:text-zinc-600" />

          {/* Resources Box */}
          <rect x="380" y="40" width="100" height="70" rx="12" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-zinc-400 dark:text-zinc-600" />
          <text x="430" y="80" textAnchor="middle" className="fill-zinc-800 dark:fill-zinc-200 font-extrabold text-sm">Resources</text>

          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" className="text-zinc-400 dark:text-zinc-600" />
            </marker>
          </defs>
        </svg>
      </div>
    );
  }

  if (slug === 'process-states') {
    return (
      <div className="my-8 flex justify-center bg-zinc-50 dark:bg-zinc-950/30 border border-zinc-200 dark:border-zinc-900 rounded-2xl p-6">
        <svg viewBox="0 0 540 180" className="w-full max-w-lg h-auto">
          {/* States */}
          <circle cx="50" cy="90" r="30" fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-400 dark:text-zinc-600" />
          <text x="50" y="94" textAnchor="middle" className="fill-zinc-700 dark:fill-zinc-300 font-bold text-xs">New</text>

          <circle cx="180" cy="90" r="35" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-indigo-600 dark:text-indigo-400" />
          <text x="180" y="94" textAnchor="middle" className="fill-zinc-900 dark:fill-white font-extrabold text-xs">Ready</text>

          <circle cx="340" cy="90" r="35" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-indigo-600 dark:text-indigo-400" />
          <text x="340" y="94" textAnchor="middle" className="fill-zinc-900 dark:fill-white font-extrabold text-xs">Running</text>

          <circle cx="490" cy="90" r="30" fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-400 dark:text-zinc-600" />
          <text x="490" y="94" textAnchor="middle" className="fill-zinc-700 dark:fill-zinc-300 font-bold text-xs">Term</text>

          <rect x="210" y="135" width="120" height="36" rx="8" fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-400 dark:text-zinc-600" />
          <text x="270" y="157" textAnchor="middle" className="fill-zinc-700 dark:fill-zinc-300 font-bold text-xs">Waiting / I/O</text>

          {/* Connecting Arrows */}
          <path d="M 80 90 L 140 90" stroke="currentColor" strokeWidth="1.5" fill="none" markerEnd="url(#arrow)" className="text-zinc-400 dark:text-zinc-600" />
          <path d="M 215 80 L 300 80" stroke="currentColor" strokeWidth="1.5" fill="none" markerEnd="url(#arrow)" className="text-zinc-400 dark:text-zinc-600" />
          <path d="M 305 100 L 220 100" stroke="currentColor" strokeWidth="1.5" fill="none" markerEnd="url(#arrow)" className="text-zinc-400 dark:text-zinc-600" />
          <path d="M 375 90 L 455 90" stroke="currentColor" strokeWidth="1.5" fill="none" markerEnd="url(#arrow)" className="text-zinc-400 dark:text-zinc-600" />

          {/* Waiting Paths */}
          <path d="M 340 125 L 340 153 L 330 153" stroke="currentColor" strokeWidth="1.5" fill="none" markerEnd="url(#arrow)" className="text-zinc-400 dark:text-zinc-600" />
          <path d="M 210 153 L 180 153 L 180 125" stroke="currentColor" strokeWidth="1.5" fill="none" markerEnd="url(#arrow)" className="text-zinc-400 dark:text-zinc-600" />
        </svg>
      </div>
    );
  }

  if (slug === 'critical-section') {
    return (
      <div className="my-8 flex justify-center bg-zinc-50 dark:bg-zinc-950/30 border border-zinc-200 dark:border-zinc-900 rounded-2xl p-6">
        <svg viewBox="0 0 400 160" className="w-full max-w-sm h-auto">
          {/* Processes */}
          <rect x="10" y="60" width="70" height="40" rx="8" fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-400" />
          <text x="45" y="84" textAnchor="middle" className="fill-zinc-700 dark:fill-zinc-300 font-bold text-xs">Process 1</text>

          <rect x="320" y="60" width="70" height="40" rx="8" fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-400" />
          <text x="355" y="84" textAnchor="middle" className="fill-zinc-700 dark:fill-zinc-300 font-bold text-xs">Process 2</text>

          {/* Critical Section Gateway */}
          <rect x="130" y="30" width="140" height="100" rx="12" fill="none" stroke="currentColor" strokeWidth="3" className="text-red-500/80" />
          <text x="200" y="75" textAnchor="middle" className="fill-zinc-950 dark:fill-white font-black text-sm">Critical Section</text>
          <text x="200" y="95" textAnchor="middle" className="fill-red-500 dark:fill-red-400 font-bold text-[10px] uppercase">1 active max</text>

          <path d="M 80 80 L 122 80" stroke="currentColor" strokeWidth="1.5" fill="none" markerEnd="url(#arrow)" className="text-zinc-400" />
          <path d="M 320 80 L 278 80" stroke="currentColor" strokeWidth="1.5" fill="none" markerEnd="url(#arrow)" className="text-zinc-400" />
        </svg>
      </div>
    );
  }

  // Fallback return empty div
  return <div className="hidden" />;
};

const Resources = () => {
  const { subjectSlug, topicSlug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAdmin } = useAuth();

  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState({});

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') ||
      (document.documentElement.classList.contains('dark') ? 'dark' : 'light');
  });

  // Topic CRUD States
  const [topicModalOpen, setTopicModalOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null);
  const [topicTitle, setTopicTitle] = useState('');
  const [topicSlugState, setTopicSlugState] = useState('');
  const [topicContent, setTopicContent] = useState('');
  const [topicSortOrder, setTopicSortOrder] = useState(0);
  const [topicSubmitting, setTopicSubmitting] = useState(false);
  const [activeSubjectForTopic, setActiveSubjectForTopic] = useState(null);

  // Subject CRUD States
  const [subjectModalOpen, setSubjectModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [subjectTitle, setSubjectTitle] = useState('');
  const [subjectCode, setSubjectCode] = useState('');
  const [subjectSlugState, setSubjectSlugState] = useState('');
  const [subjectDescription, setSubjectDescription] = useState('');
  const [subjectIconName, setSubjectIconName] = useState('Cpu');
  const [subjectShowOnLanding, setSubjectShowOnLanding] = useState(true);
  const [subjectSubmitting, setSubjectSubmitting] = useState(false);

  const iconOptions = ['Cpu', 'Database', 'Globe', 'GitFork', 'Code', 'Layers', 'BookOpen'];

  const handleSubjectTitleChange = (val) => {
    setSubjectTitle(val);
    if (!editingSubject) {
      setSubjectSlugState(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    }
  };

  const handleOpenAddSubject = () => {
    setEditingSubject(null);
    setSubjectTitle('');
    setSubjectCode('');
    setSubjectSlugState('');
    setSubjectDescription('');
    setSubjectIconName('Cpu');
    setSubjectShowOnLanding(true);
    setSubjectModalOpen(true);
  };

  const handleOpenEditSubject = (subj) => {
    setEditingSubject(subj);
    setSubjectTitle(subj.title);
    setSubjectCode(subj.code);
    setSubjectSlugState(subj.slug);
    setSubjectDescription(subj.description || '');
    setSubjectIconName(subj.iconName || 'Cpu');
    setSubjectShowOnLanding(subj.showOnLandingPage);
    setSubjectModalOpen(true);
  };

  const handleSaveSubject = async (e) => {
    e.preventDefault();
    if (!subjectTitle.trim() || !subjectCode.trim() || !subjectSlugState.trim()) {
      alert('Subject title, code, and slug are required.');
      return;
    }

    try {
      setSubjectSubmitting(true);
      const payload = {
        title: subjectTitle.trim(),
        code: subjectCode.trim(),
        slug: subjectSlugState.trim(),
        description: subjectDescription.trim(),
        iconName: subjectIconName,
        showOnLandingPage: subjectShowOnLanding
      };

      if (editingSubject) {
        await API.put(`/api/admin/subjects/${editingSubject.id}`, payload);
      } else {
        await API.post('/api/admin/subjects', payload);
      }
      setSubjectModalOpen(false);
      
      const response = await API.get('/api/public/subjects');
      setSubjects(response.data || []);

      if (editingSubject && editingSubject.slug !== subjectSlugState.trim()) {
        navigate(`/resources/${subjectSlugState.trim()}`);
      }
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
      const response = await API.get('/api/public/subjects');
      const updatedSubjects = response.data || [];
      setSubjects(updatedSubjects);

      if (currentSubject && currentSubject.id === subjId) {
        navigate('/');
      }
    } catch (err) {
      alert('Failed to delete subject.');
    }
  };

  const handleTopicTitleChange = (val) => {
    setTopicTitle(val);
    if (!editingTopic) {
      setTopicSlugState(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    }
  };

  const handleOpenAddTopic = (subject) => {
    setEditingTopic(null);
    setTopicTitle('');
    setTopicSlugState('');
    setTopicContent('');
    setTopicSortOrder(subject.topics ? subject.topics.length * 10 : 0);
    setActiveSubjectForTopic(subject);
    setTopicModalOpen(true);
  };

  const handleOpenEditTopic = (topic, subject) => {
    setEditingTopic(topic);
    setTopicTitle(topic.title);
    setTopicSlugState(topic.slug);
    setTopicContent(topic.content || '');
    setTopicSortOrder(topic.sortOrder || 0);
    setActiveSubjectForTopic(subject);
    setTopicModalOpen(true);
  };

  const handleSaveTopic = async (e) => {
    e.preventDefault();
    if (!topicTitle.trim() || !topicSlugState.trim() || !topicContent.trim()) {
      alert('Title, slug, and content are required.');
      return;
    }

    try {
      setTopicSubmitting(true);
      const payload = {
        title: topicTitle.trim(),
        slug: topicSlugState.trim(),
        content: topicContent.trim(),
        sortOrder: topicSortOrder
      };

      let savedTopic;
      if (editingTopic) {
        const response = await API.put(`/api/admin/subjects/topics/${editingTopic.id}`, payload);
        savedTopic = response.data;
      } else {
        const response = await API.post(`/api/admin/subjects/${activeSubjectForTopic.id}/topics`, payload);
        savedTopic = response.data;
      }

      setTopicModalOpen(false);

      const response = await API.get('/api/public/subjects');
      const updatedSubjects = response.data || [];
      setSubjects(updatedSubjects);

      if (activeTopicData && (editingTopic?.id === activeTopicData.id || activeTopicData.slug === savedTopic.slug)) {
        setActiveTopicData(savedTopic);
      }

      if (!editingTopic) {
        navigate(`/resources/${activeSubjectForTopic.slug}/${savedTopic.slug}`);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save syllabus topic.');
    } finally {
      setTopicSubmitting(false);
    }
  };

  const handleDeleteTopic = async (topicId, subSlug) => {
    if (!window.confirm('Are you sure you want to permanently delete this chapter topic? All written theory content will be permanently lost.')) return;
    try {
      await API.delete(`/api/admin/subjects/topics/${topicId}`);
      
      const response = await API.get('/api/public/subjects');
      const updatedSubjects = response.data || [];
      setSubjects(updatedSubjects);

      if (activeTopicData && activeTopicData.id === topicId) {
        const updatedSub = updatedSubjects.find(s => s.slug === subSlug);
        if (updatedSub && updatedSub.topics && updatedSub.topics.length > 0) {
          navigate(`/resources/${subSlug}/${updatedSub.topics[0].slug}`);
        } else {
          navigate(`/`);
        }
      }
    } catch (err) {
      alert('Failed to delete topic.');
    }
  };

  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTopicData, setActiveTopicData] = useState(null);
  const [loadingTopic, setLoadingTopic] = useState(false);

  // Track active header scroll position to highlight table of contents
  const [activeAnchor, setActiveAnchor] = useState('');
  const contentObserver = useRef(null);

  // Fetch all subjects on mount
  useEffect(() => {
    const fetchAllSubjects = async () => {
      try {
        const response = await API.get('/api/public/subjects');
        setSubjects(response.data || []);
      } catch (err) {
        console.error("Failed to load subjects:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllSubjects();
  }, []);

  const currentSubject = subjects.find(s => s.slug === subjectSlug);

  // Fetch active topic content dynamically when slugs change
  useEffect(() => {
    if (!currentSubject) return;

    // Determine target topic slug
    const targetTopic = currentSubject.topics.find(t => t.slug === topicSlug) || currentSubject.topics[0];
    if (!targetTopic) {
      setActiveTopicData(null);
      return;
    }

    // If the topic in URL is different from the first one and no topicSlug was provided, navigate to it
    if (!topicSlug && targetTopic) {
      navigate(`/resources/${subjectSlug}/${targetTopic.slug}`, { replace: true });
      return;
    }

    const fetchTopicContent = async () => {
      try {
        setLoadingTopic(true);
        const response = await API.get(`/api/public/subjects/${currentSubject.slug}/topics/${targetTopic.slug}`);
        setActiveTopicData(response.data);
      } catch (err) {
        console.error("Failed to load topic content:", err);
      } finally {
        setLoadingTopic(false);
      }
    };

    fetchTopicContent();
  }, [subjectSlug, topicSlug, currentSubject, navigate]);

  // Auto-expand folder representing active subject
  useEffect(() => {
    if (subjectSlug) {
      setExpandedFolders(prev => ({ ...prev, [subjectSlug]: true }));
    }
  }, [subjectSlug]);

  // Handle theme modifications
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Auto-redirect if subjects list loaded and subjectSlug is invalid
  useEffect(() => {
    if (!loading && subjects.length > 0 && !currentSubject) {
      navigate('/');
    }
  }, [loading, subjects, currentSubject, navigate]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const toggleFolder = (slug) => {
    setExpandedFolders(prev => ({ ...prev, [slug]: !prev[slug] }));
  };

  const activeIdx = currentSubject && activeTopicData
    ? currentSubject.topics.findIndex(t => t.slug === activeTopicData.slug)
    : -1;

  const prevTopic = currentSubject && activeIdx > 0
    ? currentSubject.topics[activeIdx - 1]
    : null;

  const nextTopic = currentSubject && activeIdx !== -1 && activeIdx < currentSubject.topics.length - 1
    ? currentSubject.topics[activeIdx + 1]
    : null;

  // Parse headings on active page to generate Toc dynamically
  const headings = useMemo(() => {
    if (!activeTopicData || !activeTopicData.content) return [];
    const lines = activeTopicData.content.split('\n');
    const list = [];
    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith('### ')) {
        const text = trimmed.replace('### ', '');
        const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        list.push({ id, text, level: 3 });
      } else if (trimmed.startsWith('## ')) {
        const text = trimmed.replace('## ', '');
        const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        list.push({ id, text, level: 2 });
      }
    });
    return list;
  }, [activeTopicData]);

  // Track scroll position to update Right Toc highlights
  useEffect(() => {
    if (contentObserver.current) {
      contentObserver.current.disconnect();
    }

    contentObserver.current = new IntersectionObserver((entries) => {
      const visible = entries.find(e => e.isIntersecting);
      if (visible) {
        setActiveAnchor(visible.target.id);
      }
    }, { rootMargin: '-10% 0px -75% 0px' });

    headings.forEach(heading => {
      const el = document.getElementById(heading.id);
      if (el) contentObserver.current.observe(el);
    });

    return () => {
      if (contentObserver.current) contentObserver.current.disconnect();
    };
  }, [headings]);

  const handleTopicClick = (subjSlug, tSlug) => {
    setIsMobileNavOpen(false);
    navigate(`/resources/${subjSlug}/${tSlug}`);
  };

  const handleLaunchPractice = () => {
    if (currentSubject) {
      navigate(`/practice?topic=${currentSubject.code}`);
    }
  };

  const handleLaunchInterview = () => {
    if (currentSubject) {
      navigate(user ? `/mock-interview?topic=${encodeURIComponent(currentSubject.title)}` : '/login');
    }
  };

  const handleAnchorClick = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveAnchor(id);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#09090b] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!currentSubject) return null;

  // Content formatter supporting anchor IDs and custom diagram insertion
  const renderContent = (text) => {
    return text.split('\n\n').map((block, idx) => {
      const trimmedBlock = block.trim();
      if (!trimmedBlock) return null;

      // Custom Diagram tag check
      if (trimmedBlock.startsWith('[DIAGRAM: ') && trimmedBlock.endsWith(']')) {
        const dSlug = trimmedBlock.replace('[DIAGRAM: ', '').replace(']', '');
        return <TopicDiagram key={idx} slug={dSlug} />;
      }

      // Code blocks
      if (trimmedBlock.startsWith('```')) {
        const lines = trimmedBlock.split('\n');
        const code = lines.slice(1, lines.length - 1).join('\n');
        return (
          <pre key={idx} className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-xl p-5 overflow-x-auto text-xs font-mono text-zinc-800 dark:text-zinc-300 my-6 shadow-inner leading-relaxed">
            <code>{code}</code>
          </pre>
        );
      }

      // Headings with ID attachment
      if (trimmedBlock.startsWith('### ')) {
        const textVal = trimmedBlock.replace('### ', '');
        const idVal = textVal.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        return (
          <h3 id={idVal} key={idx} className="text-lg sm:text-xl font-bold text-zinc-950 dark:text-white mt-8 mb-4 tracking-tight scroll-mt-24">
            {textVal}
          </h3>
        );
      }
      if (trimmedBlock.startsWith('## ')) {
        const textVal = trimmedBlock.replace('## ', '');
        const idVal = textVal.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        return (
          <h2 id={idVal} key={idx} className="text-2xl sm:text-3xl font-extrabold text-zinc-950 dark:text-white mt-12 mb-5 tracking-tight border-b border-zinc-100 dark:border-zinc-900 pb-2.5 scroll-mt-24">
            {textVal}
          </h2>
        );
      }

      // Unordered lists
      if (trimmedBlock.startsWith('* ') || trimmedBlock.startsWith('- ')) {
        return (
          <ul key={idx} className="list-disc pl-6 space-y-2.5 text-zinc-600 dark:text-zinc-400 text-sm sm:text-base font-medium my-5">
            {trimmedBlock.split('\n').map((li, lIdx) => (
              <li key={lIdx}>
                {li.replace(/^[\*\-\s]+/, '').split('**').map((chunk, cIdx) =>
                  cIdx % 2 === 1 ? <strong key={cIdx} className="font-extrabold text-zinc-900 dark:text-white">{chunk}</strong> : chunk
                )}
              </li>
            ))}
          </ul>
        );
      }

      // Ordered lists
      if (/^\d+\.\s/.test(trimmedBlock)) {
        return (
          <ol key={idx} className="list-decimal pl-6 space-y-2.5 text-zinc-650 dark:text-zinc-400 text-sm sm:text-base font-medium my-5">
            {trimmedBlock.split('\n').map((li, lIdx) => (
              <li key={lIdx}>
                {li.replace(/^\d+\.[\s]+/, '').split('**').map((chunk, cIdx) =>
                  cIdx % 2 === 1 ? <strong key={cIdx} className="font-extrabold text-zinc-900 dark:text-white">{chunk}</strong> : chunk
                )}
              </li>
            ))}
          </ol>
        );
      }

      // Standard Paragraph with inline bolding
      return (
        <p key={idx} className="text-zinc-650 dark:text-zinc-405 text-sm sm:text-base leading-relaxed my-5 font-medium">
          {trimmedBlock.split('**').map((chunk, cIdx) =>
            cIdx % 2 === 1 ? <strong key={cIdx} className="font-extrabold text-zinc-900 dark:text-white">{chunk}</strong> : chunk
          )}
        </p>
      );
    });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 font-sans selection:bg-zinc-200 dark:selection:bg-zinc-800 transition-colors duration-300">

      {/* MOBILE HEADER BAR */}
      <header className="md:hidden fixed top-0 inset-x-0 h-16 bg-white/95 dark:bg-[#09090b]/95 border-b border-zinc-200 dark:border-zinc-900 z-50 flex items-center justify-between px-6 backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <button onClick={() => navigate('/')} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-full transition cursor-pointer">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="font-black text-sm tracking-tight">InterviewQuest</span>
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={toggleTheme} className="p-2 text-zinc-550 dark:text-zinc-400">
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button onClick={() => setIsMobileNavOpen(!isMobileNavOpen)} className="p-2 text-zinc-550 dark:text-zinc-400">
            {isMobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* THREE-COLUMN LAYOUT MAIN WRAPPER */}
      <div className="flex max-w-[1600px] mx-auto min-h-screen relative">

        {/* COLUMN 1: LEFT SIDEBAR (Width: 280px) */}
        <aside className={`
          w-[280px] shrink-0 border-r border-zinc-200 dark:border-zinc-900 bg-zinc-50/20 dark:bg-[#09090b]
          fixed md:sticky top-0 bottom-0 z-40 md:z-10 pt-20 md:pt-8 pb-8 px-6 flex flex-col justify-between
          transition-all duration-300 overflow-y-auto h-screen
          ${isMobileNavOpen ? 'left-0' : '-left-full md:left-0'}
        `}>
          <div className="space-y-6">

            {/* Brand Logo & Back to Home */}
            <div className="hidden md:flex items-center justify-between">
              <div onClick={() => navigate('/')} className="flex items-center space-x-2.5 cursor-pointer">
                <Terminal className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span className="font-black text-base tracking-tight text-zinc-950 dark:text-white">InterviewQuest</span>
              </div>
            </div>

            {/* Folder Combobox Selector */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 flex items-center justify-between shadow-sm">
              <div className="flex items-center space-x-2.5">
                <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="text-xs font-black text-zinc-800 dark:text-zinc-200">CS Fundamentals</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
            </div>

            {/* Search Box Trigger */}
            <button
              onClick={() => navigate('/')} // Redirects to home to use the main modal search
              className="w-full flex items-center justify-between bg-zinc-100 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-zinc-400 hover:border-zinc-350 dark:hover:border-zinc-700 transition cursor-pointer"
            >
              <div className="flex items-center space-x-2 text-xs">
                <Search className="w-3.5 h-3.5 text-zinc-400" />
                <span>Search...</span>
              </div>
              <kbd className="bg-zinc-200 dark:bg-zinc-800 px-1 py-0.5 rounded text-[8px] font-sans font-extrabold text-zinc-400">Ctrl K</kbd>
            </button>

            {/* Subject Accordions */}
            <div className="space-y-2 pt-4">
              {isAdmin && (
                <button
                  onClick={handleOpenAddSubject}
                  className="w-full flex items-center justify-center space-x-1.5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] rounded-lg transition shadow cursor-pointer border-none mb-3"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Subject Category</span>
                </button>
              )}

              {subjects.map((sub) => {
                const FolderIcon = iconMap[sub.iconName] || BookOpen;
                const isFolderExpanded = !!expandedFolders[sub.slug];
                const isActiveSubject = sub.slug === subjectSlug;

                return (
                  <div key={sub.slug} className="space-y-1">
                    {/* Header trigger */}
                    <div className="flex items-center justify-between group/folder">
                      <button
                        onClick={() => toggleFolder(sub.slug)}
                        className={`
                          flex-1 flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer
                          ${isActiveSubject
                            ? 'text-zinc-950 dark:text-white bg-zinc-100 dark:bg-zinc-900/60'
                            : 'text-zinc-650 dark:text-zinc-400 hover:bg-zinc-100/30 dark:hover:bg-zinc-900/20 hover:text-zinc-950 dark:hover:text-white'}
                        `}
                      >
                        <div className="flex items-center space-x-2.5">
                          <FolderIcon className={`w-4 h-4 ${isActiveSubject ? getSubjectColor(sub.slug) : 'text-zinc-400'}`} />
                          <span className="truncate max-w-[130px]">{sub.title}</span>
                        </div>
                        {isFolderExpanded ? (
                          <ChevronDown className="w-3.5 h-3.5 text-zinc-400 shrink-0 ml-1" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5 text-zinc-400 shrink-0 ml-1" />
                        )}
                      </button>

                      {/* Admin CRUD controls for Subject and adding Topics */}
                      {isAdmin && (
                        <div className="flex items-center space-x-1 ml-1 shrink-0 opacity-0 group-hover/folder:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleOpenAddTopic(sub)}
                            className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-400 hover:text-emerald-500 rounded-md transition cursor-pointer border-none bg-transparent"
                            title="Add Chapter Topic"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEditSubject(sub)}
                            className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-400 hover:text-indigo-500 rounded-md transition cursor-pointer border-none bg-transparent"
                            title="Edit Subject"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteSubject(sub.id)}
                            className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-400 hover:text-rose-500 rounded-md transition cursor-pointer border-none bg-transparent"
                            title="Delete Subject"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Nested Chapter Topics list */}
                    {isFolderExpanded && (
                      <div className="pl-6 border-l border-zinc-200 dark:border-zinc-800 space-y-1 py-1 ml-5">
                        {sub.topics && sub.topics.map((t, idx) => {
                          const isTopicSelected = (activeTopicData && t.slug === activeTopicData.slug) || (!activeTopicData && t.slug === topicSlug);
                          return (
                            <div key={t.id || idx} className="flex items-center justify-between group/topic">
                              <button
                                onClick={() => handleTopicClick(sub.slug, t.slug)}
                                className={`
                                  flex-1 text-left px-3 py-2 rounded-md text-[11px] font-semibold transition-all duration-150 cursor-pointer truncate
                                  ${isTopicSelected && isActiveSubject
                                    ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold border border-purple-500/20 shadow-sm'
                                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'}
                                `}
                              >
                                {t.title}
                              </button>

                              {isAdmin && (
                                <div className="flex items-center space-x-0.5 ml-1 shrink-0 opacity-0 group-hover/topic:opacity-100 transition-opacity">
                                  <button
                                    onClick={() => handleOpenEditTopic(t, sub)}
                                    className="p-1 text-zinc-400 hover:text-indigo-500 rounded-md transition cursor-pointer border-none bg-transparent"
                                    title="Edit Chapter Topic"
                                  >
                                    <Edit3 className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteTopic(t.id, sub.slug)}
                                    className="p-1 text-zinc-400 hover:text-rose-500 rounded-md transition cursor-pointer border-none bg-transparent"
                                    title="Delete Chapter Topic"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              )}
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

          {/* Sidebar Footer theme toggle */}
          <div className="pt-6 border-t border-zinc-200 dark:border-zinc-900 flex items-center justify-between">
            <button
              onClick={toggleTheme}
              className="p-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-950 dark:hover:text-white transition cursor-pointer text-zinc-500"
              title="Change Theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <span className="text-[10px] text-zinc-400 dark:text-zinc-600 font-bold tracking-widest uppercase">v1.1.0</span>
          </div>
        </aside>

        {/* COLUMN 2: MIDDLE COLUMN (Main study content area) */}
        <main className="flex-1 px-6 sm:px-12 md:px-16 pt-24 md:pt-12 pb-20 overflow-y-auto max-w-4xl">

          {/* Subject indicator & content details */}
          {loadingTopic || !activeTopicData ? (
            <div className="animate-pulse space-y-6 pt-8">
              <div className="h-4 w-1/4 bg-zinc-200 dark:bg-zinc-800 rounded" />
              <div className="h-10 w-3/4 bg-zinc-200 dark:bg-zinc-800 rounded mt-3" />
              <div className="h-20 w-full bg-zinc-100 dark:bg-zinc-900 rounded-xl mt-6 border border-zinc-200 dark:border-zinc-800" />
              <div className="space-y-3 pt-6">
                <div className="h-4 w-full bg-zinc-200 dark:bg-zinc-800 rounded" />
                <div className="h-4 w-full bg-zinc-200 dark:bg-zinc-800 rounded" />
                <div className="h-4 w-5/6 bg-zinc-200 dark:bg-zinc-800 rounded" />
              </div>
            </div>
          ) : (
            <>
              {/* Subject indicator & header buttons */}
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-900 pb-3 mb-6">
                <span className="text-xs font-black uppercase tracking-widest text-purple-600 dark:text-purple-400 animate-fadeIn">
                  {currentSubject.title}
                </span>
                {isAdmin && (
                  <button
                    onClick={() => handleOpenEditTopic(activeTopicData, currentSubject)}
                    className="flex items-center space-x-1.5 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold text-xs px-3 py-1.5 rounded-lg transition border border-zinc-200 dark:border-zinc-800 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Topic Content</span>
                  </button>
                )}
              </div>

              {/* Main heading */}
              <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-950 dark:text-white mt-3 mb-6 tracking-tight leading-[1.15] animate-fadeIn">
                Understanding {activeTopicData.title}: The Core Foundations
              </h1>

              {/* Subtitle intro callout */}
              <p className="text-zinc-500 dark:text-zinc-400 text-base sm:text-lg leading-relaxed font-semibold mb-10 border-l-2 border-zinc-200 dark:border-zinc-800 pl-4 py-1 animate-fadeIn">
                Dive deep into {activeTopicData.title.toLowerCase()} theory. Explore conceptual design structures, resource mapping definitions, and operations mechanics.
              </p>

              {/* Article layout */}
              <article className="prose dark:prose-invert max-w-none text-zinc-800 dark:text-zinc-300 animate-fadeIn">
                {renderContent(activeTopicData.content)}
              </article>

              {/* Sequential lesson navigators */}
              <div className="flex justify-between items-center border-t border-zinc-200 dark:border-zinc-900 pt-8 mt-16 gap-4 animate-fadeIn">
                {prevTopic ? (
                  <button
                    onClick={() => handleTopicClick(subjectSlug, prevTopic.slug)}
                    className="flex items-center space-x-2.5 text-left bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 px-5 py-3.5 rounded-xl text-xs font-bold transition duration-200 cursor-pointer text-zinc-700 dark:text-zinc-300"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 text-zinc-400" />
                    <div>
                      <p className="text-[9px] uppercase tracking-wider text-zinc-400">Previous</p>
                      <p className="line-clamp-1">{prevTopic.title}</p>
                    </div>
                  </button>
                ) : (
                  <div className="w-10" />
                )}

                {nextTopic ? (
                  <button
                    onClick={() => handleTopicClick(subjectSlug, nextTopic.slug)}
                    className="flex items-center space-x-2.5 text-right bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 px-5 py-3.5 rounded-xl text-xs font-bold transition duration-200 cursor-pointer text-zinc-700 dark:text-zinc-300"
                  >
                    <div>
                      <p className="text-[9px] uppercase tracking-wider text-zinc-400">Next Up</p>
                      <p className="line-clamp-1">{nextTopic.title}</p>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
                  </button>
                ) : (
                  <button
                    onClick={handleLaunchPractice}
                    className="flex items-center space-x-2.5 bg-zinc-950 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-900 dark:hover:bg-zinc-200 px-6 py-3.5 rounded-xl text-xs font-bold transition duration-200 cursor-pointer"
                  >
                    <span>Complete Subject & Practice</span>
                    <Award className="w-4 h-4" />
                  </button>
                )}
              </div>
            </>
          )}
        </main>

        {/* COLUMN 3: RIGHT SIDEBAR ("On this page" outline - desktop only) */}
        <aside className="hidden lg:block w-[240px] shrink-0 pt-16 px-6 h-screen sticky top-0 overflow-y-auto">
          <div className="space-y-6 sticky top-16">

            {/* Header outlines label */}
            <div className="flex items-center space-x-2 text-zinc-400 dark:text-zinc-500 border-b border-zinc-100 dark:border-zinc-900/60 pb-3">
              <List className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-wider">On this page</span>
            </div>

            {/* Anchor navigation items */}
            {headings.length > 0 ? (
              <nav className="space-y-3 flex flex-col">
                {headings.map((heading, idx) => {
                  const isActive = heading.id === activeAnchor;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleAnchorClick(heading.id)}
                      className={`
                        text-left text-xs transition duration-150 cursor-pointer w-full
                        ${heading.level === 3 ? 'pl-3 border-l border-zinc-100 dark:border-zinc-900/60' : ''}
                        ${isActive
                          ? 'text-purple-600 dark:text-purple-400 font-extrabold'
                          : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-950 dark:hover:text-zinc-200 font-semibold'}
                      `}
                    >
                      {heading.text}
                    </button>
                  );
                })}
              </nav>
            ) : (
              <p className="text-xs text-zinc-400 dark:text-zinc-600 italic font-semibold">Overview information only</p>
            )}

            {/* Quick action card panel */}
            <div className="pt-6 mt-6 border-t border-zinc-100 dark:border-zinc-900/60 space-y-3">
              <button
                onClick={handleLaunchPractice}
                className="w-full flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-800 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800/80 p-3 rounded-xl transition duration-150 cursor-pointer shadow-sm"
              >
                <div className="flex items-center space-x-2">
                  <HelpCircle className="w-3.5 h-3.5 text-indigo-500" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Practice Quiz</span>
                </div>
                <ChevronRight className="w-3 h-3 text-zinc-400" />
              </button>

              <button
                onClick={handleLaunchInterview}
                className="w-full flex items-center justify-between bg-zinc-950 dark:bg-white hover:bg-zinc-850 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 p-3 rounded-xl transition duration-150 cursor-pointer"
              >
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400 dark:text-indigo-600" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Mock Interview</span>
                </div>
                <ChevronRight className="w-3 h-3 text-zinc-400 dark:text-zinc-600" />
              </button>
            </div>

          </div>
        </aside>

      </div>

      {/* SUBJECTS FORM MODAL */}
      {subjectModalOpen && (
        <div className="fixed inset-0 bg-zinc-955/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 relative shadow-2xl flex flex-col max-h-[90vh] text-zinc-900 dark:text-zinc-100 animate-scaleIn">
            <button
              onClick={() => setSubjectModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-zinc-450 hover:text-zinc-900 dark:hover:text-white rounded-lg transition cursor-pointer border-none bg-transparent"
            >
              <X className="w-4 h-4" />
            </button>

            <h2 className="text-lg font-black mb-4 flex items-center border-b border-zinc-100 dark:border-zinc-800 pb-3 shrink-0">
              <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mr-2" />
              {editingSubject ? 'Edit Subject Category' : 'Create New Subject'}
            </h2>

            <form onSubmit={handleSaveSubject} className="flex-grow flex flex-col overflow-hidden">
              <div className="flex-grow overflow-y-auto space-y-4 pr-2 pb-4 mb-4">
                
                {/* Title & Code */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-black text-zinc-500 mb-1.5 uppercase">Subject Title *</label>
                    <input
                      type="text"
                      value={subjectTitle}
                      onChange={(e) => handleSubjectTitleChange(e.target.value)}
                      placeholder="e.g. Operating Systems"
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-indigo-500 text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-zinc-500 mb-1.5 uppercase">Code *</label>
                    <input
                      type="text"
                      value={subjectCode}
                      onChange={(e) => setSubjectCode(e.target.value)}
                      placeholder="e.g. OS"
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-indigo-500 text-xs"
                      required
                    />
                  </div>
                </div>

                {/* Slug */}
                <div>
                  <label className="block text-[10px] font-black text-zinc-500 mb-1.5 uppercase">URL Slug (Generated) *</label>
                  <input
                    type="text"
                    value={subjectSlugState}
                    onChange={(e) => setSubjectSlugState(e.target.value)}
                    placeholder="e.g. operating-systems"
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-indigo-500 text-xs font-mono"
                    required
                  />
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

                {/* Icon Selection & Show on Landing Toggle */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-zinc-500 mb-1.5 uppercase">Lucide Icon</label>
                    <select
                      value={subjectIconName}
                      onChange={(e) => setSubjectIconName(e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-500 text-xs text-zinc-600 dark:text-zinc-300"
                    >
                      {iconOptions.map(icon => <option key={icon} value={icon}>{icon}</option>)}
                    </select>
                  </div>
                  <div className="flex items-center pt-5">
                    <label className="flex items-center cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={subjectShowOnLanding}
                        onChange={(e) => setSubjectShowOnLanding(e.target.checked)}
                        className="w-4 h-4 rounded border-zinc-300 dark:border-zinc-800 text-indigo-600 bg-zinc-100 dark:bg-zinc-905 focus:ring-indigo-500 cursor-pointer"
                      />
                      <span className="text-xs text-zinc-500 dark:text-zinc-400 font-bold ml-2">Show on Landing</span>
                    </label>
                  </div>
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

      {/* SYLLABUS TOPIC FORM MODAL */}
      {topicModalOpen && (
        <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 relative shadow-2xl flex flex-col max-h-[92vh] text-zinc-900 dark:text-zinc-100 animate-scaleIn">
            <button
              onClick={() => setTopicModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-zinc-450 hover:text-zinc-900 dark:hover:text-white rounded-lg transition cursor-pointer border-none bg-transparent"
            >
              <X className="w-4 h-4" />
            </button>

            <h2 className="text-lg font-black mb-4 flex items-center border-b border-zinc-100 dark:border-zinc-800 pb-3 shrink-0">
              <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mr-2" />
              {editingTopic ? 'Edit Syllabus Topic' : 'Add New Syllabus Topic'}
              <span className="ml-2 text-xs font-bold text-zinc-400">({activeSubjectForTopic?.title})</span>
            </h2>

            <form onSubmit={handleSaveTopic} className="flex-grow flex flex-col overflow-hidden">
              <div className="flex-grow overflow-y-auto space-y-4 pr-2 pb-4 mb-4">
                
                {/* Topic Title & Sort Order */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="col-span-3">
                    <label className="block text-[10px] font-black text-zinc-500 mb-1.5 uppercase">Topic Title *</label>
                    <input
                      type="text"
                      value={topicTitle}
                      onChange={(e) => handleTopicTitleChange(e.target.value)}
                      placeholder="e.g. Introduction to Thread Pools"
                      className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-indigo-500 text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-zinc-500 mb-1.5 uppercase">Sort Order *</label>
                    <input
                      type="number"
                      value={topicSortOrder}
                      onChange={(e) => setTopicSortOrder(parseInt(e.target.value) || 0)}
                      className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-indigo-500 text-xs"
                      required
                    />
                  </div>
                </div>

                {/* Slug */}
                <div>
                  <label className="block text-[10px] font-black text-zinc-500 mb-1.5 uppercase">URL Slug (Generated) *</label>
                  <input
                    type="text"
                    value={topicSlugState}
                    onChange={(e) => setTopicSlugState(e.target.value)}
                    placeholder="e.g. intro-to-thread-pools"
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-indigo-500 text-xs font-mono"
                    required
                  />
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col min-h-[300px]">
                  <label className="block text-[10px] font-black text-zinc-500 mb-1.5 uppercase">Lesson Content (Markdown & Diagrams) *</label>
                  <textarea
                    value={topicContent}
                    onChange={(e) => setTopicContent(e.target.value)}
                    placeholder="Write detailed computer science study concepts here using Markdown... Supports: #, ##, ###, *, - lists, ```code blocks```, and diagrams [DIAGRAM: os-arch]"
                    className="w-full flex-grow bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-indigo-500 text-xs font-mono resize-none leading-relaxed"
                    required
                  />
                </div>

              </div>

              {/* Form Actions */}
              <div className="flex space-x-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 shrink-0">
                <button
                  type="button"
                  onClick={() => setTopicModalOpen(false)}
                  className="w-1/2 py-2.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 text-xs font-bold rounded-xl transition cursor-pointer border-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={topicSubmitting}
                  className="w-1/2 py-2.5 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 text-xs font-bold rounded-xl transition cursor-pointer shadow-md flex justify-center items-center border-none"
                >
                  {topicSubmitting ? <Loader2 className="w-4 h-4 animate-spin text-zinc-800" /> : 'Save Topic'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Resources;
