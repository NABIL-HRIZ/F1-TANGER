import React, { useState, useEffect, useCallback } from 'react';

function TeamDriversView({ team, onSelectDriver }) {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTeamDrivers = useCallback(async () => {
    if (!team?.id) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/team/${team.id}/drivers`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch drivers');
      
      const data = await response.json();
      setDrivers(data.data || []);
    } catch (error) {
      console.error('Error fetching drivers:', error);
    } finally {
      setLoading(false);
    }
  }, [team?.id]);

  useEffect(() => {
    fetchTeamDrivers();
  }, [fetchTeamDrivers]);

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}><div className="loader"><div className="f1-wheel"></div></div></div>;
  }

  return (
    <div style={{ padding: '30px' }}>
      <h2 style={{ 
        color: '#fff', 
        marginBottom: '30px',
        fontSize: '28px',
        fontWeight: '600'
      }}>
        👤 My Drivers
      </h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '20px'
      }}>
        {drivers.length > 0 ? (
          drivers.map((driver) => (
            <div key={driver.id} style={{
              background: 'linear-gradient(135deg, #1a1728 0%, #2d1b3d 100%)',
              border: '1px solid rgba(232, 62, 140, 0.3)',
              borderRadius: '12px',
              padding: '20px',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onClick={() => onSelectDriver(driver)}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(232, 62, 140, 0.6)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(232, 62, 140, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(232, 62, 140, 0.3)';
              e.currentTarget.style.boxShadow = 'none';
            }}>
              {driver.driver_img && (
                <div style={{
                  width: '100%',
                  height: '150px',
                  marginBottom: '15px',
                  borderRadius: '8px',
                  backgroundImage: `url(http://localhost:8000/${driver.driver_img})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }} />
              )}

              <h3 style={{ 
                margin: '0 0 10px 0',
                color: '#e83e8c',
                fontSize: '18px',
                fontWeight: '600'
              }}>
                {driver.first_name} {driver.last_name}
              </h3>

              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                marginBottom: '15px',
                fontSize: '13px',
                color: '#a8b5c4'
              }}>
                <p style={{ margin: '0' }}>🎯 Number: {driver.number || 'N/A'}</p>
                <p style={{ margin: '0' }}>🌍 Country: {driver.nationality || 'N/A'}</p>
                <p style={{ margin: '0' }}>📅 DOB: {driver.date_of_birth ? new Date(driver.date_of_birth).toLocaleDateString() : 'N/A'}</p>
                <p style={{ margin: '0' }}>🏆 Points: {driver.total_points || 0}</p>
              </div>

              <div style={{
                padding: '12px',
                background: 'rgba(232, 62, 140, 0.1)',
                borderRadius: '8px',
                fontSize: '12px',
                color: '#cbd5e1',
                textAlign: 'center'
              }}>
                Status: <span style={{ color: '#4ade80' }}>🟢 Active</span>
              </div>
            </div>
          ))
        ) : (
          <div style={{
            gridColumn: '1 / -1',
            textAlign: 'center',
            padding: '60px 40px',
            color: '#7c8fa0'
          }}>
            <p style={{ fontSize: '18px' }}>No drivers assigned yet</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default TeamDriversView;
