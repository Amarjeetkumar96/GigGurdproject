import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../../api';

const WorkerPolicy = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unsubbing, setUnsubbing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    apiFetch('/me/dashboard').then(setData).catch((e) => console.error(e)).finally(() => setLoading(false));
  }, []);

  const handleUnsubscribe = async () => {
    if (!window.confirm('Are you sure you want to cancel your coverage?')) return;
    setUnsubbing(true);
    try {
      await apiFetch('/me/unsubscribe', { method: 'POST' });
      navigate('/worker');
    } catch (e) { alert(e.message); }
    finally { setUnsubbing(false); }
  };

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}><div className="spinner" style={{ width: 40, height: 40 }} /></div>;

  const tier = data?.premiumTier;
  const planName = tier === 40 ? 'Basic' : tier === 70 ? 'Standard' : 'Premium';
  const maxPayout = tier === 40 ? '₹600' : tier === 70 ? '₹840' : '₹1,200';

  const triggers = [
    { icon: '🌧️', name: 'Heavy Rainfall', cond: '> 50mm per day', payout: maxPayout },
    { icon: '💨', name: 'AQI Hazard', cond: 'AQI > 400 (Hazardous)', payout: maxPayout },
    { icon: '🌡️', name: 'Heat Wave', cond: 'Temperature > 45°C', payout: maxPayout },
    { icon: '🚫', name: 'Govt. Restriction', cond: 'Mandatory work stoppage', payout: maxPayout },
  ];

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">🛡️ My Policy</h1>
          <p className="page-subtitle">Parametric insurance details and coverage</p>
        </div>
        {data?.policyActive && (
          <button className="btn btn-danger btn-sm" onClick={handleUnsubscribe} disabled={unsubbing}>
            {unsubbing ? <span className="spinner" /> : '❌ Cancel Policy'}
          </button>
        )}
      </div>

      {!data?.policyActive ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>📭</div>
          <h2 style={{ marginBottom: 8 }}>No Active Policy</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>Go to Dashboard to enroll in a plan.</p>
          <button className="btn btn-primary" onClick={() => navigate('/worker')}>Go to Dashboard</button>
        </div>
      ) : (
        <>
          {/* Policy Banner */}
          <div className="card" style={{ background: 'linear-gradient(135deg, rgba(56,189,248,0.1), rgba(168,85,247,0.08))', borderColor: 'rgba(56,189,248,0.3)', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <span className="badge badge-success">● ACTIVE</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Since {data.policyStartDate}</span>
                </div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{planName} Plan</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: 4 }}>
                  Worker: <strong>{data.userName}</strong> • {data.workType} • {data.location}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--accent)' }}>₹{tier}<span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 400 }}>/wk</span></div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Max payout: {maxPayout}/event</div>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="stats-grid" style={{ marginBottom: 20 }}>
            <div className="stat-card">
              <div className="stat-icon">💰</div>
              <div className="stat-value">₹{Math.round(data.totalPremiumPaid || 0)}</div>
              <div className="stat-label">Total Premiums Paid</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📋</div>
              <div className="stat-value">{data.recentClaims?.length || 0}</div>
              <div className="stat-label">Total Claims Filed</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-value">{data.recentClaims?.filter(c => c.status === 'Approved').length || 0}</div>
              <div className="stat-label">Claims Approved</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📈</div>
              <div className="stat-value">₹{data.recentClaims?.filter(c => c.status === 'Approved').reduce((s, c) => s + parseInt(c.amount.replace(/[₹, ]/g, '')), 0).toLocaleString('en-IN') || 0}</div>
              <div className="stat-label">Total Payouts Received</div>
            </div>
          </div>

          {/* Covered Triggers */}
          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ marginBottom: 16, fontSize: '1rem', fontWeight: 700 }}>⚡ Triggers Covered Under Your Policy</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
              {triggers.map(t => (
                <div key={t.name} className="card" style={{ background: 'var(--accent-dim)', borderColor: 'rgba(56,189,248,0.2)', padding: 16 }}>
                  <div style={{ fontSize: '1.6rem', marginBottom: 8 }}>{t.icon}</div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 4 }}>{t.name}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 8 }}>{t.cond}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--green)', fontWeight: 700 }}>Payout: {t.payout}</div>
                </div>
              ))}
            </div>
          </div>

          {/* How It Works */}
          <div className="card">
            <h3 style={{ marginBottom: 16, fontSize: '1rem', fontWeight: 700 }}>ℹ️ How Parametric Insurance Works</h3>
            <div className="timeline">
              {[
                { icon: '🌧️', title: 'Trigger Detected', desc: 'Rainfall > 50mm, AQI > 400, etc.', color: 'var(--accent-dim)' },
                { icon: '🤖', title: 'AI Verification', desc: 'Fraud detection & risk scoring runs automatically', color: 'var(--purple-dim)' },
                { icon: '📋', title: 'Claim Created', desc: 'Claim auto-generated for all active policies', color: 'var(--yellow-dim)' },
                { icon: '✅', title: 'Payout Processed', desc: `₹{maxPayout} credited to your account instantly`, color: 'var(--green-dim)' },
              ].map((s, i) => (
                <div key={i} className="timeline-item">
                  <div className="timeline-dot" style={{ background: s.color, color: 'var(--text)' }}>{s.icon}</div>
                  <div className="timeline-content">
                    <div className="timeline-title">{s.title}</div>
                    <div className="timeline-meta">{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default WorkerPolicy;
