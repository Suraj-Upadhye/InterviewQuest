/**
 * IconPicker — Curated lucide-react icon set (tree-shakeable, ~0 extra bundle cost)
 *
 * Only uses verified named exports from lucide-react v1.x.
 * Each icon is individually imported so Vite/Rollup tree-shakes them perfectly.
 * ~90 icons × ~400 bytes ≈ ~36 KB minified / ~10 KB gzipped.
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  Search, X, Check,
  // ── Tech & Computing
  Cpu, Monitor, Server, HardDrive, Database, Cloud, Wifi, Globe, Network,
  Terminal, Code, Code2, FileCode, Braces, GitBranch, GitFork, GitMerge,
  Binary, Hash, Layers, LayoutGrid, Boxes,
  // ── Data & Analytics
  BarChart2, BarChart3, PieChart, LineChart, TrendingUp, TrendingDown,
  Table2, Sigma, Calculator,
  // ── Science & Math
  Atom, Beaker, FlaskConical, Microscope, Dna, Zap, Waves, Activity,
  // ── Engineering
  Settings, Settings2, Wrench, Cog, Gauge, CircuitBoard, Blocks, Workflow,
  // ── Security & Auth
  Shield, ShieldCheck, Lock, LockOpen, Key, KeyRound, Fingerprint, Eye, EyeOff,
  // ── Files & Docs
  FileText, File, Folder, FolderOpen, BookOpen, Book, BookMarked, Library,
  Notebook, Clipboard, ClipboardList, GraduationCap, School,
  // ── Media
  Image, Video, Music, Headphones, Radio, Tv,
  // ── Communication & Web
  Mail, MessageSquare, MessageCircle, Send, Bell, Rss,
  // ── Interface & Layout
  Layout, LayoutDashboard, Sidebar, PanelLeft, PanelRight, AppWindow,
  // ── Arrows
  ArrowRight, ArrowLeft, ArrowUp, ArrowDown, ChevronRight, ChevronDown,
  // ── Shapes
  Star, Hexagon, Triangle, Circle, Square, Diamond,
  // ── Misc useful
  Brain, Lightbulb, Puzzle, Target, Trophy, Award,
  Users, User, UserCheck, Box, Package, Component,
} from 'lucide-react';

// ─── Registry: { name, C } — defines the picker grid order and search terms ───
const ICON_REGISTRY = [
  // ── Tech & Computing
  { name: 'Cpu',            C: Cpu },
  { name: 'Monitor',        C: Monitor },
  { name: 'Server',         C: Server },
  { name: 'HardDrive',      C: HardDrive },
  { name: 'Database',       C: Database },
  { name: 'Cloud',          C: Cloud },
  { name: 'Wifi',           C: Wifi },
  { name: 'Globe',          C: Globe },
  { name: 'Network',        C: Network },
  { name: 'Terminal',       C: Terminal },
  { name: 'Code',           C: Code },
  { name: 'Code2',          C: Code2 },
  { name: 'FileCode',       C: FileCode },
  { name: 'Braces',         C: Braces },
  { name: 'GitBranch',      C: GitBranch },
  { name: 'GitFork',        C: GitFork },
  { name: 'GitMerge',       C: GitMerge },
  { name: 'Binary',         C: Binary },
  { name: 'Hash',           C: Hash },
  { name: 'Layers',         C: Layers },
  { name: 'LayoutGrid',     C: LayoutGrid },
  { name: 'Boxes',          C: Boxes },
  // ── Data & Analytics
  { name: 'BarChart2',      C: BarChart2 },
  { name: 'BarChart3',      C: BarChart3 },
  { name: 'PieChart',       C: PieChart },
  { name: 'LineChart',      C: LineChart },
  { name: 'TrendingUp',     C: TrendingUp },
  { name: 'TrendingDown',   C: TrendingDown },
  { name: 'Table2',         C: Table2 },
  { name: 'Sigma',          C: Sigma },
  { name: 'Calculator',     C: Calculator },
  // ── Science & Math
  { name: 'Atom',           C: Atom },
  { name: 'Beaker',         C: Beaker },
  { name: 'FlaskConical',   C: FlaskConical },
  { name: 'Microscope',     C: Microscope },
  { name: 'Dna',            C: Dna },
  { name: 'Zap',            C: Zap },
  { name: 'Waves',          C: Waves },
  { name: 'Activity',       C: Activity },
  // ── Engineering
  { name: 'Settings',       C: Settings },
  { name: 'Settings2',      C: Settings2 },
  { name: 'Wrench',         C: Wrench },
  { name: 'Cog',            C: Cog },
  { name: 'Gauge',          C: Gauge },
  { name: 'CircuitBoard',   C: CircuitBoard },
  { name: 'Blocks',         C: Blocks },
  { name: 'Workflow',       C: Workflow },
  // ── Security & Auth
  { name: 'Shield',         C: Shield },
  { name: 'ShieldCheck',    C: ShieldCheck },
  { name: 'Lock',           C: Lock },
  { name: 'LockOpen',       C: LockOpen },
  { name: 'Key',            C: Key },
  { name: 'KeyRound',       C: KeyRound },
  { name: 'Fingerprint',    C: Fingerprint },
  { name: 'Eye',            C: Eye },
  { name: 'EyeOff',         C: EyeOff },
  // ── Files & Docs
  { name: 'FileText',       C: FileText },
  { name: 'File',           C: File },
  { name: 'Folder',         C: Folder },
  { name: 'FolderOpen',     C: FolderOpen },
  { name: 'BookOpen',       C: BookOpen },
  { name: 'Book',           C: Book },
  { name: 'BookMarked',     C: BookMarked },
  { name: 'Library',        C: Library },
  { name: 'Notebook',       C: Notebook },
  { name: 'Clipboard',      C: Clipboard },
  { name: 'ClipboardList',  C: ClipboardList },
  { name: 'GraduationCap',  C: GraduationCap },
  { name: 'School',         C: School },
  // ── Media
  { name: 'Image',          C: Image },
  { name: 'Video',          C: Video },
  { name: 'Music',          C: Music },
  { name: 'Headphones',     C: Headphones },
  { name: 'Radio',          C: Radio },
  { name: 'Tv',             C: Tv },
  // ── Communication & Web
  { name: 'Mail',           C: Mail },
  { name: 'MessageSquare',  C: MessageSquare },
  { name: 'MessageCircle',  C: MessageCircle },
  { name: 'Send',           C: Send },
  { name: 'Bell',           C: Bell },
  { name: 'Rss',            C: Rss },
  // ── Interface & Layout
  { name: 'Layout',         C: Layout },
  { name: 'LayoutDashboard',C: LayoutDashboard },
  { name: 'Sidebar',        C: Sidebar },
  { name: 'PanelLeft',      C: PanelLeft },
  { name: 'PanelRight',     C: PanelRight },
  { name: 'AppWindow',      C: AppWindow },
  // ── Arrows
  { name: 'ArrowRight',     C: ArrowRight },
  { name: 'ArrowLeft',      C: ArrowLeft },
  { name: 'ArrowUp',        C: ArrowUp },
  { name: 'ArrowDown',      C: ArrowDown },
  { name: 'ChevronRight',   C: ChevronRight },
  { name: 'ChevronDown',    C: ChevronDown },
  // ── Shapes
  { name: 'Star',           C: Star },
  { name: 'Hexagon',        C: Hexagon },
  { name: 'Triangle',       C: Triangle },
  { name: 'Circle',         C: Circle },
  { name: 'Square',         C: Square },
  { name: 'Diamond',        C: Diamond },
  // ── Misc
  { name: 'Brain',          C: Brain },
  { name: 'Lightbulb',      C: Lightbulb },
  { name: 'Puzzle',         C: Puzzle },
  { name: 'Target',         C: Target },
  { name: 'Trophy',         C: Trophy },
  { name: 'Award',          C: Award },
  { name: 'Users',          C: Users },
  { name: 'User',           C: User },
  { name: 'UserCheck',      C: UserCheck },
  { name: 'Box',            C: Box },
  { name: 'Package',        C: Package },
  { name: 'Component',      C: Component },
];

// Fast lookup: name → component (used for footer preview and external rendering)
export const ICON_MAP = Object.fromEntries(
  ICON_REGISTRY.map(({ name, C }) => [name, C])
);

/**
 * getIconComponent(name) — safe icon resolver with BookOpen fallback
 */
