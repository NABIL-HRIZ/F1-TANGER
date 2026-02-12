import React from 'react';
import '../styles/AdminSidebar.css';

function TeamUserSidebar({ activePage, onPageChange, isOpen, teamName }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'cars', label: 'My Cars', icon: '🏎️' },
    { id: 'drivers', label: 'My Drivers', icon: '👤' },
  ];

  return (
    <aside className={`admin-sidebar ${isOpen ? 'open' : 'closed'}`}>
      <nav className="sidebar-nav">
        <div className="team-header" style={{
          padding: '20px 15px',
          borderBottom: '1px solid rgba(232, 62, 140, 0.2)',
          marginBottom: '10px'
        }}>
          <h3 style={{
            margin: '0',
            color: '#e83e8c',
            fontSize: '14px',
            fontWeight: '600',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            🏁 {teamName || 'Team'}
          </h3>
        </div>
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${activePage === item.id ? 'active' : ''}`}
            onClick={() => onPageChange(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}

export default TeamUserSidebar;
