import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/user/Dashboard';
import Profile from './pages/user/Profile';
import Practice from './pages/user/Practice';
import Assessments from './pages/user/Assessments';
import MockInterview from './pages/user/MockInterview';
import AdminDashboard from './pages/admin/AdminDashboard';
import Companies from './pages/user/Companies';
import LandingPage from './pages/LandingPage';

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
      <div className="min-h-screen bg-slate-950 flex justify-center items-center text-slate-400">
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
      <Router>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Secure User Routes */}
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/companies" element={<PrivateRoute><Companies /></PrivateRoute>} />
          <Route path="/practice" element={<Practice />} />
          <Route path="/assessments" element={<PrivateRoute><Assessments /></PrivateRoute>} />
          <Route path="/mock-interview" element={<PrivateRoute><MockInterview /></PrivateRoute>} />

          {/* Secure Admin Routes */}
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />

          {/* Default Redirect Fallbacks */}
          <Route path="/" element={<LandingPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
