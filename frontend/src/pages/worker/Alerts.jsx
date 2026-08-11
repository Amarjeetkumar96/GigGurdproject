import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../../api';

const notifIcon = type => ({ info: 'ℹ️', success: '✅', alert: '⚠️', danger: '🚨' }[type] || 'ℹ️');
const notifColor = type => ({ info: 'var(--accent)', success: 'var(--green)', alert: 'var(--yellow)', danger: 'var(--red)' }[type] || 'var(--accent)');

const WorkerAlerts = () => {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const load = async () => {
    try {
      const data = await apiFetch('/me/notifications');
      setNotifs(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const markRead = async (id) => {
    await apiFetch(`/me/notifications/${id}/read`, { method: 'POST' }).catch(() => {});
    setNotifs(ns => ns.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const markAll = async () => {
    await apiFetch('/me/notifications/read-all', { method: 'POST' }).catch(() => {});
    setNotifs(ns => ns.map(n => ({ ...n, is_read: true })));
  };

  const unread = notifs.filter(n => !n.is_read).length;

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}><div className="spinner" style={{ width: 40, height: 40 }} /></div>;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">🔔 Alerts & Notifications</h1>
          <p className="page-subtitle">{unread > 0 ? `${unread} unread alert${unread > 1 ? 's' : ''}` : 'All caught up!'}</p>
        </div>
        {unread > 0 && (
          <button className="btn btn-outline btn-sm" onClick={markAll}>✓ Mark All Read</button>
        )}
      </div>

      {notifs.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>🔕</div>
          <h2 style={{ marginBottom: 8 }}>No notifications yet</h2>
          <p style={{ color: 'var(--text-muted)' }}>You'll be notified when triggers are detected, claims are processed, or payments are made.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {notifs.map(n => (
            <div
              key={n.id}
              className="card"
              style={{
                display: 'flex', gap: 14, alignItems: 'flex-start',
                borderColor: n.is_read ? 'var(--border)' : notifColor(n.type) + '55',
                background: n.is_read ? 'var(--surface)' : notifColor(n.type) + '08',
                cursor: n.is_read ? 'default' : 'pointer',
                padding: '16px 20px',
              }}
              onClick={() => !n.is_read && markRead(n.id)}
            >
              <div style={{
                width: 38, height: 38, borderRadius: 10,
                background: notifColor(n.type) + '18',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.2rem', flexShrink: 0,
              }}>
                {notifIcon(n.type)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem', color: n.is_read ? 'var(--text-sub)' : 'var(--text)' }}>
                    {n.title}
                  </span>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                    {!n.is_read && <div className="notif-dot" />}
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{n.created_at}</span>
                  </div>
                </div>
                <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: 4, lineHeight: 1.5 }}>
                  {n.message}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WorkerAlerts;
