import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, Outlet } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Navbar from './components/layout/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Submissions from './pages/Submissions';
import TrainingForm from './pages/TrainingForm';
import BlogEditor from './pages/Blogs';
import Settings from './pages/Settings';
import Login from './pages/Login';
import { applySavedSettings } from './components/applySettings';
import { getSession, clearSession, isSessionValid, updateSessionTimestamp } from './utils/session';

/* ─────────────────────────────────────────────
   Layout wrapper — sidebar + navbar + content
   ───────────────────────────────────────────── */
const DashboardLayout = ({ currentUser, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => { updateSessionTimestamp(); }, []);
  useEffect(() => { applySavedSettings(); }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-slate-950 transition-colors duration-200">
      <Sidebar
        currentUser={currentUser}
        handleLogout={onLogout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          currentUser={currentUser}
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   Root App
   ───────────────────────────────────────────── */
function App({ basename = '/' }) {
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    clearSession();
    setCurrentUser(null);
    navigate('/login');
  };

  useEffect(() => {
    const session = getSession();
    if (session && isSessionValid()) {
      setCurrentUser(session.user);
    } else {
      clearSession();
    }

    applySavedSettings();

    const interval = setInterval(() => {
      if (!isSessionValid() && getSession()) {
        handleLogout();
      }
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Routes basename={basename}>
      {/* Login */}
      <Route
        path="/login"
        element={
          isSessionValid()
            ? <Navigate to="/dashboard" replace />
            : <Login setCurrentUser={setCurrentUser} />
        }
      />

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route
          path="/"
          element={<DashboardLayout currentUser={currentUser} onLogout={handleLogout} />}
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="submissions" element={<Submissions />} />
          <Route path="blogs" element={<BlogEditor />} />
          <Route path="trainingform" element={<TrainingForm />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
