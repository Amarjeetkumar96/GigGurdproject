import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../../api';

const AdminTransactions = () => {
  const [txns, setTxns] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    apiFetch('/admin/transactions').then(setTxns).catch(e => {
      if (e.message.includes('401') || e.message.includes('403')) navigate('/auth');
    }).finally(() => setLoading(false));
  }, []);

  const total_premiums = txns.filter(t => t.type === 'premium').reduce((s, t) => s + t.amount, 0);
  const total_payouts = txns.filter(t => t.type === 'payout').reduce((s, t) => s + t.amount, 0);

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}><div className="spinner" style={{ width: 40, height: 40 }} /></div>;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">💰 Transactions</h1>
          <p className="page-subtitle">All premium payments and claim payouts</p>
        </div>
      </div>

      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card" style={{ '--accent-line': 'var(--green)' }}>
          <div className="stat-icon">💳</div>
          <div className="stat-value" style={{ color: 'var(--green)' }}>₹{Math.round(total_premiums).toLocaleString('en-IN')}</div>
          <div className="stat-label">Total Premiums</div>
        </div>
        <div className="stat-card" style={{ '--accent-line': 'var(--red)' }}>
          <div className="stat-icon">💸</div>
          <div className="stat-value" style={{ color: 'var(--red)' }}>₹{Math.round(total_payouts).toLocaleString('en-IN')}</div>
          <div className="stat-label">Total Payouts</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-value">₹{Math.round(total_premiums - total_payouts).toLocaleString('en-IN')}</div>
          <div className="stat-label">Net Reserve</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🔢</div>
          <div className="stat-value">{txns.length}</div>
          <div className="stat-label">Total Transactions</div>
        </div>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr><th>Ref</th><th>Worker ID</th><th>Type</th><th>Amount</th><th>Status</th><th>Date</th></tr>
            </thead>
            <tbody>
              {txns.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '28px', color: 'var(--text-muted)' }}>No transactions yet.</td></tr>
              ) : txns.map(t => (
                <tr key={t.id}>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--text-muted)' }}>{t.reference || '—'}</td>
                  <td>W-{t.worker_id}</td>
                  <td>
                    <span className={`badge ${t.type === 'premium' ? 'badge-info' : 'badge-success'}`}>
                      {t.type === 'premium' ? '💳 Premium' : '💰 Payout'}
                    </span>
                  </td>
                  <td style={{ fontWeight: 700, color: t.type === 'payout' ? 'var(--green)' : 'var(--text)', fontSize: '0.95rem' }}>
                    {t.type === 'payout' ? '+' : '-'}₹{Math.round(t.amount).toLocaleString('en-IN')}
                  </td>
                  <td><span className="badge badge-approved">{t.status}</span></td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{t.created_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminTransactions;
