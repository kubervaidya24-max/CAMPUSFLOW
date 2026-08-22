import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import {
  User as UserIcon,
  Building,
  GraduationCap,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Plus,
  X,
  Github,
  Linkedin,
  Globe,
  Image as ImageIcon,
  Save,
  ArrowLeft,
  BadgeCheck,
} from 'lucide-react';

export const EditProfilePage = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    profile: {
      avatar: '',
      bio: '',
      department: '',
      semester: 1,
      graduationYear: 2026,
      collegeId: '',
      skills: [],
      interests: [],
      socialLinks: {
        github: '',
        linkedin: '',
        portfolio: '',
      },
      designation: '',
      subjects: [],
      officeLocation: '',
    },
  });

  const [newSkill, setNewSkill] = useState('');
  const [newInterest, setNewInterest] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Preset avatar choices
  const presetAvatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
  ];

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        profile: {
          avatar: user.profile?.avatar || '',
          bio: user.profile?.bio || '',
          department: user.profile?.department || '',
          semester: user.profile?.semester || 1,
          graduationYear: user.profile?.graduationYear || 2026,
          collegeId: user.profile?.collegeId || '',
          skills: user.profile?.skills || [],
          interests: user.profile?.interests || [],
          socialLinks: {
            github: user.profile?.socialLinks?.github || '',
            linkedin: user.profile?.socialLinks?.linkedin || '',
            portfolio: user.profile?.socialLinks?.portfolio || '',
          },
          designation: user.profile?.designation || '',
          subjects: user.profile?.subjects || [],
          officeLocation: user.profile?.officeLocation || '',
        },
      });
    }
  }, [user]);

  const isStudent = user?.role === 'student';
  const isFaculty = user?.role === 'faculty';

  // Tag Management
  const handleAddSkill = (e) => {
    e?.preventDefault();
    const trimmed = newSkill.trim();
    if (trimmed && !formData.profile.skills.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        profile: {
          ...prev.profile,
          skills: [...prev.profile.skills, trimmed],
        },
      }));
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        skills: prev.profile.skills.filter((s) => s !== skillToRemove),
      },
    }));
  };

  const handleAddInterest = (e) => {
    e?.preventDefault();
    const trimmed = newInterest.trim();
    if (trimmed && !formData.profile.interests.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        profile: {
          ...prev.profile,
          interests: [...prev.profile.interests, trimmed],
        },
      }));
      setNewInterest('');
    }
  };

  const handleRemoveInterest = (interestToRemove) => {
    setFormData((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        interests: prev.profile.interests.filter((i) => i !== interestToRemove),
      },
    }));
  };

  const handleAddSubject = (e) => {
    e?.preventDefault();
    const trimmed = newSubject.trim();
    if (trimmed && !formData.profile.subjects.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        profile: {
          ...prev.profile,
          subjects: [...prev.profile.subjects, trimmed],
        },
      }));
      setNewSubject('');
    }
  };

  const handleRemoveSubject = (subjectToRemove) => {
    setFormData((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        subjects: prev.profile.subjects.filter((s) => s !== subjectToRemove),
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const response = await userService.updateMyProfile(formData);
      if (response?.data?.user) {
        updateUser(response.data.user);
        setSuccessMessage('Profile updated successfully!');
        setTimeout(() => {
          navigate('/profile');
        }, 1200);
      }
    } catch (error) {
      if (error.errors && Array.isArray(error.errors)) {
        setErrorMessage(error.errors.map((err) => `${err.field}: ${err.message}`).join(', '));
      } else {
        setErrorMessage(error.message || 'Failed to update profile. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="glass-panel p-6 sm:p-10 rounded-3xl border border-slate-800 shadow-2xl relative">
        {/* Top bar with back button */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-800/80 mb-8">
          <div className="flex items-center gap-3">
            <Link
              to="/profile"
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Edit Profile
              </h1>
              <p className="text-slate-400 text-xs">
                Update your student and academic information visible across CampusFlow
              </p>
            </div>
          </div>

          <span className="text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            {user?.role}
          </span>
        </div>

        {/* Alerts */}
        {successMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3 text-emerald-400 text-xs font-medium">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>{successMessage} Redirecting back to profile...</span>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400 text-xs font-medium">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8" noValidate>
          {/* 1. Avatar Section */}
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 space-y-4">
            <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-indigo-400" />
              <span>Profile Picture & Avatar</span>
            </h2>

            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Preview Thumbnail */}
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-sky-500 p-0.5 shadow-lg flex-shrink-0">
                {formData.profile.avatar ? (
                  <img
                    src={formData.profile.avatar}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-[14px]"
                    onError={(e) => {
                      e.currentTarget.src =
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-xl font-bold text-indigo-300">
                    {formData.name.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
              </div>

              <div className="flex-1 w-full space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Custom Image URL
                  </label>
                  <input
                    type="url"
                    value={formData.profile.avatar}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        profile: { ...prev.profile, avatar: e.target.value },
                      }))
                    }
                    placeholder="https://example.com/avatar.jpg"
                    className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Preset Avatars */}
                <div>
                  <span className="block text-[11px] text-slate-400 mb-1.5">Or choose a preset avatar:</span>
                  <div className="flex items-center gap-2">
                    {presetAvatars.map((url, idx) => (
                      <button
                        type="button"
                        key={idx}
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            profile: { ...prev.profile, avatar: url },
                          }))
                        }
                        className={`w-9 h-9 rounded-xl overflow-hidden border-2 transition-all ${
                          formData.profile.avatar === url
                            ? 'border-indigo-500 scale-105 shadow-md shadow-indigo-500/20'
                            : 'border-slate-800 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={url} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                    {formData.profile.avatar && (
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            profile: { ...prev.profile, avatar: '' },
                          }))
                        }
                        className="text-[11px] text-slate-500 hover:text-red-400 underline ml-2"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Basic Information */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-indigo-400" />
              <span>Basic Information</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3.5 py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Department</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Building className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={formData.profile.department}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        profile: { ...prev.profile, department: e.target.value },
                      }))
                    }
                    placeholder="Computer Science & Engineering"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-medium text-slate-300">About / Biography</label>
                  <span className="text-[11px] text-slate-500">
                    {formData.profile.bio?.length || 0} / 500 characters
                  </span>
                </div>
                <textarea
                  rows={4}
                  maxLength={500}
                  value={formData.profile.bio}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      profile: { ...prev.profile, bio: e.target.value },
                    }))
                  }
                  placeholder="Share a brief overview of your academic interests, project goals, and background..."
                  className="w-full p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>
            </div>
          </div>

          {/* 3. Student Academic Details */}
          {isStudent && (
            <div className="space-y-4">
              <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-emerald-400" />
                <span>Student Academic Details</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Current Semester (1-8)
                  </label>
                  <select
                    value={formData.profile.semester}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        profile: { ...prev.profile, semester: parseInt(e.target.value, 10) },
                      }))
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
                      <option key={num} value={num}>
                        Semester {num}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Graduation Year
                  </label>
                  <input
                    type="number"
                    min={2000}
                    max={2040}
                    value={formData.profile.graduationYear}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        profile: { ...prev.profile, graduationYear: parseInt(e.target.value, 10) },
                      }))
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    College Roll / ID
                  </label>
                  <input
                    type="text"
                    value={formData.profile.collegeId}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        profile: { ...prev.profile, collegeId: e.target.value },
                      }))
                    }
                    placeholder="2026-CS-042"
                    className="w-full px-3.5 py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Skills Tag Input */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Technical Skills (Press Enter or click Add)
                </label>
                <div className="flex gap-2 mb-2.5">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddSkill(e)}
                    placeholder="e.g. React, Node.js, Python, MongoDB"
                    className="flex-1 px-3.5 py-2 bg-slate-900/80 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    id="add-skill-btn"
                    onClick={handleAddSkill}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Skill</span>
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.profile.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs"
                    >
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="text-indigo-400 hover:text-red-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Interests Tag Input */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Academic & Project Interests
                </label>
                <div className="flex gap-2 mb-2.5">
                  <input
                    type="text"
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddInterest(e)}
                    placeholder="e.g. Distributed Systems, Machine Learning, UI/UX"
                    className="flex-1 px-3.5 py-2 bg-slate-900/80 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    id="add-interest-btn"
                    onClick={handleAddInterest}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Interest</span>
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.profile.interests.map((interest, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs"
                    >
                      <span>{interest}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveInterest(interest)}
                        className="text-amber-400 hover:text-red-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 4. Faculty Details */}
          {isFaculty && (
            <div className="space-y-4">
              <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <BadgeCheck className="w-4 h-4 text-indigo-400" />
                <span>Faculty Academic Profile</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Academic Designation
                  </label>
                  <input
                    type="text"
                    value={formData.profile.designation}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        profile: { ...prev.profile, designation: e.target.value },
                      }))
                    }
                    placeholder="e.g. Associate Professor, HOD"
                    className="w-full px-3.5 py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Office / Cabin Location
                  </label>
                  <input
                    type="text"
                    value={formData.profile.officeLocation}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        profile: { ...prev.profile, officeLocation: e.target.value },
                      }))
                    }
                    placeholder="e.g. Block C, Room 304"
                    className="w-full px-3.5 py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Subjects Taught Input */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Subjects / Courses Taught
                  </label>
                  <div className="flex gap-2 mb-2.5">
                    <input
                      type="text"
                      value={newSubject}
                      onChange={(e) => setNewSubject(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddSubject(e)}
                      placeholder="e.g. Data Structures, Cloud Architecture"
                      className="flex-1 px-3.5 py-2 bg-slate-900/80 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddSubject}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Subject</span>
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.profile.subjects.map((sub, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs"
                      >
                        <span>{sub}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSubject(sub)}
                          className="text-indigo-400 hover:text-red-400"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 5. Social & Portfolio Links */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Globe className="w-4 h-4 text-sky-400" />
              <span>Social & Online Presence</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">GitHub URL</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Github className="w-4 h-4" />
                  </div>
                  <input
                    type="url"
                    value={formData.profile.socialLinks.github}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        profile: {
                          ...prev.profile,
                          socialLinks: { ...prev.profile.socialLinks, github: e.target.value },
                        },
                      }))
                    }
                    placeholder="https://github.com/..."
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">LinkedIn URL</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Linkedin className="w-4 h-4" />
                  </div>
                  <input
                    type="url"
                    value={formData.profile.socialLinks.linkedin}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        profile: {
                          ...prev.profile,
                          socialLinks: { ...prev.profile.socialLinks, linkedin: e.target.value },
                        },
                      }))
                    }
                    placeholder="https://linkedin.com/in/..."
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Portfolio / Website</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Globe className="w-4 h-4" />
                  </div>
                  <input
                    type="url"
                    value={formData.profile.socialLinks.portfolio}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        profile: {
                          ...prev.profile,
                          socialLinks: { ...prev.profile.socialLinks, portfolio: e.target.value },
                        },
                      }))
                    }
                    placeholder="https://myportfolio.dev"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Form Action Buttons */}
          <div className="pt-6 border-t border-slate-800/80 flex items-center justify-end gap-3">
            <Link
              to="/profile"
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold transition-colors"
            >
              Cancel
            </Link>

            <button
              type="submit"
              id="save-profile-btn"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-semibold transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Profile...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfilePage;
