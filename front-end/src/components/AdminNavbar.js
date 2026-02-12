import React, { useState } from 'react';
import '../styles/AdminNavbar.css';

function AdminNavbar({ user, onLogout, onMenuToggle }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    setDropdownOpen(false);
    onLogout();
  };

  return (
    <nav className="admin-navbar">
      <div className="navbar-left">
        <button className="menu-toggle" onClick={onMenuToggle}>
          ☰
        </button>
        <div className="navbar-logo">
          <span className="logo-icon">🏁</span>
          <span className="logo-text">F1 TANGER</span>
        </div>
      </div>

      <div className="navbar-center">
        <h1 className="page-title">Admin Dashboard</h1>
      </div>

      <div className="navbar-right">
        <div className="user-dropdown">
          <button 
            className="user-button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{
              transform: dropdownOpen ? 'scale(1.05)' : 'scale(1)'
            }}
          >
            <span className="user-avatar">👤</span>
            <span className="user-name">{user.name}</span>
            <span className="dropdown-arrow" style={{
              transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.3s ease'
            }}>▼</span>
          </button>

          {dropdownOpen && (
            <div className="dropdown-menu-custom">
              <div className="dropdown-item-custom">
                <span>👤</span> <strong>{user.name}</strong>
              </div>
              <div className="dropdown-item-email">{user.email}</div>
              <div className="dropdown-divider-custom"></div>
              <button 
                className="logout-item"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default AdminNavbar;
