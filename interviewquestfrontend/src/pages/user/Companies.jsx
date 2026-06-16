import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, Building2, Plus, Edit3, Trash2, Loader2, X, AlertCircle } from 'lucide-react';

const Companies = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form Modal States (for Admin CRUD)
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const response = await API.get('/api/public/companies');
      setCompanies(response.data || []);
    } catch (err) {
      setError('Failed to load companies.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingId(null);
    setName('');
    setLogoUrl('');
    setDescription('');
    setError('');
    setModalOpen(true);
  };

  const handleOpenEditModal = (company) => {
    setEditingId(company.id);
    setName(company.name);
    setLogoUrl(company.logoUrl || '');
    setDescription(company.description || '');
    setError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Company name is required.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      const payload = {
        name: name.trim(),
        logoUrl: logoUrl.trim() || null,
        description: description.trim() || null
      };

      if (editingId) {
        // Edit Mode
        const response = await API.put(`/api/admin/companies/${editingId}`, payload);
        setCompanies(companies.map(c => c.id === editingId ? response.data : c));
      } else {
        // Create Mode
        const response = await API.post('/api/admin/companies', payload);
        setCompanies([...companies, response.data]);
      }
      setModalOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Action failed. Ensure company name is unique.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this company? All related interview experiences will be permanently deleted.')) {
      return;
    }

    try {
      setError('');
      await API.delete(`/api/admin/companies/${id}`);
      setCompanies(companies.filter(c => c.id !== id));
    } catch (err) {
      setError('Failed to delete company.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mb-4" />
        <p className="text-slate-400 text-sm">Fetching companies list...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 relative overflow-hidden">
      {/* Background decor */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/5 blur-[100px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/5 blur-[100px]" />

      <div className="max-w-4xl mx-auto z-10 relative">
        {/* Header */}
        <header className="flex items-center justify-between mb-8 border-b border-slate-900 pb-5">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-xl transition text-slate-400 hover:text-white cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Companies Directory
              </h1>
              <p className="text-xs text-slate-500">Browse tracked corporate recruiters or manage company panels</p>
            </div>
          </div>

          {isAdmin && (
            <button
              onClick={handleOpenCreateModal}
              className="flex items-center space-x-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2.5 rounded-xl transition cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Add Company</span>
            </button>
          )}
        </header>

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center mb-6 flex items-center justify-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {companies.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/30 border border-slate-900 border-dashed rounded-3xl text-slate-500">
            <Building2 className="w-12 h-12 mx-auto mb-3 text-slate-700 animate-pulse" />
            <p className="text-sm">No companies registered yet.</p>
            {isAdmin && <button onClick={handleOpenCreateModal} className="mt-3 text-xs text-indigo-400 hover:underline cursor-pointer">Register one now</button>}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {companies.map((company) => (
              <div 
                key={company.id} 
                className="bg-slate-900/40 border border-slate-900 hover:border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between transition relative group"
              >
                {/* Admin Actions */}
                {isAdmin && (
                  <div className="absolute top-4 right-4 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleOpenEditModal(company)}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg cursor-pointer"
                      title="Edit"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(company.id)}
                      className="p-1.5 bg-red-950/40 hover:bg-red-950/80 text-red-400 border border-red-900/30 rounded-lg cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <div>
                  <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-850 flex items-center justify-center text-slate-400 mb-4 overflow-hidden">
                    {company.logoUrl ? (
                      <img src={company.logoUrl} alt={company.name} className="w-full h-full object-cover" />
                    ) : (
                      <Building2 className="w-5 h-5" />
                    )}
                  </div>
                  <h3 className="font-semibold text-slate-200 mb-1">{company.name}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                    {company.description || 'No corporate description available.'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* MODAL DIALOG (Create/Edit Company) */}
        {modalOpen && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 relative shadow-2xl animate-scaleIn">
              <button
                onClick={() => setModalOpen(false)}
                className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white rounded-lg transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <h2 className="text-xl font-bold mb-4 text-slate-200 flex items-center">
                <Building2 className="w-5 h-5 text-indigo-400 mr-2" />
                {editingId ? 'Edit Company' : 'Add New Company'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Company Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Google"
                    className="w-full bg-slate-950/40 border border-slate-800 rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500 text-sm text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Logo Image URL</label>
                  <input
                    type="text"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="https://logo.link/..."
                    className="w-full bg-slate-950/40 border border-slate-800 rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500 text-sm text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Write a brief overview of the company, headquarters, industry, etc."
                    rows="3"
                    className="w-full bg-slate-950/40 border border-slate-800 rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500 text-sm text-slate-200 resize-none"
                  />
                </div>

                <div className="flex space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="w-1/2 py-2.5 bg-slate-950 border border-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-semibold rounded-xl transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-1/2 py-2.5 bg-indigo-600 hover:bg-indigo-505 text-white text-xs font-semibold rounded-xl transition cursor-pointer shadow-md flex justify-center items-center"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Details'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Companies;
