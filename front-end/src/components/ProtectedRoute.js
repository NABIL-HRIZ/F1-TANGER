import React from 'react';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children, requiredRole }) {
  // Get user data from localStorage
  const userStr = localStorage.getItem('user');
  const token = localStorage.getItem('token');

  // If no token or user, redirect to login
  if (!token || !userStr) {
    return <Navigate to="/login" replace />;
  }

  try {
    const user = JSON.parse(userStr);
    
    // Check if user has the required role
    if (user.roles && user.roles.length > 0) {
      const hasRole = user.roles.some(role => role.name === requiredRole);
      
      if (!hasRole) {
        // User doesn't have the required role, redirect to login
        return <Navigate to="/login" replace />;
      }
    } else {
      // No roles found, redirect to login
      return <Navigate to="/login" replace />;
    }

    // User has the required role, render the component
    return children;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return <Navigate to="/login" replace />;
  }
}

export default ProtectedRoute;
