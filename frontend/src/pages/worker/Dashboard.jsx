import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../../api';
import { useToast } from '../../components/Toast';

// ── Premium Calculator ────────────────────────────────────────────────────────
const CITY_RISK = { Bangalore: 1.0, Mumbai: 1.2, Delhi: 1.3, Chennai: 1.1, Hyderabad: 1.05 };
const PremiumCalculator = () => {
  const [income, setIncome] = useState(5000);
  const [city, setCity] = useState('Bangalore');

  const tier = income <= 5000 ? { name: 'Basic', base: 40, coverage: 600 }
    : income <= 8000 ? { name: 'Standard', base: 70, coverage: 840 }
    : { name: 'Premium', base: 100, coverage: 1200 };

  const riskMult = CITY_RISK[city] || 1.0;
  const adjustedPremium = Math.round(tier.base * riskMult);
  const roi = Math.round((tier.coverage / adjustedPremium) * 100) / 100;

  return (
    <div className="card" style={{ marginBottom: 20, background: 'linear-gradient(135deg, rgba(56,189,248,0.06), rgba(168,85,247,0.06))', borderColor: 'rgba(56,189,248,0.2)' }}>
      <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 16 }}>🧮 Premium Calculator</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        <div className="form-group">
          <label className="form-label">Your City</label>
          <select className="form-input" value={city} onChange={e => setCity(e.target.value)}>
            {Object.keys(CITY_RISK).map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Weekly Income: ₹{income.toLocaleString('en-IN')}</label>
          <input type="range" min={1000} max={15000} step={500} value={income}
            onChange={e => setIncome(Number(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--accent)', marginTop: 8 }} />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
        {[
          { label: 'Plan', value: tier.name, color: 'var(--accent)' },
          { label: 'Weekly Premium', value: `₹${adjustedPremium}`, color: 'var(--purple)' },
          { label: 'Payout/Event', value: `₹${tier.coverage}`, color: 'var(--green)' },
        ].map((s, i) => (
          <div key={i} style={{ textAlign: 'center', padding: '10px 8px', background: 'var(--surface)', borderRadius: 8, border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 3 }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 12, fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
        💡 Coverage ROI: <strong style={{ color: 'var(--yellow)' }}>{roi}×</strong> — for every ₹1 paid, you get ₹{roi} back on a trigger
      </div>
    </div>
  );
};

const getRiskColor = (level) => level === 'High' ? 'var(--red)' : level === 'Medium' ? 'var(--yellow)' : 'var(--green)';

const WorkerDashboard = () => {
  const [data, setData] = useState(null);
  const [risk, setRisk] = useState(null);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [enrollForm, setEnrollForm] = useState({ name: '', location: 'Bangalore', weekly_income: 5000, work_type: 'Delivery' });
  const navigate = useNavigate();
  const toast = useToast();

  const setField = k => e => setEnrollForm(f => ({ ...f, [k]: e.target.value }));

  const load = async () => {
    try {
      const [dash, w] = await Promise.all([
        apiFetch('/me/dashboard'),
        apiFetch('/weather/mock?city=Bangalore').catch(() => null)
      ]);
      setData(dash);
      setWeather(w);
      if (dash.policyActive) {
        const r = await apiFetch(`/worker/risk?location=${dash.location || 'Bangalore'}&income=${dash.weeklyIncome || 5000}`).catch(() => null);
        setRisk(r);
      }
    } catch (e) {
      if (e.message.includes('401')) navigate('/auth');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); const t = setInterval(load, 15000); return () => clearInterval(t); }, []);

  const handleEnroll = async (e) => {
    e.preventDefault();
    setEnrolling(true);
    try {
      await apiFetch('/me/enroll', {
        method: 'POST',
        body: JSON.stringify({ ...enrollForm, weekly_income: parseFloat(enrollForm.weekly_income) })
      });
      await load();
    } catch (e) { toast.error(e.message || 'Enrollment failed. Please try again.'); }
    finally { setEnrolling(false); }
  };

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}><div className="spinner" style={{ width: 40, height: 40 }} /></div>;

  const tier = data?.premiumTier;
  const planName = tier === 40 ? 'Basic' : tier === 70 ? 'Standard' : 'Premium';

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            {data?.userName ? <>Welcome, <span className="text-accent">{data.userName}</span></> : 'GigGuard Dashboard'}
          </h1>
          <p className="page-subtitle">
            {data?.workType} • {data?.location} • {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        {data?.policyActive && (
          <button className="btn btn-outline btn-sm" onClick={() => navigate('/worker/payments')}>💳 Pay Premium</button>
        )}
      </div>

      {!data?.policyActive ? (
        /* ── Enrollment ── */
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <div className="card" style={{ marginBottom: 16, background: 'var(--accent-dim)', borderColor: 'rgba(56,189,248,0.3)', textAlign: 'center', padding: '28px' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 10 }}>🛡️</div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 8 }}>Protect Your Income</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Get automatic payouts when heavy rain, AQI spikes, heat waves, or government restrictions stop you from working.
            </p>
          </div>

          {/* Premium Calculator */}
          <PremiumCalculator />

          {/* Plan previews */}
          <div className="plan-cards" style={{ marginBottom: 20 }}>
            {[
              { name: 'Basic', income: '₹3,000–5,000/wk', premium: 40, coverage: '₹600/event' },
              { name: 'Standard', income: '₹5,000–8,000/wk', premium: 70, coverage: '₹840/event' },
              { name: 'Premium', income: '₹8,000+/wk', premium: 100, coverage: '₹1,200/event' },
            ].map(p => (
              <div key={p.name} className="plan-card" onClick={() => {
                const inc = p.name === 'Basic' ? 4000 : p.name === 'Standard' ? 6500 : 9000;
                setEnrollForm(f => ({ ...f, weekly_income: inc }));
              }}>
                <div className="plan-name">{p.name}</div>
                <div className="plan-price">₹{p.premium}<span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-muted)' }}>/wk</span></div>
                <div className="plan-features">
                  <span>Income: {p.income}</span>
                  <span>Coverage: {p.coverage}</span>
                  <span>✓ Rain, AQI, Heat</span>
                  <span>✓ Auto payout</span>
                </div>
              </div>
            ))}
          </div>

          <div className="card">
            <h3 style={{ marginBottom: 18, fontSize: '1rem' }}>📝 Enroll Now</h3>
            <form onSubmit={handleEnroll} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" type="text" placeholder="Rahul Kumar" value={enrollForm.name} onChange={setField('name')} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">City</label>
                  <select className="form-input" value={enrollForm.location} onChange={setField('location')}>
                    <option>Bangalore</option><option>Mumbai</option><option>Delhi</option>
                    <option>Chennai</option><option>Hyderabad</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Work Type</label>
                  <select className="form-input" value={enrollForm.work_type} onChange={setField('work_type')}>
                    <option>Delivery</option><option>Cab Driver</option>
                    <option>Freelancer</option><option>Logistics</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Weekly Income (₹)</label>
                <input className="form-input" type="number" placeholder="5000" value={enrollForm.weekly_income} onChange={setField('weekly_income')} required min="1000" />
                <span style={{ fontSize: '0.75rem', color: 'var(--accent)', marginTop: 4 }}>
                  → Plan: {parseFloat(enrollForm.weekly_income) <= 5000 ? 'Basic (₹40/wk)' : parseFloat(enrollForm.weekly_income) <= 8000 ? 'Standard (₹70/wk)' : 'Premium (₹100/wk)'}
                </span>
              </div>
              <button className="btn btn-primary btn-lg" type="submit" disabled={enrolling} style={{ justifyContent: 'center' }}>
                {enrolling ? <span className="spinner" /> : '🚀 Activate Coverage'}
              </button>
            </form>
          </div>
        </div>
      ) : (
        /* ── Active Dashboard ── */
        <>
          {/* Stats */}
          <div className="stats-grid">
            <div className="stat-card" style={{ '--accent-line': 'var(--green)' }}>
              <div className="stat-icon">🛡️</div>
              <div className="stat-value" style={{ color: 'var(--green)' }}>ACTIVE</div>
              <div className="stat-label">Coverage Status</div>
              <div className="stat-change up">Since {data?.policyStartDate}</div>
            </div>
            <div className="stat-card" style={{ '--accent-line': 'var(--accent)' }}>
              <div className="stat-icon">💳</div>
              <div className="stat-value text-gradient">₹{tier}</div>
              <div className="stat-label">{planName} Plan · Weekly Premium</div>
              <div className="stat-change up">Auto-debit active</div>
            </div>
            <div className="stat-card" style={{ '--accent-line': risk ? getRiskColor(risk.level) : 'var(--yellow)' }}>
              <div className="stat-icon">🤖</div>
              <div className="stat-value" style={{ color: risk ? getRiskColor(risk.level) : 'var(--yellow)' }}>
                {risk ? `${Math.round(risk.risk_score * 100)}%` : '—'}
              </div>
              <div className="stat-label">AI Risk Score</div>
              <div className="stat-change" style={{ color: risk ? getRiskColor(risk.level) : 'var(--text-muted)' }}>
                {risk?.level || '...'} Risk · {risk?.recommendation?.split(' ').slice(0,3).join(' ')}…
              </div>
            </div>
            <div className="stat-card" style={{ '--accent-line': 'var(--purple)' }}>
              <div className="stat-icon">💰</div>
              <div className="stat-value">₹{Math.round(data?.totalPremiumPaid || 0).toLocaleString('en-IN')}</div>
              <div className="stat-label">Total Premium Paid</div>
              <div className="stat-change" style={{ color: 'var(--text-muted)' }}>{data?.recentClaims?.length || 0} claims on record</div>
            </div>
          </div>

          {/* Weather + Quick Actions */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
            {/* Live Weather */}
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>🌦️ Live Weather — {data?.location}</h3>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Mock data</span>
              </div>
              {weather ? (
                <div className="weather-widget">
                  <div className="weather-item">
                    <div className="weather-item-icon">🌧️</div>
                    <div className="weather-item-value" style={{ color: weather.rainfall_mm > 50 ? 'var(--red)' : 'var(--accent)' }}>
                      {weather.rainfall_mm}mm
                    </div>
                    <div className="weather-item-label">Rainfall</div>
                    {weather.rainfall_mm > 50 && <div style={{ fontSize: '0.65rem', color: 'var(--red)', marginTop: 2 }}>⚠️ Trigger</div>}
                  </div>
                  <div className="weather-item">
                    <div className="weather-item-icon">💨</div>
                    <div className="weather-item-value" style={{ color: weather.aqi > 400 ? 'var(--red)' : weather.aqi > 200 ? 'var(--yellow)' : 'var(--green)' }}>
                      {weather.aqi}
                    </div>
                    <div className="weather-item-label">AQI</div>
                    {weather.aqi > 400 && <div style={{ fontSize: '0.65rem', color: 'var(--red)', marginTop: 2 }}>⚠️ Hazardous</div>}
                  </div>
                  <div className="weather-item">
                    <div className="weather-item-icon">🌡️</div>
                    <div className="weather-item-value" style={{ color: weather.temp_c > 45 ? 'var(--red)' : 'var(--orange)' }}>
                      {weather.temp_c}°C
                    </div>
                    <div className="weather-item-label">Temperature</div>
                    {weather.temp_c > 45 && <div style={{ fontSize: '0.65rem', color: 'var(--red)', marginTop: 2 }}>⚠️ Heat Wave</div>}
                  </div>
                </div>
              ) : <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading weather…</div>}
            </div>

            {/* Quick Actions */}
            <div className="card">
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 14 }}>⚡ Quick Actions</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button className="btn btn-primary" onClick={() => navigate('/worker/payments')} style={{ justifyContent: 'center' }}>
                  💳 Pay Weekly Premium (₹{tier})
                </button>
                <button className="btn btn-outline" onClick={() => navigate('/worker/policy')} style={{ justifyContent: 'center' }}>
                  📄 View My Policy Details
                </button>
                <button className="btn btn-outline" onClick={() => navigate('/worker/claims')} style={{ justifyContent: 'center' }}>
                  📋 View Claim History
                </button>
                <button className="btn btn-outline" onClick={() => navigate('/worker/alerts')} style={{ justifyContent: 'center' }}>
                  🔔 Check Alerts & Notifications
                </button>
              </div>
            </div>
          </div>

          {/* Recent Claims */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>📋 Recent Claims</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/worker/claims')}>View All →</button>
            </div>
            {data?.recentClaims?.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '28px 0', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '2rem', marginBottom: 8 }}>✅</div>
                No claims yet. Your coverage is protecting you.
              </div>
            ) : (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr><th>Claim ID</th><th>Trigger</th><th>Payout</th><th>Status</th><th>Date</th></tr>
                  </thead>
                  <tbody>
                    {data.recentClaims.slice(0, 5).map(c => (
                      <tr key={c.id}>
                        <td style={{ fontFamily: 'monospace', color: 'var(--accent)' }}>{c.display_id}</td>
                        <td>{c.type}</td>
                        <td style={{ fontWeight: 600, color: 'var(--text)' }}>{c.amount}</td>
                        <td>
                          <span className={`badge badge-${c.status === 'Approved' ? 'approved' : c.status === 'Rejected' ? 'rejected' : 'review'}`}>
                            {c.status}
                          </span>
                        </td>
                        <td>{c.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default WorkerDashboard;
