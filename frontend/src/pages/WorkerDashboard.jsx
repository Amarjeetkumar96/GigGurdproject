import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const WorkerDashboard = () => {
    const [data, setData] = useState({
        userName: '',
        policyActive: false,
        premiumTier: 0,
        recentClaims: [],
        location: '',
        risk: { risk_score: 0, level: 'Low', recommendation: '' }
    });
    const [enrollName, setEnrollName] = useState('');
    const [enrollIncome, setEnrollIncome] = useState(5000);
    const [enrollLoc, setEnrollLoc] = useState('Bangalore');
    const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
    const navigate = useNavigate();

    const fetchWorkerData = async () => {
        const token = localStorage.getItem('token');
        if (!token) navigate('/auth');

        try {
            const res = await fetch('http://127.0.0.1:8000/me/dashboard', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const dbData = await res.json();
            if (res.ok) {
                const riskRes = await fetch(`http://127.0.0.1:8000/worker/risk?location=${dbData.location || 'Bangalore'}&income=${dbData.weeklyIncome || 5000}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const riskData = await riskRes.json();
                setData({ ...dbData, risk: riskData });
            }
            if (!dbData.userName) setEnrollName(''); // Ready for enrollment
        } catch (e) { console.error("Fetch failed", e); }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchWorkerData();
        const interval = setInterval(fetchWorkerData, 10000);
        return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleEnroll = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        try {
            const res = await fetch('http://127.0.0.1:8000/me/enroll', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: enrollName,
                    location: enrollLoc,
                    weekly_income: parseFloat(enrollIncome)
                })
            });
            if (res.ok) fetchWorkerData();
        } catch { alert("Enrollment failed."); }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/auth');
    };

    return (
        <div className="container">
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }} className="animate-fade-in">
                <div>
                    <h1 style={{ fontSize: '2rem', marginBottom: '4px' }}>
                        Welcome, <span className="text-accent-gradient">{data.userName || 'Partner'}</span>
                    </h1>
                    <p style={{ color: 'var(--text-muted)' }}>Personal Coverage Dashboard</p>
                </div>
                <button className="btn btn-primary" style={{ background: 'transparent', border: '1px solid var(--danger)', color: 'var(--danger)' }} onClick={handleLogout}>Log Out</button>
            </header>

            {!data.policyActive ? (
                <div className="glass-panel animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', padding: '60px 40px' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '16px' }}>No Active Policy Found</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Enroll now to protect your earnings against rain, pollution, and zone shutdowns.</p>

                    <form onSubmit={handleEnroll} style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Full Name</label>
                            <input
                                type="text"
                                className="glass-panel"
                                style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--card-border)' }}
                                value={enrollName} onChange={(e) => setEnrollName(e.target.value)} required
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '20px' }}>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Avg. Weekly Income (₹)</label>
                                <input
                                    type="number"
                                    className="glass-panel"
                                    style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--card-border)' }}
                                    value={enrollIncome} onChange={(e) => setEnrollIncome(e.target.value)} required
                                />
                            </div>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Service City</label>
                                <select
                                    className="glass-panel"
                                    style={{ padding: '12px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid var(--card-border)' }}
                                    value={enrollLoc} onChange={(e) => setEnrollLoc(e.target.value)}
                                >
                                    <option value="Bangalore" style={{ background: '#1a1b23' }}>Bangalore</option>
                                    <option value="Mumbai" style={{ background: '#1a1b23' }}>Mumbai</option>
                                    <option value="Delhi" style={{ background: '#1a1b23' }}>Delhi</option>
                                </select>
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ padding: '14px', marginTop: '12px' }}>Activate Weekly Coverage</button>
                    </form>
                </div>
            ) : (
                <>
                    <div className="grid-dashboard">
                        <div className="glass-panel animate-fade-in delay-1">
                            <h3 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '12px' }}>Coverage Status</h3>
                            <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--success)' }}>ACTIVE</div>
                            <div style={{ marginTop: '12px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Zone: {data.location}</div>
                        </div>
                        <div className="glass-panel animate-fade-in delay-1">
                            <h3 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '12px' }}>Weekly Premium</h3>
                            <div style={{ fontSize: '2.5rem', fontWeight: '700' }} className="text-gradient">₹ {data.premiumTier}</div>
                            <div style={{ marginTop: '12px', fontSize: '0.8rem', color: 'var(--success)' }}>Auto-debit active</div>
                        </div>
                        <div className="glass-panel animate-fade-in delay-2">
                            <h3 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '12px' }}>AI Risk Score</h3>
                            <div style={{ fontSize: '2.5rem', fontWeight: '700', color: data.risk.level === 'High' ? 'var(--danger)' : (data.risk.level === 'Medium' ? 'var(--warning)' : 'var(--success)') }}>
                                {Math.round(data.risk.risk_score * 100)}%
                            </div>
                            <div style={{ marginTop: '12px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{data.risk.level} Risk Level</div>
                        </div>
                        <div className="glass-panel animate-fade-in delay-2">
                            <h3 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '12px' }}>Weather Forecaster</h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--accent)' }}>22%</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Rain risk for tomorrow</div>
                            </div>
                            <div style={{ marginTop: '12px', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                                <div style={{ width: '22%', height: '100%', background: 'var(--accent)' }}></div>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginBottom: '24px', display: 'flex', gap: '12px' }}>
                        <button className="btn btn-primary" onClick={() => setIsPolicyModalOpen(true)} style={{ background: 'rgba(0, 240, 255, 0.1)', border: '1px solid var(--accent)', color: 'var(--accent)' }}>View My Policy Details</button>
                    </div>

                    {isPolicyModalOpen && (
                        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                            <div className="glass-panel scale-in" style={{ maxWidth: '600px', width: '100%', padding: '40px', border: '1px solid var(--accent)' }}>
                                <h2 style={{ marginBottom: '24px' }}>Parametric Insurance Policy</h2>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '0.95rem' }}>
                                    <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px' }}>
                                        <strong style={{ color: 'var(--accent)' }}>Trigger:</strong> Heavy Rainfall (&gt; 50mm/day)
                                    </div>
                                    <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px' }}>
                                        <strong style={{ color: 'var(--accent)' }}>Payout:</strong> ₹ 1,200 per event
                                    </div>
                                    <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px' }}>
                                        <strong style={{ color: 'var(--accent)' }}>Exclusions:</strong> Pre-existing weather warnings.
                                    </div>
                                </div>
                                <button className="btn btn-primary" onClick={() => setIsPolicyModalOpen(false)} style={{ marginTop: '32px', width: '100%' }}>Close Policy Detail</button>
                            </div>
                        </div>
                    )}

                    <div className="glass-panel animate-fade-in delay-3">
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '24px' }}>My Claim History</h2>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--card-border)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                        <th style={{ padding: '12px 16px', fontWeight: '500' }}>ID</th>
                                        <th style={{ padding: '12px 16px', fontWeight: '500' }}>Trigger Type</th>
                                        <th style={{ padding: '12px 16px', fontWeight: '500' }}>Payout</th>
                                        <th style={{ padding: '12px 16px', fontWeight: '500' }}>Status</th>
                                        <th style={{ padding: '12px 16px', fontWeight: '500' }}>Detected</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.recentClaims.length === 0 && (
                                        <tr><td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>No claims yet. Coverage is protecting you from the next event.</td></tr>
                                    )}
                                    {data.recentClaims.map((claim, idx) => (
                                        <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                                            <td style={{ padding: '16px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{claim.id}</td>
                                            <td style={{ padding: '16px', fontSize: '0.9rem' }}>{claim.type}</td>
                                            <td style={{ padding: '16px', fontSize: '0.9rem', fontWeight: '600' }}>{claim.amount}</td>
                                            <td style={{ padding: '16px' }}>
                                                <span className={`badge ${claim.status === 'Approved' ? 'badge-success' : 'badge-warning'}`}>
                                                    {claim.status}
                                                </span>
                                            </td>
                                            <td style={{ padding: '16px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{claim.time}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default WorkerDashboard;
