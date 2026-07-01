import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, User, Eye, EyeOff, Loader2, ShieldAlert, CheckCircle, ArrowLeft } from 'lucide-react';
import API from '../../services/api';

const Auth = () => {
  const { login, register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Determine initial tab from path
  const isRegisterPath = location.pathname === '/register';
  const [activeTab, setActiveTab] = useState(isRegisterPath ? 'signup' : 'login');

  // Input states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(''); // Renamed from username
  const [otp, setOtp] = useState('');

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);

  // Flow states
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Reset states on tab switch
  useEffect(() => {
    setError('');
    setSuccess('');
    setEmail('');
    setPassword('');
    setName('');
    setOtp('');
    setOtpSent(false);
    setShowPassword(false);
  }, [activeTab]);

  // Sync tab with URL changes
  useEffect(() => {
    setActiveTab(location.pathname === '/register' ? 'signup' : 'login');
  }, [location.pathname]);

  // Google Sign-In Integration
  useEffect(() => {
    const initializeGoogleSignIn = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          // Retrieve from Vite environment variables or use fallback placeholder
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
          callback: handleGoogleCredentialResponse,
        });
        renderGoogleButton();
      }
    };

    if (window.google) {
      initializeGoogleSignIn();
    } else {
      // If the static script in index.html is still loading, wait for it
      const interval = setInterval(() => {
        if (window.google) {
          initializeGoogleSignIn();
          clearInterval(interval);
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  const renderGoogleButton = () => {
    const btnContainer = document.getElementById('google-btn-container');
    if (btnContainer && window.google) {
      window.google.accounts.id.renderButton(btnContainer, {
        theme: 'outline',
        size: 'large',
        width: btnContainer.clientWidth || 382,
        text: activeTab === 'login' ? 'signin_with' : 'signup_with',
        shape: 'rectangular',
      });
    }
  };

  // Re-render Google button on window resize
  useEffect(() => {
    const handleResize = () => {
      renderGoogleButton();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activeTab]);

  const handleGoogleCredentialResponse = async (response) => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      // Perform Google Login
      await loginWithGoogle(response.credential);
      
      setSuccess('Signed in with Google successfully!');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (err) {
      setError(err || 'Google authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    try {
      setError('');
      setLoading(true);
      
      // Call login with email (which maps to usernameOrEmail on backend)
      await login(email, password);
      
      setSuccess('Signed in successfully!');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    try {
      setError('');
      setLoading(true);
      
      // Send OTP to email
      const response = await API.post(`/api/auth/send-otp?email=${encodeURIComponent(email)}`);
      
      setOtpSent(true);
      setSuccess(response.data.message || 'Verification code sent to your email.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send verification code.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterVerify = async (e) => {
    e.preventDefault();
    if (!otp) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    try {
      setError('');
      setLoading(true);
      
      // Complete registration
      const msg = await register(name, email, password, otp);
      
      setSuccess(msg || 'Account created successfully! Redirecting to login...');
      setTimeout(() => {
        // Automatically switch to login tab and reset states
        setActiveTab('login');
        navigate('/login');
      }, 2500);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 flex flex-col justify-center items-center relative overflow-hidden px-4 transition-colors duration-300">
      <div className="w-full max-w-md z-10">

        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link to="/" className="text-3xl font-extrabold tracking-tight text-zinc-955 dark:text-white hover:opacity-80 transition">
            InterviewQuest
          </Link>
          <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
            Fuel your technical placement preparation
          </p>
        </div>

        {/* Unified Card */}
        <div className="bg-zinc-50 dark:bg-[#0d0d11] border border-zinc-200 dark:border-zinc-900 rounded-2xl p-8 shadow-sm transition-all duration-300">
          
          {/* Tabs header */}
          {!otpSent && (
            <div className="flex border-b border-zinc-200 dark:border-zinc-850 mb-6 p-1 bg-zinc-100 dark:bg-zinc-950 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('login');
                  navigate('/login');
                }}
                className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition duration-200 cursor-pointer ${
                  activeTab === 'login'
                    ? 'bg-white dark:bg-[#18181b] text-zinc-950 dark:text-white shadow-sm'
                    : 'text-zinc-500 dark:text-zinc-450 hover:text-zinc-800 dark:hover:text-zinc-200'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('signup');
                  navigate('/register');
                }}
                className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition duration-200 cursor-pointer ${
                  activeTab === 'signup'
                    ? 'bg-white dark:bg-[#18181b] text-zinc-950 dark:text-white shadow-sm'
                    : 'text-zinc-500 dark:text-zinc-450 hover:text-zinc-800 dark:hover:text-zinc-200'
                }`}
              >
                Create Account
              </button>
            </div>
          )}

          {/* Feedback messages */}
          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-650 dark:text-red-400 text-xs text-center mb-6 flex items-center justify-center space-x-1.5">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs text-center mb-6 flex items-center justify-center space-x-1.5">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Flow 1: Login Form */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-zinc-650 dark:text-zinc-350 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-500">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="block w-full pl-11 pr-4 py-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-zinc-450 dark:focus:border-zinc-600 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 text-xs transition duration-200"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-semibold text-zinc-650 dark:text-zinc-350">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-[11px] font-semibold text-indigo-650 dark:text-indigo-400 hover:underline transition duration-200"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-500">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full pl-11 pr-11 py-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-zinc-450 dark:focus:border-zinc-600 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 text-xs transition duration-200"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-400 dark:text-zinc-500 hover:text-zinc-650 dark:hover:text-zinc-300"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 flex justify-center items-center bg-zinc-955 dark:bg-white hover:bg-zinc-850 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 text-xs font-bold rounded-xl shadow-sm transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>
          )}

          {/* Flow 2: Signup Form (Step 1 - Enter details) */}
          {activeTab === 'signup' && !otpSent && (
            <form onSubmit={handleSendOtp} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-zinc-650 dark:text-zinc-350 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-500">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="block w-full pl-11 pr-4 py-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-zinc-450 dark:focus:border-zinc-600 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 text-xs transition duration-200"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-650 dark:text-zinc-350 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-500">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                    className="block w-full pl-11 pr-4 py-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-zinc-450 dark:focus:border-zinc-600 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 text-xs transition duration-200"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-650 dark:text-zinc-350 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-500">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full pl-11 pr-11 py-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-zinc-450 dark:focus:border-zinc-600 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 text-xs transition duration-200"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-400 dark:text-zinc-500 hover:text-zinc-650 dark:hover:text-zinc-300"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 flex justify-center items-center bg-zinc-950 dark:bg-white hover:bg-zinc-850 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 text-xs font-bold rounded-xl shadow-sm transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Sending Code...
                  </>
                ) : (
                  'Send Verification Code'
                )}
              </button>
            </form>
          )}

          {/* Flow 3: Signup Form (Step 2 - Verify OTP) */}
          {activeTab === 'signup' && otpSent && (
            <form onSubmit={handleRegisterVerify} className="space-y-6">
              <div className="text-center">
                <p className="text-xs text-zinc-500 dark:text-zinc-405 leading-relaxed">
                  We've sent a 6-digit verification code to <strong className="text-zinc-800 dark:text-zinc-200">{email}</strong>. Please enter it below.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-650 dark:text-zinc-350 mb-2 text-center">
                  Verification Code (OTP)
                </label>
                <input
                  type="text"
                  maxLength="6"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="block w-full py-3.5 bg-white dark:bg-zinc-955 border border-zinc-205 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-zinc-450 dark:focus:border-zinc-600 text-zinc-905 dark:text-zinc-100 text-center tracking-[0.5em] text-lg font-bold placeholder-zinc-300 dark:placeholder-zinc-700 transition duration-200"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 flex justify-center items-center bg-zinc-950 dark:bg-white hover:bg-zinc-850 dark:hover:bg-zinc-202 text-white dark:text-zinc-950 text-xs font-bold rounded-xl shadow-sm transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Creating Account...
                  </>
                ) : (
                  'Verify & Create Account'
                )}
              </button>

              <div className="flex justify-between items-center text-xs pt-2">
                <button
                  type="button"
                  onClick={() => setOtpSent(false)}
                  className="inline-flex items-center text-zinc-500 hover:text-zinc-950 dark:hover:text-white transition duration-200 font-semibold cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                  Edit Details
                </button>
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={loading}
                  className="text-indigo-650 dark:text-indigo-400 hover:underline transition duration-200 font-semibold cursor-pointer"
                >
                  Resend Code
                </button>
              </div>
            </form>
          )}

          {/* Divider & Social Login */}
          {!otpSent && (
            <>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-zinc-200 dark:border-zinc-900"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-zinc-50 dark:bg-[#0d0d11] px-3 text-zinc-400 dark:text-zinc-500">
                    Or continue with
                  </span>
                </div>
              </div>

              {/* Google Button Container */}
              <div className="flex justify-center w-full">
                <div id="google-btn-container" className="w-full flex justify-center min-h-[44px]"></div>
              </div>
            </>
          )}

        </div>

      </div>
    </div>
  );
};

export default Auth;
