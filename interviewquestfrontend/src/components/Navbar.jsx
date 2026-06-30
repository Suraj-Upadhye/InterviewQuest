import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Sun, Moon, Menu, X, Search, ArrowRight,
  User, LogOut, LayoutDashboard, ChevronDown
} from 'lucide-react';
import './Navbar.css';

/**
 * Reusable Navbar component used across all pages.
 *
 * @param {Object} props
 * @param {'landing'|'app'} props.variant - 'landing' shows scroll-based nav links & search pill.
 *                                           'app' shows a simpler bar with logo + right actions.
 * @param {Function} [props.onSearchOpen] - Callback to open the search modal (landing page only).
 */
const Navbar = ({ variant = 'app', onSearchOpen }) => {
  const { user, logout, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const profileBtnRef = useRef(null);

  // Close profile popover on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(e.target) &&
        profileBtnRef.current &&
        !profileBtnRef.current.contains(e.target)
      ) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close profile popover on route change
  useEffect(() => {
    setProfileOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    setProfileOpen(false);
    setMobileMenuOpen(false);
    logout();
    navigate('/login');
  };

  const handleScrollTo = (id) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleNav = (path) => {
    setMobileMenuOpen(false);
    setProfileOpen(false);
    navigate(path);
  };

  const dashboardPath = isAdmin ? '/admin' : '/dashboard';

  const navLinks = variant === 'landing' ? [
    { label: 'Study Modules', action: () => handleScrollTo('subjects') },
    { label: 'Practice Quiz', action: () => handleNav('/practice-quiz') },
    { label: 'Mock Interviews', action: () => handleNav('/mock-interview') },
  ] : [];

  return (
    <header
      className={`fixed top-6 inset-x-4 max-w-6xl mx-auto bg-white/70 dark:bg-[#09090b]/70 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-900/80 rounded-2xl md:rounded-full z-50 shadow-lg shadow-zinc-100/50 dark:shadow-none transition-all duration-300 ${mobileMenuOpen ? 'overflow-visible' : ''}`}
    >
      <div className="px-6 md:px-8 h-16 flex justify-between items-center">

        {/* Logo */}
        <div
          className="flex items-center space-x-2 cursor-pointer"
          onClick={() => navigate('/')}
        >
          <span className="text-xl sm:text-2xl font-black tracking-tight text-zinc-950 dark:text-white">
            InterviewQuest
          </span>
        </div>

        {/* Desktop Nav Links (landing variant only) */}
        {navLinks.length > 0 && (
          <nav className="hidden md:flex items-center space-x-8 text-base font-bold text-zinc-600 dark:text-zinc-400">
            {navLinks.map((link, idx) => (
              <button
                key={idx}
                onClick={link.action}
                className="hover:text-zinc-950 dark:hover:text-zinc-50 transition cursor-pointer"
              >
                {link.label}
              </button>
            ))}
          </nav>
        )}

        {/* Right Section */}
        <div className="hidden md:flex items-center space-x-4">

          {/* Search Pill (landing variant only) */}
          {variant === 'landing' && onSearchOpen && (
            <button
              onClick={onSearchOpen}
              className="flex items-center space-x-3 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full px-4 py-2 text-sm text-zinc-500 dark:text-zinc-400 w-44 justify-between hover:border-zinc-300 dark:hover:border-zinc-700 transition cursor-pointer"
            >
              <div className="flex items-center space-x-2">
                <Search className="w-4 h-4 text-zinc-400" />
                <span>Search</span>
              </div>
              <kbd className="bg-zinc-200 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-[10px] font-sans font-bold text-zinc-500">Ctrl K</kbd>
            </button>
          )}

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2.5 text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition cursor-pointer"
            title="Change Theme"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Auth Buttons or Profile Avatar */}
          {user ? (
            <div className="relative">
              <button
                ref={profileBtnRef}
                onClick={() => setProfileOpen(!profileOpen)}
                className="w-9 h-9 rounded-full bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center text-sm font-bold hover:ring-2 hover:ring-zinc-400 dark:hover:ring-zinc-600 transition cursor-pointer"
                title={user.username}
              >
                {user.username?.charAt(0).toUpperCase()}
              </button>

              {/* Profile Popover Dropdown */}
              {profileOpen && (
                <div
                  ref={profileRef}
                  className="profile-popover absolute right-0 top-[calc(100%+12px)] w-72 bg-white/95 dark:bg-[#0d0d11]/95 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl shadow-zinc-200/50 dark:shadow-black/40 overflow-hidden"
                >
                  {/* User Info Header */}
                  <div className="p-5 border-b border-zinc-100 dark:border-zinc-900">
                    <div className="flex items-center space-x-3">
                      <div className="w-11 h-11 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-lg font-extrabold shrink-0">
                        {user.username?.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-zinc-900 dark:text-white truncate">
                          {user.username}
                        </p>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                          {user.email}
                        </p>
                        <span className="inline-block mt-1 text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                          {user.role?.replace('ROLE_', '')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Links */}
                  <div className="p-2">
                    <button
                      onClick={() => handleNav('/profile')}
                      className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition cursor-pointer"
                    >
                      <User className="w-4 h-4 text-zinc-400" />
                      <span>View Full Profile</span>
                    </button>
                    <button
                      onClick={() => handleNav(dashboardPath)}
                      className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition cursor-pointer"
                    >
                      <LayoutDashboard className="w-4 h-4 text-zinc-400" />
                      <span>Go to Dashboard</span>
                    </button>
                  </div>

                  {/* Sign Out */}
                  <div className="p-2 pt-0 border-t border-zinc-100 dark:border-zinc-900 mt-0">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition cursor-pointer mt-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <button
                onClick={() => navigate('/register')}
                className="text-sm font-bold text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-50 px-3 py-2.5 transition cursor-pointer"
              >
                Sign Up
              </button>
              <button
                onClick={() => navigate('/login')}
                className="bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 text-sm font-bold px-5 py-2.5 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition cursor-pointer"
              >
                Log In
              </button>
            </>
          )}
        </div>

        {/* Mobile Actions */}
        <div className="flex md:hidden items-center space-x-2">
          {variant === 'landing' && onSearchOpen && (
            <button
              onClick={onSearchOpen}
              className="p-2.5 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition"
            >
              <Search className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={toggleTheme}
            className="p-2.5 text-zinc-500 dark:text-zinc-400 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition cursor-pointer"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2.5 text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Expanded */}
      {mobileMenuOpen && (
        <div className="md:hidden mobile-menu-animate bg-white/95 dark:bg-[#09090b]/95 border-t border-zinc-200 dark:border-zinc-900 px-6 py-6 space-y-4 transition-colors duration-300">

          {/* Nav Links for landing */}
          {navLinks.map((link, idx) => (
            <button
              key={idx}
              onClick={link.action}
              className="block w-full text-left text-base font-bold text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white py-2 cursor-pointer"
            >
              {link.label}
            </button>
          ))}

          {/* User-specific section */}
          <div className={`${navLinks.length > 0 ? 'pt-4 border-t border-zinc-200 dark:border-zinc-900' : ''} flex flex-col space-y-3`}>
            {user ? (
              <>
                {/* User Info in Mobile */}
                <div className="flex items-center space-x-3 pb-3 border-b border-zinc-200 dark:border-zinc-900">
                  <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-base font-extrabold">
                    {user.username?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-zinc-900 dark:text-white">{user.username}</p>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400">{user.email}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleNav('/profile')}
                  className="w-full text-left text-sm font-bold text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white py-2 cursor-pointer flex items-center space-x-2"
                >
                  <User className="w-4 h-4" />
                  <span>View Profile</span>
                </button>
                <button
                  onClick={() => handleNav(dashboardPath)}
                  className="w-full text-center py-3 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 rounded-lg text-sm font-bold cursor-pointer"
                >
                  Go to Dashboard
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-center py-3 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-lg text-sm font-bold cursor-pointer border border-red-200 dark:border-red-900/30"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleNav('/login')}
                  className="w-full text-center py-3 bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 rounded-lg text-sm font-bold cursor-pointer border border-zinc-300 dark:border-zinc-800"
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleNav('/register')}
                  className="w-full text-center py-3 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 rounded-lg text-sm font-bold cursor-pointer"
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
