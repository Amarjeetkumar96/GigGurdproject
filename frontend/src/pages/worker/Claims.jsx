import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../../api';

const statusClass = s => s === 'Approved' ? 'badge-approved' : s === 'Rejected' ? 'badge-rejected' : s === 'Manual Review' ? 'badge-review' : 'badge-pending';

const WorkerClaims = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    apiFetch('/me/dashboard').then(setData).catch((e) => console.error(e)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}><div className="spinner" style={{ width: 40, height: 40 }} /></div>;

  const claims = data?.recentClaims || [];
  const approved = claims.filter(c => c.status === 'Approved');
  const pending = claims.filter(c => ['Pending', 'Manual Review'].includes(c.status));

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">📋 My Claims</h1>
          <p className="page-subtitle">Full history of your insurance claims and payouts</p>
        </div>
      </div>

      {/* Summary */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card"><div className="stat-icon">📋</div><div className="stat-value">{claims.length}</div><div className="stat-label">Total Claims</div></div>
        <div className="stat-card" style={{ '--accent-line': 'var(--green)' }}><div className="stat-icon">✅</div><div className="stat-value" style={{ color: 'var(--green)' }}>{approved.length}</div><div className="stat-label">Approved</div></div>
        <div className="stat-card" style={{ '--accent-line': 'var(--yellow)' }}><div className="stat-icon">⏳</div><div className="stat-value" style={{ color: 'var(--yellow)' }}>{pending.length}</div><div className="stat-label">Pending Review</div></div>
        <div className="stat-card" style={{ '--accent-line': 'var(--accent)' }}>
          <div className="stat-icon">💰</div>
          <div className="stat-value text-gradient">
            ₹{approved.reduce((s, c) => s + parseInt((c.amount || '0').replace(/[₹, ]/g, '')), 0).toLocaleString('en-IN')}
          </div>
          <div className="stat-label">Total Payouts Received</div>
        </div>
      </div>

      {claims.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>🔒</div>
          <h2 style={{ marginBottom: 8 }}>No Claims Filed</h2>
          <p style={{ color: 'var(--text-muted)' }}>Your coverage is active. Claims are auto-created when triggers are detected.</p>
          {!data?.policyActive && <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/worker')}>Enroll Now</button>}
        </div>
      ) : (
        <div className="card">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Claim ID</th>
                  <th>Trigger Type</th>
                  <th>Payout</th>
                  <th>Status</th>
                  <th>AI Risk</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {claims.map(c => (
                  <tr key={c.id}>
                    <td style={{ fontFamily: 'monospace', color: 'var(--accent)', fontWeight: 600 }}>{c.display_id}</td>
                    <td style={{ color: 'var(--text)' }}>{c.type}</td>
                    <td style={{ fontWeight: 700, color: 'var(--green)', fontSize: '0.95rem' }}>{c.amount}</td>
                    <td><span className={`badge ${statusClass(c.status)}`}>{c.status}</span></td>
                    <td>
                      {c.fraud_score !== undefined ? (
                        <div className="fraud-meter">
                          <div className="fraud-score-bar">
                            <div className="fraud-score-fill" style={{
                              width: `${Math.round((c.fraud_score || 0) * 100)}%`,
                              background: c.fraud_score > 0.45 ? 'var(--red)' : c.fraud_score > 0.2 ? 'var(--yellow)' : 'var(--green)'
                            }} />
                          </div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', minWidth: 30 }}>
                            {Math.round((c.fraud_score || 0) * 100)}%
                          </span>
                        </div>
                      ) : '—'}
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{c.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkerClaims;
