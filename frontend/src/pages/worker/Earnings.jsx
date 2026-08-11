import React, { useState, useEffect } from 'react';

const STORAGE_KEY = 'gigguard_earnings';

const getDayLabel = (daysAgo) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' });
};

const getDateKey = (daysAgo = 0) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
};

const WorkerEarnings = () => {
  const [entries, setEntries] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
    catch { return {}; }
  });
  const [form, setForm] = useState({ date: getDateKey(0), amount: '' });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, [entries]);

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const key = getDateKey(6 - i);
    return { label: getDayLabel(6 - i), key, value: parseFloat(entries[key] || 0) };
  });

  const maxVal = Math.max(...last7.map(d => d.value), 1);
  const total = last7.reduce((s, d) => s + d.value, 0);
  const avg = total / 7;
  const todayVal = entries[getDateKey(0)] || 0;
  const bestDay = last7.reduce((best, d) => d.value > best.value ? d : best, last7[0]);

  const handleSave = (e) => {
    e.preventDefault();
    if (!form.amount || isNaN(form.amount)) return;
    setEntries(prev => ({ ...prev, [form.date]: parseFloat(form.amount) }));
    setForm(f => ({ ...f, amount: '' }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleDelete = (key) => {
    setEntries(prev => { const n = { ...prev }; delete n[key]; return n; });
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">💰 Earnings Tracker</h1>
          <p className="page-subtitle">Log and visualize your daily income over the past 7 days</p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', marginBottom: 24 }}>
        {[
          { icon: '📅', label: "Today's Earnings", value: `₹${Number(todayVal).toLocaleString('en-IN')}`, color: 'var(--accent)' },
          { icon: '📊', label: 'Weekly Total', value: `₹${Math.round(total).toLocaleString('en-IN')}`, color: 'var(--green)' },
          { icon: '📈', label: 'Daily Average', value: `₹${Math.round(avg).toLocaleString('en-IN')}`, color: 'var(--purple)' },
          { icon: '🏆', label: 'Best Day', value: bestDay.value > 0 ? bestDay.label : '—', color: 'var(--yellow)' },
        ].map((s, i) => (
          <div key={i} className="stat-card" style={{ '--accent-line': s.color }}>
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-value" style={{ color: s.color, fontSize: '1.5rem' }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16, alignItems: 'start' }}>
        {/* Bar Chart */}
        <div className="card">
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 24 }}>📅 Last 7 Days</h3>
          <div className="earnings-chart">
            {last7.map((d, i) => {
              const heightPct = d.value > 0 ? Math.max((d.value / maxVal) * 180, 6) : 4;
              const isToday = d.key === getDateKey(0);
              const isAboveAvg = d.value >= avg && d.value > 0;
              return (
                <div key={i} className="earnings-bar-wrap">
                  <div className="earnings-bar-value" style={{ color: d.value > 0 ? 'var(--text)' : 'var(--text-muted)' }}>
                    {d.value > 0 ? `₹${Math.round(d.value / 1000) > 0 ? (d.value / 1000).toFixed(1) + 'k' : d.value}` : '—'}
                  </div>
                  <div className="earnings-bar-col">
                    <div
                      className="earnings-bar"
                      style={{
                        height: heightPct,
                        background: isToday
                          ? 'linear-gradient(180deg, var(--accent), #0284c7)'
                          : isAboveAvg
                          ? 'linear-gradient(180deg, var(--green), rgba(34,197,94,0.5))'
                          : 'rgba(255,255,255,0.12)',
                        boxShadow: isToday ? '0 0 12px var(--accent-glow)' : 'none',
                      }}
                    />
                    {d.value > 0 && avg > 0 && (
                      <div className="earnings-avg-line" style={{ bottom: (avg / maxVal) * 180 }} />
                    )}
                  </div>
                  <div className="earnings-bar-label" style={{ color: isToday ? 'var(--accent)' : 'var(--text-muted)', fontWeight: isToday ? 700 : 400 }}>
                    {d.label.split(' ')[0]}
                    {isToday && <div style={{ fontSize: '0.6rem', color: 'var(--accent)' }}>Today</div>}
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ display: 'flex', gap: 16, marginTop: 16, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--accent)', display: 'inline-block' }} /> Today
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--green)', display: 'inline-block' }} /> Above avg
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 10, height: 2, background: 'var(--yellow)', display: 'inline-block' }} /> Avg line
            </span>
          </div>
        </div>

        {/* Log Form + Entries */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 16 }}>➕ Log Earnings</h3>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Date</label>
                <input className="form-input" type="date" value={form.date}
                  max={getDateKey(0)}
                  onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Amount Earned (₹)</label>
                <input className="form-input" type="number" placeholder="e.g. 1200"
                  value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                  min="0" max="99999" required />
              </div>
              <button className="btn btn-primary" type="submit" style={{ justifyContent: 'center' }}>
                {saved ? '✅ Saved!' : '💾 Save Entry'}
              </button>
            </form>
          </div>

          {/* Logged Entries */}
          <div className="card">
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 12 }}>📋 Logged Entries</h3>
            {last7.filter(d => d.value > 0).length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', textAlign: 'center', padding: '12px 0' }}>
                No entries yet. Start logging!
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {last7.filter(d => d.value > 0).reverse().map(d => (
                  <div key={d.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', background: 'var(--surface-hover)', borderRadius: 8 }}>
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>{d.label}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{d.key}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontWeight: 700, color: 'var(--green)' }}>₹{d.value.toLocaleString('en-IN')}</span>
                      <button className="btn btn-ghost btn-sm" style={{ color: 'var(--red)', padding: '3px 7px', fontSize: '0.75rem' }}
                        onClick={() => handleDelete(d.key)}>✕</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerEarnings;
