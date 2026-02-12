// import React, { useState, useEffect, useRef } from 'react';
// import '../../styles/DashboardHome.css';

// function DashboardHome() {
//   const [stats, setStats] = useState({ totalRaces: 0, totalDrivers: 0, totalTeams: 0, activeRaces: 0 });
//   const [raceData, setRaceData] = useState([]);
//   const [topDrivers, setTopDrivers] = useState([]);
//   const [teamPoints, setTeamPoints] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const hasFetched = useRef(false);

//   useEffect(() => {
//     if (!hasFetched.current) {
//       hasFetched.current = true;
//       fetchData();
//     }
//   }, []);

//   const fetchData = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
      
//       const [races, drivers, teams] = await Promise.all([
//         fetch(`${apiUrl}/races/admin/dashboard`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
//         fetch(`${apiUrl}/drivers/admin/dashboard`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
//         fetch(`${apiUrl}/teams/admin/dashboard`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
//         fetch(`${apiUrl}/races/top-races`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
//         fetch(`${apiUrl}/drivers/top-drivers`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
//       ]).then(async results => {
//         const [raceCount, driverCount, teamCount, topRaces, topDriversApi] = results;
//         return [raceCount, driverCount, teamCount, topRaces, topDriversApi];
//       });

//       const topRaces = drivers[3] || [];
//       const topDriversApi = drivers[4] || [];

//       setStats({
//         totalRaces: races.count || 0,
//         totalDrivers: drivers.count || 0,
//         totalTeams: teams.count || 0,
//         activeRaces: topRaces.filter(r => r.status === 'ongoing').length,
//       });

//       setRaceData(topRaces);

//       const formattedDrivers = topDriversApi.map((d, idx) => ({
//         rank: idx + 1,
//         name: `${d.first_name} ${d.last_name}`,
//         team: d.team?.name || 'Unknown',
//         points: d.total_points || 0,
//       }));
//       setTopDrivers(formattedDrivers);

//       const teamMap = {};
//       topDriversApi.forEach(d => {
//         const team = d.team?.name || 'Unknown';
//         teamMap[team] = (teamMap[team] || 0) + (d.total_points || 0);
//       });
      
//       const teams_points = Object.entries(teamMap)
//         .map(([name, pts]) => ({ name: name.substring(0, 15), points: pts }))
//         .sort((a, b) => b.points - a.points);
//       setTeamPoints(teams_points);
//     } catch (error) {
//       console.error('Error:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) return <div className="dashboard-home loading"><div className="loader">Loading...</div></div>;

//   return (
//     <div className="dashboard-home">
//       {/* Stats Cards */}
//       <div className="stats-grid">
//         <div className="stat-card race-card"><div className="stat-icon">🏆</div><div><h3>Total Races</h3><p>{stats.totalRaces}</p></div></div>
//         <div className="stat-card driver-card"><div className="stat-icon">👤</div><div><h3>Total Drivers</h3><p>{stats.totalDrivers}</p></div></div>
//         <div className="stat-card team-card"><div className="stat-icon">🏁</div><div><h3>Total Teams</h3><p>{stats.totalTeams}</p></div></div>
//         <div className="stat-card active-card"><div className="stat-icon">⚡</div><div><h3>Active Races</h3><p>{stats.activeRaces}</p></div></div>
//       </div>

//       {/* Main Content */}
//       <div className="charts-section">
//         {/* Team Points */}
//         <div className="chart-container">
//           <h3>🏆 Team Points</h3>
//           <div className="bar-chart">
//             {teamPoints.map((t, i) => (
//               <div key={i} className="chart-bar-wrapper">
//                 <div className="chart-bar" style={{ height: `${(t.points / (teamPoints[0]?.points || 1)) * 100}%` }}>
//                   <span>{t.points}</span>
//                 </div>
//                 <span>{t.name}</span>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Schedule */}
//         <div className="chart-container">
//           <h3>📅 Races Schedule</h3>
//           <div className="races-schedule">
//             {raceData.map((r, i) => (
//               <div key={i} className="schedule-item">
//                 <div className="schedule-date">
//                   <span>{new Date(r.date).toLocaleDateString('en-US', { month: 'short' })}</span>
//                   <span>{new Date(r.date).getDate()}</span>
//                 </div>
//                 <div className="schedule-info">
//                   <h4>{r.name}</h4>
//                   <p>📍 {r.location}</p>
//                 </div>
//                 <div><span>${r.price}</span> <span className={`status-badge ${r.status}`}>{r.status}</span></div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Bottom Section */}
//       <div className="bottom-section">
//         {/* Top Drivers */}
//         <div className="chart-container">
//           <h3>🏆 Top Drivers</h3>
//           <div className="drivers-ranking">
//             {topDrivers.map((d, i) => (
//               <div key={i} className="driver-rank-item">
//                 <div className="rank-medal">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : ''} {d.rank}</div>
//                 <div className="driver-info"><h4>{d.name}</h4><p>{d.team}</p></div>
//                 <div className="driver-stats"><span>{d.points} pts</span></div>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Table */}
//         <div className="table-section">
//           <h3>📋 All Races</h3>
//           <table className="races-table">
//             <thead>
//               <tr><th>Race</th><th>Date</th><th>Location</th><th>Price</th><th>Status</th></tr>
//             </thead>
//             <tbody>
//               {raceData.map((r, i) => (
//                 <tr key={i}>
//                   <td>{r.name}</td>
//                   <td>{new Date(r.date).toLocaleDateString()}</td>
//                   <td>📍 {r.location}</td>
//                   <td>${r.price}</td>
//                   <td><span className={`status-badge ${r.status}`}>{r.status}</span></td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default DashboardHome;
