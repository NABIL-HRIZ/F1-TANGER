import React, { useState, useEffect, useCallback } from 'react';

function TeamCarsView({ team }) {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTeamCars = useCallback(async () => {
    if (!team?.id) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/team/${team.id}/cars`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch cars');
      
      const data = await response.json();
      setCars(data.data || []);
    } catch (error) {
      console.error('Error fetching cars:', error);
    } finally {
      setLoading(false);
    }
  }, [team?.id]);

  useEffect(() => {
    fetchTeamCars();
  }, [fetchTeamCars]);

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
        🏎️ My Cars
      </h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '20px'
      }}>
        {cars.length > 0 ? (
          cars.map((car) => (
            <div key={car.id} style={{
              background: 'linear-gradient(135deg, #1a1728 0%, #2d1b3d 100%)',
              border: '1px solid rgba(232, 62, 140, 0.3)',
              borderRadius: '12px',
              padding: '20px',
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
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '15px'
              }}>
                <h3 style={{ 
                  margin: '0',
                  color: '#e83e8c',
                  fontSize: '18px',
                  fontWeight: '600'
                }}>
                  Car #{car.car_number}
                </h3>
                <span style={{
                  background: 'rgba(232, 62, 140, 0.2)',
                  color: '#e83e8c',
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  Active
                </span>
              </div>

              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                marginBottom: '15px',
                fontSize: '13px',
                color: '#a8b5c4'
              }}>
                <p style={{ margin: '0' }}>🏭 Model: {car.model}</p>
                <p style={{ margin: '0' }}>⚙️ Chassis: {car.chassis}</p>
                <p style={{ margin: '0' }}>🔧 Engine: {car.engine}</p>
                <p style={{ margin: '0' }}>📅 Year: {car.year}</p>
              </div>

              <div style={{
                padding: '12px',
                background: 'rgba(232, 62, 140, 0.1)',
                borderRadius: '8px',
                fontSize: '12px',
                color: '#cbd5e1',
                textAlign: 'center'
              }}>
                Status: <span style={{ color: '#4ade80' }}>🟢 Ready</span>
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
            <p style={{ fontSize: '18px' }}>No cars assigned yet</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default TeamCarsView;
