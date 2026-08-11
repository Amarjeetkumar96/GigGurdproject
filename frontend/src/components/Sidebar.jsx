import React, { useState, useEffect } from 'react';

const WORKER_NAV = [
  { icon: '📊', label: 'Dashboard',  path: '/worker' },
  { icon: '🛡️', label: 'My Policy', path: '/worker/policy' },
  { icon: '📋', label: 'Claims',     path: '/worker/claims' },
  { icon: '💰', label: 'Earnings',   path: '/worker/earnings' },
  { icon: '💳', label: 'Payments',   path: '/worker/payments' },
  { icon: '🔔', label: 'Alerts',     path: '/worker/alerts', badgeKey: 'alerts' },
];

const ADMIN_NAV = [
  { icon: '📊', label: 'Overview',          path: '/admin' },
  { icon: '⚡', label: 'Trigger Simulator', path: '/admin/triggers' },
  { icon: '👥', label: 'Workers',           path: '/admin/workers' },
  { icon: '📋', label: 'Claims',            path: '/admin/claims' },
  { icon: '🚨', label: 'Fraud Panel',       path: '/admin/fraud' },
  { icon: '💰', label: 'Transactions',      path: '/admin/transactions' },
  { icon: '📈', label: 'Analytics',         path: '/admin/analytics' },
];

const Sidebar = ({ role, email, onNavigate, currentPath, unreadAlerts = 0, fraudFlags = 0 }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('gg_theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('gg_theme', theme);
  }, [theme]);

  // Close on route change
  useEffect(() => { setMobileOpen(false); }, [currentPath]);

  const nav = role === 'admin' ? ADMIN_NAV : WORKER_NAV;
  const initial = email ? email[0].toUpperCase() : '?';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('email');
    onNavigate('/auth');
  };

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  const SidebarContent = () => (
    <nav className={`sidebar ${mobileOpen ? 'open' : ''}`}>
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">🛡️</div>
        <div className="sidebar-logo-text"><span>Gig</span>Guard</div>
        {/* Mobile close */}
        <button className="sidebar-mobile-close btn btn-ghost btn-sm" onClick={() => setMobileOpen(false)}>✕</button>
      </div>

      <div className="sidebar-nav">
        <div className="nav-section-label">{role === 'admin' ? 'Admin Panel' : 'My Account'}</div>
        {nav.map((item) => {
          const isActive = currentPath === item.path ||
            (item.path !== '/worker' && item.path !== '/admin' && currentPath.startsWith(item.path));
          const badge = item.badgeKey === 'alerts' ? unreadAlerts : (item.badgeKey === 'fraud' ? fraudFlags : 0);
          return (
            <div
              key={item.path}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => onNavigate(item.path)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
              {badge > 0 && <span className="nav-badge">{badge}</span>}
            </div>
          );
        })}
      </div>

      <div className="sidebar-footer">
        {/* Theme Toggle */}
        <button
          className="theme-toggle-btn"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          <span>{theme === 'dark' ? '☀️' : '🌙'}</span>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </span>
          <span className="theme-toggle-track">
            <span className={`theme-toggle-thumb ${theme === 'light' ? 'on' : ''}`} />
          </span>
        </button>

        <div className="user-chip" onClick={handleLogout}>
          <div className="user-avatar">{initial}</div>
          <div className="user-chip-text">
            <div className="user-chip-email">{email || 'user@gigguard.in'}</div>
            <div className="user-chip-role">{role} · Logout</div>
          </div>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>→</span>
        </div>
      </div>
    </nav>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="mobile-topbar">
        <button className="btn btn-ghost btn-icon" onClick={() => setMobileOpen(o => !o)}>
          <span style={{ fontSize: '1.2rem' }}>☰</span>
        </button>
        <div className="sidebar-logo-text" style={{ fontSize: '1rem' }}><span>Gig</span>Guard</div>
        <div style={{ width: 36 }} />
      </div>

      {/* Backdrop */}
      {mobileOpen && (
        <div className="sidebar-backdrop" onClick={() => setMobileOpen(false)} />
      )}

      <SidebarContent />
    </>
  );
};

export default Sidebar;
