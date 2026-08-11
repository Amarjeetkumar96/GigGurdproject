import React from 'react';

const WORKER_NAV = [
  { icon: '📊', label: 'Dashboard', path: '/worker' },
  { icon: '🛡️', label: 'My Policy', path: '/worker/policy' },
  { icon: '📋', label: 'Claims', path: '/worker/claims' },
  { icon: '💳', label: 'Payments', path: '/worker/payments' },
  { icon: '🔔', label: 'Alerts', path: '/worker/alerts', badgeKey: 'alerts' },
];

const ADMIN_NAV = [
  { icon: '📊', label: 'Overview', path: '/admin' },
  { icon: '⚡', label: 'Trigger Simulator', path: '/admin/triggers' },
  { icon: '👥', label: 'Workers', path: '/admin/workers' },
  { icon: '📋', label: 'Claims', path: '/admin/claims' },
  { icon: '🚨', label: 'Fraud Panel', path: '/admin/fraud' },
  { icon: '💰', label: 'Transactions', path: '/admin/transactions' },
  { icon: '📈', label: 'Analytics', path: '/admin/analytics' },
];

const Sidebar = ({ role, email, onNavigate, currentPath, unreadAlerts = 0, fraudFlags = 0 }) => {
  const nav = role === 'admin' ? ADMIN_NAV : WORKER_NAV;
  const initial = email ? email[0].toUpperCase() : '?';

  const handleLogout = () => {
    localStorage.clear();
    onNavigate('/auth');
  };

  return (
    <nav className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">🛡️</div>
        <div className="sidebar-logo-text"><span>Gig</span>Guard</div>
      </div>

      <div className="sidebar-nav">
        <div className="nav-section-label">{role === 'admin' ? 'Admin Panel' : 'My Account'}</div>
        {nav.map((item) => {
          const isActive = currentPath === item.path || (item.path !== '/worker' && item.path !== '/admin' && currentPath.startsWith(item.path));
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
};

export default Sidebar;
