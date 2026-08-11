import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../../api';
import { useToast } from '../../components/Toast';

const CITIES = ['All Cities', 'Bangalore', 'Mumbai', 'Delhi', 'Chennai', 'Hyderabad'];
const WORK_TYPES = ['All Types', 'Delivery', 'Cab Driver', 'Freelancer', 'Logistics'];

const AdminWorkers = () => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('All Cities');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [statusFilter, setStatusFilter] = useState('All');
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    apiFetch('/admin/workers').then(setWorkers).catch(e => {
      if (e.message.includes('401') || e.message.includes('403')) navigate('/auth');
    }).finally(() => setLoading(false));
  }, []);

  const filtered = workers.filter(w => {
    const matchSearch = !search ||
      w.name?.toLowerCase().includes(search.toLowerCase()) ||
      w.email?.toLowerCase().includes(search.toLowerCase()) ||
      w.location?.toLowerCase().includes(search.toLowerCase());
    const matchCity = cityFilter === 'All Cities' || w.location === cityFilter;
    const matchType = typeFilter === 'All Types' || w.work_type === typeFilter;
    const matchStatus = statusFilter === 'All' ||
      (statusFilter === 'Active' && w.policy_active) ||
      (statusFilter === 'Inactive' && !w.policy_active) ||
      (statusFilter === 'Flagged' && w.is_flagged);
    return matchSearch && matchCity && matchType && matchStatus;
  });

  const active = workers.filter(w => w.policy_active).length;
  const flagged = workers.filter(w => w.is_flagged).length;
  const totalPremiums = workers.reduce((s, w) => s + (w.policy_active ? w.premium_tier : 0), 0);

  // CSV Export
  const exportCSV = () => {
    const headers = ['Name', 'Email', 'City', 'Work Type', 'Weekly Income', 'Premium/wk', 'Claims', 'Fraud Score', 'Status'];
    const rows = filtered.map(w => [
      w.name || '', w.email || '', w.location || '', w.work_type || '',
      w.weekly_income || 0, w.premium_tier || 0, w.claim_count || 0,
      Math.round((w.fraud_score || 0) * 100) + '%',
      w.policy_active ? 'Active' : 'Inactive'
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `gigguard_workers_${new Date().toISOString().split('T')[0]}.csv`;
    a.click(); URL.revokeObjectURL(url);
    toast.success(`Exported ${filtered.length} workers to CSV`);
  };

  const clearFilters = () => { setSearch(''); setCityFilter('All Cities'); setTypeFilter('All Types'); setStatusFilter('All'); };
  const hasFilters = search || cityFilter !== 'All Cities' || typeFilter !== 'All Types' || statusFilter !== 'All';

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}><div className="spinner" style={{ width: 40, height: 40 }} /></div>;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">👥 Worker Directory</h1>
          <p className="page-subtitle">{workers.length} registered workers · {active} with active coverage</p>
        </div>
        <button className="btn btn-outline btn-sm" onClick={exportCSV} title="Export filtered results">
          📥 Export CSV ({filtered.length})
        </button>
      </div>

      <div className="stats-grid" style={{ marginBottom: 20 }}>
        <div className="stat-card"><div className="stat-icon">👥</div><div className="stat-value">{workers.length}</div><div className="stat-label">Total Workers</div></div>
        <div className="stat-card" style={{ '--accent-line': 'var(--green)' }}><div className="stat-icon">🛡️</div><div className="stat-value" style={{ color: 'var(--green)' }}>{active}</div><div className="stat-label">Covered</div></div>
        <div className="stat-card" style={{ '--accent-line': 'var(--red)' }}><div className="stat-icon">🚨</div><div className="stat-value" style={{ color: 'var(--red)' }}>{flagged}</div><div className="stat-label">Fraud Flagged</div></div>
        <div className="stat-card" style={{ '--accent-line': 'var(--accent)' }}><div className="stat-icon">💰</div><div className="stat-value">₹{totalPremiums}</div><div className="stat-label">Weekly Pool</div></div>
      </div>

      <div className="card">
        {/* Search & Filter Bar */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            className="form-input"
            type="text"
            placeholder="🔍 Search name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: '1 1 200px', minWidth: 180 }}
          />
          <select className="form-input" value={cityFilter} onChange={e => setCityFilter(e.target.value)} style={{ flex: '0 1 150px' }}>
            {CITIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <select className="form-input" value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={{ flex: '0 1 150px' }}>
            {WORK_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
          <select className="form-input" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ flex: '0 1 130px' }}>
            {['All', 'Active', 'Inactive', 'Flagged'].map(s => <option key={s}>{s}</option>)}
          </select>
          {hasFilters && (
            <button className="btn btn-ghost btn-sm" onClick={clearFilters} style={{ color: 'var(--red)', whiteSpace: 'nowrap' }}>
              ✕ Clear
            </button>
          )}
        </div>

        {/* Result count */}
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 10 }}>
          Showing <strong style={{ color: 'var(--text)' }}>{filtered.length}</strong> of {workers.length} workers
          {hasFilters && ' (filtered)'}
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
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: '2rem', marginBottom: 8 }}>🔍</div>
                  No workers match your filters.
                  {hasFilters && <> <span style={{ color: 'var(--accent)', cursor: 'pointer' }} onClick={clearFilters}> Clear filters</span></>}
                </td></tr>
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
