import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Auth from './pages/auth/Auth';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Dashboard from './pages/user/Dashboard';
import Assessments from './pages/user/Assessments';
import MockInterview from './pages/user/MockInterview';
import AdminDashboard from './pages/admin/AdminDashboard';
import LandingPage from './pages/LandingPage';
import Resources from './pages/user/Resources';
import Profile from './pages/user/Profile';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
import Privacy from './pages/Privacy';
import TermsConditions from './pages/TermsConditions';
import ScrollToTop from './components/ScrollToTop';

// Route Guard for unauthenticated guests
const PublicRoute = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex justify-center items-center text-slate-400">
        Loading session...
      </div>
    );
  }

  if (user) {
    return <Navigate to={isAdmin ? "/admin" : "/dashboard"} replace />;
  }

  return children;
};

// Route Guard for authenticated candidates
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex justify-center items-center text-slate-400">
        Loading session...
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
};

// Route Guard for administrators
const AdminRoute = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex justify-center items-center text-slate-405">
        Loading session...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return isAdmin ? children : <Navigate to="/dashboard" replace />;
};

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <ScrollToTop />
          <Routes>
            {/* Public Auth Routes (Guest Only) */}
            <Route path="/login" element={<PublicRoute><Auth /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><Auth /></PublicRoute>} />
            <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
            <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />

            {/* Public Content Routes */}
            <Route path="/resources/:subjectSlug/:topicSlug" element={<Resources />} />
            <Route path="/resources/:subjectSlug" element={<Resources />} />

            {/* Public Info Routes */}
            <Route path="/about-us" element={<AboutUs />} />
            <Route path="/contact-us" element={<ContactUs />} />
            <Route path="/privacy-policy" element={<Privacy />} />
            <Route path="/terms-conditions" element={<TermsConditions />} />

            {/* Secure User Routes */}
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
            <Route path="/practice-quiz" element={<PrivateRoute><Assessments /></PrivateRoute>} />
            <Route path="/practice-quiz/:subjectSlug" element={<PrivateRoute><Assessments /></PrivateRoute>} />
            <Route path="/practice-quiz/:subjectSlug/:topicSlug" element={<PrivateRoute><Assessments /></PrivateRoute>} />
            <Route path="/practice-quiz/attempt/:quizId" element={<PrivateRoute><Assessments /></PrivateRoute>} />
            <Route path="/practice-quiz/mix/:subjectSlugs" element={<PrivateRoute><Assessments /></PrivateRoute>} />
            <Route path="/mock-interview" element={<PrivateRoute><MockInterview /></PrivateRoute>} />

            {/* Secure Admin Routes */}
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />

            {/* Default Redirect Fallbacks */}
            <Route path="/" element={<LandingPage />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
