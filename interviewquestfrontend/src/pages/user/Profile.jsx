import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import {
  Loader2, FileText, Eye, EyeOff, X, ExternalLink, Trash2,
  Save, Lock, User, KeyRound, CheckCircle2, AlertCircle, Shield, Mail
} from 'lucide-react';

const Profile = () => {
  const { user, isAdmin, updateUser, logout } = useAuth();
  const navigate = useNavigate();

  // Form states
  const [newName, setNewName] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // OTP states
  const [otpSent, setOtpSent] = useState(false);
  const [otpCooldown, setOtpCooldown] = useState(0);
  const [otpLoading, setOtpLoading] = useState(false);

  // Password visibility toggles
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Feedback states
  const [nameLoading, setNameLoading] = useState(false);
  const [nameSuccess, setNameSuccess] = useState('');
  const [nameError, setNameError] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwError, setPwError] = useState('');

  // Resume states (user only)
  const [resume, setResume] = useState(null);
  const [resumeLoading, setResumeLoading] = useState(false);
  const [resumeUploading, setResumeUploading] = useState(false);
  const [resumeError, setResumeError] = useState('');
  const [resumeSuccess, setResumeSuccess] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);

  // Delete account states
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Gemini BYOK states
  const [geminiKey, setGeminiKey] = useState('');
  const [hasGeminiKey, setHasGeminiKey] = useState(false);
  const [keyLoading, setKeyLoading] = useState(false);
  const [keySaving, setKeySaving] = useState(false);
  const [keySuccess, setKeySuccess] = useState('');
  const [keyError, setKeyError] = useState('');
  const [showGeminiKey, setShowGeminiKey] = useState(false);

  const getResumePdfUrl = (url) => {
    if (!url) return '';
    return url.toLowerCase().endsWith('.pdf') ? url : `${url}.pdf`;
  };

  // Initialize name field
  useEffect(() => {
    if (user?.username) {
      setNewName(user.username);
    }
  }, [user]);

  // Fetch resume and API key status on mount (for all roles)
  useEffect(() => {
    if (user) {
      fetchResume();
      fetchApiKeyStatus();
    }
  }, [user]);

  const fetchApiKeyStatus = async () => {
    try {
      setKeyLoading(true);
      const response = await API.get('/api/users/profile/api-key/status');
      setHasGeminiKey(response.data.hasKey);
    } catch (err) {
      console.error('Failed to fetch api key status', err);
    } finally {
      setKeyLoading(false);
    }
  };

  const handleSaveApiKey = async (e) => {
    e.preventDefault();
    if (!geminiKey.trim()) {
      setKeyError('API Key cannot be empty.');
      return;
    }
    try {
      setKeySaving(true);
      setKeyError('');
      setKeySuccess('');
      const response = await API.post('/api/users/profile/api-key', { apiKey: geminiKey.trim() });
      setHasGeminiKey(true);
      setGeminiKey('');
      setKeySuccess(response.data.message || 'API Key saved and verified successfully.');
    } catch (err) {
      setKeyError(err.response?.data?.error || 'Failed to save and validate API Key.');
    } finally {
      setKeySaving(false);
    }
  };

  const handleDeleteApiKey = async () => {
    if (!window.confirm('Are you sure you want to delete your registered Gemini API Key? Mock interviews and AI generation features will no longer function.')) return;
    try {
      setKeySaving(true);
      setKeyError('');
      setKeySuccess('');
      await API.delete('/api/users/profile/api-key');
      setHasGeminiKey(false);
      setKeySuccess('API Key deleted successfully.');
    } catch (err) {
      setKeyError('Failed to delete API Key.');
    } finally {
      setKeySaving(false);
    }
  };

  // OTP timer effect
  useEffect(() => {
    let timer;
    if (otpCooldown > 0) {
      timer = setTimeout(() => setOtpCooldown(otpCooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [otpCooldown]);

  const handleUpdateName = async (e) => {
    e.preventDefault();
    if (!newName.trim()) {
      setNameError('Name cannot be empty.');
      return;
    }
    if (newName.trim().length < 3) {
      setNameError('Name must be at least 3 characters.');
      return;
    }

    try {
      setNameLoading(true);
      setNameError('');
      setNameSuccess('');
      const response = await API.put('/api/users/profile', { name: newName.trim() });
      updateUser({ username: response.data.name || response.data.username });
      setNameSuccess('Name updated successfully!');
    } catch (err) {
      setNameError(err.response?.data?.message || 'Failed to update name.');
    } finally {
      setNameLoading(false);
    }
  };

  const handleSendOtp = async () => {
    try {
      setOtpLoading(true);
      setPwError('');
      setPwSuccess('');
      await API.post('/api/users/profile/send-password-otp');
      setPwSuccess('Verification code sent to your email.');
      setOtpSent(true);
      setOtpCooldown(60);
    } catch (err) {
      setPwError(err.response?.data?.message || 'Failed to send verification code.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!otp || !newPassword || !confirmPassword) {
      setPwError('Please fill in all password fields (including the verification code).');
      return;
    }
    if (newPassword.length < 6) {
      setPwError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError('New passwords do not match.');
      return;
    }

    try {
      setPwLoading(true);
      setPwError('');
      setPwSuccess('');
      await API.put('/api/users/profile/password', {
        otp,
        newPassword
      });
      setPwSuccess('Password changed successfully!');
      setOtp('');
      setNewPassword('');
      setConfirmPassword('');
      setOtpSent(false);
    } catch (err) {
      setPwError(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setPwLoading(false);
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setResumeError('File size exceeds the 2MB limit. Please choose a smaller PDF.');
      return;
    }
    if (file.type !== 'application/pdf') {
      setResumeError('Only PDF documents are allowed.');
      return;
    }

    try {
      setResumeError('');
      setResumeSuccess('');
      setResumeUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      const response = await API.post('/api/users/profile/resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResume(response.data);
      setResumeSuccess('Resume uploaded successfully!');
    } catch (err) {
      setResumeError(err.response?.data?.message || 'Failed to upload resume.');
    } finally {
      setResumeUploading(false);
    }
  };

  const handleResumeDelete = async () => {
    if (!window.confirm('Are you sure you want to permanently delete your resume?')) return;
    try {
      setResumeError('');
      setResumeSuccess('');
      setResumeLoading(true);
      await API.delete('/api/users/profile/resume');
      setResume(null);
      setResumeSuccess('Resume deleted successfully.');
    } catch (err) {
      setResumeError('Failed to delete resume.');
    } finally {
      setResumeLoading(false);
    }
  };

  const fetchResume = async () => {
    try {
      setResumeLoading(true);
      const response = await API.get('/api/users/profile/resume');
      setResume(response.data);
    } catch (err) {
      setResume(null);
    } finally {
      setResumeLoading(false);
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    if (deleteConfirmText !== 'DELETE') {
      setDeleteError("Please type 'DELETE' to confirm.");
      return;
    }

    try {
      setDeleteLoading(true);
      setDeleteError('');
      await API.delete('/api/users/profile');
      setDeleteModalOpen(false);
      await logout();
      navigate('/');
    } catch (err) {
      setDeleteError(err.response?.data?.message || 'Failed to delete account. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 relative overflow-hidden flex flex-col transition-colors duration-300">
      <Navbar variant="app" />

      <div className="max-w-5xl mx-auto w-full z-10 relative flex-grow flex flex-col pt-28 px-6 pb-12">
        {/* Page Title */}
        <div className="mb-8 border-b border-zinc-200 dark:border-zinc-900 pb-5">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 dark:text-white flex items-center">
            <User className="w-6 h-6 text-indigo-600 dark:text-indigo-400 mr-3 shrink-0" />
            My Profile
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Manage your account credentials, resume, and AI configuration
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ═══ LEFT COLUMN: User Info Card ═══ */}
          <div className="lg:col-span-1">
            <div className="bg-zinc-50 dark:bg-[#0d0d11] border border-zinc-200 dark:border-zinc-900 rounded-2xl p-6 shadow-sm space-y-6 sticky top-28">
              <div className="flex flex-col items-center text-center pb-5 border-b border-zinc-200 dark:border-zinc-800">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-3xl font-extrabold mb-4 shadow-lg shadow-indigo-500/20">
                  {user?.username?.charAt(0).toUpperCase()}
                </div>
                <h3 className="font-bold text-zinc-900 dark:text-zinc-200 text-base">{user?.username}</h3>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 break-all">{user?.email}</p>
                <span className="inline-flex items-center mt-3 text-[9px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                  <Shield className="w-3 h-3 mr-1" />
                  {user?.role?.replace('ROLE_', '')} Account
                </span>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <span className="text-zinc-500 dark:text-zinc-400 block font-semibold uppercase text-[10px] tracking-wider">Email Address</span>
                  <span className="text-zinc-800 dark:text-zinc-300 font-medium break-all mt-1 block">{user?.email}</span>
                </div>
                <div>
                  <span className="text-zinc-500 dark:text-zinc-400 block font-semibold uppercase text-[10px] tracking-wider">Role</span>
                  <span className="text-zinc-800 dark:text-zinc-300 font-medium mt-1 block">{user?.role?.replace('ROLE_', '')}</span>
                </div>
              </div>

              {!isAdmin && (
                <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 text-xs">
                  <span className="text-red-500 dark:text-red-400 block font-semibold uppercase text-[10px] tracking-wider mb-2">Danger Zone</span>
                  <button
                    type="button"
                    onClick={() => setDeleteModalOpen(true)}
                    className="w-full flex items-center justify-center space-x-2 bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/30 py-2.5 rounded-xl transition text-xs font-semibold cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Account</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ═══ RIGHT COLUMN: Content Container ═══ */}
          <div className="lg:col-span-2 space-y-6">
            {!isAdmin ? (
              <>
                {/* Top Grid: Edit Name & Professional Resume Side-by-Side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Edit Name Form */}
                  <div className="bg-zinc-50 dark:bg-[#0d0d11] border border-zinc-200 dark:border-zinc-900 rounded-2xl p-6 shadow-sm flex flex-col justify-between h-full">
                    <div>
                      <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200 flex items-center mb-1">
                        <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mr-2" />
                        Edit Name
                      </h3>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed mb-5">
                        Update your display name. This will be visible across the platform.
                      </p>

                      {nameSuccess && (
                        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs text-center mb-4 flex items-center justify-center space-x-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{nameSuccess}</span>
                        </div>
                      )}
                      {nameError && (
                        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs text-center mb-4 flex items-center justify-center space-x-1.5">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>{nameError}</span>
                        </div>
                      )}
                    </div>

                    <form onSubmit={handleUpdateName} className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-black text-zinc-500 mb-1.5 uppercase">Name</label>
                        <input
                          type="text"
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          placeholder="Enter new name"
                          className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 text-xs text-zinc-900 dark:text-zinc-100"
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={nameLoading}
                        className="w-full py-2.5 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 text-xs font-bold rounded-xl transition cursor-pointer shadow-sm flex justify-center items-center border-none hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50"
                      >
                        {nameLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                          <><Save className="w-3.5 h-3.5 mr-1.5" /> Save Name</>
                        )}
                      </button>
                    </form>
                  </div>

                  {/* Professional Resume */}
                  <div className="bg-zinc-50 dark:bg-[#0d0d11] border border-zinc-200 dark:border-zinc-900 rounded-2xl p-6 shadow-sm flex flex-col justify-between h-full">
                    <div>
                      <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200 flex items-center mb-1">
                        <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mr-2" />
                        Professional Resume
                      </h3>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed mb-6">
                        Upload your resume in PDF format (maximum size 2MB).
                      </p>

                      {resumeSuccess && (
                        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs text-center mb-4 flex items-center justify-center space-x-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{resumeSuccess}</span>
                        </div>
                      )}
                      {resumeError && (
                        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs text-center mb-4 flex items-center justify-center space-x-1.5">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>{resumeError}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      {resumeLoading ? (
                        <div className="flex flex-col items-center justify-center py-6 text-zinc-500">
                          <Loader2 className="w-6 h-6 animate-spin text-zinc-400 mb-2" />
                          <p className="text-[10px]">Fetching resume status...</p>
                        </div>
                      ) : resume ? (
                        /* Resume Display Card */
                        <div className="bg-white dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-900 rounded-2xl p-4 flex flex-col justify-between gap-4">
                          <div className="flex items-center space-x-3">
                            <div className="p-2.5 bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 rounded-lg border border-zinc-200 dark:border-zinc-800 shrink-0">
                              <FileText className="w-5 h-5" />
                            </div>
                            <div className="min-w-0 flex-grow">
                              <h4 className="font-bold text-zinc-900 dark:text-zinc-300 text-[11px] truncate">Verified PDF Document</h4>
                              <p className="text-[9px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                                Uploaded on: {new Date(resume.uploadedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 justify-end w-full">
                            <button
                              type="button"
                              onClick={() => setPreviewOpen(true)}
                              className="flex items-center space-x-1 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 px-2.5 py-1.5 rounded-lg transition text-[11px] font-semibold cursor-pointer"
                            >
                              <Eye className="w-3 h-3" />
                              <span>Preview</span>
                            </button>
                            <button
                              type="button"
                              onClick={handleResumeDelete}
                              className="flex items-center space-x-1 bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/30 px-2.5 py-1.5 rounded-lg transition text-[11px] font-semibold cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Dropzone for upload */
                        <label className={`border border-dashed border-zinc-300 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700 bg-white dark:bg-zinc-950/20 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition relative group min-h-[140px] ${resumeUploading ? 'pointer-events-none opacity-50' : ''}`}>
                          <input
                            type="file"
                            accept=".pdf"
                            onChange={handleResumeUpload}
                            className="hidden"
                          />
                          {resumeUploading ? (
                            <>
                              <Loader2 className="w-6 h-6 animate-spin text-zinc-400 mb-2" />
                              <p className="text-[11px] text-zinc-800 dark:text-zinc-300 font-semibold">Uploading PDF...</p>
                            </>
                          ) : (
                            <>
                              <FileText className="w-6 h-6 text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition mb-2" />
                              <p className="text-[11px] text-zinc-800 dark:text-zinc-300 font-semibold font-sans">Upload Resume</p>
                              <p className="text-[9px] text-zinc-500 dark:text-zinc-400 mt-1 max-w-[200px] leading-relaxed">
                                Please upload a PDF document (Max size: 2MB).
                              </p>
                              <span className="mt-3 text-[9px] bg-zinc-950 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 font-bold px-3 py-1.5 rounded-lg shadow-sm transition">
                                Select PDF
                              </span>
                            </>
                          )}
                        </label>
                      )}
                    </div>
                  </div>
                </div>

                {/* Gemini API Key Configuration Card */}
                <div className="bg-zinc-50 dark:bg-[#0d0d11] border border-zinc-200 dark:border-zinc-900 rounded-2xl p-6 shadow-sm">
                  <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200 flex items-center mb-1">
                    <KeyRound className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mr-2" />
                    Gemini API Configuration (BYOK)
                  </h3>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed mb-5">
                    Configure your personal Gemini API Key. Keys are encrypted at-rest using AES-256-GCM and never exposed to the client browser.
                  </p>

                  {keySuccess && (
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs text-center mb-4 flex items-center justify-center space-x-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{keySuccess}</span>
                    </div>
                  )}
                  {keyError && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs text-center mb-4 flex items-center justify-center space-x-1.5">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{keyError}</span>
                    </div>
                  )}

                  {keyLoading ? (
                    <div className="flex items-center justify-center py-6 text-zinc-500">
                      <Loader2 className="w-6 h-6 animate-spin text-zinc-400 mb-2" />
                    </div>
                  ) : hasGeminiKey ? (
                    <div className="bg-white dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-900 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                      <div className="flex items-center space-x-3 w-full sm:w-auto">
                        <div className="p-2.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg border border-emerald-500/20 shrink-0">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-zinc-900 dark:text-zinc-300 text-[11px]">API Key Active</h4>
                          <p className="text-[9px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                            Encrypted at-rest. Ready for real-time interviews.
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleDeleteApiKey}
                        disabled={keySaving}
                        className="w-full sm:w-auto flex items-center justify-center space-x-1 bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/30 px-3.5 py-2.5 rounded-xl transition text-[11px] font-semibold cursor-pointer disabled:opacity-50"
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1" />
                        <span>Delete Key</span>
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSaveApiKey} className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-black text-zinc-500 mb-1.5 uppercase">Gemini API Key</label>
                        <div className="relative">
                          <input
                            type={showGeminiKey ? 'text' : 'password'}
                            value={geminiKey}
                            onChange={(e) => setGeminiKey(e.target.value)}
                            placeholder="AIzaSy..."
                            className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-4 pr-11 py-3 focus:outline-none focus:border-indigo-500 text-xs text-zinc-900 dark:text-zinc-100 font-mono"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowGeminiKey(!showGeminiKey)}
                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 bg-transparent border-none cursor-pointer"
                          >
                            {showGeminiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        <p className="text-[10px] text-zinc-500 mt-1.5 leading-relaxed">
                          Get a free API key from the <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 underline font-semibold">Google AI Studio</a>.
                        </p>
                      </div>
                      <button
                        type="submit"
                        disabled={keySaving}
                        className="w-full py-2.5 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 text-xs font-bold rounded-xl transition cursor-pointer shadow-sm flex justify-center items-center border-none hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50"
                      >
                        {keySaving ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                          <><Save className="w-3.5 h-3.5 mr-1.5" /> Save & Verify Key</>
                        )}
                      </button>
                    </form>
                  )}
                </div>

                {/* Change Password Form (Full Width for Users) */}
                <div className="bg-zinc-50 dark:bg-[#0d0d11] border border-zinc-200 dark:border-zinc-900 rounded-2xl p-6 shadow-sm">
                  <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200 flex items-center mb-1">
                    <KeyRound className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mr-2" />
                    Change Password
                  </h3>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed mb-5">
                    Verify your email and set a new password. Minimum 6 characters.
                  </p>

                  {user?.isGoogleUser && (
                    <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs mb-4 flex items-start space-x-2">
                      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                      <div>
                        <span className="font-bold">Google Signed-in User:</span> You signed up with your Google account. You don't have a password yet, but you can set one here after verifying your email.
                      </div>
                    </div>
                  )}

                  {pwSuccess && (
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs text-center mb-4 flex items-center justify-center space-x-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{pwSuccess}</span>
                    </div>
                  )}
                  {pwError && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs text-center mb-4 flex items-center justify-center space-x-1.5">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{pwError}</span>
                    </div>
                  )}

                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-zinc-500 mb-1.5 uppercase">New Password</label>
                        <div className="relative">
                          <input
                            type={showNewPassword ? 'text' : 'password'}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-4 pr-11 py-3 focus:outline-none focus:border-indigo-500 text-xs text-zinc-900 dark:text-zinc-100"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 bg-transparent border-none cursor-pointer"
                          >
                            {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-zinc-500 mb-1.5 uppercase">Confirm Password</label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-4 pr-11 py-3 focus:outline-none focus:border-indigo-500 text-xs text-zinc-900 dark:text-zinc-100"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 bg-transparent border-none cursor-pointer"
                          >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {newPassword && confirmPassword && (
                      <div className="space-y-4 pt-4 border-t border-zinc-150 dark:border-zinc-900 transition-all duration-300">
                        {newPassword.length < 6 ? (
                          <p className="text-[10px] text-red-500 flex items-center">
                            <AlertCircle className="w-3.5 h-3.5 mr-1" />
                            Password must be at least 6 characters.
                          </p>
                        ) : newPassword !== confirmPassword ? (
                          <p className="text-[10px] text-red-500 flex items-center">
                            <AlertCircle className="w-3.5 h-3.5 mr-1" />
                            Passwords do not match.
                          </p>
                        ) : (
                          <>
                            <div>
                              <label className="block text-[10px] font-black text-zinc-500 mb-1.5 uppercase">Email Verification</label>
                              <div className="flex gap-2">
                                <div className="relative flex-grow">
                                  <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    placeholder={otpSent ? "Enter 6-digit code" : "Request code first"}
                                    disabled={!otpSent}
                                    className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 text-xs text-zinc-900 dark:text-zinc-100 disabled:opacity-60 disabled:cursor-not-allowed"
                                    required
                                  />
                                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-zinc-400">
                                    <Mail className="w-4 h-4" />
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={handleSendOtp}
                                  disabled={otpLoading || otpCooldown > 0}
                                  className="px-4 py-3 bg-zinc-900 dark:bg-zinc-850 hover:bg-zinc-800 dark:hover:bg-zinc-750 text-white text-xs font-bold rounded-xl transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0 border-none flex items-center justify-center min-w-[110px]"
                                >
                                  {otpLoading ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  ) : otpCooldown > 0 ? (
                                    `Resend (${otpCooldown}s)`
                                  ) : otpSent ? (
                                    "Resend Code"
                                  ) : (
                                    "Send Code"
                                  )}
                                </button>
                              </div>
                              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1">
                                Verification code will be sent to your registered email: <strong>{user?.email}</strong>
                              </p>
                            </div>

                            <button
                              type="submit"
                              disabled={pwLoading || !otp}
                              className="w-full py-2.5 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 text-xs font-bold rounded-xl transition cursor-pointer shadow-sm flex justify-center items-center border-none hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50"
                            >
                              {pwLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                                <><Lock className="w-3.5 h-3.5 mr-1.5" /> Update Password</>
                              )}
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </form>
                </div>
              </>
            ) : (
              <>
                {/* Admin View: Stacked Form Panels */}

                {/* Top Grid: Edit Name & Professional Resume Side-by-Side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Edit Name Form */}
                  <div className="bg-zinc-50 dark:bg-[#0d0d11] border border-zinc-200 dark:border-zinc-900 rounded-2xl p-6 shadow-sm flex flex-col justify-between h-full">
                    <div>
                      <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200 flex items-center mb-1">
                        <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mr-2" />
                        Edit Name
                      </h3>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed mb-5">
                        Update your display name. This will be visible across the platform.
                      </p>

                      {nameSuccess && (
                        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs text-center mb-4 flex items-center justify-center space-x-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{nameSuccess}</span>
                        </div>
                      )}
                      {nameError && (
                        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs text-center mb-4 flex items-center justify-center space-x-1.5">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>{nameError}</span>
                        </div>
                      )}
                    </div>

                    <form onSubmit={handleUpdateName} className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-black text-zinc-500 mb-1.5 uppercase">Name</label>
                        <input
                          type="text"
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          placeholder="Enter new name"
                          className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 text-xs text-zinc-900 dark:text-zinc-100"
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={nameLoading}
                        className="w-full py-2.5 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 text-xs font-bold rounded-xl transition cursor-pointer shadow-sm flex justify-center items-center border-none hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50"
                      >
                        {nameLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                          <><Save className="w-3.5 h-3.5 mr-1.5" /> Save Name</>
                        )}
                      </button>
                    </form>
                  </div>

                  {/* Professional Resume (Admin) */}
                  <div className="bg-zinc-50 dark:bg-[#0d0d11] border border-zinc-200 dark:border-zinc-900 rounded-2xl p-6 shadow-sm flex flex-col justify-between h-full">
                    <div>
                      <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200 flex items-center mb-1">
                        <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mr-2" />
                        Professional Resume
                      </h3>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed mb-6">
                        Upload your resume in PDF format (maximum size 2MB).
                      </p>

                      {resumeSuccess && (
                        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs text-center mb-4 flex items-center justify-center space-x-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{resumeSuccess}</span>
                        </div>
                      )}
                      {resumeError && (
                        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs text-center mb-4 flex items-center justify-center space-x-1.5">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>{resumeError}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      {resumeLoading ? (
                        <div className="flex flex-col items-center justify-center py-6 text-zinc-500">
                          <Loader2 className="w-6 h-6 animate-spin text-zinc-400 mb-2" />
                          <p className="text-[10px]">Fetching resume status...</p>
                        </div>
                      ) : resume ? (
                        <div className="bg-white dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-900 rounded-2xl p-4 flex flex-col justify-between gap-4">
                          <div className="flex items-center space-x-3">
                            <div className="p-2.5 bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 rounded-lg border border-zinc-200 dark:border-zinc-800 shrink-0">
                              <FileText className="w-5 h-5" />
                            </div>
                            <div className="min-w-0 flex-grow">
                              <h4 className="font-bold text-zinc-900 dark:text-zinc-300 text-[11px] truncate">Verified PDF Document</h4>
                              <p className="text-[9px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                                Uploaded on: {new Date(resume.uploadedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 justify-end w-full">
                            <button
                              type="button"
                              onClick={() => setPreviewOpen(true)}
                              className="flex items-center space-x-1 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 px-2.5 py-1.5 rounded-lg transition text-[11px] font-semibold cursor-pointer"
                            >
                              <Eye className="w-3 h-3" />
                              <span>Preview</span>
                            </button>
                            <button
                              type="button"
                              onClick={handleResumeDelete}
                              className="flex items-center space-x-1 bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/30 px-2.5 py-1.5 rounded-lg transition text-[11px] font-semibold cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <label className={`border border-dashed border-zinc-300 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700 bg-white dark:bg-zinc-950/20 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition relative group min-h-[140px] ${resumeUploading ? 'pointer-events-none opacity-50' : ''}`}>
                          <input
                            type="file"
                            accept=".pdf"
                            onChange={handleResumeUpload}
                            className="hidden"
                          />
                          {resumeUploading ? (
                            <>
                              <Loader2 className="w-6 h-6 animate-spin text-zinc-400 mb-2" />
                              <p className="text-[11px] text-zinc-800 dark:text-zinc-300 font-semibold">Uploading PDF...</p>
                            </>
                          ) : (
                            <>
                              <FileText className="w-6 h-6 text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition mb-2" />
                              <p className="text-[11px] text-zinc-800 dark:text-zinc-300 font-semibold font-sans">Upload Resume</p>
                              <p className="text-[9px] text-zinc-500 dark:text-zinc-400 mt-1 max-w-[200px] leading-relaxed">
                                Please upload a PDF document (Max size: 2MB).
                              </p>
                              <span className="mt-3 text-[9px] bg-zinc-950 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 font-bold px-3 py-1.5 rounded-lg shadow-sm transition">
                                Select PDF
                              </span>
                            </>
                          )}
                        </label>
                      )}
                    </div>
                  </div>
                </div>

                {/* Gemini API Key Configuration Card (Admin) */}
                <div className="bg-zinc-50 dark:bg-[#0d0d11] border border-zinc-200 dark:border-zinc-900 rounded-2xl p-6 shadow-sm">
                  <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200 flex items-center mb-1">
                    <KeyRound className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mr-2" />
                    Gemini API Configuration (BYOK)
                  </h3>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed mb-5">
                    Configure your personal Gemini API Key to access Mock Interview and AI generation features. Keys are encrypted at-rest using AES-256-GCM.
                  </p>

                  {keySuccess && (
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs text-center mb-4 flex items-center justify-center space-x-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{keySuccess}</span>
                    </div>
                  )}
                  {keyError && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs text-center mb-4 flex items-center justify-center space-x-1.5">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{keyError}</span>
                    </div>
                  )}

                  {keyLoading ? (
                    <div className="flex items-center justify-center py-6 text-zinc-500">
                      <Loader2 className="w-6 h-6 animate-spin text-zinc-400 mb-2" />
                    </div>
                  ) : hasGeminiKey ? (
                    <div className="bg-white dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-900 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                      <div className="flex items-center space-x-3 w-full sm:w-auto">
                        <div className="p-2.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg border border-emerald-500/20 shrink-0">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-zinc-900 dark:text-zinc-300 text-[11px]">API Key Active</h4>
                          <p className="text-[9px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                            Encrypted at-rest. Ready for real-time interviews.
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleDeleteApiKey}
                        disabled={keySaving}
                        className="w-full sm:w-auto flex items-center justify-center space-x-1 bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/30 px-3.5 py-2.5 rounded-xl transition text-[11px] font-semibold cursor-pointer disabled:opacity-50"
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1" />
                        <span>Delete Key</span>
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSaveApiKey} className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-black text-zinc-500 mb-1.5 uppercase">Gemini API Key</label>
                        <div className="relative">
                          <input
                            type={showGeminiKey ? 'text' : 'password'}
                            value={geminiKey}
                            onChange={(e) => setGeminiKey(e.target.value)}
                            placeholder="AIzaSy..."
                            className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-4 pr-11 py-3 focus:outline-none focus:border-indigo-500 text-xs text-zinc-900 dark:text-zinc-100 font-mono"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowGeminiKey(!showGeminiKey)}
                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 bg-transparent border-none cursor-pointer"
                          >
                            {showGeminiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        <p className="text-[10px] text-zinc-500 mt-1.5 leading-relaxed">
                          Get a free API key from the <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 underline font-semibold">Google AI Studio</a>.
                        </p>
                      </div>
                      <button
                        type="submit"
                        disabled={keySaving}
                        className="w-full py-2.5 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 text-xs font-bold rounded-xl transition cursor-pointer shadow-sm flex justify-center items-center border-none hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50"
                      >
                        {keySaving ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                          <><Save className="w-3.5 h-3.5 mr-1.5" /> Save & Verify Key</>
                        )}
                      </button>
                    </form>
                  )}
                </div>

                {/* Change Password Form */}
                <div className="bg-zinc-50 dark:bg-[#0d0d11] border border-zinc-200 dark:border-zinc-900 rounded-2xl p-6 shadow-sm">
                  <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200 flex items-center mb-1">
                    <KeyRound className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mr-2" />
                    Change Password
                  </h3>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed mb-5">
                    Verify your email and set a new password. Minimum 6 characters.
                  </p>

                  {pwSuccess && (
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs text-center mb-4 flex items-center justify-center space-x-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{pwSuccess}</span>
                    </div>
                  )}
                  {pwError && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs text-center mb-4 flex items-center justify-center space-x-1.5">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{pwError}</span>
                    </div>
                  )}

                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-zinc-500 mb-1.5 uppercase">New Password</label>
                        <div className="relative">
                          <input
                            type={showNewPassword ? 'text' : 'password'}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-4 pr-11 py-3 focus:outline-none focus:border-indigo-500 text-xs text-zinc-900 dark:text-zinc-100"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 bg-transparent border-none cursor-pointer"
                          >
                            {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-zinc-500 mb-1.5 uppercase">Confirm Password</label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-4 pr-11 py-3 focus:outline-none focus:border-indigo-500 text-xs text-zinc-900 dark:text-zinc-100"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 bg-transparent border-none cursor-pointer"
                          >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {newPassword && confirmPassword && (
                      <div className="space-y-4 pt-4 border-t border-zinc-150 dark:border-zinc-900 transition-all duration-300">
                        {newPassword.length < 6 ? (
                          <p className="text-[10px] text-red-500 flex items-center">
                            <AlertCircle className="w-3.5 h-3.5 mr-1" />
                            Password must be at least 6 characters.
                          </p>
                        ) : newPassword !== confirmPassword ? (
                          <p className="text-[10px] text-red-500 flex items-center">
                            <AlertCircle className="w-3.5 h-3.5 mr-1" />
                            Passwords do not match.
                          </p>
                        ) : (
                          <>
                            <div>
                              <label className="block text-[10px] font-black text-zinc-500 mb-1.5 uppercase">Email Verification</label>
                              <div className="flex gap-2">
                                <div className="relative flex-grow">
                                  <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    placeholder={otpSent ? "Enter 6-digit code" : "Request code first"}
                                    disabled={!otpSent}
                                    className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 text-xs text-zinc-900 dark:text-zinc-100 disabled:opacity-60 disabled:cursor-not-allowed"
                                    required
                                  />
                                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-zinc-400">
                                    <Mail className="w-4 h-4" />
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={handleSendOtp}
                                  disabled={otpLoading || otpCooldown > 0}
                                  className="px-4 py-3 bg-zinc-900 dark:bg-zinc-850 hover:bg-zinc-800 dark:hover:bg-zinc-750 text-white text-xs font-bold rounded-xl transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0 border-none flex items-center justify-center min-w-[110px]"
                                >
                                  {otpLoading ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  ) : otpCooldown > 0 ? (
                                    `Resend (${otpCooldown}s)`
                                  ) : otpSent ? (
                                    "Resend Code"
                                  ) : (
                                    "Send Code"
                                  )}
                                </button>
                              </div>
                              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1">
                                Verification code will be sent to your registered email: <strong>{user?.email}</strong>
                              </p>
                            </div>

                            <button
                              type="submit"
                              disabled={pwLoading || !otp}
                              className="w-full py-2.5 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 text-xs font-bold rounded-xl transition cursor-pointer shadow-sm flex justify-center items-center border-none hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50"
                            >
                              {pwLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                                <><Lock className="w-3.5 h-3.5 mr-1.5" /> Update Password</>
                              )}
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </form>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* PDF PREVIEW MODAL */}
      {previewOpen && resume && (
        <div className="fixed inset-0 bg-zinc-950/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl h-[90vh] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 relative shadow-2xl flex flex-col">
            <button
              onClick={() => setPreviewOpen(false)}
              className="absolute top-4 right-4 p-2 text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:white rounded-lg transition cursor-pointer bg-transparent border-none"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="mb-4 flex justify-between items-center pr-8">
              <div>
                <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">Resume Preview</h3>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400">Verified Cloudinary Delivery URL</p>
              </div>
              <a
                href={getResumePdfUrl(resume.resumeUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1.5 bg-zinc-950 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 text-xs font-bold px-4 py-2 rounded-xl transition shadow-sm cursor-pointer no-underline"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open in New Tab</span>
              </a>
            </div>

            <div className="flex-grow rounded-2xl overflow-hidden bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 relative">
              <iframe
                src={getResumePdfUrl(resume.resumeUrl)}
                title="Resume PDF Preview"
                className="w-full h-full border-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* DELETE ACCOUNT CONFIRMATION MODAL */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 relative shadow-2xl space-y-5">
            <button
              onClick={() => {
                setDeleteModalOpen(false);
                setDeleteConfirmText('');
                setDeleteError('');
              }}
              className="absolute top-4 right-4 p-2 text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:white bg-transparent border-none rounded-lg transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center space-y-3">
              <div className="mx-auto w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/30 text-red-600 dark:text-red-400 flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-zinc-950 dark:text-white">Delete Account Permanently?</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Warning: This action is <strong>dangerous</strong> and <strong>cannot be undone</strong>.
                Deleting your account will permanently wipe your profile, settings, uploaded resumes,
                mock interviews, assessment history, and all other related data from our servers.
              </p>
            </div>

            {deleteError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs text-center flex items-center justify-center space-x-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{deleteError}</span>
              </div>
            )}

            <form onSubmit={handleDeleteAccount} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-wider">
                  Type <span className="text-red-600 dark:text-red-400 font-black">DELETE</span> to confirm
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="Type DELETE"
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 focus:outline-none focus:border-red-500 text-xs text-zinc-900 dark:text-zinc-100"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setDeleteModalOpen(false);
                    setDeleteConfirmText('');
                    setDeleteError('');
                  }}
                  className="flex-1 py-2.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-750 text-zinc-700 dark:text-zinc-300 text-xs font-bold rounded-xl transition cursor-pointer border-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={deleteConfirmText !== 'DELETE' || deleteLoading}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-sm border-none flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleteLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                      Delete Permanently
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;