import React from 'react';
import { Navigate } from 'react-router-dom';
import { authAPI } from '../services/api';

const RoleBasedRoute = ({ children, allowedRoles = [] }) => {
  const isAuthenticated = authAPI.isAuthenticated();
  const user = authAPI.getCurrentUser();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    // Redirect based on user role
    if (user?.role === 'admin') {
      return <Navigate to="/admindashboard" replace />;
    } else if (user?.role === 'user') {
      return <Navigate to="/properties" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
};

export default RoleBasedRoute;