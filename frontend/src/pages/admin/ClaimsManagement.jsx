import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../../api';

const statusClass = s => s === 'Approved' ? 'badge-approved' : s === 'Rejected' ? 'badge-rejected' : s === 'Manual Review' ? 'badge-review' : 'badge-pending';

const AdminClaims = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [actionNote, setActionNote] = useState({});
  const [actioning, setActioning] = useState({});
  const navigate = useNavigate();

  const load = async () => {
    try {
      const data = await apiFetch('/admin/claims');
      setClaims(data);
    } catch (e) {
      if (e.message.includes('401') || e.message.includes('403')) navigate('/auth');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const action = async (id, act) => {
    setActioning(a => ({ ...a, [id]: act }));
    try {
      await apiFetch(`/admin/claims/${id}/action`, {
        method: 'POST',
        body: JSON.stringify({ action: act, note: actionNote[id] || '' })
      });
      await load();
    } catch (e) { alert(e.message); }
    finally { setActioning(a => ({ ...a, [id]: null })); }
  };

  const filtered = filter === 'all' ? claims : claims.filter(c => c.status.toLowerCase().replace(' ', '_') === filter);

  const counts = {
    all: claims.length,
    approved: claims.filter(c => c.status === 'Approved').length,
    pending: claims.filter(c => c.status === 'Pending').length,
    manual_review: claims.filter(c => c.status === 'Manual Review').length,
    rejected: claims.filter(c => c.status === 'Rejected').length,
  };

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}><div className="spinner" style={{ width: 40, height: 40 }} /></div>;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">📋 Claims Management</h1>
          <p className="page-subtitle">Review and take action on insurance claims</p>
        </div>
        <button className="btn btn-outline btn-sm" onClick={load}>↻ Refresh</button>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { key: 'all', label: 'All', count: counts.all },
          { key: 'manual_review', label: 'Manual Review', count: counts.manual_review },
          { key: 'pending', label: 'Pending', count: counts.pending },
          { key: 'approved', label: 'Approved', count: counts.approved },
          { key: 'rejected', label: 'Rejected', count: counts.rejected },
        ].map(tab => (
          <button
            key={tab.key}
            className={`btn btn-sm ${filter === tab.key ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setFilter(tab.key)}
          >
            {tab.label} {tab.count > 0 && <span style={{ opacity: 0.8 }}>({tab.count})</span>}
          </button>
        ))}
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Claim ID</th><th>Worker</th><th>Trigger</th><th>Amount</th>
                <th>Fraud</th><th>Status</th><th>Note</th><th>Actions</th><th>Time</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={9} style={{ textAlign: 'center', padding: '28px', color: 'var(--text-muted)' }}>No claims in this category.</td></tr>
              ) : filtered.map(c => (
                <tr key={c.id}>
                  <td style={{ fontFamily: 'monospace', color: 'var(--accent)', fontSize: '0.82rem' }}>{c.display_id}</td>
                  <td style={{ fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap' }}>{c.worker}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>{c.type}</td>
                  <td style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>{c.amount}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {c.is_fraud_flagged && <span title="AI flagged">🚨</span>}
                      <span style={{
                        fontSize: '0.78rem', fontWeight: 700,
                        color: c.fraud_score > 0.45 ? 'var(--red)' : c.fraud_score > 0.2 ? 'var(--yellow)' : 'var(--green)'
                      }}>
                        {Math.round((c.fraud_score || 0) * 100)}%
                      </span>
                    </div>
                  </td>
                  <td><span className={`badge ${statusClass(c.status)}`}>{c.status}</span></td>
                  <td>
                    {['Pending', 'Manual Review'].includes(c.status) ? (
                      <input
                        className="form-input"
                        type="text"
                        placeholder="Optional note…"
                        value={actionNote[c.id] || ''}
                        onChange={e => setActionNote(n => ({ ...n, [c.id]: e.target.value }))}
                        style={{ minWidth: 120, fontSize: '0.78rem', padding: '6px 10px' }}
                      />
                    ) : (
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                        {c.admin_note || '—'}
                      </span>
                    )}
                  </td>
                  <td>
                    {['Pending', 'Manual Review'].includes(c.status) ? (
                      <div style={{ display: 'flex', gap: 6, whiteSpace: 'nowrap' }}>
                        <button className="btn btn-success btn-sm" disabled={actioning[c.id]} onClick={() => action(c.id, 'approve')}>
                          {actioning[c.id] === 'approve' ? <span className="spinner" /> : '✓ Approve'}
                        </button>
                        <button className="btn btn-danger btn-sm" disabled={actioning[c.id]} onClick={() => action(c.id, 'reject')}>
                          {actioning[c.id] === 'reject' ? <span className="spinner" /> : '✗ Reject'}
                        </button>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>—</span>
                    )}
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>{c.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminClaims;
