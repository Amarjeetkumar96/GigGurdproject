import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../../api';

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    apiFetch('/admin/analytics').then(setAnalytics).catch(e => {
      if (e.message.includes('401') || e.message.includes('403')) navigate('/auth');
    }).finally(() => setLoading(false));
  }, []);

  if (loading || !analytics) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}><div className="spinner" style={{ width: 40, height: 40 }} /></div>;

  const { trigger_breakdown, financial, city_distribution } = analytics;
  const maxCount = Math.max(...(trigger_breakdown.map(t => t.count) || [1]), 1);

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">📈 Analytics</h1>
          <p className="page-subtitle">Disruption trends, financial health, and geographic insights</p>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ marginBottom: 20, fontSize: '1rem', fontWeight: 700 }}>💹 Financial Health</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 20, marginBottom: 20 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--green)' }}>₹{Math.round(financial.total_premiums).toLocaleString('en-IN')}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: 4 }}>💳 Total Premiums Collected</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--red)' }}>₹{Math.round(financial.total_payouts).toLocaleString('en-IN')}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: 4 }}>💸 Total Payouts Disbursed</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: financial.net >= 0 ? 'var(--green)' : 'var(--red)' }}>₹{Math.round(financial.net).toLocaleString('en-IN')}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: 4 }}>🏦 Net Reserve</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent)' }}>
              {financial.total_premiums > 0 ? `${Math.round((financial.total_payouts / financial.total_premiums) * 100)}%` : '0%'}
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: 4 }}>📊 Payout-to-Premium Ratio</div>
          </div>
        </div>

        {/* Bar visualization for premium vs payout */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 8 }}>
            <span>💳 Premiums</span>
            <span>💸 Payouts</span>
          </div>
          {financial.total_premiums > 0 && (
            <div style={{ display: 'flex', height: 20, borderRadius: 10, overflow: 'hidden', gap: 2 }}>
              <div style={{
                width: `${Math.round((financial.total_premiums / (financial.total_premiums + financial.total_payouts)) * 100)}%`,
                background: 'var(--green)', transition: 'width 0.8s ease',
              }} />
              <div style={{
                flex: 1, background: 'var(--red)', opacity: 0.7,
              }} />
            </div>
          )}
        </div>
      </div>

      {/* Trigger Breakdown + City Distribution */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Trigger Breakdown */}
        <div className="card">
          <h3 style={{ marginBottom: 20, fontSize: '1rem', fontWeight: 700 }}>⚡ Disruptions by Trigger Type</h3>
          {trigger_breakdown.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '28px 0', color: 'var(--text-muted)' }}>No data. Use Trigger Simulator.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[...trigger_breakdown].sort((a, b) => b.count - a.count).map((t, i) => (
                <div key={t.type}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', marginBottom: 6 }}>
                    <span style={{ fontWeight: 600 }}>{t.type}</span>
                    <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{t.count} claims</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{
                      width: `${Math.round((t.count / maxCount) * 100)}%`,
                      background: ['var(--accent)', 'var(--purple)', 'var(--orange)', 'var(--red)'][i % 4]
                    }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* City Distribution */}
        <div className="card">
          <h3 style={{ marginBottom: 20, fontSize: '1rem', fontWeight: 700 }}>🗺️ Worker City Distribution</h3>
          {city_distribution.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '28px 0', color: 'var(--text-muted)' }}>No enrolled workers yet.</div>
          ) : (
            <>
              {/* Simple pie-like representation */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {city_distribution.map((c, i) => {
                  const pct = Math.round((c.count / city_distribution.reduce((s, x) => s + x.count, 0)) * 100);
                  return (
                    <div key={c.city}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', marginBottom: 5 }}>
                        <span style={{ fontWeight: 600 }}>{c.city || 'Unknown'}</span>
                        <span style={{ color: 'var(--text-muted)' }}>{c.count} workers · {pct}%</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{
                          width: `${pct}%`,
                          background: ['var(--accent)', 'var(--green)', 'var(--yellow)', 'var(--purple)', 'var(--orange)'][i % 5]
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* SVG Earnings Loss Chart */}
      <div className="card">
        <h3 style={{ marginBottom: 16, fontSize: '1rem', fontWeight: 700 }}>📉 Estimated Earnings Loss (Last 7 Days)</h3>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: 12 }}>
          Estimated based on ₹800/day avg × disruption days for active workers.
        </div>
        <svg viewBox="0 0 600 100" style={{ width: '100%', height: 120 }}>
          <defs>
            <linearGradient id="lossGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="var(--red)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="var(--red)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <polygon
            fill="url(#lossGrad)"
            points="0,100 0,70 80,60 160,80 240,40 320,55 400,30 480,45 600,20 600,100"
          />
          <polyline
            fill="none" stroke="var(--red)" strokeWidth="2"
            points="0,70 80,60 160,80 240,40 320,55 400,30 480,45 600,20"
            className="chart-line"
            style={{ filter: 'drop-shadow(0 0 4px var(--red))' }}
          />
          {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d, i) => (
            <text key={d} x={i * 86 + 10} y={115} fill="var(--text-muted)" fontSize="9">{d}</text>
          ))}
        </svg>
      </div>
    </div>
  );
};

export default AdminAnalytics;
