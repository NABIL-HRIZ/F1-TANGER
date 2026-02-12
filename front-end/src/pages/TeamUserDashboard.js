import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import '../styles/AdminDashboard.css';
import '../styles/TeamUserDashboard.css';
import AdminNavbar from '../components/AdminNavbar';
import TeamUserSidebar from '../components/TeamUserSidebar';
import TeamDashboardHome from '../components/dashboard/TeamDashboardHome';
import TeamCarsView from '../components/team/TeamCarsView';
import TeamDriversView from '../components/team/TeamDriversView';
import TeamDriverPerformance from '../components/team/TeamDriverPerformance';

function TeamUserDashboard() {
  const [user, setUser] = useState(null);
  const [team, setTeam] = useState(null);
  const [activePage, setActivePage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const navigate = useNavigate();
  const { driverName } = useParams();
  const location = useLocation();

  useEffect(() => {
    // Determine current page from URL
    const path = location.pathname;
    if (path.includes('/performance/')) {
      setActivePage('performance');
    } else if (path.includes('/cars')) {
      setActivePage('cars');
    } else if (path.includes('/drivers')) {
      setActivePage('drivers');
    } else {
      setActivePage('dashboard');
    }
  }, [location.pathname]);

  useEffect(() => {
    // Get user from localStorage
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
      return;
    }
    setUser(JSON.parse(storedUser));
    
    // Fetch team data for this user
    fetchTeamData();
  }, [navigate]);

  const fetchTeamData = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/team', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch team data');
      
      const data = await response.json();
      setTeam(data.data);
    } catch (error) {
      console.error('Error fetching team:', error);
      alert('Error loading team data');
    } finally {
      setLoading(false);
    }
  }, []);

  const handlePageChange = (page) => {
    setActivePage(page);
    navigate(`/team-dashboard/${page}`);
  };

  const handleDriverSelect = (driver) => {
    setActivePage('performance');
    setSelectedDriver(driver);
    const driverUrlName = `${driver.first_name}-${driver.last_name}`.toLowerCase();
    navigate(`/team-dashboard/performance/${driverUrlName}`);
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
        <TeamUserSidebar 
          activePage={activePage} 
          onPageChange={handlePageChange}
          isOpen={sidebarOpen}
          teamName={team?.name}
        />
        
        <main className="dashboard-main">
          {activePage === 'dashboard' && <TeamDashboardHome team={team} />}
          {activePage === 'cars' && <TeamCarsView team={team} />}
          {activePage === 'drivers' && <TeamDriversView team={team} onSelectDriver={handleDriverSelect} />}
          {activePage === 'performance' && selectedDriver && <TeamDriverPerformance team={team} driver={selectedDriver} />}
        </main>
      </div>
    </div>
  );
}

export default TeamUserDashboard;
