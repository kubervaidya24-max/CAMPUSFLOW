import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Loader2,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const from = location.state?.from?.pathname || '/dashboard';

  // If already authenticated, redirect
  if (isAuthenticated) {
    navigate(from, { replace: true });
  }

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
    if (!formData.email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
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
      await login(formData);
      navigate(from, { replace: true });
    } catch (error) {
      if (error.errors && Array.isArray(error.errors)) {
        const errorsObj = {};
        error.errors.forEach((err) => {
          errorsObj[err.field] = err.message;
        });
        setFieldErrors(errorsObj);
      } else {
        setErrorMessage(error.message || 'Login failed. Please verify your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = (role) => {
    const demos = {
      student: { email: 'student.alex@campusflow.edu', password: 'Password123!' },
      faculty: { email: 'faculty.sarah@campusflow.edu', password: 'Password123!' },
      admin: { email: 'admin.system@campusflow.edu', password: 'Password123!' },
    };
    const selected = demos[role];
    if (selected) {
      setFormData(selected);
      setFieldErrors({});
      setErrorMessage('');
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-md w-full glass-panel p-8 sm:p-10 rounded-3xl border border-slate-800 shadow-2xl relative">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>CampusFlow Authentication</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome Back
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1.5">
            Sign in to access your unified college portal
          </p>
        </div>

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="mb-6 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 text-red-400 text-xs">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Email field */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Email Address
            </label>
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
                placeholder="you@college.edu"
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
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-slate-300">Password</label>
            </div>
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
                placeholder="••••••••••••"
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
            {fieldErrors.password && (
              <p className="text-red-400 text-[11px] mt-1">{fieldErrors.password}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            id="login-submit-btn"
            disabled={loading}
            className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 active:scale-[0.99] text-white text-xs font-semibold transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Fast Fill Section for Reviewers */}
        <div className="mt-6 pt-5 border-t border-slate-800/80">
          <div className="flex items-center gap-1 text-[11px] font-medium text-slate-400 mb-2.5">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>Quick Fill Testing Credentials:</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => fillDemoAccount('student')}
              className="px-2 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 font-medium transition-colors"
            >
              Student
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('faculty')}
              className="px-2 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 font-medium transition-colors"
            >
              Faculty
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('admin')}
              className="px-2 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 font-medium transition-colors"
            >
              Admin
            </button>
          </div>
        </div>

        {/* Footer link to register */}
        <p className="text-center text-slate-400 text-xs mt-6">
          Don&apos;t have an account?{' '}
          <Link
            to="/register"
            className="text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-2 transition-colors"
          >
            Create an Account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
