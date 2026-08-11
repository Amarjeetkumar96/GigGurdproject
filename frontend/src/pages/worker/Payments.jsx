import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../../api';

const WorkerPayments = () => {
  const [txns, setTxns] = useState([]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();

  const load = async () => {
    try {
      const [t, d] = await Promise.all([apiFetch('/me/transactions'), apiFetch('/me/dashboard')]);
      setTxns(t); setData(d);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handlePay = async () => {
    if (!data?.policyActive) return alert('No active policy to pay for.');
    setPaying(true);
    try {
      const res = await apiFetch('/me/pay-premium', { method: 'POST' });
      setSuccessMsg(`✅ Payment of ₹${res.amount} successful! Ref: ${res.reference}`);
      await load();
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (e) { alert(e.message); }
    finally { setPaying(false); }
  };

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}><div className="spinner" style={{ width: 40, height: 40 }} /></div>;

  const premiums = txns.filter(t => t.type === 'premium');
  const payouts = txns.filter(t => t.type === 'payout');
  const totalPaid = premiums.reduce((s, t) => s + t.amount, 0);
  const totalReceived = payouts.reduce((s, t) => s + t.amount, 0);

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">💳 Payments</h1>
          <p className="page-subtitle">Premium payments and payout history</p>
        </div>
        {data?.policyActive && (
          <button className="btn btn-primary" onClick={handlePay} disabled={paying}>
            {paying ? <span className="spinner" /> : `💳 Pay ₹${data.premiumTier} Premium`}
          </button>
        )}
      </div>

      {successMsg && <div className="alert alert-success" style={{ marginBottom: 20 }}>{successMsg}</div>}

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card" style={{ '--accent-line': 'var(--red)' }}>
          <div className="stat-icon">💸</div>
          <div className="stat-value">₹{Math.round(totalPaid).toLocaleString('en-IN')}</div>
          <div className="stat-label">Total Premiums Paid</div>
          <div className="stat-change" style={{ color: 'var(--text-muted)' }}>{premiums.length} payments</div>
        </div>
        <div className="stat-card" style={{ '--accent-line': 'var(--green)' }}>
          <div className="stat-icon">💰</div>
          <div className="stat-value" style={{ color: 'var(--green)' }}>₹{Math.round(totalReceived).toLocaleString('en-IN')}</div>
          <div className="stat-label">Total Payouts Received</div>
          <div className="stat-change up">{payouts.length} payouts</div>
        </div>
        <div className="stat-card" style={{ '--accent-line': totalReceived > totalPaid ? 'var(--green)' : 'var(--yellow)' }}>
          <div className="stat-icon">📊</div>
          <div className="stat-value" style={{ color: totalReceived > totalPaid ? 'var(--green)' : 'var(--yellow)' }}>
            {totalPaid > 0 ? `${Math.round((totalReceived / totalPaid) * 100)}%` : '—'}
          </div>
          <div className="stat-label">Payout / Premium Ratio</div>
          <div className="stat-change" style={{ color: 'var(--text-muted)' }}>ROI of coverage</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🏦</div>
          <div className="stat-value">Razorpay</div>
          <div className="stat-label">Payment Gateway</div>
          <div className="stat-change" style={{ color: 'var(--yellow)' }}>Test mode</div>
        </div>
      </div>

      {/* Simulate Payment card */}
      {data?.policyActive && (
        <div className="card" style={{ marginBottom: 24, background: 'linear-gradient(135deg, rgba(56,189,248,0.06), rgba(168,85,247,0.04))', borderColor: 'rgba(56,189,248,0.25)' }}>
          <h3 style={{ marginBottom: 12 }}>🏦 Weekly Premium Payment</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: 16 }}>
            Your {data.premiumTier === 40 ? 'Basic' : data.premiumTier === 70 ? 'Standard' : 'Premium'} plan is auto-debited weekly via Razorpay (test mode).
            Click below to simulate this week's payment.
          </p>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <button className="btn btn-primary" onClick={handlePay} disabled={paying}>
              {paying ? <span className="spinner" /> : `Pay ₹${data.premiumTier} Now`}
            </button>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>🔒 Secured by Razorpay (Test)</span>
          </div>
        </div>
      )}

      {/* Transactions table */}
      <div className="card">
        <h3 style={{ marginBottom: 16, fontSize: '1rem', fontWeight: 700 }}>📄 Transaction History</h3>
        {txns.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
            No transactions yet. Pay your first premium above!
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr><th>Ref</th><th>Type</th><th>Amount</th><th>Status</th><th>Date</th></tr>
              </thead>
              <tbody>
                {txns.map(t => (
                  <tr key={t.id}>
                    <td style={{ fontFamily: 'monospace', color: 'var(--text-muted)', fontSize: '0.8rem' }}>{t.reference || '—'}</td>
                    <td>
                      <span className={`badge ${t.type === 'premium' ? 'badge-info' : 'badge-success'}`}>
                        {t.type === 'premium' ? '💸 Premium' : '💰 Payout'}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700, color: t.type === 'payout' ? 'var(--green)' : 'var(--text)', fontSize: '0.95rem' }}>
                      {t.type === 'payout' ? '+' : '-'}₹{Math.round(t.amount).toLocaleString('en-IN')}
                    </td>
                    <td><span className="badge badge-approved">{t.status}</span></td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{t.created_at}</td>
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

export default WorkerPayments;
