import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../../api';

const TRIGGERS = [
  {
    id: 'rain', icon: '🌧️', name: 'Heavy Rainfall', endpoint: '/triggers/rain',
    desc: 'Simulates rainfall > 50mm/day in Bangalore. Auto-creates claims for all active policies.',
    color: 'var(--accent)', threshold: '50mm', severity: 'HIGH',
  },
  {
    id: 'aqi', icon: '💨', name: 'AQI Hazard', endpoint: '/triggers/aqi',
    desc: 'Simulates AQI > 400 (Hazardous) in Delhi. Outdoor work becomes dangerous.',
    color: 'var(--purple)', threshold: 'AQI > 400', severity: 'CRITICAL',
  },
  {
    id: 'heat', icon: '🌡️', name: 'Heat Wave', endpoint: '/triggers/heat',
    desc: 'Simulates temperature > 45°C in Mumbai. Extreme heat work restrictions apply.',
    color: 'var(--orange)', threshold: '>45°C', severity: 'HIGH',
  },
  {
    id: 'restriction', icon: '🚫', name: 'Govt. Restriction', endpoint: '/triggers/restriction',
    desc: 'Simulates a government-mandated work stoppage. Applies across all cities.',
    color: 'var(--red)', threshold: 'Mandatory', severity: 'CRITICAL',
  },
];