export const getIconComponent = (name) => ICON_MAP[name] || BookOpen;

/**
 * IconPicker
 * Props:
 *   value    — currently selected icon name (PascalCase string)
 *   onChange — callback(iconName: string)
 *   onClose  — callback to close the picker
 */
const IconPicker = ({ value, onChange, onClose }) => {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!query.trim()) return ICON_REGISTRY;
    const q = query.toLowerCase();
    return ICON_REGISTRY.filter(({ name }) => name.toLowerCase().includes(q));
  }, [query]);

  const handleSelect = useCallback((name) => {
    onChange(name);
    onClose();
  }, [onChange, onClose]);

  const SelectedIcon = value ? getIconComponent(value) : null;

  return (
    <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl flex flex-col max-h-[85vh] text-zinc-900 dark:text-zinc-100 animate-scaleIn">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
          <div>
            <h3 className="font-black text-sm text-zinc-900 dark:text-white">Choose Icon</h3>
            <p className="text-[10px] text-zinc-400 mt-0.5">{ICON_REGISTRY.length} curated icons — search to filter</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer border-none bg-transparent"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="px-5 py-3 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search icons… (e.g. Globe, Brain, Lock)"
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-9 pr-9 py-2.5 text-xs focus:outline-none focus:border-indigo-500 text-zinc-900 dark:text-zinc-100"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 border-none bg-transparent cursor-pointer p-0"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1.5">
            {filtered.length} result{filtered.length !== 1 ? 's' : ''}
            {value && (
              <span className="ml-2">
                — Selected: <span className="font-bold text-indigo-500">{value}</span>
              </span>
            )}
          </p>
        </div>

        {/* Icon Grid */}
        <div className="flex-grow overflow-y-auto p-4">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-zinc-400">
              <Search className="w-8 h-8 mb-3 opacity-40" />
              <p className="text-xs font-semibold">No icons match "{query}"</p>
              <p className="text-[10px] mt-1 text-zinc-400">Try a different keyword</p>
            </div>
          ) : (
            <div className="grid grid-cols-6 sm:grid-cols-8 gap-1.5">
              {filtered.map(({ name, C: IconComp }) => {
                const isSelected = name === value;
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => handleSelect(name)}
                    title={name}
                    className={`relative flex flex-col items-center justify-center p-2 rounded-xl transition cursor-pointer border group aspect-square ${
                      isSelected
                        ? 'bg-indigo-500/15 border-indigo-500/50 text-indigo-600 dark:text-indigo-400'
                        : 'bg-zinc-50 dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    <IconComp className="w-4 h-4 shrink-0" />
                    {isSelected && (
                      <div className="absolute top-0.5 right-0.5 w-3 h-3 bg-indigo-500 rounded-full flex items-center justify-center">
                        <Check className="w-1.5 h-1.5 text-white" />
                      </div>
                    )}
                    {/* Name tooltip on hover */}
                    <span className="pointer-events-none absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-[8px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      {name}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer — current selection preview */}
        {SelectedIcon && (
          <div className="px-5 py-3.5 border-t border-zinc-100 dark:border-zinc-800 shrink-0 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-950/30 rounded-b-3xl">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm">
                <SelectedIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{value}</p>
                <p className="text-[10px] text-zinc-400">Currently selected</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition cursor-pointer border-none shadow"
            >
              Confirm
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default IconPicker;
