import React, { useState, useEffect } from 'react';

function TeamDashboardHome({ team }) {
  const [stats, setStats] = useState({
    cars: 0,
    drivers: 0,
    totalPoints: 0,
    races: 0
  });

  useEffect(() => {
    if (team) {
      setStats({
        cars: team.cars_count || team.cars?.length || 0,
        drivers: team.drivers_count || team.drivers?.length || 0,
        totalPoints: team.total_points || 0,
        races: team.races_count || 0
      });
    }
  }, [team]);

  return (
    <div style={{ padding: '30px' }}>
      <h1 style={{ 
        color: '#fff', 
        marginBottom: '40px',
        fontSize: '36px',
        fontWeight: '700'
      }}>
        🏁 {team?.name} - Team Dashboard
      </h1>

      {/* Quick Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '40px'
      }}>
        {/* Cars Card */}
        <div style={{
          background: 'linear-gradient(135deg, #1a1728 0%, #2d1b3d 100%)',
          border: '1px solid rgba(232, 62, 140, 0.3)',
          borderRadius: '12px',
          padding: '25px',
          textAlign: 'center',
          transition: 'all 0.3s ease',
          cursor: 'pointer'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'rgba(232, 62, 140, 0.6)';
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(232, 62, 140, 0.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'rgba(232, 62, 140, 0.3)';
          e.currentTarget.style.boxShadow = 'none';
        }}>
          <div style={{ fontSize: '40px', marginBottom: '10px' }}>🏎️</div>
          <div style={{ color: '#a8b5c4', fontSize: '14px', marginBottom: '10px' }}>Total Cars</div>
          <div style={{ color: '#e83e8c', fontSize: '36px', fontWeight: '700' }}>{stats.cars}</div>
        </div>

        {/* Drivers Card */}
        <div style={{
          background: 'linear-gradient(135deg, #1a1728 0%, #2d1b3d 100%)',
          border: '1px solid rgba(232, 62, 140, 0.3)',
          borderRadius: '12px',
          padding: '25px',
          textAlign: 'center',
          transition: 'all 0.3s ease',
          cursor: 'pointer'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'rgba(232, 62, 140, 0.6)';
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(232, 62, 140, 0.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'rgba(232, 62, 140, 0.3)';
          e.currentTarget.style.boxShadow = 'none';
        }}>
          <div style={{ fontSize: '40px', marginBottom: '10px' }}>👤</div>
          <div style={{ color: '#a8b5c4', fontSize: '14px', marginBottom: '10px' }}>Total Drivers</div>
          <div style={{ color: '#64c8ff', fontSize: '36px', fontWeight: '700' }}>{stats.drivers}</div>
        </div>

        {/* Points Card */}
        <div style={{
          background: 'linear-gradient(135deg, #1a1728 0%, #2d1b3d 100%)',
          border: '1px solid rgba(232, 62, 140, 0.3)',
          borderRadius: '12px',
          padding: '25px',
          textAlign: 'center',
          transition: 'all 0.3s ease',
          cursor: 'pointer'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'rgba(232, 62, 140, 0.6)';
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(232, 62, 140, 0.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'rgba(232, 62, 140, 0.3)';
          e.currentTarget.style.boxShadow = 'none';
        }}>
          <div style={{ fontSize: '40px', marginBottom: '10px' }}>🏆</div>
          <div style={{ color: '#a8b5c4', fontSize: '14px', marginBottom: '10px' }}>Total Points</div>
          <div style={{ color: '#fbbf24', fontSize: '36px', fontWeight: '700' }}>{stats.totalPoints}</div>
        </div>

        {/* Races Card */}
        <div style={{
          background: 'linear-gradient(135deg, #1a1728 0%, #2d1b3d 100%)',
          border: '1px solid rgba(232, 62, 140, 0.3)',
          borderRadius: '12px',
          padding: '25px',
          textAlign: 'center',
          transition: 'all 0.3s ease',
          cursor: 'pointer'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'rgba(232, 62, 140, 0.6)';
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(232, 62, 140, 0.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'rgba(232, 62, 140, 0.3)';
          e.currentTarget.style.boxShadow = 'none';
        }}>
          <div style={{ fontSize: '40px', marginBottom: '10px' }}>🏁</div>
          <div style={{ color: '#a8b5c4', fontSize: '14px', marginBottom: '10px' }}>Participated Races</div>
          <div style={{ color: '#4ade80', fontSize: '36px', fontWeight: '700' }}>{stats.races}</div>
        </div>
      </div>
    </div>
  );
}

export default TeamDashboardHome;