const AdminTriggers = () => {
  const [loading, setLoading] = useState({});
  const [results, setResults] = useState({});
  const [logs, setLogs] = useState([]);
  const [customTrigger, setCustomTrigger] = useState({ trigger_type: 'heavy_rainfall', location: 'Bangalore', severity: 65, description: '' });
  const [customLoading, setCustomLoading] = useState(false);
  const navigate = useNavigate();

  const loadLogs = async () => {
    try {
      const data = await apiFetch('/admin/trigger-logs');
      setLogs(data);
    } catch (e) {
      if (e.message.includes('401') || e.message.includes('403')) navigate('/auth');
    }
  };

  useEffect(() => { loadLogs(); }, []);

  const fire = async (trigger) => {
    setLoading(l => ({ ...l, [trigger.id]: true }));
    setResults(r => ({ ...r, [trigger.id]: null }));
    try {
      const data = await apiFetch(trigger.endpoint, { method: 'POST' });
      setResults(r => ({ ...r, [trigger.id]: { success: true, ...data } }));
      await loadLogs();
    } catch (e) {
      setResults(r => ({ ...r, [trigger.id]: { success: false, message: e.message } }));
    } finally {
      setLoading(l => ({ ...l, [trigger.id]: false }));
    }
  };

  const fireCustom = async () => {
    setCustomLoading(true);
    try {
      const data = await apiFetch('/admin/simulate-trigger', {
        method: 'POST',
        body: JSON.stringify({ ...customTrigger, severity: parseFloat(customTrigger.severity) })
      });
      setResults(r => ({ ...r, custom: { success: true, ...data } }));
      await loadLogs();
    } catch (e) {
      setResults(r => ({ ...r, custom: { success: false, message: e.message } }));
    } finally { setCustomLoading(false); }
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">⚡ Trigger Simulator</h1>
          <p className="page-subtitle">Demo Mode: Simulate real-world weather and policy triggers</p>
        </div>
      </div>

      {/* Info Box */}
      <div className="alert alert-info" style={{ marginBottom: 24 }}>
        <span style={{ fontSize: '1.2rem' }}>ℹ️</span>
        <div>
          <strong>How it works:</strong> Clicking any trigger button fires an event on all active policies,
          auto-creates claims, runs AI fraud detection, sends notifications to workers, and logs the event.
        </div>
      </div>

      {/* Quick Trigger Buttons */}
      <div className="trigger-grid" style={{ marginBottom: 28 }}>
        {TRIGGERS.map(t => {
          const res = results[t.id];
          const isLoading = loading[t.id];
          return (
            <div key={t.id} className="trigger-card" style={{ borderColor: isLoading ? t.color : 'var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div className="trigger-icon">{t.icon}</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <span className="badge" style={{ background: `${t.color}20`, color: t.color, borderColor: `${t.color}40` }}>
                    {t.severity}
                  </span>
                  <span className="badge badge-info">{t.threshold}</span>
                </div>
              </div>
              <div className="trigger-title">{t.name}</div>
              <div className="trigger-desc">{t.desc}</div>
              {res && (
                <div className={`alert ${res.success ? 'alert-success' : 'alert-danger'}`} style={{ padding: '8px 12px', fontSize: '0.8rem' }}>
                  {res.success
                    ? `✅ ${res.count} claim(s) created · ₹${res.payout_per_claim}/claim`
                    : `❌ ${res.message}`}
                </div>
              )}
              <button
                className="btn btn-primary"
                onClick={() => fire(t)}
                disabled={isLoading}
                style={{ justifyContent: 'center', background: `linear-gradient(135deg, ${t.color}, ${t.color}99)`, boxShadow: `0 2px 12px ${t.color}40` }}
              >
                {isLoading ? <span className="spinner" /> : `🚀 Simulate ${t.name.split(' ')[0]}`}
              </button>
            </div>
          );
        })}
      </div>

      {/* Custom Trigger */}
      <div className="card" style={{ marginBottom: 28 }}>
        <h3 style={{ fontWeight: 700, marginBottom: 16 }}>🎛️ Custom Trigger</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 14 }}>
          <div className="form-group">
            <label className="form-label">Trigger Type</label>
            <select className="form-input" value={customTrigger.trigger_type} onChange={e => setCustomTrigger(p => ({ ...p, trigger_type: e.target.value }))}>
              <option value="heavy_rainfall">Heavy Rainfall</option>
              <option value="aqi_hazard">AQI Hazard</option>
              <option value="heat_wave">Heat Wave</option>
              <option value="govt_restriction">Govt. Restriction</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Location</label>
            <select className="form-input" value={customTrigger.location} onChange={e => setCustomTrigger(p => ({ ...p, location: e.target.value }))}>
              <option>Bangalore</option><option>Mumbai</option><option>Delhi</option><option>All Cities</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Severity ({'>'}50 = Auto-Approve)</label>
            <input className="form-input" type="number" min={0} max={150} value={customTrigger.severity}
              onChange={e => setCustomTrigger(p => ({ ...p, severity: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <input className="form-input" type="text" placeholder="Manual trigger note..." value={customTrigger.description}
              onChange={e => setCustomTrigger(p => ({ ...p, description: e.target.value }))} />
          </div>
        </div>
        {results.custom && (
          <div className={`alert ${results.custom.success ? 'alert-success' : 'alert-danger'}`} style={{ marginBottom: 12, fontSize: '0.84rem' }}>
            {results.custom.success ? `✅ ${results.custom.message}` : `❌ ${results.custom.message}`}
          </div>
        )}
        <button className="btn btn-primary" onClick={fireCustom} disabled={customLoading}>
          {customLoading ? <span className="spinner" /> : '🚀 Fire Custom Trigger'}
        </button>
      </div>

      {/* Trigger Log */}
      <div className="card">
        <h3 style={{ fontWeight: 700, marginBottom: 16 }}>📝 Trigger Event Log</h3>
        {logs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '28px 0', color: 'var(--text-muted)' }}>No triggers fired yet.</div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr><th>Type</th><th>Location</th><th>Severity</th><th>Claims</th><th>By</th><th>Time</th></tr>
              </thead>
              <tbody>
                {logs.map(l => (
                  <tr key={l.id}>
                    <td style={{ fontWeight: 600 }}>{l.trigger_type}</td>
                    <td>{l.location}</td>
                    <td>
                      <span style={{ color: l.severity > 70 ? 'var(--red)' : l.severity > 50 ? 'var(--yellow)' : 'var(--green)', fontWeight: 700 }}>
                        {l.severity}
                      </span>
                    </td>
                    <td style={{ color: 'var(--accent)', fontWeight: 700 }}>{l.claims_created}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{l.triggered_by}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{l.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminTriggers;
