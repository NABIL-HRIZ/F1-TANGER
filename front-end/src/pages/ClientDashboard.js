import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AdminNavbar from '../components/AdminNavbar';
import AdminSidebar from '../components/AdminSidebar';
import ClientTicketsHome from '../components/client/ClientTicketsHome';
import ClientProfileHome from '../components/client/ClientProfileHome';

function ClientDashboard() {
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Determine active page from URL
  const getActivePage = () => {
    if (location.pathname.includes('/profile')) return 'profile';
    return 'tickets';
  };

  const [activePage, setActivePage] = useState(getActivePage());

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const res = await fetch('http://localhost:8000/api/user', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) {
          navigate('/login');
          return;
        }
        const data = await res.json();
        setUser(data);
      } catch (error) {
        console.error('Error fetching user:', error);
        navigate('/login');
      }
    };

    fetchUser();
  }, [navigate]);

  // Update URL when page changes
  const handlePageChange = (page) => {
    setActivePage(page);
    if (page === 'tickets') {
      navigate('/dashboard/client');
    } else if (page === 'profile') {
      navigate('/dashboard/client/profile');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!user) return null;

  const clientNavItems = [
    { id: 'tickets', label: 'My Tickets', icon: '🎫' },
    { id: 'profile', label: 'My Profile', icon: '👤' },
  ];

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
          items={clientNavItems}
        />
        
        <main className="dashboard-main">
          {activePage === 'tickets' && <ClientTicketsHome user={user} />}
          {activePage === 'profile' && <ClientProfileHome user={user} setUser={setUser} />}
        </main>
      </div>
    </div>
  );
}

export default ClientDashboard;
