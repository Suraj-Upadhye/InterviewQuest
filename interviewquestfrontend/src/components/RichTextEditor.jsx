import React, { useState, useEffect, useCallback, useRef, forwardRef, useImperativeHandle, useMemo } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Heading1, Heading2, Heading3, List, ListOrdered,
  Code, Code2, Quote, Minus, GitBranch, Link2, Highlighter,
  Plus, X
} from 'lucide-react';
import './RichTextEditor.css';

const lowlight = createLowlight(common);

// Slash command definitions
const SLASH_COMMANDS = [
  { title: 'Heading 1', description: 'Large section heading', icon: Heading1, command: (editor) => editor.chain().focus().toggleHeading({ level: 1 }).run() },
  { title: 'Heading 2', description: 'Medium section heading', icon: Heading2, command: (editor) => editor.chain().focus().toggleHeading({ level: 2 }).run() },
  { title: 'Heading 3', description: 'Small section heading', icon: Heading3, command: (editor) => editor.chain().focus().toggleHeading({ level: 3 }).run() },
  { title: 'Bullet List', description: 'Create a bullet list', icon: List, command: (editor) => editor.chain().focus().toggleBulletList().run() },
  { title: 'Numbered List', description: 'Create a numbered list', icon: ListOrdered, command: (editor) => editor.chain().focus().toggleOrderedList().run() },
  { title: 'Code Block', description: 'Add a code snippet', icon: Code2, command: (editor) => editor.chain().focus().toggleCodeBlock().run() },
  { title: 'Blockquote', description: 'Add a quote block', icon: Quote, command: (editor) => editor.chain().focus().toggleBlockquote().run() },
  { title: 'Divider', description: 'Insert a horizontal rule', icon: Minus, command: (editor) => editor.chain().focus().setHorizontalRule().run() },
  { title: 'Mermaid Diagram', description: 'Insert a mermaid diagram block', icon: GitBranch, command: (editor) => editor.chain().focus().setCodeBlock({ language: 'mermaid' }).run() },
];

