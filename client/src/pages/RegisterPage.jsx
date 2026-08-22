import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  User as UserIcon,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Building,
  GraduationCap,
  Sparkles,
  AlertCircle,
  Loader2,
  Check,
  X,
  ArrowRight,
  BadgeCheck,
} from 'lucide-react';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    department: '',
    graduationYear: 2026,
    collegeId: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  if (isAuthenticated) {
    navigate('/dashboard', { replace: true });
  }

  // Password rules validation
  const passwordChecks = {
    length: formData.password.length >= 8,
    uppercase: /[A-Z]/.test(formData.password),
    lowercase: /[a-z]/.test(formData.password),
    number: /\d/.test(formData.password),
    special: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(formData.password),
  };

  const passwordScore = Object.values(passwordChecks).filter(Boolean).length;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (errorMessage) {
      setErrorMessage('');
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      errors.name = 'Full name must be at least 2 characters';
    }

    if (!formData.email.trim() || !/^\S+@\S+\.\S+$/.test(formData.email)) {
      errors.email = 'Please provide a valid email address';
    }

    if (passwordScore < 5) {
      errors.password = 'Password does not satisfy security requirements';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setErrorMessage('');

    try {
      await register(formData);
      navigate('/dashboard', { replace: true });
    } catch (error) {
      if (error.errors && Array.isArray(error.errors)) {
        const errorsObj = {};
        error.errors.forEach((err) => {
          errorsObj[err.field] = err.message;
        });
        setFieldErrors(errorsObj);
      } else {
        setErrorMessage(error.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-lg w-full glass-panel p-8 sm:p-10 rounded-3xl border border-slate-800 shadow-2xl relative">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Join CampusFlow</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Create Your Account
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1.5">
            One platform for your entire college and career journey
          </p>
        </div>

        {/* Global Error Alert */}
        {errorMessage && (
          <div className="mb-6 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 text-red-400 text-xs">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Role selector */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">Select Your Role</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, role: 'student' }))}
                className={`py-2.5 px-4 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  formData.role === 'student'
                    ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-md shadow-indigo-500/10'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>Student</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, role: 'faculty' }))}
                className={`py-2.5 px-4 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  formData.role === 'faculty'
                    ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-md shadow-indigo-500/10'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <BadgeCheck className="w-4 h-4" />
                <span>Faculty</span>
              </button>
            </div>
          </div>

          {/* Full Name field */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Full Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <UserIcon className="w-4 h-4" />
              </div>
              <input
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Alex Johnson"
                className={`w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border rounded-xl text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                  fieldErrors.name
                    ? 'border-red-500/60 focus:ring-red-500/40'
                    : 'border-slate-800 focus:border-indigo-500/50'
                }`}
              />
            </div>
            {fieldErrors.name && (
              <p className="text-red-400 text-[11px] mt-1">{fieldErrors.name}</p>
            )}
          </div>

          {/* Email field */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="alex.johnson@college.edu"
                className={`w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border rounded-xl text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                  fieldErrors.email
                    ? 'border-red-500/60 focus:ring-red-500/40'
                    : 'border-slate-800 focus:border-indigo-500/50'
                }`}
              />
            </div>
            {fieldErrors.email && (
              <p className="text-red-400 text-[11px] mt-1">{fieldErrors.email}</p>
            )}
          </div>

          {/* Password field */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                id="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create strong password"
                className={`w-full pl-10 pr-10 py-2.5 bg-slate-900/80 border rounded-xl text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                  fieldErrors.password
                    ? 'border-red-500/60 focus:ring-red-500/40'
                    : 'border-slate-800 focus:border-indigo-500/50'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Password Strength Checklist */}
            {formData.password.length > 0 && (
              <div className="mt-2.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                  <span>Password Strength</span>
                  <span
                    className={`font-semibold ${
                      passwordScore === 5
                        ? 'text-emerald-400'
                        : passwordScore >= 3
                        ? 'text-amber-400'
                        : 'text-red-400'
                    }`}
                  >
                    {passwordScore === 5 ? 'Strong' : passwordScore >= 3 ? 'Medium' : 'Weak'}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden flex gap-1">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      passwordScore <= 2
                        ? 'bg-red-500'
                        : passwordScore <= 4
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${(passwordScore / 5) * 100}%` }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-x-2 gap-y-1 pt-1 text-[10px]">
                  <span
                    className={`flex items-center gap-1 ${
                      passwordChecks.length ? 'text-emerald-400' : 'text-slate-500'
                    }`}
                  >
                    {passwordChecks.length ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                    8+ Characters
                  </span>
                  <span
                    className={`flex items-center gap-1 ${
                      passwordChecks.uppercase ? 'text-emerald-400' : 'text-slate-500'
                    }`}
                  >
                    {passwordChecks.uppercase ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                    Uppercase
                  </span>
                  <span
                    className={`flex items-center gap-1 ${
                      passwordChecks.number ? 'text-emerald-400' : 'text-slate-500'
                    }`}
                  >
                    {passwordChecks.number ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                    Number
                  </span>
                  <span
                    className={`flex items-center gap-1 ${
                      passwordChecks.special ? 'text-emerald-400' : 'text-slate-500'
                    }`}
                  >
                    {passwordChecks.special ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                    Special Symbol
                  </span>
                </div>
              </div>
            )}
            {fieldErrors.password && (
              <p className="text-red-400 text-[11px] mt-1">{fieldErrors.password}</p>
            )}
          </div>

          {/* Department & College ID (2-column layout) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Department</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Building className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  placeholder="Computer Science"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                College ID / Roll No
              </label>
              <input
                type="text"
                name="collegeId"
                value={formData.collegeId}
                onChange={handleChange}
                placeholder="2026-CS-042"
                className="w-full px-4 py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500/50"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            id="register-submit-btn"
            disabled={loading}
            className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 active:scale-[0.99] text-white text-xs font-semibold transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Complete Registration</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer link to login */}
        <p className="text-center text-slate-400 text-xs mt-6">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-2 transition-colors"
          >
            Sign In Here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
