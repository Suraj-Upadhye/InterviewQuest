import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  ArrowLeft, ArrowRight, BookOpen, Award, Sparkles,
  Menu, X, Sun, Moon, HelpCircle, ChevronLeft, ChevronRight, ChevronDown,
  Search, List, Terminal, Database, Cpu, Globe, GitFork, Code, Loader2,
  Plus, Edit3, Trash2, Layers
} from 'lucide-react';
import API from '../../services/api';
import RichTextEditor from '../../components/RichTextEditor';
import Navbar from '../../components/Navbar';

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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem('resourcesSidebarCollapsed') === 'true';
  });

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('resourcesSidebarCollapsed', String(next));
      return next;
    });
  };

  const { theme } = useTheme();

  // VS Code-style Inline Editor States
  const [inlineInputVal, setInlineInputVal] = useState('');
  const [addingSubject, setAddingSubject] = useState(false);
  const [addingChapterSubjectId, setAddingChapterSubjectId] = useState(null);
  const [addingTopicChapterKey, setAddingTopicChapterKey] = useState(null); // subjectSlug + '::' + chapterName

  const [editingSubjectId, setEditingSubjectId] = useState(null);
  const [editingChapterKey, setEditingChapterKey] = useState(null); // subjectSlug + '::' + chapterName
  const [editingTopicId, setEditingTopicId] = useState(null);

  // Content pane direct edit states
  const [isEditingContent, setIsEditingContent] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [editedTitle, setEditedTitle] = useState('');
  const editorRef = useRef(null);

  // AI Content Generator States
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiSubject, setAiSubject] = useState('');
  const [aiChapter, setAiChapter] = useState('');
  const [aiTopic, setAiTopic] = useState('');
  const [aiPromptText, setAiPromptText] = useState('');
  const [generatingAI, setGeneratingAI] = useState(false);

  // Generate dynamic prompt from template parameters
  useEffect(() => {
    if (!aiModalOpen) return;
    const template = `Create a highly detailed, comprehensive study resource for the topic "${aiTopic}" under the chapter "${aiChapter}" in the subject "${aiSubject}".

Please follow these strict instructions:
1. Explain the concepts in a simple manner and in simple language (simple, clear, and direct language). Break down complex terminology into plain English. The resource must be optimized to help university students prepare for technical job interviews. Include common interview questions and key callouts.
2. Format the response exclusively in clean, semantic HTML. Use only tags like <h2>, <h3>, <p>, <ul>, <ol>, <li>, <blockquote>, <table>, and <pre><code>.
3. Tables and Tabular Data: For all example datasets, comparison grids, inputs/outputs, database table structures, mock database values (such as Left Table and Right Table in Joins), you MUST use proper semantic HTML <table> tags including <thead>, <tbody>, <tr>, <th>, and <td>. Never display tabular/grid data as plain text, space-separated lists, or simple bullet points.
4. Do NOT use markdown syntax (do NOT use #, ##, **, * or single backticks). For example, use <strong>text</strong> instead of **text**, and <code>code</code> instead of \`code\`.
5. If relevant, generate one or more high-quality, visually engaging Mermaid diagrams to explain the concepts (you can generate multiple diagrams per topic, but do not force one if it is not educational or relevant). Use the following block structure:
   <pre><code class="language-mermaid">
   [diagram syntax here]
   </code></pre>
6. Choose the standard diagram type for this concept representation used worldwide:
   - For state transitions (like Process States or Transaction States) use State Diagrams (stateDiagram-v2).
   - For database structure (like schemas, tables, relationships) use ER Diagrams (erDiagram).
   - For step-by-step logic, flowcharts, or system processes use Flowcharts (flowchart TD or flowchart LR).
   - For communication over time (like TCP Handshake, client-server requests) use Sequence Diagrams (sequenceDiagram).
   - For OOP designs (like inheritance, design patterns, classes) use Class Diagrams (classDiagram).
   - For hierarchies or conceptual mapping use Mindmaps (mindmap).
   Make the diagrams colorful and visually appealing (using subgraphs, custom class definitions, colors, node styling, and themes where supported).
7. Strict Mermaid Syntax Rules to prevent ANY syntax errors:
   - ALL node labels containing spaces, parentheses, brackets, or special characters MUST be wrapped in double quotes (e.g. use A["Process Control Block (PCB)"] instead of A[Process Control Block (PCB)]).
   - Node IDs must be simple alphanumeric characters with no spaces or special symbols (e.g. A, B, C, Node1, Node2).
   - Ensure all arrows and connectors are valid (e.g. --> or -.->). Do NOT append an extra ">" after a label. Use "-->|label| B" or "-.->|label| B", NEVER "-->|label|> B" or "-.->|label|> B".
   - In stateDiagram-v2, do not use transition labels with special symbols unless the state names are clean. Better yet, write transition labels after a colon (e.g. StateA --> StateB : label).
   - In erDiagram, do not put spaces in entity names. For example, use CUSTOMER_ORDER or CustomerOrder, never "Customer Order".
   - Do not mix syntax elements from flowcharts in sequence diagrams or state diagrams.
8. Return only the inner HTML content. Do not include <html>, <head>, or <body> tags.
9. Styling Mermaid Diagrams: NEVER hardcode pure white (#fff, #ffffff, white) or pure black (#000, #000000, black) background fills for nodes/shapes. The application runs in both dark and light modes; pure white nodes will hide arrow lines in dark mode, and pure black nodes will hide text. Use theme-adaptive colors or custom classes with mid-tone theme colors (e.g., #312e81 for indigo, #065f46 for green, #854d0e for amber, #1e293b for slate) that look great in both dark and light themes. Let the default theme handle backgrounds natively where possible. Do not hardcode arrow stroke colors.`;

    setAiPromptText(template);
  }, [aiSubject, aiChapter, aiTopic, aiModalOpen]);

  const [expandedChapters, setExpandedChapters] = useState({});

  const generateSubjectCode = (title) => {
    const words = title.trim().split(/\s+/);
    if (words.length > 1) {
      return words.map(w => w[0]).join('').toUpperCase();
    }
    return title.slice(0, 3).toUpperCase();
  };

  const generateSlug = (title) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const handleCommitAddSubject = async (title) => {
    if (!title.trim()) {
      setAddingSubject(false);
      return;
    }
    try {
      const generatedSlug = generateSlug(title);
      const generatedCode = generateSubjectCode(title);
      const payload = {
        title: title.trim(),
        code: generatedCode,
        slug: generatedSlug,
        description: `Learn core concepts of ${title.trim()}`,
        iconName: 'Cpu',
        showOnLandingPage: true
      };
      await API.post('/api/admin/subjects', payload);
      const response = await API.get('/api/public/subjects');
      setSubjects(response.data || []);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save subject.');
    } finally {
      setAddingSubject(false);
    }
  };

  const handleCommitRenameSubject = async (subj, newTitle) => {
    if (!newTitle.trim()) {
      setEditingSubjectId(null);
      return;
    }
    try {
      const generatedSlug = generateSlug(newTitle);
      const payload = {
        ...subj,
        title: newTitle.trim(),
        slug: generatedSlug
      };
      await API.put(`/api/admin/subjects/${subj.id}`, payload);
      const response = await API.get('/api/public/subjects');
      setSubjects(response.data || []);
      if (currentSubject && currentSubject.id === subj.id) {
        navigate(`/resources/${generatedSlug}`);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to rename subject.');
    } finally {
      setEditingSubjectId(null);
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

  const handleCommitAddChapter = async (subject, chapterName) => {
    if (!chapterName.trim()) {
      setAddingChapterSubjectId(null);
      return;
    }
    try {
      // Find max sort order in this subject
      const currentTopics = subject.topics || [];
      const maxSort = currentTopics.reduce((max, t) => Math.max(max, t.sortOrder || 0), 0);

      const payload = {
        title: 'Introduction',
        slug: `introduction-${generateSlug(chapterName)}-${Math.floor(Math.random() * 1000)}`,
        chapter: chapterName.trim(),
        content: '',
        sortOrder: maxSort + 10
      };
      const response = await API.post(`/api/admin/subjects/${subject.id}/topics`, payload);

      const res = await API.get('/api/public/subjects');
      const updatedSubjects = res.data || [];
      setSubjects(updatedSubjects);

      // Auto-expand the new chapter
      const chKey = `${subject.slug}-${chapterName.trim()}`;
      setExpandedChapters(prev => ({ ...prev, [chKey]: true }));

      // Redirect to the newly created placeholder topic
      navigate(`/resources/${subject.slug}/${response.data.slug}`);
    } catch (err) {
      alert('Failed to add chapter: ' + (err.response?.data?.message || err.message));
    } finally {
      setAddingChapterSubjectId(null);
    }
  };

  const handleCommitRenameChapter = async (subject, oldName, newName) => {
    if (!newName.trim() || oldName === newName.trim()) {
      setEditingChapterKey(null);
      return;
    }
    try {
      await API.put(`/api/admin/subjects/${subject.id}/chapters/rename?oldName=${encodeURIComponent(oldName)}&newName=${encodeURIComponent(newName.trim())}`);
      const response = await API.get('/api/public/subjects');
      setSubjects(response.data || []);

      // Keep expansion state for new chapter key
      const oldChKey = `${subject.slug}-${oldName}`;
      const newChKey = `${subject.slug}-${newName.trim()}`;
      setExpandedChapters(prev => {
        const next = { ...prev };
        next[newChKey] = next[oldChKey];
        delete next[oldChKey];
        return next;
      });
    } catch (err) {
      alert('Failed to rename chapter: ' + (err.response?.data?.message || err.message));
    } finally {
      setEditingChapterKey(null);
    }
  };

  const handleDeleteChapter = async (subject, chapterName) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${chapterName}"? All its topics and content will be permanently lost.`)) return;
    try {
      await API.delete(`/api/admin/subjects/${subject.id}/chapters?chapterName=${encodeURIComponent(chapterName)}`);

      const response = await API.get('/api/public/subjects');
      const updatedSubjects = response.data || [];
      setSubjects(updatedSubjects);

      // Check if we deleted the active topic
      const activeTopicWasInDeletedChapter = activeTopicData && activeTopicData.chapter === chapterName;
      if (activeTopicWasInDeletedChapter && currentSubject) {
        const updatedSub = updatedSubjects.find(s => s.id === subject.id);
        if (updatedSub && updatedSub.topics && updatedSub.topics.length > 0) {
          navigate(`/resources/${subject.slug}/${updatedSub.topics[0].slug}`);
        } else {
          navigate(`/`);
        }
      }
    } catch (err) {
      alert('Failed to delete chapter: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleCommitAddTopic = async (subject, chapterName, topicTitle) => {
    if (!topicTitle.trim()) {
      setAddingTopicChapterKey(null);
      return;
    }
    try {
      const generatedSlug = `${generateSlug(topicTitle)}-${Math.floor(Math.random() * 1000)}`;
      // Find max sort order in this chapter
      const currentTopics = subject.topics || [];
      const chTopics = currentTopics.filter(t => t.chapter === chapterName);
      const maxSort = chTopics.reduce((max, t) => Math.max(max, t.sortOrder || 0), 0);

      const payload = {
        title: topicTitle.trim(),
        slug: generatedSlug,
        chapter: chapterName,
        content: '',
        sortOrder: maxSort + 10
      };

      const response = await API.post(`/api/admin/subjects/${subject.id}/topics`, payload);

      const res = await API.get('/api/public/subjects');
      const updatedSubjects = res.data || [];
      setSubjects(updatedSubjects);

      // Redirect to the newly created topic
      navigate(`/resources/${subject.slug}/${response.data.slug}`);
    } catch (err) {
      alert('Failed to add topic: ' + (err.response?.data?.message || err.message));
    } finally {
      setAddingTopicChapterKey(null);
    }
  };

  const handleCommitRenameTopic = async (topic, newTitle) => {
    if (!newTitle.trim()) {
      setEditingTopicId(null);
      return;
    }
    try {
      const generatedSlug = `${generateSlug(newTitle)}-${Math.floor(Math.random() * 1000)}`;
      const payload = {
        ...topic,
        title: newTitle.trim(),
        slug: generatedSlug
      };
      const response = await API.put(`/api/admin/subjects/topics/${topic.id}`, payload);

      const res = await API.get('/api/public/subjects');
      setSubjects(res.data || []);

      if (activeTopicData && activeTopicData.id === topic.id) {
        setActiveTopicData(response.data);
        navigate(`/resources/${currentSubject.slug}/${response.data.slug}`);
      }
    } catch (err) {
      alert('Failed to rename topic: ' + (err.response?.data?.message || err.message));
    } finally {
      setEditingTopicId(null);
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

  const handleSaveContent = async () => {
    if (!activeTopicData) return;
    try {
      setLoadingTopic(true);
      const html = editorRef.current?.getHTML() || editedContent || '';
      const payload = {
        ...activeTopicData,
        title: editedTitle || activeTopicData.title,
        description: null,
        content: html
      };
      const response = await API.put(`/api/admin/subjects/topics/${activeTopicData.id}`, payload);
      setActiveTopicData(response.data);
      setIsEditingContent(false);

      const res = await API.get('/api/public/subjects');
      setSubjects(res.data || []);
    } catch (err) {
      alert('Failed to save content: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoadingTopic(false);
    }
  };

  const handleCancelEdit = () => {
    if (editorRef.current?.getEditor()) {
      editorRef.current.getEditor().commands.setContent(activeTopicData?.content || '');
    }
    setIsEditingContent(false);
  };

  const handleGenerateAI = () => {
    if (!activeTopicData) return;
    setAiSubject(currentSubject?.title || '');
    setAiChapter(activeTopicData.chapter || 'General');
    setAiTopic(activeTopicData.title || '');
    setAiModalOpen(true);
  };

  const handleExecuteAIGeneration = async () => {
    try {
      setGeneratingAI(true);
      const response = await API.post('/api/admin/subjects/topics/generate-ai', {
        prompt: aiPromptText
      });
      const generatedHtml = response.data.content;

      setEditedContent(generatedHtml);
      if (editorRef.current?.getEditor()) {
        editorRef.current.getEditor().commands.setContent(generatedHtml);
      }

      setIsEditingContent(true);
      setAiModalOpen(false);
    } catch (err) {
      alert('Failed to generate AI content: ' + (err.response?.data?.message || err.message));
    } finally {
      setGeneratingAI(false);
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

  // Group topics by chapter for each subject
  const groupedChapters = useMemo(() => {
    const groups = {};
    subjects.forEach(sub => {
      const subGroups = {};
      const chaptersOrder = [];
      if (sub.topics) {
        sub.topics.forEach(t => {
          const ch = t.chapter || 'General';
          if (!subGroups[ch]) {
            subGroups[ch] = [];
            chaptersOrder.push(ch);
          }
          subGroups[ch].push(t);
        });
      }
      groups[sub.slug] = {
        chapters: subGroups,
        order: chaptersOrder
      };
    });
    return groups;
  }, [subjects]);



  // Fetch active topic content dynamically when slugs change
  useEffect(() => {
    if (!currentSubject) return;

    // Determine target topic slug
    let targetTopic = currentSubject.topics.find(t => t.slug === topicSlug);

    // Fallback: If topicSlug is not found or not provided, redirect to the first topic
    if (!targetTopic && currentSubject.topics && currentSubject.topics.length > 0) {
      targetTopic = currentSubject.topics[0];
      navigate(`/resources/${subjectSlug}/${targetTopic.slug}`, { replace: true });
      return;
    }

    if (!targetTopic) {
      setActiveTopicData(null);
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

  // Auto-expand folder representing active subject and active chapter
  useEffect(() => {
    if (subjectSlug) {
      setExpandedFolders(prev => ({ ...prev, [subjectSlug]: true }));
    }
    if (subjectSlug && activeTopicData && activeTopicData.chapter) {
      const chKey = `${subjectSlug}::${activeTopicData.chapter}`;
      setExpandedChapters(prev => ({ ...prev, [chKey]: true }));
    }
  }, [subjectSlug, activeTopicData]);

  // Reset editing state when navigating between topics
  useEffect(() => {
    setIsEditingContent(false);
    setEditedContent('');
    setEditedTitle('');
  }, [topicSlug]);



  // Auto-redirect if subjects list loaded and subjectSlug is invalid
  useEffect(() => {
    if (!loading && subjects.length > 0 && !currentSubject) {
      navigate('/');
    }
  }, [loading, subjects, currentSubject, navigate]);



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
  // Parse headings from HTML content for the right-sidebar table of contents
  const headings = useMemo(() => {
    const htmlContent = editedContent || activeTopicData?.content || '';
    if (!htmlContent) return [];
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, 'text/html');
      const list = [];
      doc.querySelectorAll('h2, h3').forEach(el => {
        const text = el.textContent || '';
        const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        list.push({ id, text, level: parseInt(el.tagName[1]) });
      });
      return list;
    } catch {
      return [];
    }
  }, [activeTopicData, editedContent]);

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
      if (activeTopicData) {
        navigate(`/practice-quiz/${subjectSlug}/${activeTopicData.slug}`);
      } else {
        navigate(`/practice-quiz/${subjectSlug}`);
      }
    } else {
      navigate('/practice-quiz');
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
      <Navbar variant="app" />

      {/* THREE-COLUMN LAYOUT MAIN WRAPPER */}
      <div className="flex max-w-[1600px] mx-auto min-h-screen relative pt-24">

        {/* COLUMN 1: LEFT SIDEBAR (Width: 280px) */}
        <aside className={`
          shrink-0 border-zinc-200 dark:border-zinc-900 bg-zinc-50/20 dark:bg-[#09090b]
          fixed md:sticky top-24 bottom-0 z-40 md:z-10 pb-8 flex flex-col justify-between
          transition-all duration-300 h-[calc(100vh-6rem)] custom-scrollbar overflow-y-auto
          ${isSidebarCollapsed
            ? 'md:w-0 md:px-0 md:opacity-0 md:pointer-events-none md:overflow-hidden md:border-r-0'
            : 'w-[280px] px-6 border-r opacity-100'
          }
          ${isMobileNavOpen ? 'left-0 w-[280px] px-6 border-r top-0 pt-20 h-screen z-50' : '-left-full md:left-0'}
        `}>
          <div className="space-y-6">

            {/* Brand Logo & Back to Home */}
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800/60 pb-3">
              <div onClick={() => navigate('/')} className="flex items-center space-x-2.5 cursor-pointer">
                <Terminal className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span className="font-black text-base tracking-tight text-zinc-950 dark:text-white">Topics</span>
              </div>
              <button
                onClick={isMobileNavOpen ? () => setIsMobileNavOpen(false) : toggleSidebarCollapse}
                className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-400 hover:text-zinc-950 dark:hover:text-white rounded-lg transition cursor-pointer"
                title={isMobileNavOpen ? "Close Menu" : "Collapse Sidebar"}
              >
                {isMobileNavOpen ? <X className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </button>
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
                  onClick={() => {
                    setAddingSubject(true);
                    setInlineInputVal('');
                  }}
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
                    {/* Header trigger / Subject row */}
                    <div className="flex items-center justify-between group/folder">
                      {editingSubjectId === sub.id ? (
                        <input
                          type="text"
                          value={inlineInputVal}
                          onChange={(e) => setInlineInputVal(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleCommitRenameSubject(sub, inlineInputVal);
                            else if (e.key === 'Escape') setEditingSubjectId(null);
                          }}
                          onBlur={() => handleCommitRenameSubject(sub, inlineInputVal)}
                          className="w-full bg-white dark:bg-zinc-950 border border-purple-500 ring-1 ring-purple-500/20 rounded-md px-2.5 py-1 text-xs font-bold focus:outline-none text-zinc-900 dark:text-white"
                          autoFocus
                        />
                      ) : (
                        <>
                          <button
                            onClick={() => toggleFolder(sub.slug)}
                            className={`
                              flex-1 flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer
                              ${isActiveSubject
                                ? 'text-zinc-950 dark:text-white bg-zinc-100 dark:bg-zinc-900/60'
                                : 'text-zinc-650 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-950 dark:hover:text-white'}
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

                          {/* Admin controls next to Subject */}
                          {isAdmin && (
                            <div className="flex items-center space-x-1 ml-1 shrink-0 opacity-0 group-hover/folder:opacity-100 transition-opacity">
                              <button
                                onClick={() => {
                                  setAddingChapterSubjectId(sub.id);
                                  setInlineInputVal('');
                                }}
                                className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-400 hover:text-emerald-500 rounded-md transition cursor-pointer border-none bg-transparent"
                                title="New Chapter Folder"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  setEditingSubjectId(sub.id);
                                  setInlineInputVal(sub.title);
                                }}
                                className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-400 hover:text-indigo-500 rounded-md transition cursor-pointer border-none bg-transparent"
                                title="Rename Subject"
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
                        </>
                      )}
                    </div>

                    {/* Chapters and Chapter Topics list */}
                    {isFolderExpanded && (
                      <div className="pl-3 border-l border-zinc-200 dark:border-zinc-800/80 space-y-2 py-1 ml-4 animate-fadeIn">
                        {groupedChapters[sub.slug] && groupedChapters[sub.slug].order.map((ch) => {
                          const chKey = `${sub.slug}::${ch}`;
                          const isChapterExpanded = !!expandedChapters[chKey];
                          const topics = groupedChapters[sub.slug].chapters[ch] || [];

                          return (
                            <div key={ch} className="space-y-1">
                              {/* Chapter Header Row */}
                              <div className="flex items-center justify-between group/chapter">
                                {editingChapterKey === chKey ? (
                                  <input
                                    type="text"
                                    value={inlineInputVal}
                                    onChange={(e) => setInlineInputVal(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') handleCommitRenameChapter(sub, ch, inlineInputVal);
                                      else if (e.key === 'Escape') setEditingChapterKey(null);
                                    }}
                                    onBlur={() => handleCommitRenameChapter(sub, ch, inlineInputVal)}
                                    className="w-full bg-white dark:bg-zinc-950 border border-purple-500 ring-1 ring-purple-500/20 rounded-md px-2 py-1 text-[11px] font-bold focus:outline-none text-zinc-900 dark:text-white ml-2"
                                    autoFocus
                                  />
                                ) : (
                                  <>
                                    <button
                                      onClick={() => setExpandedChapters(prev => ({ ...prev, [chKey]: !prev[chKey] }))}
                                      className="flex-1 flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-800 text-[10px] font-bold tracking-tight text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition cursor-pointer text-left"
                                    >
                                      <span className="truncate pr-1">{ch}</span>
                                      {isChapterExpanded ? (
                                        <ChevronDown className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                                      ) : (
                                        <ChevronRight className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                                      )}
                                    </button>

                                    {/* Admin controls next to Chapter */}
                                    {isAdmin && (
                                      <div className="flex items-center space-x-0.5 ml-1 shrink-0 opacity-0 group-hover/chapter:opacity-100 transition-opacity">
                                        <button
                                          onClick={() => {
                                            setAddingTopicChapterKey(chKey);
                                            setInlineInputVal('');
                                          }}
                                          className="p-1 text-zinc-400 hover:text-emerald-500 rounded-md transition cursor-pointer border-none bg-transparent"
                                          title="New Chapter Topic"
                                        >
                                          <Plus className="w-3 h-3" />
                                        </button>
                                        <button
                                          onClick={() => {
                                            setEditingChapterKey(chKey);
                                            setInlineInputVal(ch);
                                          }}
                                          className="p-1 text-zinc-400 hover:text-indigo-500 rounded-md transition cursor-pointer border-none bg-transparent"
                                          title="Rename Chapter"
                                        >
                                          <Edit3 className="w-3 h-3" />
                                        </button>
                                        <button
                                          onClick={() => handleDeleteChapter(sub, ch)}
                                          className="p-1 text-zinc-400 hover:text-rose-500 rounded-md transition cursor-pointer border-none bg-transparent"
                                          title="Delete Chapter"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>

                              {/* Chapter Topics list */}
                              {isChapterExpanded && (
                                <div className="pl-3 border-l border-zinc-200/60 dark:border-zinc-800/40 space-y-0.5 ml-2.5 py-0.5">
                                  {topics.map((t, idx) => {
                                    const isTopicSelected = (activeTopicData && t.slug === activeTopicData.slug) || (!activeTopicData && t.slug === topicSlug);
                                    return (
                                      <div key={t.id || idx} className="flex items-center justify-between group/topic">
                                        {editingTopicId === t.id ? (
                                          <input
                                            type="text"
                                            value={inlineInputVal}
                                            onChange={(e) => setInlineInputVal(e.target.value)}
                                            onKeyDown={(e) => {
                                              if (e.key === 'Enter') handleCommitRenameTopic(t, inlineInputVal);
                                              else if (e.key === 'Escape') setEditingTopicId(null);
                                            }}
                                            onBlur={() => handleCommitRenameTopic(t, inlineInputVal)}
                                            className="w-full bg-white dark:bg-zinc-950 border border-purple-500 ring-1 ring-purple-500/20 rounded-md px-2 py-1 text-[11px] font-semibold focus:outline-none text-zinc-900 dark:text-white"
                                            autoFocus
                                          />
                                        ) : (
                                          <>
                                            <button
                                              onClick={() => handleTopicClick(sub.slug, t.slug)}
                                              className={`
                                                flex-1 text-left px-2.5 py-1.5 rounded-md text-[11px] font-semibold transition-all duration-150 cursor-pointer truncate
                                                ${isTopicSelected && isActiveSubject
                                                  ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold border border-purple-500/20 shadow-sm'
                                                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800'}
                                              `}
                                            >
                                              {t.title}
                                            </button>
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`/practice-quiz/${sub.slug}/${t.slug}`);
                                              }}
                                              className="opacity-0 group-hover/topic:opacity-100 p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-400 hover:text-indigo-500 rounded-md transition cursor-pointer shrink-0 border-none bg-transparent"
                                              title="Take Topic Quiz"
                                            >
                                              <HelpCircle className="w-3 h-3" />
                                            </button>

                                            {isAdmin && (
                                              <div className="flex items-center space-x-0.5 ml-1 shrink-0 opacity-0 group-hover/topic:opacity-100 transition-opacity">
                                                <button
                                                  onClick={() => {
                                                    setEditingTopicId(t.id);
                                                    setInlineInputVal(t.title);
                                                  }}
                                                  className="p-1 text-zinc-400 hover:text-indigo-500 rounded-md transition cursor-pointer border-none bg-transparent"
                                                  title="Rename Topic"
                                                >
                                                  <Edit3 className="w-3 h-3" />
                                                </button>
                                                <button
                                                  onClick={() => handleDeleteTopic(t.id, sub.slug)}
                                                  className="p-1 text-zinc-400 hover:text-rose-500 rounded-md transition cursor-pointer border-none bg-transparent"
                                                  title="Delete Topic"
                                                >
                                                  <Trash2 className="w-3 h-3" />
                                                </button>
                                              </div>
                                            )}
                                          </>
                                        )}
                                      </div>
                                    );
                                  })}

                                  {/* Inline Add Topic input at the bottom of the chapter */}
                                  {addingTopicChapterKey === chKey && (
                                    <div className="pl-2.5 py-1">
                                      <input
                                        type="text"
                                        value={inlineInputVal}
                                        onChange={(e) => setInlineInputVal(e.target.value)}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') handleCommitAddTopic(sub, ch, inlineInputVal);
                                          else if (e.key === 'Escape') setAddingTopicChapterKey(null);
                                        }}
                                        onBlur={() => handleCommitAddTopic(sub, ch, inlineInputVal)}
                                        placeholder="New topic title..."
                                        className="w-full bg-white dark:bg-zinc-950 border border-purple-500 ring-1 ring-purple-500/20 rounded-md px-2 py-1 text-[11px] font-semibold focus:outline-none text-zinc-900 dark:text-white"
                                        autoFocus
                                      />
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}

                        {/* Inline Add Chapter input at the bottom of the subject */}
                        {addingChapterSubjectId === sub.id && (
                          <div className="pl-3 py-1.5 ml-4">
                            <div className="flex items-center space-x-1.5">
                              <ChevronRight className="w-3 h-3 text-zinc-400 shrink-0" />
                              <input
                                type="text"
                                value={inlineInputVal}
                                onChange={(e) => setInlineInputVal(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleCommitAddChapter(sub, inlineInputVal);
                                  else if (e.key === 'Escape') setAddingChapterSubjectId(null);
                                }}
                                onBlur={() => handleCommitAddChapter(sub, inlineInputVal)}
                                placeholder="New chapter name..."
                                className="w-full bg-white dark:bg-zinc-950 border border-purple-500 ring-1 ring-purple-500/20 rounded-md px-2 py-1 text-[11px] font-bold focus:outline-none text-zinc-900 dark:text-white"
                                autoFocus
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Inline Add Subject input at the bottom of subjects list */}
              {addingSubject && (
                <div className="pt-2">
                  <input
                    type="text"
                    value={inlineInputVal}
                    onChange={(e) => setInlineInputVal(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCommitAddSubject(inlineInputVal);
                      else if (e.key === 'Escape') setAddingSubject(false);
                    }}
                    onBlur={() => handleCommitAddSubject(inlineInputVal)}
                    placeholder="New subject title..."
                    className="w-full bg-white dark:bg-zinc-950 border border-purple-500 ring-1 ring-purple-500/20 rounded-md px-2.5 py-1.5 text-xs font-bold focus:outline-none text-zinc-900 dark:text-white"
                    autoFocus
                  />
                </div>
              )}
            </div>

          </div>

          {/* Version */}
          <div className="pt-6 border-t border-zinc-200 dark:border-zinc-900 flex items-center justify-between">
            <span className="text-[10px] text-zinc-400 dark:text-zinc-600 font-bold tracking-widest uppercase">v1.1.0</span>
          </div>
        </aside>

        {/* COLUMN 2: MIDDLE COLUMN (Main study content area) */}
        <main className="flex-grow px-6 sm:px-12 md:px-16 pt-8 pb-20 overflow-y-auto max-w-4xl custom-scrollbar">

          {/* Mobile show topics button */}
          {!isMobileNavOpen && (
            <button
              onClick={() => setIsMobileNavOpen(true)}
              className="md:hidden mb-6 flex items-center space-x-2 text-xs font-bold bg-zinc-50 dark:bg-[#0d0d11] border border-zinc-200 dark:border-zinc-900 rounded-xl px-4 py-2.5 text-zinc-700 dark:text-zinc-350 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition shadow-sm cursor-pointer"
            >
              <List className="w-4 h-4" />
              <span>Show Topics</span>
            </button>
          )}

          {/* Top dynamic header bar for desktop (always visible) */}
          <div className="hidden md:flex items-center justify-between border-b border-zinc-100 dark:border-zinc-900 pb-3 mb-6 min-h-[40px]">
            <div className="flex items-center space-x-3">
              {isSidebarCollapsed && (
                <button
                  onClick={toggleSidebarCollapse}
                  className="flex items-center justify-center p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-400 hover:text-zinc-950 dark:hover:text-white rounded-lg transition cursor-pointer border border-zinc-200 dark:border-zinc-800 shadow-sm"
                  title="Expand Sidebar"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
              <span className="text-xs font-black uppercase tracking-widest text-purple-600 dark:text-purple-400 animate-fadeIn">
                {currentSubject.title}
              </span>
            </div>

            {!loadingTopic && activeTopicData && isAdmin && (
              <div className="flex items-center space-x-2">
                {isEditingContent ? (
                  <>
                    <button
                      onClick={handleSaveContent}
                      className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition cursor-pointer border-none shadow-sm"
                    >
                      <span>Save Changes</span>
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="flex items-center space-x-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold text-xs px-3 py-1.5 rounded-lg transition border border-zinc-200 dark:border-zinc-800 cursor-pointer"
                    >
                      <span>Cancel</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setEditedContent(activeTopicData.content || '');
                      setEditedTitle(activeTopicData.title || '');
                      setIsEditingContent(true);
                    }}
                    className="flex items-center space-x-1.5 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold text-xs px-3 py-1.5 rounded-lg transition border border-zinc-200 dark:border-zinc-800 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Topic Content</span>
                  </button>
                )}
                <button
                  onClick={handleGenerateAI}
                  className="flex items-center space-x-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-400 hover:via-purple-400 hover:to-pink-400 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition cursor-pointer border-none shadow-sm shadow-purple-500/20"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate with AI</span>
                </button>
              </div>
            )}
          </div>

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
              {/* Main heading */}
              {isEditingContent ? (
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="text-3xl sm:text-4xl font-extrabold text-zinc-950 dark:text-white mt-3 mb-6 tracking-tight leading-[1.15] w-full bg-transparent border-b border-zinc-200 dark:border-zinc-800 pb-2 focus:border-purple-500 focus:outline-none outline-none transition animate-fadeIn"
                  placeholder="Topic Title"
                />
              ) : (
                <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-950 dark:text-white mt-3 mb-6 tracking-tight leading-[1.15] animate-fadeIn">
                  {activeTopicData.title}
                </h1>
              )}


              {/* Rich Text Editor - Notion-like inline editing */}
              <article className="animate-fadeIn">
                <RichTextEditor
                  key={activeTopicData.id}
                  ref={editorRef}
                  content={activeTopicData.content || ''}
                  editable={isEditingContent}
                  onContentChange={setEditedContent}
                  onGenerateAI={handleGenerateAI}
                />
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
        <aside className="hidden lg:block w-[240px] shrink-0 pt-16 px-6 h-screen sticky top-0 overflow-y-auto custom-scrollbar">
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

      {/* AI PROMPT BUILDER MODAL */}
      {aiModalOpen && (
        <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 relative shadow-2xl flex flex-col max-h-[90vh] text-zinc-900 dark:text-zinc-100 animate-scaleIn">

            <button
              onClick={() => setAiModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-lg transition cursor-pointer border-none bg-transparent"
              disabled={generatingAI}
            >
              <X className="w-4 h-4" />
            </button>

            <h2 className="text-lg font-black mb-4 flex items-center border-b border-zinc-100 dark:border-zinc-800 pb-3 shrink-0">
              <Sparkles className="w-5 h-5 text-purple-500 mr-2 animate-pulse" />
              Generate Topic Content with AI
            </h2>

            <div className="flex-grow overflow-y-auto space-y-4 pr-2 pb-4 mb-4">
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-semibold">
                Tweak the context parameters below to dynamically adjust the prompt template, or edit the prompt directly to guide the AI draft generation.
              </p>

              {/* Form Grid for Parameters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-zinc-450 dark:text-zinc-500 mb-1.5 uppercase">Subject Title</label>
                  <input
                    type="text"
                    value={aiSubject}
                    onChange={(e) => setAiSubject(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-purple-500 text-xs"
                    disabled={generatingAI}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-zinc-450 dark:text-zinc-500 mb-1.5 uppercase">Chapter Name</label>
                  <input
                    type="text"
                    value={aiChapter}
                    onChange={(e) => setAiChapter(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-purple-500 text-xs"
                    disabled={generatingAI}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-zinc-450 dark:text-zinc-500 mb-1.5 uppercase">Topic Name</label>
                  <input
                    type="text"
                    value={aiTopic}
                    onChange={(e) => setAiTopic(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-purple-500 text-xs"
                    disabled={generatingAI}
                  />
                </div>
              </div>

              {/* Prompt Textarea */}
              <div>
                <label className="block text-[10px] font-black text-zinc-450 dark:text-zinc-500 mb-1.5 uppercase">Prompt for Groq AI</label>
                <textarea
                  value={aiPromptText}
                  onChange={(e) => setAiPromptText(e.target.value)}
                  rows="8"
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-purple-500 text-xs font-mono resize-none leading-relaxed"
                  placeholder="Enter custom prompt instructions..."
                  disabled={generatingAI}
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex space-x-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 shrink-0">
              <button
                type="button"
                onClick={() => setAiModalOpen(false)}
                className="w-1/2 py-2.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 text-xs font-bold rounded-xl transition cursor-pointer border-none"
                disabled={generatingAI}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteAIGeneration}
                disabled={generatingAI}
                className="w-1/2 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-800/50 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-md flex justify-center items-center border-none"
              >
                {generatingAI ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white mr-1.5" />
                    <span>Drafting Content...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 mr-1.5 text-white" />
                    <span>Generate Topic Content</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Resources;