// Fullscreen Mermaid Diagram Viewer Modal with Zoom/Pan controls
const FullscreenMermaidModal = ({ svg, onClose }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const containerRef = useRef(null);

  // Reset zoom and pan
  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 4));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.5));
  };

  // Mouse wheel zoom
  const handleWheel = (e) => {
    e.preventDefault();
    const zoomFactor = 0.1;
    if (e.deltaY < 0) {
      setScale(prev => Math.min(prev + zoomFactor, 4));
    } else {
      setScale(prev => Math.max(prev - zoomFactor, 0.5));
    }
  };

  // Dragging / Panning
  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col bg-zinc-950/90 backdrop-blur-md animate-fadeIn select-none">
      {/* Header bar */}
      <div className="flex justify-between items-center px-6 py-4 border-b border-zinc-800 shrink-0">
        <span className="text-xs font-black text-white uppercase tracking-wider">Mermaid Diagram - Fullscreen</span>
        <div className="flex items-center space-x-3 text-zinc-300">
          <button 
            onClick={handleZoomOut}
            className="p-2 hover:bg-zinc-850 rounded-lg hover:text-white transition cursor-pointer bg-transparent border-none"
            title="Zoom Out"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono font-bold w-12 text-center">{Math.round(scale * 100)}%</span>
          <button 
            onClick={handleZoomIn}
            className="p-2 hover:bg-zinc-850 rounded-lg hover:text-white transition cursor-pointer bg-transparent border-none"
            title="Zoom In"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button 
            onClick={handleReset}
            className="px-3 py-1.5 bg-zinc-800 text-xs font-bold rounded-lg hover:bg-zinc-700 text-white transition ml-2 cursor-pointer border-none"
          >
            Reset
          </button>
          <div className="w-px h-6 bg-zinc-800 mx-2" />
          <button 
            onClick={onClose}
            className="p-2 hover:bg-zinc-850 rounded-lg text-zinc-400 hover:text-white transition cursor-pointer bg-transparent border-none"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main body area for zooming & panning */}
      <div 
        ref={containerRef}
        className={`flex-grow relative overflow-hidden flex items-center justify-center ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div 
          className="transition-transform duration-75 ease-out select-none pointer-events-none flex justify-center items-center"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          }}
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      </div>
      
      {/* Help text footer */}
      <div className="py-3 text-center border-t border-zinc-800/60 shrink-0">
        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
          Drag to Pan • Scroll to Zoom • Esc to Close
        </span>
      </div>
    </div>
  );
};

const RichTextEditor = forwardRef(({ content, editable = false, onContentChange, onGenerateAI }, ref) => {
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashMenuPos, setSlashMenuPos] = useState({ top: 0, left: 0 });
  const [slashFilter, setSlashFilter] = useState('');
  const [selectedSlashIdx, setSelectedSlashIdx] = useState(0);
  const [slashRange, setSlashRange] = useState(null);

  const containerRef = useRef(null);
  const slashMenuRef = useRef(null);
  const [fullscreenSvg, setFullscreenSvg] = useState(null);

  // Refs for stale closure prevention (used in editor keydown handler)
  const showSlashMenuRef = useRef(false);
  const selectedSlashIdxRef = useRef(0);
  const slashRangeRef = useRef(null);

  // Keep refs in sync
  useEffect(() => { showSlashMenuRef.current = showSlashMenu; }, [showSlashMenu]);
  useEffect(() => { selectedSlashIdxRef.current = selectedSlashIdx; }, [selectedSlashIdx]);
  useEffect(() => { slashRangeRef.current = slashRange; }, [slashRange]);

  const filteredCommands = useMemo(() => {
    return SLASH_COMMANDS.filter(cmd =>
      cmd.title.toLowerCase().includes(slashFilter.toLowerCase())
    );
  }, [slashFilter]);

  const filteredCommandsRef = useRef(filteredCommands);
  useEffect(() => { filteredCommandsRef.current = filteredCommands; }, [filteredCommands]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // Replaced by CodeBlockLowlight
      }),
      Placeholder.configure({
        placeholder: "Type '/' for commands, or start writing...",
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Highlight.configure({
        multicolor: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: 'noopener noreferrer',
          target: '_blank',
        },
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
    ],
    content: content || '',
    editable: editable,
    onUpdate: ({ editor }) => {
      // Slash command detection
      if (editor.isEditable) {
        try {
          const { $anchor } = editor.state.selection;
          const textBefore = $anchor.parent.textContent.substring(0, $anchor.parentOffset);
          const slashMatch = textBefore.match(/\/([\w ]*)$/);

          if (slashMatch && $anchor.parent.type.name === 'paragraph') {
            // Check if any commands match the filter
            const filterText = slashMatch[1];
            const hasMatches = SLASH_COMMANDS.some(cmd =>
              cmd.title.toLowerCase().includes(filterText.toLowerCase())
            );

            if (hasMatches) {
              const from = $anchor.pos - slashMatch[0].length;
              const to = $anchor.pos;
              try {
                const coords = editor.view.coordsAtPos(from);
                setSlashMenuPos({ top: coords.bottom + 8, left: coords.left });
              } catch {
                // Use fallback position if coordsAtPos fails
              }
              setShowSlashMenu(true);
              setSlashFilter(filterText);
              setSlashRange({ from, to });
              setSelectedSlashIdx(0);
            } else {
              setShowSlashMenu(false);
            }
          } else {
            setShowSlashMenu(false);
          }
        } catch {
          setShowSlashMenu(false);
        }
      }

      onContentChange?.(editor.getHTML());
    },
  });

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    getHTML: () => editor?.getHTML() || '',
    getEditor: () => editor,
  }));

  // Sync editable state when prop changes
  useEffect(() => {
    if (editor) {
      editor.setEditable(editable);
    }
  }, [editable, editor]);

  // Execute a slash command
  const executeSlashCommand = useCallback((cmd) => {
    if (!editor || !slashRange) return;

    // Delete the "/" + filter text
    editor.chain()
      .focus()
      .deleteRange(slashRange)
      .run();

    // Run the block command
    cmd.command(editor);
    setShowSlashMenu(false);
  }, [editor, slashRange]);

  // Keyboard navigation for slash menu (capture phase to intercept before ProseMirror)
  useEffect(() => {
    if (!showSlashMenu) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        e.stopPropagation();
        setSelectedSlashIdx(prev => Math.min(prev + 1, filteredCommandsRef.current.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        e.stopPropagation();
        setSelectedSlashIdx(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        const cmd = filteredCommandsRef.current[selectedSlashIdxRef.current];
        if (cmd) {
          // Execute via timeout to avoid ProseMirror transaction conflicts
          const range = slashRangeRef.current;
          if (editor && range) {
            editor.chain().focus().deleteRange(range).run();
            cmd.command(editor);
          }
          setShowSlashMenu(false);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        setShowSlashMenu(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [showSlashMenu, editor]);

  // Close slash menu on outside click
  useEffect(() => {
    if (!showSlashMenu) return;
    const handleClick = (e) => {
      if (slashMenuRef.current && !slashMenuRef.current.contains(e.target)) {
        setShowSlashMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showSlashMenu]);

  // Render mermaid diagrams (read-only mode only)
  useEffect(() => {
    if (!containerRef.current || editable) return;

    const renderMermaid = async () => {
      const el = containerRef.current;
      if (!el) return;

      // Find code blocks with mermaid language
      const codeBlocks = el.querySelectorAll('pre code');
      const mermaidBlocks = Array.from(codeBlocks).filter(block => {
        const pre = block.parentElement;
        return block.classList.contains('language-mermaid') ||
               pre?.classList.contains('language-mermaid') ||
               pre?.getAttribute('data-language') === 'mermaid';
      });

      if (mermaidBlocks.length === 0) return;

      try {
        const mermaid = (await import('mermaid')).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: document.documentElement.classList.contains('dark') ? 'dark' : 'default',
          securityLevel: 'loose',
        });

        for (let i = 0; i < mermaidBlocks.length; i++) {
          const block = mermaidBlocks[i];
          const rawCode = block.textContent || '';
          const code = rawCode.replace(/(-->|-\.->|==>|->)\s*\|\s*([^|]+)\s*\|\s*>/g, '$1|$2|');
          const pre = block.parentElement;
          if (!pre || !code.trim()) continue;

          try {
            const id = `mermaid-${Date.now()}-${i}`;
            const { svg } = await mermaid.render(id, code.trim());
            
            const wrapper = document.createElement('div');
            wrapper.className = 'mermaid-diagram-container';
            
            // Create SVG container
            const svgWrapper = document.createElement('div');
            svgWrapper.className = 'mermaid-svg-wrapper';
            svgWrapper.innerHTML = svg;
            wrapper.appendChild(svgWrapper);

            // Create fullscreen button overlay
            const btn = document.createElement('button');
            btn.className = 'mermaid-fullscreen-btn';
            btn.title = 'View Fullscreen';
            btn.innerHTML = `
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
              </svg>
            `;

            // Click button opens fullscreen modal
            btn.addEventListener('click', (e) => {
              e.stopPropagation();
              setFullscreenSvg(svg);
            });

            // Clicking diagram opens fullscreen modal too
            wrapper.addEventListener('click', () => {
              setFullscreenSvg(svg);
            });

            wrapper.appendChild(btn);
            pre.replaceWith(wrapper);
          } catch (err) {
            console.error('Mermaid render error:', err);
          }
        }
      } catch (err) {
        console.error('Failed to load mermaid:', err);
      }
    };

    const timer = setTimeout(renderMermaid, 200);
    return () => clearTimeout(timer);
  }, [editable, content]);

  // Add IDs to headings for anchor scroll navigation
  useEffect(() => {
    if (!containerRef.current || !editor) return;

    const addHeadingIds = () => {
      if (!containerRef.current) return;
      const headingEls = containerRef.current.querySelectorAll('.ProseMirror h1, .ProseMirror h2, .ProseMirror h3');
      headingEls.forEach(el => {
        const text = el.textContent || '';
        const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        el.id = id;
      });
    };

    addHeadingIds();
    editor.on('update', addHeadingIds);
    return () => editor.off('update', addHeadingIds);
  }, [editor]);

  // Link insertion prompt
  const setLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter URL:', previousUrl || 'https://');

    if (url === null) return; // Cancelled
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
  }, [editor]);

  if (!editor) return null;

  return (
    <div ref={containerRef} className={`rich-text-editor ${editable ? 'is-editable' : ''}`}>

      {/* ---- Floating Bubble Menu (appears on text selection) ---- */}
      {editable && editor && (
        <BubbleMenu
          editor={editor}
          tippyOptions={{
            duration: 150,
            placement: 'top',
            appendTo: () => document.body,
          }}
        >
          <div className="bubble-toolbar">
            {/* Inline formatting */}
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`bubble-toolbar-btn ${editor.isActive('bold') ? 'is-active' : ''}`}
              title="Bold (Ctrl+B)"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`bubble-toolbar-btn ${editor.isActive('italic') ? 'is-active' : ''}`}
              title="Italic (Ctrl+I)"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={`bubble-toolbar-btn ${editor.isActive('underline') ? 'is-active' : ''}`}
              title="Underline (Ctrl+U)"
            >
              <UnderlineIcon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className={`bubble-toolbar-btn ${editor.isActive('strike') ? 'is-active' : ''}`}
              title="Strikethrough"
            >
              <Strikethrough className="w-3.5 h-3.5" />
            </button>

            <div className="bubble-toolbar-divider" />

            {/* Headings */}
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              className={`bubble-toolbar-btn ${editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}`}
              title="Heading 1"
            >
              <Heading1 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className={`bubble-toolbar-btn ${editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}`}
              title="Heading 2"
            >
              <Heading2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              className={`bubble-toolbar-btn ${editor.isActive('heading', { level: 3 }) ? 'is-active' : ''}`}
              title="Heading 3"
            >
              <Heading3 className="w-3.5 h-3.5" />
            </button>

            <div className="bubble-toolbar-divider" />

            {/* Code, highlight, link */}
            <button
              onClick={() => editor.chain().focus().toggleCode().run()}
              className={`bubble-toolbar-btn ${editor.isActive('code') ? 'is-active' : ''}`}
              title="Inline Code"
            >
              <Code className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleHighlight().run()}
              className={`bubble-toolbar-btn ${editor.isActive('highlight') ? 'is-active' : ''}`}
              title="Highlight"
            >
              <Highlighter className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={setLink}
              className={`bubble-toolbar-btn ${editor.isActive('link') ? 'is-active' : ''}`}
              title="Add Link"
            >
              <Link2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </BubbleMenu>
      )}

      {/* ---- Editor Content ---- */}
      <EditorContent editor={editor} />

      {/* ---- Slash Commands Dropdown ---- */}
      {showSlashMenu && editable && (
        <div
          ref={slashMenuRef}
          className="slash-menu"
          style={{ top: slashMenuPos.top, left: slashMenuPos.left }}
        >
          <div className="slash-menu-label">Blocks</div>
          {filteredCommands.length > 0 ? (
            filteredCommands.map((cmd, idx) => {
              const Icon = cmd.icon;
              return (
                <button
                  key={cmd.title}
                  className={`slash-menu-item ${idx === selectedSlashIdx ? 'is-selected' : ''}`}
                  onClick={() => executeSlashCommand(cmd)}
                  onMouseEnter={() => setSelectedSlashIdx(idx)}
                >
                  <div className="slash-menu-item-icon">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="slash-menu-item-info">
                    <div className="slash-menu-item-title">{cmd.title}</div>
                    <div className="slash-menu-item-desc">{cmd.description}</div>
                  </div>
                </button>
              );
            })
          ) : (
            <div className="slash-menu-empty">No matching commands</div>
          )}
        </div>
      )}
      {fullscreenSvg && (
        <FullscreenMermaidModal
          svg={fullscreenSvg}
          onClose={() => setFullscreenSvg(null)}
        />
      )}
    </div>
  );
});

RichTextEditor.displayName = 'RichTextEditor';

export default RichTextEditor;
