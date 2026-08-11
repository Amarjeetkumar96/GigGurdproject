import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../../api';

const AdminOverview = () => {
  const [stats, setStats] = useState(null);
  const [claims, setClaims] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const load = async () => {
    try {
      const [s, c, a] = await Promise.all([
        apiFetch('/admin/stats'),
        apiFetch('/admin/claims'),
        apiFetch('/admin/analytics'),
      ]);
      setStats(s); setClaims(c.slice(0, 8)); setAnalytics(a);
    } catch (e) {
      if (e.message.includes('403') || e.message.includes('401')) navigate('/auth');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); const t = setInterval(load, 15000); return () => clearInterval(t); }, []);

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}><div className="spinner" style={{ width: 40, height: 40 }} /></div>;

  // SVG sparkline
  const SparkLine = ({ points, color }) => (
    <svg viewBox="0 0 100 30" style={{ width: '100%', height: 40 }}>
      <polyline fill="none" stroke={color} strokeWidth="2" points={points}
        style={{ filter: `drop-shadow(0 0 3px ${color})` }} className="chart-line" />
    </svg>
  );

  const BarChart = ({ data }) => {
    const max = Math.max(...data.map(d => d.count), 1);
    return (
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 80 }}>
        {data.map(d => (
          <div key={d.type} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{ height: `${(d.count / max) * 64}px`, minHeight: 4, background: 'var(--accent)', borderRadius: '4px 4px 0 0', width: '100%', transition: 'height 0.5s ease' }} />
            <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.2 }}>{d.type.split(' ')[0]}</div>
            <div style={{ fontSize: '0.7rem', fontWeight: 700 }}>{d.count}</div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">📊 Admin Overview</h1>
          <p className="page-subtitle">Real-time monitoring of GigGuard operations</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/admin/triggers')}>⚡ Trigger Simulator</button>
          <button className="btn btn-outline btn-sm" onClick={load}>↻ Refresh</button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))' }}>
        {[
          { icon: '👥', label: 'Total Workers', value: stats?.totalWorkers || 0, color: 'var(--accent)', line: 'var(--accent)', change: 'Enrolled users' },
          { icon: '🛡️', label: 'Active Policies', value: stats?.activePolicies || 0, color: 'var(--green)', line: 'var(--green)', change: 'Live coverage' },
          { icon: '💰', label: 'Total Premiums', value: stats?.weeklyPremiums || '₹0', color: 'var(--text)', line: 'var(--purple)', change: 'Collected' },
          { icon: '💸', label: 'Total Payouts', value: stats?.totalPayouts || '₹0', color: 'var(--yellow)', line: 'var(--yellow)', change: 'Disbursed' },
          { icon: '⚡', label: 'Disruptions', value: stats?.disruptions || 0, color: 'var(--orange)', line: 'var(--orange)', change: 'Trigger events' },
          { icon: '📋', label: 'Pending Claims', value: stats?.claimsProcessing || 0, color: 'var(--yellow)', line: 'var(--yellow)', change: 'Awaiting review' },
          { icon: '🚨', label: 'Fraud Flags', value: stats?.fraudFlags || 0, color: 'var(--red)', line: 'var(--red)', change: 'Flagged claims' },
          { icon: '📊', label: 'Total Claims', value: stats?.totalClaims || 0, color: 'var(--text)', line: 'var(--accent)', change: 'All time' },
        ].map((s, i) => (
          <div key={i} className={`stat-card delay-${i % 5 + 1} animate-fade-in`} style={{ '--accent-line': s.line }}>
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-value" style={{ color: s.color, fontSize: '1.6rem' }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-change" style={{ color: 'var(--text-muted)' }}>{s.change}</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        {/* Trigger Breakdown */}
        <div className="card">
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 16 }}>⚡ Claims by Trigger Type</h3>
          {analytics?.trigger_breakdown?.length > 0 ? (
            <BarChart data={analytics.trigger_breakdown} />
          ) : (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '20px 0' }}>
              No trigger data yet. Use the Trigger Simulator.
            </div>
          )}
        </div>

        {/* Financial Summary */}
        <div className="card">
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 16 }}>💹 Financial Summary</h3>
          {analytics?.financial && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Total Premiums</span>
                <span style={{ fontWeight: 700, color: 'var(--green)' }}>₹{Math.round(analytics.financial.total_premiums).toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Total Payouts</span>
                <span style={{ fontWeight: 700, color: 'var(--red)' }}>₹{Math.round(analytics.financial.total_payouts).toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
                <span style={{ color: 'var(--text-muted)' }}>Net Reserve</span>
                <span style={{ fontWeight: 700, color: analytics.financial.net >= 0 ? 'var(--green)' : 'var(--red)' }}>
                  ₹{Math.round(analytics.financial.net).toLocaleString('en-IN')}
                </span>
              </div>
              <div style={{ marginTop: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 6 }}>
                  <span>Payout Ratio</span>
                  <span>{analytics.financial.total_premiums > 0 ? Math.round((analytics.financial.total_payouts / analytics.financial.total_premiums) * 100) : 0}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{
                    width: `${analytics.financial.total_premiums > 0 ? Math.min(100, Math.round((analytics.financial.total_payouts / analytics.financial.total_premiums) * 100)) : 0}%`,
                    background: 'linear-gradient(90deg, var(--green), var(--yellow))'
                  }} />
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Recent Claims */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>📋 Recent Activity</h3>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/admin/claims')}>View All →</button>
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr><th>ID</th><th>Worker</th><th>Trigger</th><th>Amount</th><th>Status</th><th>Fraud</th><th>Time</th></tr>
            </thead>
            <tbody>
              {claims.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '28px', color: 'var(--text-muted)' }}>No claims yet. Use Trigger Simulator to create some.</td></tr>
              ) : claims.map(c => (
                <tr key={c.id}>
                  <td style={{ fontFamily: 'monospace', color: 'var(--accent)', fontSize: '0.8rem' }}>{c.display_id}</td>
                  <td style={{ fontWeight: 600, color: 'var(--text)' }}>{c.worker}</td>
                  <td style={{ color: 'var(--text-sub)' }}>{c.type}</td>
                  <td style={{ fontWeight: 700 }}>{c.amount}</td>
                  <td><span className={`badge badge-${c.status === 'Approved' ? 'approved' : c.status === 'Rejected' ? 'rejected' : 'review'}`}>{c.status}</span></td>
                  <td>
                    {c.is_fraud_flagged
                      ? <span className="badge badge-fraud">🚨 Flagged</span>
                      : <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{Math.round((c.fraud_score || 0) * 100)}%</span>}
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{c.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
