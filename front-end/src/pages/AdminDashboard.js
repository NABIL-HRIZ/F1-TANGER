import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminDashboard.css';
import AdminNavbar from '../components/AdminNavbar';
import AdminSidebar from '../components/AdminSidebar';
import DashboardHome from '../components/dashboard/DashboardHome';
import TeamAdminDashboard from './TeamAdminDashboard';
import DriverAdminDashboard from './DriverAdminDashboard';
import CarsAdminDashboard from './CarsAdminDashboard';
import RacesAdminDashboard from './RacesAdminDashboard';

function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [activePage, setActivePage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Get user from localStorage
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
      return;
    }
    setUser(JSON.parse(storedUser));
  }, [navigate]);

  const handlePageChange = (page) => {
    setActivePage(page);
    // Update URL based on page
    navigate(`/admin/${page}`);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="admin-dashboard">
      <AdminNavbar 
        user={user} 
        onLogout={handleLogout}
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      
      <div className="dashboard-container">
        <AdminSidebar 
          activePage={activePage} 
          onPageChange={handlePageChange}
          isOpen={sidebarOpen}
        />
        
        <main className="dashboard-main">
          {activePage === 'dashboard' && <DashboardHome />}
          {activePage === 'teams' && <TeamAdminDashboard />}
          {activePage === 'drivers' && <DriverAdminDashboard />}
          {activePage === 'cars' && <CarsAdminDashboard />}
          {activePage === 'races' && <RacesAdminDashboard />}
        </main>
      </div>
    </div>
  );
}

export default AdminDashboard;
