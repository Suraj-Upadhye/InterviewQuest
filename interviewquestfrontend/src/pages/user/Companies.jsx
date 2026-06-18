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
      <div className="min-h-screen bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 flex flex-col justify-center items-center">
        <Loader2 className="w-10 h-10 animate-spin text-zinc-750 dark:text-zinc-400 mb-4" />
        <p className="text-zinc-500 dark:text-zinc-400 text-xs">Fetching companies list...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 p-6 relative overflow-hidden transition-colors duration-300">
      <div className="max-w-4xl mx-auto z-10 relative">
        
        {/* Header */}
        <header className="flex items-center justify-between mb-8 border-b border-zinc-200 dark:border-zinc-900 pb-5">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2.5 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-xl transition text-zinc-550 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-extrabold text-zinc-950 dark:text-white">
                Companies Directory
              </h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-405">Browse tracked corporate recruiters or manage company panels</p>
            </div>
          </div>

          {isAdmin && (
            <button
              onClick={handleOpenCreateModal}
              className="flex items-center space-x-1.5 text-xs bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 font-bold px-4 py-2.5 rounded-lg transition cursor-pointer hover:bg-zinc-850 dark:hover:bg-zinc-200"
            >
              <Plus className="w-4 h-4" />
              <span>Add Company</span>
            </button>
          )}
        </header>

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-650 dark:text-red-400 text-xs text-center mb-6 flex items-center justify-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {companies.length === 0 ? (
          <div className="text-center py-16 bg-zinc-50 dark:bg-[#0d0d11] border border-zinc-200 dark:border-zinc-900 border-dashed rounded-2xl text-zinc-550">
            <Building2 className="w-10 h-10 mx-auto mb-3 text-zinc-400 dark:text-zinc-650" />
            <p className="text-xs">No companies registered yet.</p>
            {isAdmin && <button onClick={handleOpenCreateModal} className="mt-3 text-xs text-indigo-650 dark:text-indigo-400 hover:underline cursor-pointer">Register one now</button>}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {companies.map((company) => (
              <div 
                key={company.id} 
                className="bg-zinc-50 dark:bg-[#0d0d11] border border-zinc-200 dark:border-zinc-900 hover:border-zinc-400 dark:hover:border-zinc-700 rounded-xl p-5 flex flex-col justify-between transition duration-200 relative group"
              >
                {/* Admin Actions */}
                {isAdmin && (
                  <div className="absolute top-4 right-4 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleOpenEditModal(company)}
                      className="p-1.5 bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-350 rounded-lg cursor-pointer transition border border-zinc-250 dark:border-zinc-700"
                      title="Edit"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(company.id)}
                      className="p-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-950/80 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/30 rounded-lg cursor-pointer transition"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <div>
                  <div className="w-12 h-12 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 flex items-center justify-center text-zinc-400 mb-4 overflow-hidden">
                    {company.logoUrl ? (
                      <img src={company.logoUrl} alt={company.name} className="w-full h-full object-cover" />
                    ) : (
                      <Building2 className="w-5 h-5" />
                    )}
                  </div>
                  <h3 className="font-bold text-zinc-900 dark:text-zinc-200 text-sm mb-1">{company.name}</h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-405 leading-relaxed line-clamp-3 font-medium">
                    {company.description || 'No corporate description available.'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* MODAL DIALOG (Create/Edit Company) */}
        {modalOpen && (
          <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 relative shadow-2xl animate-scaleIn">
              <button
                onClick={() => setModalOpen(false)}
                className="absolute top-4 right-4 p-2 text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white rounded-lg transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <h2 className="text-lg font-bold mb-4 text-zinc-900 dark:text-zinc-250 flex items-center">
                <Building2 className="w-5 h-5 text-indigo-650 dark:text-indigo-400 mr-2" />
                {editingId ? 'Edit Company' : 'Add New Company'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-650 dark:text-zinc-400 mb-1.5">Company Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Google"
                    className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl px-4 py-2.5 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-650 text-xs text-zinc-900 dark:text-zinc-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-650 dark:text-zinc-400 mb-1.5">Logo Image URL</label>
                  <input
                    type="text"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="https://logo.link/..."
                    className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl px-4 py-2.5 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-650 text-xs text-zinc-900 dark:text-zinc-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-650 dark:text-zinc-400 mb-1.5">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Write a brief overview of the company, headquarters, industry, etc."
                    rows="3"
                    className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl px-4 py-2.5 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-650 text-xs text-zinc-900 dark:text-zinc-100 resize-none"
                  />
                </div>

                <div className="flex space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="w-1/2 py-2.5 bg-white dark:bg-transparent border border-zinc-250 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-1/2 py-2.5 bg-zinc-950 dark:bg-white hover:bg-zinc-850 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 text-xs font-bold rounded-xl transition cursor-pointer shadow-sm flex justify-center items-center"
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
