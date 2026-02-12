import React, { useState, useEffect, useRef } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import '../../styles/DashboardHome.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function DashboardHome() {
  const [stats, setStats] = useState({ totalRaces: 0, totalDrivers: 0, totalTeams: 0, activeRaces: 0 });
  const [raceData, setRaceData] = useState([]);
  const [topDrivers, setTopDrivers] = useState([]);
  const [teamPoints, setTeamPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchData();
    }
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
      
      // Optimized: Only 3 API requests
      const results = await Promise.all([
        fetch(`${apiUrl}/races/top-races`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
        fetch(`${apiUrl}/drivers`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
        fetch(`${apiUrl}/teams`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      ]);

      const [topRaces, allDrivers, allTeams] = results;

      // Get arrays
      const driversArray = Array.isArray(allDrivers) ? allDrivers : (allDrivers.data || []);
      const teamsArray = Array.isArray(allTeams) ? allTeams : (allTeams.data || []);

      // Calculate stats directly from fetched data
      const totalRaces = topRaces.length || 0;
      const totalDrivers = driversArray.length || 0;
      const totalTeams = teamsArray.length || 0;
      const activeRaces = topRaces.filter(r => r.status === 'ongoing').length;

      setStats({
        totalRaces,
        totalDrivers,
        totalTeams,
        activeRaces,
      });

      setRaceData(topRaces);

      // Get top 5 drivers by sorting all drivers
      const topDriversFromAll = driversArray
        .sort((a, b) => (b.total_points || 0) - (a.total_points || 0))
        .slice(0, 5)
        .map((d, idx) => ({
          rank: idx + 1,
          name: `${d.first_name} ${d.last_name}`,
          team: d.team?.name || 'Unknown Team',
          points: d.total_points || 0,
          wins: 0,
          podiums: 0,
        }));
      setTopDrivers(topDriversFromAll);

      // Calculate team points from ALL drivers
      const teamMap = {};
      teamsArray.forEach(team => {
        teamMap[team.name] = 0;
      });
      
      driversArray.forEach(d => {
        const team = d.team?.name || 'Unknown';
        teamMap[team] = (teamMap[team] || 0) + (d.total_points || 0);
      });
      
      const teams_points = Object.entries(teamMap)
        .map(([name, pts]) => ({ name: name.substring(0, 15), points: pts }))
        .sort((a, b) => b.points - a.points);
      setTeamPoints(teams_points);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="dashboard-home loading"><div className="loader"><div className="f1-wheel"></div></div></div>;

  const maxDriverPoints = topDrivers[0]?.points || 1;

  return (
    <div className="dashboard-home">
      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card race-card">
          <div className="stat-icon">🏆</div>
          <div className="stat-content">
            <h3>Total Races</h3>
            <p className="stat-value">{stats.totalRaces}</p>
          </div>
        </div>

        <div className="stat-card driver-card">
          <div className="stat-icon">👤</div>
          <div className="stat-content">
            <h3>Total Drivers</h3>
            <p className="stat-value">{stats.totalDrivers}</p>
          </div>
        </div>

        <div className="stat-card team-card">
          <div className="stat-icon">🏁</div>
          <div className="stat-content">
            <h3>Total Teams</h3>
            <p className="stat-value">{stats.totalTeams}</p>
          </div>
        </div>

        <div className="stat-card active-card">
          <div className="stat-icon">⚡</div>
          <div className="stat-content">
            <h3>Active Races</h3>
            <p className="stat-value">{stats.activeRaces}</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        <div className="chart-container">
          <h3>🏆 Team Points Distribution</h3>
          {teamPoints.length > 0 ? (
            <Bar 
              data={{
                labels: teamPoints.map(t => t.name),
                datasets: [{
                  label: 'Points',
                  data: teamPoints.map(t => t.points),
                  backgroundColor: teamPoints.map((_, idx) => {
                    const colors = [
                      '#e83e8c', '#ff6b9d', '#cc0052', '#ff4081', '#f06292',
                      '#ec407a', '#ef5350', '#f44336', '#e57373', '#ef9a9a'
                    ];
                    return colors[idx % colors.length];
                  }),
                  borderColor: '#e83e8c',
                  borderWidth: 2,
                  borderRadius: 8,
                  hoverBackgroundColor: '#fff',
                  hoverBorderColor: '#e83e8c',
                  hoverBorderWidth: 3
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: true,
                indexAxis: 'x',
                plugins: {
                  legend: {
                    display: true,
                    labels: {
                      color: '#fff',
                      font: { size: 14, weight: '600' },
                      padding: 15
                    }
                  },
                  tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: { size: 14, weight: 'bold' },
                    bodyFont: { size: 13 },
                    borderColor: '#e83e8c',
                    borderWidth: 1,
                    displayColors: true,
                    callbacks: {
                      label: (ctx) => ` ${ctx.dataset.label}: ${ctx.parsed.y} pts`
                    }
                  }
                },
                scales: {
                  x: {
                    grid: {
                      display: false,
                      color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                      color: '#fff',
                      font: { size: 12 },
                      maxRotation: 45,
                      minRotation: 0
                    }
                  },
                  y: {
                    beginAtZero: true,
                    grid: {
                      color: 'rgba(255, 255, 255, 0.1)',
                      drawBorder: false
                    },
                    ticks: {
                      color: '#fff',
                      font: { size: 12 }
                    }
                  }
                }
              }}
            />
          ) : (
            <p className="no-data">No data</p>
          )}
        </div>

        <div className="chart-container schedule-container">
          <h3>🏆 Tanger Races Schedule</h3>
          <div className="races-schedule">
            {raceData.length > 0 ? (
              raceData.map((race, idx) => (
                <div key={idx} className="schedule-item">
                  <div className="schedule-date">
                    <span className="month">{new Date(race.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                    <span className="day">{new Date(race.date).getDate()}</span>
                  </div>
                  <div className="schedule-info">
                    <h4>{race.name}</h4>
                    <p className="schedule-location">📍 {race.location}</p>
                  </div>
                  <div className="schedule-price">
                    <span className="price">${race.price}</span>
                    <span className={`status-badge ${race.status}`}>{race.status}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-data">No races scheduled</p>
            )}
          </div>
        </div>
      </div>

      {/* Top Drivers & Recent Races */}
      <div className="bottom-section">
        <div className="chart-container">
          <h3>🏆 Top Drivers Championship</h3>
          <div className="drivers-ranking">
            {topDrivers.length > 0 ? (
              topDrivers.map((driver, idx) => (
                <div key={idx} className="driver-rank-item">
                  <div className="rank-medal">
                    {driver.rank === 1 ? '🥇' : driver.rank === 2 ? '🥈' : driver.rank === 3 ? '🥉' : ''}
                    <span className="rank-number">{driver.rank}</span>
                  </div>
                  <div className="driver-info">
                    <h4>{driver.name}</h4>
                    <p className="team-name">{driver.team}</p>
                  </div>
                  <div className="driver-stats">
                    <div className="stat-item">
                      <span className="stat-label">Pts</span>
                      <span className="stat-num">{driver.points}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">W</span>
                      <span className="stat-num">{driver.wins}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">P</span>
                      <span className="stat-num">{driver.podiums}</span>
                    </div>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${maxDriverPoints > 0 ? (driver.points / maxDriverPoints) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-data">No drivers yet</p>
            )}
          </div>
        </div>

        <div className="table-section">
          <h3>📋 Tanger Grand Prix Schedule</h3>
          <div className="table-wrapper">
            <table className="races-table">
              <thead>
                <tr>
                  <th>Race Name</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Location</th>
                  <th>Price</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {raceData.length > 0 ? (
                  raceData.map((race, idx) => (
                    <tr key={idx}>
                      <td className="race-name">{race.name}</td>
                      <td>{new Date(race.date).toLocaleDateString()}</td>
                      <td>{race.start_time || 'TBA'}</td>
                      <td>
                        <span className="location-badge">📍 {race.location}</span>
                      </td>
                      <td>
                        <span className="price-badge">${race.price}</span>
                      </td>
                      <td>
                        <span className={`status-badge ${race.status}`}>{race.status}</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="no-data">No races scheduled</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardHome;
