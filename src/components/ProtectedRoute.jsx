// src/components/ProtectedRoute.js
import { Navigate, Outlet } from 'react-router-dom';
import { isSessionValid } from '../utils/session';

const ProtectedRoute = () => {
  if (!isSessionValid()) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;