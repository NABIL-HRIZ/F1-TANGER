import React from 'react';
import '../styles/AdminSidebar.css';

function AdminSidebar({ activePage, onPageChange, isOpen, items }) {
  const menuItems = items || [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'teams', label: 'Teams', icon: '🏁' },
    { id: 'drivers', label: 'Drivers', icon: '👤' },
    { id: 'cars', label: 'Cars', icon: '🏎️' },
    { id: 'races', label: 'Races', icon: '🏆' },
  ];

  return (
    <aside className={`admin-sidebar ${isOpen ? 'open' : 'closed'}`}>
      <nav className="sidebar-nav">
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

export default AdminSidebar;
