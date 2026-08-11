import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../../api';

const AdminFraud = () => {
  const [flags, setFlags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const navigate = useNavigate();

  const load = async () => {
    try {
      const data = await apiFetch('/admin/fraud-flags');
      setFlags(data);
    } catch (e) {
      if (e.message.includes('401') || e.message.includes('403')) navigate('/auth');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const runScan = async () => {
    setScanning(true);
    try {
      const res = await apiFetch('/admin/fraud-scan', { method: 'POST' });
      alert(res.message);
      await load();
    } catch (e) { alert(e.message); }
    finally { setScanning(false); }
  };

  const scoreColor = s => s > 0.7 ? 'var(--red)' : s > 0.45 ? 'var(--orange)' : 'var(--yellow)';

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}><div className="spinner" style={{ width: 40, height: 40 }} /></div>;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">🚨 Fraud Detection Panel</h1>
          <p className="page-subtitle">AI-powered anomaly detection using Isolation Forest model</p>
        </div>
        <button className="btn btn-primary" onClick={runScan} disabled={scanning}>
          {scanning ? <span className="spinner" /> : '🤖 Run AI Fraud Scan'}
        </button>
      </div>

      {/* ML Info */}
      <div className="card" style={{ marginBottom: 20, background: 'var(--purple-dim)', borderColor: 'rgba(168,85,247,0.3)' }}>
        <div style={{ display: 'flex', gap: 14 }}>
          <div style={{ fontSize: '2rem' }}>🤖</div>
          <div>
            <h3 style={{ marginBottom: 6, color: 'var(--purple)' }}>How the ML Model Works</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              The fraud detection uses a rule-based scoring engine (simulating scikit-learn's Isolation Forest).
              It analyzes: <strong>claim frequency</strong>, <strong>payout amounts</strong>,
              <strong>days since enrollment</strong>, and <strong>trigger edge cases</strong>.
              Scores above 0.45 are flagged for review. Admins can override decisions.
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: 20 }}>
        <div className="stat-card" style={{ '--accent-line': 'var(--red)' }}>
          <div className="stat-icon">🚨</div>
          <div className="stat-value" style={{ color: 'var(--red)' }}>{flags.length}</div>
          <div className="stat-label">Total Fraud Flags</div>
        </div>
        <div className="stat-card" style={{ '--accent-line': 'var(--orange)' }}>
          <div className="stat-icon">⚠️</div>
          <div className="stat-value" style={{ color: 'var(--orange)' }}>{flags.filter(f => f.fraud_score > 0.7).length}</div>
          <div className="stat-label">High Risk (&gt;70%)</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-value">{flags.filter(f => f.status === 'Manual Review').length}</div>
          <div className="stat-label">Pending Review</div>
        </div>
        <div className="stat-card" style={{ '--accent-line': 'var(--green)' }}>
          <div className="stat-icon">✅</div>
          <div className="stat-value" style={{ color: 'var(--green)' }}>{flags.filter(f => f.status === 'Rejected').length}</div>
          <div className="stat-label">Rejected Claims</div>
        </div>
      </div>

      {/* Flags Table */}
      <div className="card">
        <h3 style={{ marginBottom: 16, fontSize: '1rem', fontWeight: 700 }}>🚩 Flagged Claims</h3>
        {flags.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>✅</div>
            No fraud flags detected. Run AI Scan to re-evaluate all pending claims.
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr><th>Claim ID</th><th>Worker</th><th>Trigger</th><th>Amount</th><th>Fraud Score</th><th>Status</th><th>AI Reason</th><th>Time</th></tr>
              </thead>
              <tbody>
                {flags.map(f => (
                  <tr key={f.claim_id}>
                    <td style={{ fontFamily: 'monospace', color: 'var(--purple)', fontWeight: 700 }}>{f.display_id}</td>
                    <td style={{ fontWeight: 600, color: 'var(--text)' }}>{f.worker}</td>
                    <td>{f.trigger_type}</td>
                    <td style={{ fontWeight: 700 }}>{f.amount}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1, height: 8, background: 'rgba(255,255,255,0.08)', borderRadius: 4, overflow: 'hidden', minWidth: 60 }}>
                          <div style={{
                            width: `${Math.round(f.fraud_score * 100)}%`, height: '100%', borderRadius: 4,
                            background: scoreColor(f.fraud_score)
                          }} />
                        </div>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: scoreColor(f.fraud_score) }}>
                          {Math.round(f.fraud_score * 100)}%
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${f.status === 'Approved' ? 'badge-approved' : f.status === 'Rejected' ? 'badge-rejected' : 'badge-review'}`}>
                        {f.status}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)', maxWidth: 200 }}>{f.reason}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{f.time}</td>
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

export default AdminFraud;
