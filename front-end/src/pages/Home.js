import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import F1StartingLights from '../components/F1StartingLights';
import '../styles/Home.css';

function Home() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [drivers, setDrivers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [raceResults, setRaceResults] = useState([]);

  useEffect(() => {
    // Show loader briefly when page loads
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Fetch top drivers from backend
    const fetchTopDrivers = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/drivers/top-drivers');
        if (response.ok) {
          const data = await response.json();
          setDrivers(data);
        }
      } catch (error) {
        console.error('Error fetching drivers:', error);
      }
    };

    fetchTopDrivers();
  }, []);

  useEffect(() => {
    // Fetch teams from backend
    const fetchTeams = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/teams');
        if (response.ok) {
          const data = await response.json();
          setTeams(data.data || data);
        }
      } catch (error) {
        console.error('Error fetching teams:', error);
      }
    };

    fetchTeams();
  }, []);

  useEffect(() => {
    // Fetch races from backend
    const fetchRaces = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/races/featured');
        if (response.ok) {
          const data = await response.json();
          setRaceResults(data);
          
        }
      } catch (error) {
        console.error('Error fetching races:', error);
      }
    };

    fetchRaces();
  }, []);

  const news = [
    {
      id: 1,
      title: 'Verstappen Dominates Sprint Race',
      date: 'Nov 24, 2025',
      description: 'Red Bull driver secures pole position'
    },
    {
      id: 2,
      title: 'Hamilton Eyes Championship',
      date: 'Nov 23, 2025',
      description: 'Mercedes legend pushes for victory'
    },
    {
      id: 3,
      title: 'Leclerc Shows Strong Pace',
      date: 'Nov 22, 2025',
      description: 'Ferrari competitive in qualifying'
    },
    {
      id: 4,
      title: 'New Track Records Set',
      date: 'Nov 21, 2025',
      description: 'Multiple drivers break lap records'
    }
  ];

  return (
    <div className="home-page">
      {/* Loader */}
      <F1StartingLights isLoading={loading} />

      {/* HERO SECTION WITH VIDEO */}
      <section className="hero-section">
        <video 
          className="hero-video" 
          autoPlay 
          muted 
          loop 
          playsInline
        >
          <source src="/store/videos/bg-video.mp4" type="video/mp4" />
        </video>
        <div className="hero-overlay"></div>
        
        <div className="hero-content">
          <h1 className="hero-title">Feel The Speed of Formula 1</h1>
          <p className="hero-subtitle">Live Results, Teams, Drivers, and Stats</p>
          <button className="hero-cta" onClick={() => navigate('/register')}>
            Explore Now
          </button>
        </div>
      </section>

      {/* LATEST RACE RESULTS */}
      <section className="results-section">
        <div className="section-wrapper">
          <h2 className="section-title">Latest Race Results</h2>
          <div className="results-grid">
            {raceResults.map((race, index) => (
              <div key={race.id} className="result-card">
                <div className="position-badge">{index + 1}</div>
                <h3 className="driver-name">{race.name}</h3>
                <p className="team-name">{race.location}</p>
                <p className="race-time">{race.date}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TEAMS SECTION */}
      <section className="teams-section">
        <div className="section-wrapper">
          <h2 className="section-title">F1 Teams</h2>
          <div className="teams-grid">
            {teams.map((team) => (
              <div key={team.id} className="team-card" style={{ '--team-color': team.color || '#E10600' }}>
                <div className="team-color-bar"></div>
                <h3 className="team-name">{team.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DRIVERS SECTION */}
      <section className="drivers-section">
        <div className="section-wrapper">
          <h2 className="section-title">Top Drivers</h2>
          <div className="drivers-grid">
            {drivers.map((driver) => (
              <div key={driver.id} className="driver-card">
                <div className="driver-avatar">
                  {driver.driver_img ? (
                    <img src={`http://localhost:8000/${driver.driver_img}`} alt={driver.first_name} />
                  ) : (
                    <div className="avatar-placeholder"></div>
                  )}
                </div>
                <h3 className="driver-name">{driver.first_name} {driver.last_name}</h3>
                <p className="driver-team">{driver.team?.name || 'N/A'}</p>
                <p className="driver-points">{driver.total_points} pts</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NEWS SECTION */}
      <section className="news-section">
        <div className="section-wrapper">
          <h2 className="section-title">Latest News</h2>
          <div className="news-scroll">
            {news.map((article) => (
              <div key={article.id} className="news-card">
                <div className="news-image"></div>
                <h3 className="news-title">{article.title}</h3>
                <p className="news-date">{article.date}</p>
                <p className="news-description">{article.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="f1-footer">
        <div className="footer-content">
          <div className="footer-logo">F1 TANGER</div>
          <p className="footer-copyright">&copy; 2025 Formula 1 Tanger. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default Home;
