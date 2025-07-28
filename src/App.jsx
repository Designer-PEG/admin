import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Submissions from './pages/Submissions';
import TrainingForm from './pages/TrainingForm';
import Settings from './pages/Settings';
import Login from './pages/Login';
import { applySavedSettings } from './components/applySettings';
import { getSession, clearSession, isSessionValid, updateSessionTimestamp } from './utils/session';

const DashboardLayout = ({ currentUser, onLogout }) => {
  // Update session timestamp on any interaction
  useEffect(() => {
    updateSessionTimestamp();
  }, []);

  // Apply settings when component mounts
  useEffect(() => {
    applySavedSettings();
  }, []);

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
      <Sidebar currentUser={currentUser} handleLogout={onLogout} />
      <div className="flex-1 overflow-auto p-4">
        <Outlet />
      </div>
    </div>
  );
};

const DashboardContent = () => (
  <>
    <header className="bg-white dark:bg-gray-800 shadow-sm transition-colors duration-200">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Dashboard
        </h1>
      </div>
    </header>
    <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <Dashboard />
    </main>
  </>
);

function App({ basename = "/" }) {
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    clearSession();
    setCurrentUser(null);
    navigate('/login');
  };

  // Check for existing session on app load
  useEffect(() => {
    const session = getSession();
    if (session && isSessionValid()) {
      setCurrentUser(session.user);
    } else {
      clearSession();
    }
    
    // Apply settings when app loads
    applySavedSettings();

    // Set up interval to check session validity
    const interval = setInterval(() => {
      if (!isSessionValid() && getSession()) {
        handleLogout();
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  return (
    <Routes basename={basename}>
      {/* Login Route */}
      <Route
        path="/login"
        element={
          isSessionValid() ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Login setCurrentUser={setCurrentUser} />
          )
        }
      />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route
          path="/"
          element={<DashboardLayout currentUser={currentUser} onLogout={handleLogout} />}
        >
          <Route path="dashboard" element={<DashboardContent />} />
          <Route path="submissions" element={<Submissions />} />
          <Route path="trainingform" element={<TrainingForm />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;