import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { 
  ArrowLeft, Save, Plus, Trash2, GraduationCap, Code2, 
  FolderGit2, Award, FileSpreadsheet, Loader2, Sparkles, FileText, Eye, X, ExternalLink 
} from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Tab management
  const [activeTab, setActiveTab] = useState('education');

  // Resume states
  const [resume, setResume] = useState(null);
  const [resumeLoading, setResumeLoading] = useState(false);
  const [resumeUploading, setResumeUploading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const getResumePdfUrl = (url) => {
    if (!url) return '';
    return url.toLowerCase().endsWith('.pdf') ? url : `${url}.pdf`;
  };

  // Form states matching database entities
  const [education, setEducation] = useState([]);
  const [skills, setSkills] = useState([]);
  const [projects, setProjects] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [codingProfiles, setCodingProfiles] = useState({
    leetcode: '',
    geeksforgeeks: '',
    codechef: '',
    hackerrank: '',
    github: ''
  });

  // Input helpers
  const [newSkill, setNewSkill] = useState('');
  const [newAchievement, setNewAchievement] = useState('');

  useEffect(() => {
    fetchProfile();
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

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await API.get('/api/users/profile');
      const data = response.data;
      if (data) {
        setEducation(data.education || []);
        setSkills(data.skills || []);
        setProjects(data.projects || []);
        setAchievements(data.achievements || []);
        setCertifications(data.certifications || []);
        setCodingProfiles({
          leetcode: data.codingProfiles?.leetcode || '',
          geeksforgeeks: data.codingProfiles?.geeksforgeeks || '',
          codechef: data.codingProfiles?.codechef || '',
          hackerrank: data.codingProfiles?.hackerrank || '',
          github: data.codingProfiles?.github || ''
        });
      }
    } catch (err) {
      setError('Failed to fetch profile details.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    try {
      setError('');
      setSuccess('');
      setSaving(true);

      const payload = {
        education,
        skills,
        projects,
        achievements,
        certifications,
        codingProfiles
      };

      await API.put('/api/users/profile', payload);
      setSuccess('Profile updated successfully!');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  // Helper adding/removing dynamic entries
  const addEducation = () => {
    setEducation([...education, { institute: '', degree: '', cgpaOrPercentage: '', passingYear: new Date().getFullYear() }]);
  };
  const removeEducation = (index) => {
    setEducation(education.filter((_, idx) => idx !== index));
  };
  const updateEducationField = (index, field, value) => {
    const updated = [...education];
    updated[index][field] = value;
    setEducation(updated);
  };

  const addProject = () => {
    setProjects([...projects, { title: '', description: '', technologies: [], projectLink: '' }]);
  };
  const removeProject = (index) => {
    setProjects(projects.filter((_, idx) => idx !== index));
  };
  const updateProjectField = (index, field, value) => {
    const updated = [...projects];
    updated[index][field] = value;
    setProjects(updated);
  };
  const addProjectTech = (projIdx, tech) => {
    if (!tech.trim()) return;
    const updated = [...projects];
    if (!updated[projIdx].technologies) updated[projIdx].technologies = [];
    if (!updated[projIdx].technologies.includes(tech.trim())) {
      updated[projIdx].technologies.push(tech.trim());
    }
    setProjects(updated);
  };
  const removeProjectTech = (projIdx, techIdx) => {
    const updated = [...projects];
    updated[projIdx].technologies = updated[projIdx].technologies.filter((_, idx) => idx !== techIdx);
    setProjects(updated);
  };

  const addCertification = () => {
    setCertifications([...certifications, { name: '', issuer: '', issueDate: '', credentialUrl: '' }]);
  };
  const removeCertification = (index) => {
    setCertifications(certifications.filter((_, idx) => idx !== index));
  };
  const updateCertificationField = (index, field, value) => {
    const updated = [...certifications];
    updated[index][field] = value;
    setCertifications(updated);
  };

  const addSkillTag = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      e.preventDefault();
      if (newSkill.trim() && !skills.includes(newSkill.trim())) {
        setSkills([...skills, newSkill.trim()]);
        setNewSkill('');
      }
    }
  };
  const removeSkillTag = (index) => {
    setSkills(skills.filter((_, idx) => idx !== index));
  };

  const addAchievementTag = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      e.preventDefault();
      if (newAchievement.trim() && !achievements.includes(newAchievement.trim())) {
        setAchievements([...achievements, newAchievement.trim()]);
        setNewAchievement('');
      }
    }
  };
  const removeAchievementTag = (index) => {
    setAchievements(achievements.filter((_, idx) => idx !== index));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mb-4" />
        <p className="text-slate-400 text-sm">Fetching your profile details...</p>
      </div>
    );
  }

  const tabs = [
    { id: 'education', name: 'Education', icon: GraduationCap },
    { id: 'skills', name: 'Skills & Achievements', icon: Code2 },
    { id: 'projects', name: 'Projects', icon: FolderGit2 },
    { id: 'certifications', name: 'Certifications', icon: Award },
    { id: 'coding', name: 'Coding Profiles', icon: FileSpreadsheet },
    { id: 'resume', name: 'Resume PDF', icon: FileText }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 relative overflow-hidden">
      {/* Background decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/5 blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/5 blur-[100px]" />

      <div className="max-w-4xl mx-auto z-10 relative">
        {/* Header */}
        <header className="flex justify-between items-center mb-8 border-b border-slate-900 pb-5">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-xl transition text-slate-400 hover:text-white cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Profile Builder
              </h1>
              <p className="text-xs text-slate-500">Edit your professional details and placement readiness portfolio</p>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium px-5 py-2.5 rounded-xl transition shadow-lg shadow-indigo-600/10 cursor-pointer disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Profile</span>
          </button>
        </header>

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center mb-6 animate-pulse">
            {error}
          </div>
        )}
        {success && (
          <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm text-center mb-6">
            {success}
          </div>
        )}

        {/* Tab Selection */}
        <div className="flex border-b border-slate-900 overflow-x-auto space-x-6 mb-8 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 pb-4 border-b-2 font-medium text-sm transition cursor-pointer whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>

        {/* Form area */}
        <div className="space-y-8">
          
          {/* TAB 1: EDUCATION */}
          {activeTab === 'education' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-slate-200 flex items-center">
                  <GraduationCap className="w-5 h-5 text-indigo-400 mr-2" /> Academic Records
                </h3>
                <button
                  type="button"
                  onClick={addEducation}
                  className="flex items-center space-x-1.5 text-xs bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-600/20 px-3 py-1.5 rounded-lg transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Education</span>
                </button>
              </div>

              {education.length === 0 ? (
                <div className="text-center py-12 bg-slate-905/30 border border-slate-900 border-dashed rounded-3xl text-slate-500">
                  <GraduationCap className="w-10 h-10 mx-auto mb-3 text-slate-700" />
                  <p className="text-sm">No education records added yet.</p>
                  <button type="button" onClick={addEducation} className="mt-3 text-xs text-indigo-400 hover:underline cursor-pointer">Add one now</button>
                </div>
              ) : (
                <div className="space-y-4">
                  {education.map((edu, idx) => (
                    <div key={idx} className="bg-slate-900/40 border border-slate-900 hover:border-slate-800/80 rounded-2xl p-6 relative group transition">
                      <button
                        type="button"
                        onClick={() => removeEducation(idx)}
                        className="absolute top-6 right-6 p-2 text-slate-500 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-10">
                        <div>
                          <label className="block text-xs font-medium text-slate-400 mb-1.5">Institution / School Name</label>
                          <input
                            type="text"
                            value={edu.institute}
                            onChange={(e) => updateEducationField(idx, 'institute', e.target.value)}
                            placeholder="e.g. Oxford University"
                            className="w-full bg-slate-950/40 border border-slate-800 rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500 text-sm text-slate-200"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-400 mb-1.5">Degree / Course</label>
                          <input
                            type="text"
                            value={edu.degree}
                            onChange={(e) => updateEducationField(idx, 'degree', e.target.value)}
                            placeholder="e.g. Bachelor of Technology in CS"
                            className="w-full bg-slate-950/40 border border-slate-800 rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500 text-sm text-slate-200"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-400 mb-1.5">CGPA or Percentage</label>
                          <input
                            type="text"
                            value={edu.cgpaOrPercentage}
                            onChange={(e) => updateEducationField(idx, 'cgpaOrPercentage', e.target.value)}
                            placeholder="e.g. 9.1 CGPA or 88%"
                            className="w-full bg-slate-950/40 border border-slate-800 rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500 text-sm text-slate-200"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-400 mb-1.5">Passing Year</label>
                          <input
                            type="number"
                            value={edu.passingYear || ''}
                            onChange={(e) => updateEducationField(idx, 'passingYear', parseInt(e.target.value) || '')}
                            placeholder="e.g. 2025"
                            className="w-full bg-slate-950/40 border border-slate-800 rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500 text-sm text-slate-200"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SKILLS & ACHIEVEMENTS */}
          {activeTab === 'skills' && (
            <div className="space-y-8">
              {/* Skills Section */}
              <div className="space-y-4 bg-slate-900/30 border border-slate-900 rounded-3xl p-6">
                <h3 className="text-lg font-semibold text-slate-200 flex items-center">
                  <Code2 className="w-5 h-5 text-indigo-400 mr-2" /> Skills
                </h3>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={addSkillTag}
                    placeholder="Type a skill (e.g. React, Java) and press Enter"
                    className="flex-grow bg-slate-950/40 border border-slate-800 rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500 text-sm text-slate-200"
                  />
                  <button
                    type="button"
                    onClick={addSkillTag}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2.5 rounded-xl transition cursor-pointer text-sm"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  {skills.length === 0 ? (
                    <span className="text-xs text-slate-600">No skills added yet.</span>
                  ) : (
                    skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold rounded-full"
                      >
                        <span>{skill}</span>
                        <button
                          type="button"
                          onClick={() => removeSkillTag(idx)}
                          className="hover:text-red-400 ml-1 cursor-pointer focus:outline-none"
                        >
                          &times;
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Achievements Section */}
              <div className="space-y-4 bg-slate-900/30 border border-slate-900 rounded-3xl p-6">
                <h3 className="text-lg font-semibold text-slate-200 flex items-center">
                  <Sparkles className="w-5 h-5 text-amber-400 mr-2" /> Achievements
                </h3>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newAchievement}
                    onChange={(e) => setNewAchievement(e.target.value)}
                    onKeyDown={addAchievementTag}
                    placeholder="Type an achievement (e.g. Hackathon Winner) and press Enter"
                    className="flex-grow bg-slate-950/40 border border-slate-800 rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500 text-sm text-slate-200"
                  />
                  <button
                    type="button"
                    onClick={addAchievementTag}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2.5 rounded-xl transition cursor-pointer text-sm"
                  >
                    Add
                  </button>
                </div>
                <div className="space-y-2 pt-2">
                  {achievements.length === 0 ? (
                    <span className="text-xs text-slate-600">No achievements listed yet.</span>
                  ) : (
                    achievements.map((achievement, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center px-4 py-2.5 bg-slate-950/40 border border-slate-900 rounded-xl text-sm text-slate-300"
                      >
                        <span className="leading-relaxed">{achievement}</span>
                        <button
                          type="button"
                          onClick={() => removeAchievementTag(idx)}
                          className="text-slate-500 hover:text-red-400 cursor-pointer ml-4"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PROJECTS */}
          {activeTab === 'projects' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-slate-200 flex items-center">
                  <FolderGit2 className="w-5 h-5 text-indigo-400 mr-2" /> Software Projects
                </h3>
                <button
                  type="button"
                  onClick={addProject}
                  className="flex items-center space-x-1.5 text-xs bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-600/20 px-3 py-1.5 rounded-lg transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Project</span>
                </button>
              </div>

              {projects.length === 0 ? (
                <div className="text-center py-12 bg-slate-900/30 border border-slate-900 border-dashed rounded-3xl text-slate-500">
                  <FolderGit2 className="w-10 h-10 mx-auto mb-3 text-slate-700" />
                  <p className="text-sm">No projects added yet.</p>
                  <button type="button" onClick={addProject} className="mt-3 text-xs text-indigo-400 hover:underline cursor-pointer">Add one now</button>
                </div>
              ) : (
                <div className="space-y-4">
                  {projects.map((proj, idx) => (
                    <div key={idx} className="bg-slate-900/40 border border-slate-900 hover:border-slate-800/80 rounded-2xl p-6 relative group transition">
                      <button
                        type="button"
                        onClick={() => removeProject(idx)}
                        className="absolute top-6 right-6 p-2 text-slate-500 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="space-y-4 pr-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1.5">Project Title</label>
                            <input
                              type="text"
                              value={proj.title}
                              onChange={(e) => updateProjectField(idx, 'title', e.target.value)}
                              placeholder="e.g. Portfolio Website"
                              className="w-full bg-slate-950/40 border border-slate-800 rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500 text-sm text-slate-200"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1.5">Project Link (GitHub / Live)</label>
                            <input
                              type="text"
                              value={proj.projectLink}
                              onChange={(e) => updateProjectField(idx, 'projectLink', e.target.value)}
                              placeholder="https://github.com/..."
                              className="w-full bg-slate-950/40 border border-slate-800 rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500 text-sm text-slate-200"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-slate-400 mb-1.5">Project Description</label>
                          <textarea
                            value={proj.description}
                            onChange={(e) => updateProjectField(idx, 'description', e.target.value)}
                            placeholder="Write a brief overview of the project and key technical challenges solved..."
                            rows="3"
                            className="w-full bg-slate-950/40 border border-slate-800 rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500 text-sm text-slate-200 resize-none"
                          />
                        </div>

                        {/* Project Tech Tags */}
                        <div className="space-y-2">
                          <label className="block text-xs font-medium text-slate-400">Technologies Used</label>
                          <div className="flex space-x-2">
                            <input
                              type="text"
                              placeholder="e.g. Node.js (Press Add)"
                              id={`tech-input-${idx}`}
                              className="bg-slate-950/40 border border-slate-800 rounded-xl px-4 py-1.5 focus:outline-none focus:border-indigo-500 text-xs text-slate-200"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  addProjectTech(idx, e.target.value);
                                  e.target.value = '';
                                }
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const input = document.getElementById(`tech-input-${idx}`);
                                addProjectTech(idx, input.value);
                                input.value = '';
                              }}
                              className="bg-slate-900 border border-slate-850 text-slate-300 hover:text-white px-3 py-1.5 rounded-xl text-xs cursor-pointer hover:bg-slate-800 transition"
                            >
                              Add
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-1.5 pt-1.5">
                            {(!proj.technologies || proj.technologies.length === 0) ? (
                              <span className="text-[11px] text-slate-600">No technology tags added.</span>
                            ) : (
                              proj.technologies.map((tech, techIdx) => (
                                <span
                                  key={techIdx}
                                  className="inline-flex items-center space-x-1 px-2.5 py-1 bg-slate-950 border border-slate-850 text-slate-400 text-[10px] font-medium rounded-md"
                                >
                                  <span>{tech}</span>
                                  <button
                                    type="button"
                                    onClick={() => removeProjectTech(idx, techIdx)}
                                    className="hover:text-red-400 ml-1 cursor-pointer focus:outline-none"
                                  >
                                    &times;
                                  </button>
                                </span>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: CERTIFICATIONS */}
          {activeTab === 'certifications' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-slate-200 flex items-center">
                  <Award className="w-5 h-5 text-indigo-400 mr-2" /> Credentials & Certifications
                </h3>
                <button
                  type="button"
                  onClick={addCertification}
                  className="flex items-center space-x-1.5 text-xs bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-600/20 px-3 py-1.5 rounded-lg transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Certificate</span>
                </button>
              </div>

              {certifications.length === 0 ? (
                <div className="text-center py-12 bg-slate-900/30 border border-slate-900 border-dashed rounded-3xl text-slate-500">
                  <Award className="w-10 h-10 mx-auto mb-3 text-slate-700" />
                  <p className="text-sm">No certifications listed yet.</p>
                  <button type="button" onClick={addCertification} className="mt-3 text-xs text-indigo-400 hover:underline cursor-pointer">Add one now</button>
                </div>
              ) : (
                <div className="space-y-4">
                  {certifications.map((cert, idx) => (
                    <div key={idx} className="bg-slate-900/40 border border-slate-900 hover:border-slate-800/80 rounded-2xl p-6 relative group transition">
                      <button
                        type="button"
                        onClick={() => removeCertification(idx)}
                        className="absolute top-6 right-6 p-2 text-slate-500 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-10">
                        <div>
                          <label className="block text-xs font-medium text-slate-400 mb-1.5">Certification Name</label>
                          <input
                            type="text"
                            value={cert.name}
                            onChange={(e) => updateCertificationField(idx, 'name', e.target.value)}
                            placeholder="e.g. AWS Solutions Architect"
                            className="w-full bg-slate-950/40 border border-slate-800 rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500 text-sm text-slate-200"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-400 mb-1.5">Issuing Organization</label>
                          <input
                            type="text"
                            value={cert.issuer}
                            onChange={(e) => updateCertificationField(idx, 'issuer', e.target.value)}
                            placeholder="e.g. AWS"
                            className="w-full bg-slate-950/40 border border-slate-800 rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500 text-sm text-slate-200"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-400 mb-1.5">Credential URL</label>
                          <input
                            type="text"
                            value={cert.credentialUrl}
                            onChange={(e) => updateCertificationField(idx, 'credentialUrl', e.target.value)}
                            placeholder="https://verify.link/..."
                            className="w-full bg-slate-950/40 border border-slate-800 rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500 text-sm text-slate-200"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-400 mb-1.5">Date of Issue (or Month/Year)</label>
                          <input
                            type="text"
                            value={cert.issueDate}
                            onChange={(e) => updateCertificationField(idx, 'issueDate', e.target.value)}
                            placeholder="e.g. May 2024"
                            className="w-full bg-slate-950/40 border border-slate-800 rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500 text-sm text-slate-200"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: CODING PROFILES */}
          {activeTab === 'coding' && (
            <div className="space-y-6 bg-slate-900/30 border border-slate-900 rounded-3xl p-6">
              <h3 className="text-lg font-semibold text-slate-200 flex items-center">
                <FileSpreadsheet className="w-5 h-5 text-indigo-400 mr-2" /> Online Judge Profiles
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">GitHub URL</label>
                  <input
                    type="text"
                    value={codingProfiles.github}
                    onChange={(e) => setCodingProfiles({ ...codingProfiles, github: e.target.value })}
                    placeholder="https://github.com/johndoe"
                    className="w-full bg-slate-950/40 border border-slate-800 rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500 text-sm text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">LeetCode URL</label>
                  <input
                    type="text"
                    value={codingProfiles.leetcode}
                    onChange={(e) => setCodingProfiles({ ...codingProfiles, leetcode: e.target.value })}
                    placeholder="https://leetcode.com/johndoe"
                    className="w-full bg-slate-950/40 border border-slate-800 rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500 text-sm text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">GeeksforGeeks Profile</label>
                  <input
                    type="text"
                    value={codingProfiles.geeksforgeeks}
                    onChange={(e) => setCodingProfiles({ ...codingProfiles, geeksforgeeks: e.target.value })}
                    placeholder="https://auth.geeksforgeeks.org/user/johndoe"
                    className="w-full bg-slate-950/40 border border-slate-800 rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500 text-sm text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">CodeChef Handle</label>
                  <input
                    type="text"
                    value={codingProfiles.codechef}
                    onChange={(e) => setCodingProfiles({ ...codingProfiles, codechef: e.target.value })}
                    placeholder="e.g. johndoe"
                    className="w-full bg-slate-950/40 border border-slate-800 rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500 text-sm text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">HackerRank Profile</label>
                  <input
                    type="text"
                    value={codingProfiles.hackerrank}
                    onChange={(e) => setCodingProfiles({ ...codingProfiles, hackerrank: e.target.value })}
                    placeholder="https://hackerrank.com/johndoe"
                    className="w-full bg-slate-950/40 border border-slate-800 rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500 text-sm text-slate-200"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: RESUME PDF */}
          {activeTab === 'resume' && (
            <div className="space-y-6 bg-slate-900/30 border border-slate-900 rounded-3xl p-6">
              <h3 className="text-lg font-semibold text-slate-200 flex items-center">
                <FileText className="w-5 h-5 text-indigo-400 mr-2" /> Professional Resume
              </h3>
              
              {resumeLoading ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-2" />
                  <p className="text-xs">Loading resume status...</p>
                </div>
              ) : resume ? (
                <div className="border border-slate-800 rounded-2xl p-6 bg-slate-900/40 space-y-4 animate-fadeIn">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-slate-200">Uploaded Resume Document</h4>
                        <p className="text-xs text-slate-500">Verified PDF Document</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                      <button
                        type="button"
                        onClick={() => setPreviewOpen(true)}
                        className="flex items-center justify-center space-x-1.5 px-4 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold rounded-xl transition cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Preview PDF</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleResumeDelete}
                        className="flex items-center justify-center space-x-1.5 px-4 py-2 bg-red-950/40 border border-red-900/30 hover:bg-red-950/60 text-red-400 text-xs font-semibold rounded-xl transition cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border border-dashed border-slate-800 hover:border-slate-700 rounded-2xl p-8 bg-slate-950/25 transition flex flex-col items-center justify-center text-center">
                  <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl mb-4 text-slate-400">
                    <FileText className="w-10 h-10 animate-pulse text-indigo-400" />
                  </div>
                  <h4 className="text-sm font-semibold text-slate-300 mb-1">Upload Your Resume</h4>
                  <p className="text-xs text-slate-500 mb-4 max-w-xs">
                    Please upload a PDF document representing your educational and technical achievements (Max size: 2MB).
                  </p>
                  
                  <label className="relative cursor-pointer">
                    <span className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition shadow-md block">
                      {resumeUploading ? (
                        <span className="flex items-center space-x-1">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Uploading File...</span>
                        </span>
                      ) : (
                        "Select PDF File"
                      )}
                    </span>
                    <input
                      type="file"
                      accept="application/pdf"
                      disabled={resumeUploading}
                      onChange={handleResumeUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              )}

              {previewOpen && resume && (
                <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl p-6 relative shadow-2xl flex flex-col h-[85vh] animate-scaleIn">
                    <button
                      type="button"
                      onClick={() => setPreviewOpen(false)}
                      className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white rounded-lg transition cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    
                    <div className="flex justify-between items-center mb-4 shrink-0 pr-12">
                      <h3 className="text-md font-bold text-slate-200 flex items-center">
                        <FileText className="w-5 h-5 text-indigo-400 mr-2" /> Resume Preview
                      </h3>
                      <a
                        href={getResumePdfUrl(resume.resumeUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-950 hover:bg-slate-900 border border-slate-850 hover:border-slate-700 text-indigo-400 hover:text-indigo-300 text-xs font-semibold rounded-xl transition cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Open in New Tab</span>
                      </a>
                    </div>

                    <div className="flex-grow w-full bg-slate-950 border border-slate-900 rounded-2xl overflow-hidden min-h-0 relative">
                      <iframe
                        src={`${getResumePdfUrl(resume.resumeUrl)}#toolbar=0&navpanes=0&scrollbar=0`}
                        title="Resume Preview"
                        className="w-full h-full border-none"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Profile;
