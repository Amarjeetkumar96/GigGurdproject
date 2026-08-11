import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../../api';

const AdminWorkers = () => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    apiFetch('/admin/workers').then(setWorkers).catch(e => {
      if (e.message.includes('401') || e.message.includes('403')) navigate('/auth');
    }).finally(() => setLoading(false));
  }, []);

  const filtered = workers.filter(w =>
    w.name?.toLowerCase().includes(search.toLowerCase()) ||
    w.location?.toLowerCase().includes(search.toLowerCase()) ||
    w.work_type?.toLowerCase().includes(search.toLowerCase())
  );

  const active = workers.filter(w => w.policy_active).length;
  const flagged = workers.filter(w => w.is_flagged).length;
  const totalPremiums = workers.reduce((s, w) => s + (w.policy_active ? w.premium_tier : 0), 0);

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}><div className="spinner" style={{ width: 40, height: 40 }} /></div>;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">👥 Worker Directory</h1>
          <p className="page-subtitle">{workers.length} registered workers · {active} with active coverage</p>
        </div>
      </div>

      <div className="stats-grid" style={{ marginBottom: 20 }}>
        <div className="stat-card"><div className="stat-icon">👥</div><div className="stat-value">{workers.length}</div><div className="stat-label">Total Workers</div></div>
        <div className="stat-card" style={{ '--accent-line': 'var(--green)' }}><div className="stat-icon">🛡️</div><div className="stat-value" style={{ color: 'var(--green)' }}>{active}</div><div className="stat-label">Covered</div></div>
        <div className="stat-card" style={{ '--accent-line': 'var(--red)' }}><div className="stat-icon">🚨</div><div className="stat-value" style={{ color: 'var(--red)' }}>{flagged}</div><div className="stat-label">Fraud Flagged</div></div>
        <div className="stat-card" style={{ '--accent-line': 'var(--accent)' }}><div className="stat-icon">💰</div><div className="stat-value">₹{totalPremiums}</div><div className="stat-label">Weekly Pool</div></div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 12 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>All Workers</h3>
          <input className="form-input" type="text" placeholder="Search by name, city, or work type..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ maxWidth: 300 }} />
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th><th>City</th><th>Work Type</th><th>Weekly Income</th>
                <th>Premium</th><th>Claims</th><th>Fraud Score</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: '28px', color: 'var(--text-muted)' }}>No workers found.</td></tr>
              ) : filtered.map(w => (
                <tr key={w.id}>
                  <td style={{ fontWeight: 600, color: 'var(--text)' }}>
                    {w.is_flagged && <span title="Fraud flagged" style={{ marginRight: 6 }}>🚨</span>}
                    {w.name}
                  </td>
                  <td>{w.location}</td>
                  <td><span className="badge badge-info">{w.work_type}</span></td>
                  <td>₹{Math.round(w.weekly_income).toLocaleString('en-IN')}</td>
                  <td style={{ fontWeight: 600, color: 'var(--accent)' }}>₹{w.premium_tier}/wk</td>
                  <td style={{ color: w.claim_count > 3 ? 'var(--yellow)' : 'var(--text-muted)' }}>{w.claim_count}</td>
                  <td>
                    <div className="fraud-meter">
                      <div className="fraud-score-bar" style={{ width: 60 }}>
                        <div className="fraud-score-fill" style={{
                          width: `${Math.round((w.fraud_score || 0) * 100)}%`,
                          background: (w.fraud_score || 0) > 0.45 ? 'var(--red)' : (w.fraud_score || 0) > 0.2 ? 'var(--yellow)' : 'var(--green)'
                        }} />
                      </div>
                      <span style={{ fontSize: '0.75rem' }}>{Math.round((w.fraud_score || 0) * 100)}%</span>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${w.policy_active ? 'badge-approved' : 'badge-pending'}`}>
                      {w.policy_active ? '✓ Covered' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminWorkers;
