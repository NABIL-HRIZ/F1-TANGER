import React, { useState, useEffect, useCallback } from 'react';

function TeamDriverPerformance({ team, driver }) {
  const [driverData, setDriverData] = useState(driver);
  const [raceStats, setRaceStats] = useState([]);
  const [bestLapTime, setBestLapTime] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDriverPerformance = useCallback(async () => {
    if (!driver?.id || !team?.id) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Set driver data immediately
      setDriverData(driver);

      // Fetch performance stats
      const statsResponse = await fetch(`http://localhost:8000/api/driver/${driver.id}/performance`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        const stats = statsData.data || [];
        setRaceStats(stats);

        // Calculate best lap time from all races
        if (stats.length > 0) {
          const bestLap = stats.reduce((best, race) => {
            if (!race.best_lap_time || race.best_lap_time === 'N/A') return best;
            if (!best) return race.best_lap_time;
            
            // Compare lap times (HH:MM:SS:MMM format)
            const bestMs = convertLapTimeToMilliseconds(best);
            const raceMs = convertLapTimeToMilliseconds(race.best_lap_time);
            
            return raceMs < bestMs ? race.best_lap_time : best;
          }, null);
          
          setBestLapTime(bestLap);
        }
      }
    } catch (error) {
      console.error('Error fetching performance data:', error);
      setRaceStats([]);
    } finally {
      setLoading(false);
    }
  }, [driver, team?.id]);

  // Helper function to convert lap time HH:MM:SS:MMM to milliseconds for comparison
  const convertLapTimeToMilliseconds = (lapTime) => {
    if (!lapTime || lapTime === 'N/A') return Infinity;
    const parts = lapTime.split(':');
    if (parts.length !== 4) return Infinity;
    return parseInt(parts[0]) * 3600000 + parseInt(parts[1]) * 60000 + parseInt(parts[2]) * 1000 + parseInt(parts[3]);
  };

  useEffect(() => {
    fetchDriverPerformance();
  }, [fetchDriverPerformance]);

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
        Performance Analysis
      </h2>

      {driverData && (
        <div>
          {/* Driver Overview */}
          <div style={{
            background: 'linear-gradient(135deg, #1a1728 0%, #2d1b3d 100%)',
            border: '1px solid rgba(232, 62, 140, 0.3)',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '30px'
          }}>
            <h3 style={{ color: '#e83e8c', margin: '0 0 20px 0', fontSize: '20px', fontWeight: '600' }}>
              {driverData.first_name} {driverData.last_name} - Performance Overview
            </h3>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '15px'
            }}>
              <div style={{
                padding: '15px',
                background: 'rgba(232, 62, 140, 0.1)',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ color: '#a8b5c4', fontSize: '12px', marginBottom: '8px' }}>Total Points</div>
                <div style={{ color: '#e83e8c', fontSize: '28px', fontWeight: '700' }}>{driverData.total_points || 0}</div>
              </div>

              <div style={{
                padding: '15px',
                background: 'rgba(100, 200, 255, 0.1)',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ color: '#a8b5c4', fontSize: '12px', marginBottom: '8px' }}>Best Lap</div>
                <div style={{ color: '#64c8ff', fontSize: '28px', fontWeight: '700' }}>{bestLapTime || 'N/A'}</div>
              </div>

              <div style={{
                padding: '15px',
                background: 'rgba(74, 222, 128, 0.1)',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ color: '#a8b5c4', fontSize: '12px', marginBottom: '8px' }}>Races</div>
                <div style={{ color: '#4ade80', fontSize: '28px', fontWeight: '700' }}>{raceStats.length || 0}</div>
              </div>
            </div>
          </div>

          {/* Race Statistics */}
          <div style={{
            background: 'linear-gradient(135deg, #1a1728 0%, #2d1b3d 100%)',
            border: '1px solid rgba(232, 62, 140, 0.3)',
            borderRadius: '12px',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '20px',
              borderBottom: '1px solid rgba(232, 62, 140, 0.3)'
            }}>
              <h3 style={{ color: '#e83e8c', margin: '0', fontSize: '18px', fontWeight: '600' }}>
                Race Performance
              </h3>
            </div>

            {raceStats.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '13px'
                }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(232, 62, 140, 0.3)' }}>
                      <th style={{ padding: '15px', textAlign: 'left', color: '#e83e8c', fontWeight: '600' }}>Race</th>
                      <th style={{ padding: '15px', textAlign: 'center', color: '#e83e8c', fontWeight: '600' }}>Position</th>
                      <th style={{ padding: '15px', textAlign: 'center', color: '#e83e8c', fontWeight: '600' }}>Points</th>
                      <th style={{ padding: '15px', textAlign: 'center', color: '#e83e8c', fontWeight: '600' }}>Laps</th>
                      <th style={{ padding: '15px', textAlign: 'center', color: '#e83e8c', fontWeight: '600' }}>Total Time</th>
                      <th style={{ padding: '15px', textAlign: 'center', color: '#e83e8c', fontWeight: '600' }}>Best Lap</th>
                    </tr>
                  </thead>
                  <tbody>
                    {raceStats.map((race, idx) => (
                      <tr key={idx} style={{ 
                        borderBottom: '1px solid rgba(232, 62, 140, 0.2)',
                        backgroundColor: idx % 2 === 0 ? 'rgba(232, 62, 140, 0.05)' : 'transparent'
                      }}>
                        <td style={{ padding: '15px', color: '#cbd5e1' }}>{race.race_name}</td>
                        <td style={{ padding: '15px', textAlign: 'center', color: '#64c8ff', fontWeight: '600' }}>
                          {race.position || 'DNF'}
                        </td>
                        <td style={{ padding: '15px', textAlign: 'center', color: '#4ade80', fontWeight: '600' }}>
                          {race.points || 0}
                        </td>
                        <td style={{ padding: '15px', textAlign: 'center', color: '#cbd5e1' }}>
                          {race.lap_count || 0}
                        </td>
                        <td style={{ padding: '15px', textAlign: 'center', color: '#64c8ff', fontWeight: '600' }}>
                          {race.total_time || 'N/A'}
                        </td>
                        <td style={{ padding: '15px', textAlign: 'center', color: '#fbbf24', fontWeight: '600' }}>
                          {race.best_lap_time || 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{
                padding: '40px',
                textAlign: 'center',
                color: '#7c8fa0'
              }}>
                No race data available for this driver
              </div>
            )}
          </div>
        </div>
      )}

      {!driver && !loading && (
        <div style={{
          textAlign: 'center',
          padding: '60px 40px',
          color: '#7c8fa0'
        }}>
          <p style={{ fontSize: '18px' }}>Failed to load driver data</p>
        </div>
      )}
    </div>
  );
}

export default TeamDriverPerformance;
