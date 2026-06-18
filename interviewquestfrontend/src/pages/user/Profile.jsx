import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { 
  ArrowLeft, Trash2, Loader2, FileText, Eye, X, ExternalLink 
} from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Resume states
  const [resume, setResume] = useState(null);
  const [resumeLoading, setResumeLoading] = useState(false);
  const [resumeUploading, setResumeUploading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const getResumePdfUrl = (url) => {
    if (!url) return '';
    return url.toLowerCase().endsWith('.pdf') ? url : `${url}.pdf`;
  };

  useEffect(() => {
    fetchResume();
  }, []);

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

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError('File size exceeds the 2MB limit. Please choose a smaller PDF.');
      return;
    }

    if (file.type !== 'application/pdf') {
      setError('Only PDF documents are allowed.');
      return;
    }

    try {
      setError('');
      setSuccess('');
      setResumeUploading(true);

      const formData = new FormData();
      formData.append('file', file);

      const response = await API.post('/api/users/profile/resume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setResume(response.data);
      setSuccess('Resume uploaded successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload resume.');
    } finally {
      setResumeUploading(false);
    }
  };

  const handleResumeDelete = async () => {
    if (!window.confirm('Are you sure you want to permanently delete your resume?')) return;

    try {
      setError('');
      setSuccess('');
      setResumeLoading(true);
      await API.delete('/api/users/profile/resume');
      setResume(null);
      setSuccess('Resume deleted successfully.');
    } catch (err) {
      setError('Failed to delete resume.');
    } finally {
      setResumeLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 relative overflow-hidden flex flex-col">
      {/* Background decorations */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/5 blur-[100px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/5 blur-[100px]" />

      <div className="max-w-3xl mx-auto w-full z-10 relative flex-grow flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between mb-8 border-b border-slate-900 pb-5 shrink-0">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-xl transition text-slate-400 hover:text-white cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                My Profile
              </h1>
              <p className="text-xs text-slate-500">Manage your candidate credentials and resume</p>
            </div>
          </div>
        </header>

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center mb-6 shrink-0">
            {error}
          </div>
        )}
        {success && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm text-center mb-6 shrink-0">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column: Candidate Info */}
          <div className="md:col-span-1 bg-slate-900/60 border border-slate-850 rounded-3xl p-6 shadow-xl shadow-slate-950/20 h-fit space-y-6">
            <div className="flex flex-col items-center text-center pb-4 border-b border-slate-800">
              <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center text-2xl font-bold mb-3">
                {user?.username?.charAt(0).toUpperCase()}
              </div>
              <h3 className="font-semibold text-slate-200 text-base">{user?.username}</h3>
              <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">
                {user?.role?.replace('ROLE_', '')} Account
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <span className="text-slate-500 block">Email Address</span>
                <span className="text-slate-350 font-medium break-all mt-1 block">{user?.email}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Resume Management */}
          <div className="md:col-span-2 bg-slate-900/60 border border-slate-850 rounded-3xl p-6 shadow-xl shadow-slate-950/20 flex flex-col justify-between min-h-[300px]">
            <div>
              <h3 className="text-base font-semibold text-slate-250 flex items-center mb-1">
                <FileText className="w-5 h-5 text-indigo-400 mr-2" />
                Professional Resume
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-6">
                Upload your resume in PDF format (maximum size 2MB). Your resume will be used to calibrate mock interview questions and assess technical competency.
              </p>

              {resumeLoading ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-2" />
                  <p className="text-xs">Fetching resume status...</p>
                </div>
              ) : resume ? (
                // Resume Display Card
                <div className="bg-slate-950/60 border border-slate-900 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-center space-x-3.5">
                    <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-300 text-xs">Verified PDF Document</h4>
                      <p className="text-[10px] text-slate-500 mt-1">
                        Uploaded on: {new Date(resume.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                    <button
                      onClick={() => setPreviewOpen(true)}
                      className="flex items-center space-x-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white px-3 py-2 rounded-xl transition text-xs font-semibold cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Preview</span>
                    </button>
                    <button
                      onClick={handleResumeDelete}
                      className="flex items-center space-x-1 bg-red-950/40 hover:bg-red-950/80 text-red-400 border border-red-900/30 px-3 py-2 rounded-xl transition text-xs font-semibold cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ) : (
                // Dropzone for upload
                <label className={`border border-dashed border-slate-800 hover:border-slate-700 bg-slate-950/20 hover:bg-slate-950/40 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition relative group min-h-[160px] ${
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
                      <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-3" />
                      <p className="text-xs text-slate-300 font-semibold">Uploading PDF document...</p>
                      <p className="text-[10px] text-slate-500 mt-1">Contacting secure servers</p>
                    </>
                  ) : (
                    <>
                      <FileText className="w-8 h-8 text-slate-650 group-hover:text-indigo-400 transition mb-3" />
                      <p className="text-xs text-slate-300 font-semibold">Upload Your Resume</p>
                      <p className="text-[10px] text-slate-500 mt-1 max-w-[280px] leading-relaxed">
                        Please upload a PDF document representing your educational and technical achievements (Max size: 2MB).
                      </p>
                      <span className="mt-3 text-[10px] bg-indigo-600 hover:bg-indigo-505 text-white font-semibold px-4 py-2 rounded-xl shadow-md transition">
                        Select PDF File
                      </span>
                    </>
                  )}
                </label>
              )}
            </div>
          </div>
        </div>

        {/* PDF PREVIEW MODAL */}
        {previewOpen && resume && (
          <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-4xl h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl p-6 relative shadow-2xl flex flex-col">
              <button
                onClick={() => setPreviewOpen(false)}
                className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white rounded-lg transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="mb-4 flex justify-between items-center pr-8">
                <div>
                  <h3 className="font-bold text-slate-100 text-sm">Resume Preview</h3>
                  <p className="text-[10px] text-slate-500">Verified Cloudinary Delivery URL</p>
                </div>
                <a
                  href={getResumePdfUrl(resume.resumeUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-505 text-white text-xs font-semibold px-4 py-2 rounded-xl transition shadow-md cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open in New Tab</span>
                </a>
              </div>

              <div className="flex-grow rounded-2xl overflow-hidden bg-slate-950 border border-slate-850 relative">
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
    </div>
  );
};

export default Profile;
