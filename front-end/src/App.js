import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import TeamUserDashboard from './pages/TeamUserDashboard';
import ClientDashboard from './pages/ClientDashboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* Landing/Home Page */}
        <Route path="/" element={<Home />} />
        
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Admin Dashboard - Protected Routes */}
        <Route 
          path="/admin/*" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard/admin" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Team Dashboard - Protected Routes */}
        <Route 
          path="/team-dashboard/*" 
          element={
            <ProtectedRoute requiredRole="team">
              <TeamUserDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard/team/*" 
          element={
            <ProtectedRoute requiredRole="team">
              <TeamUserDashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Client Dashboard - Protected Routes */}
        <Route 
          path="/dashboard/client" 
          element={
            <ProtectedRoute requiredRole="client">
              <ClientDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard/client/profile" 
          element={
            <ProtectedRoute requiredRole="client">
              <ClientDashboard />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
