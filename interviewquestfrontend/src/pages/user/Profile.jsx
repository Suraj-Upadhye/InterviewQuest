import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import {
  Loader2, FileText, Eye, X, ExternalLink, Trash2,
  Save, Lock, User, KeyRound, CheckCircle2, AlertCircle, Shield
} from 'lucide-react';

const Profile = () => {
  const { user, isAdmin, updateUser } = useAuth();
  const navigate = useNavigate();

  // Form states
  const [newName, setNewName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Password visibility toggles
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
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

  // Fetch resume on mount (user only)
  useEffect(() => {
    if (!isAdmin) {
      fetchResume();
    }
  }, [isAdmin]);

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

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPwError('Please fill in all password fields.');
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
        currentPassword,
        newPassword
      });
      setPwSuccess('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
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
            Manage your account credentials{!isAdmin && ', resume'} and preferences
          </p>
        </div>

        <div className={`grid grid-cols-1 ${isAdmin ? 'lg:grid-cols-3' : 'lg:grid-cols-4'} gap-6`}>

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
                  <span className="text-zinc-500 dark:text-zinc-450 block font-semibold uppercase text-[10px] tracking-wider">Email Address</span>
                  <span className="text-zinc-800 dark:text-zinc-300 font-medium break-all mt-1 block">{user?.email}</span>
                </div>
                <div>
                  <span className="text-zinc-500 dark:text-zinc-450 block font-semibold uppercase text-[10px] tracking-wider">Role</span>
                  <span className="text-zinc-800 dark:text-zinc-300 font-medium mt-1 block">{user?.role?.replace('ROLE_', '')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ═══ CENTER COLUMN: Edit Forms ═══ */}
          <div className={`${isAdmin ? 'lg:col-span-2' : 'lg:col-span-1'} space-y-6`}>

            {/* Edit Name Form */}
            <div className="bg-zinc-50 dark:bg-[#0d0d11] border border-zinc-200 dark:border-zinc-900 rounded-2xl p-6 shadow-sm">
              <h3 className="text-base font-bold text-zinc-850 dark:text-zinc-200 flex items-center mb-1">
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
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-650 dark:text-red-450 text-xs text-center mb-4 flex items-center justify-center space-x-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{nameError}</span>
                </div>
              )}

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
                  className="w-full py-2.5 bg-zinc-955 dark:bg-white text-white dark:text-zinc-955 text-xs font-bold rounded-xl transition cursor-pointer shadow-sm flex justify-center items-center border-none hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50"
                >
                  {nameLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                    <><Save className="w-3.5 h-3.5 mr-1.5" /> Save Name</>
                  )}
                </button>
              </form>
            </div>

            {/* Change Password Form */}
            <div className="bg-zinc-50 dark:bg-[#0d0d11] border border-zinc-200 dark:border-zinc-900 rounded-2xl p-6 shadow-sm">
              <h3 className="text-base font-bold text-zinc-850 dark:text-zinc-200 flex items-center mb-1">
                <KeyRound className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mr-2" />
                Change Password
              </h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed mb-5">
                Enter your current password and set a new one. Minimum 6 characters.
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
                <div>
                  <label className="block text-[10px] font-black text-zinc-550 mb-1.5 uppercase">Current Password</label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-4 pr-11 py-3 focus:outline-none focus:border-indigo-500 text-xs text-zinc-900 dark:text-zinc-100"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-405 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 bg-transparent border-none cursor-pointer"
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-zinc-550 mb-1.5 uppercase">New Password</label>
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
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-405 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 bg-transparent border-none cursor-pointer"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-zinc-550 mb-1.5 uppercase">Confirm Password</label>
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
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-405 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 bg-transparent border-none cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={pwLoading}
                  className="w-full py-2.5 bg-zinc-950 dark:bg-white text-white dark:text-zinc-955 text-xs font-bold rounded-xl transition cursor-pointer shadow-sm flex justify-center items-center border-none hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50"
                >
                  {pwLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                    <><Lock className="w-3.5 h-3.5 mr-1.5" /> Update Password</>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* ═══ RIGHT COLUMN: Resume Management (User Only) ═══ */}
          {!isAdmin && (
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-zinc-50 dark:bg-[#0d0d11] border border-zinc-200 dark:border-zinc-900 rounded-2xl p-6 shadow-sm">
                <h3 className="text-base font-bold text-zinc-850 dark:text-zinc-200 flex items-center mb-1">
                  <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mr-2" />
                  Professional Resume
                </h3>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed mb-6">
                  Upload your resume in PDF format (maximum size 2MB). Your resume will be used to calibrate mock interview questions and assess technical competency.
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

                {resumeLoading ? (
                  <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
                    <Loader2 className="w-8 h-8 animate-spin text-zinc-400 mb-2" />
                    <p className="text-xs">Fetching resume status...</p>
                  </div>
                ) : resume ? (
                  /* Resume Display Card */
                  <div className="bg-white dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-900 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center space-x-3.5">
                      <div className="p-3 bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 rounded-xl border border-zinc-200 dark:border-zinc-800">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-zinc-900 dark:text-zinc-300 text-xs">Verified PDF Document</h4>
                        <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1">
                          Uploaded on: {new Date(resume.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                      <button
                        onClick={() => setPreviewOpen(true)}
                        className="flex items-center space-x-1 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 px-3 py-2 rounded-xl transition text-xs font-semibold cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Preview</span>
                      </button>
                      <button
                        onClick={handleResumeDelete}
                        className="flex items-center space-x-1 bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/30 px-3 py-2 rounded-xl transition text-xs font-semibold cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Dropzone for upload */
                  <label className={`border border-dashed border-zinc-300 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700 bg-white dark:bg-zinc-950/20 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition relative group min-h-[160px] ${
                    resumeUploading ? 'pointer-events-none opacity-50' : ''
                  }`}>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleResumeUpload}
                      className="hidden"
                    />
                    {resumeUploading ? (
                      <>
                        <Loader2 className="w-8 h-8 animate-spin text-zinc-400 mb-3" />
                        <p className="text-xs text-zinc-800 dark:text-zinc-300 font-semibold">Uploading PDF document...</p>
                        <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1">Contacting secure servers</p>
                      </>
                    ) : (
                      <>
                        <FileText className="w-8 h-8 text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition mb-3" />
                        <p className="text-xs text-zinc-800 dark:text-zinc-300 font-semibold">Upload Your Resume</p>
                        <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1 max-w-[280px] leading-relaxed">
                          Please upload a PDF document representing your educational and technical achievements (Max size: 2MB).
                        </p>
                        <span className="mt-3 text-[10px] bg-zinc-950 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 font-bold px-4 py-2 rounded-xl shadow-sm transition">
                          Select PDF File
                        </span>
                      </>
                    )}
                  </label>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* PDF PREVIEW MODAL */}
      {previewOpen && resume && (
        <div className="fixed inset-0 bg-zinc-950/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl h-[90vh] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 relative shadow-2xl flex flex-col">
            <button
              onClick={() => setPreviewOpen(false)}
              className="absolute top-4 right-4 p-2 text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white rounded-lg transition cursor-pointer"
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
                className="flex items-center space-x-1.5 bg-zinc-950 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 text-xs font-bold px-4 py-2 rounded-xl transition shadow-sm cursor-pointer"
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
    </div>
  );
};

export default Profile;
