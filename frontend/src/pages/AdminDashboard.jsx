import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const TrendChart = () => (
    <svg viewBox="0 0 400 100" style={{ width: '100%', height: '100px', marginTop: '20px' }}>
        <polyline
            fill="none"
            stroke="var(--accent)"
            strokeWidth="2"
            points="0,80 50,70 100,85 150,60 200,65 250,40 300,45 350,20 400,25"
            style={{ filter: 'drop-shadow(0 0 5px var(--accent-glow))' }}
            className="chart-line"
        />
        <text x="0" y="95" fill="var(--text-muted)" fontSize="8">MON</text>
        <text x="370" y="95" fill="var(--text-muted)" fontSize="8">SUN</text>
    </svg>
);

const InteractiveMap = ({ workers, isSimulating }) => (
    <svg viewBox="0 0 400 300" style={{ width: '100%', height: '100%', borderRadius: '12px' }}>
        <rect width="400" height="300" fill="rgba(0,0,0,0.2)" rx="12" />
        {/* Simple representation of Bangalore zones */}
        <circle cx="200" cy="150" r="80" fill="none" stroke="rgba(0, 240, 255, 0.1)" strokeWidth="1" />
        <circle cx="200" cy="150" r="40" fill="none" stroke="rgba(0, 240, 255, 0.2)" strokeWidth="1" />
        
        {/* Active Workers Dots */}
        {workers.map((w, i) => (
            <circle 
                key={i}
                cx={150 + (i * 30) % 100} 
                cy={100 + (i * 20) % 100} 
                r="4" 
                fill={w.policy_active ? "var(--success)" : "var(--text-muted)"}
                style={{ filter: w.policy_active ? 'drop-shadow(0 0 5px var(--success))' : 'none' }}
            >
                <title>{w.name} - {w.location}</title>
            </circle>
        ))}

        {/* Simulated Rainfall effect if simulating */}
        {isSimulating && (
            <g className="rain-animation">
                {[...Array(20)].map((_, i) => (
                    <line 
                        key={i}
                        x1={Math.random() * 400} y1={Math.random() * 300}
                        x2={Math.random() * 400} y2={Math.random() * 300 + 10}
                        stroke="var(--accent)"
                        strokeWidth="1"
                        opacity="0.5"
                    />
                ))}
            </g>
        )}
        <text x="20" y="280" fill="var(--text-muted)" fontSize="10">LIVE DATA FEED: {workers.length} NODES</text>
    </svg>
);

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        activePolicies: 0,
        weeklyPremiums: '₹ 0',
        disruptions: 0,
        claimsProcessing: 0
    });
    const [recentClaims, setRecentClaims] = useState([]);
    const [workers, setWorkers] = useState([]);
    const [isSimulating, setIsSimulating] = useState(false);
    const navigate = useNavigate();

    const fetchAdminData = async () => {
        const token = localStorage.getItem('token');
        if (!token) navigate('/auth');

        try {
            const statsRes = await fetch('http://127.0.0.1:8000/admin/stats', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const statsData = await statsRes.json();
            if (statsRes.ok) setStats(statsData);

            const claimsRes = await fetch('http://127.0.0.1:8000/admin/claims', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const claimsData = await claimsRes.json();
            if (claimsRes.ok) setRecentClaims(claimsData);

            const workersRes = await fetch('http://127.0.0.1:8000/admin/workers', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const workersData = await workersRes.json();
            if (workersRes.ok) setWorkers(workersData);
        } catch (e) {
            console.error("Fetch failed", e);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchAdminData();
        const interval = setInterval(fetchAdminData, 10000);
        return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const triggerSimulation = async () => {
        const token = localStorage.getItem('token');
        setIsSimulating(true);
        try {
            await fetch("http://127.0.0.1:8000/admin/simulate-trigger", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    trigger_type: "heavy_rainfall",
                    location: "Bangalore",
                    severity: 65.0
                })
            });
            setTimeout(() => {
                fetchAdminData();
                setIsSimulating(false);
            }, 1000);
        } catch { 
            alert("Failed to trigger simulation."); 
            setIsSimulating(false);
        }
    };

    const handleClaimAction = async (id, action) => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`http://127.0.0.1:8000/admin/claims/${id}/action`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ action })
            });
            if (res.ok) fetchAdminData();
        } catch { alert("Failed to update claim."); }
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
                        <span className="text-accent-gradient">Admin</span> Console
                    </h1>
                    <p style={{ color: 'var(--text-muted)' }}>Global Parametric Insurance Monitor</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn btn-primary" onClick={triggerSimulation} disabled={isSimulating}>
                        {isSimulating ? 'Simulating...' : 'Simulate Weather Disruption'}
                    </button>
                    <button className="btn btn-primary" style={{ background: 'transparent', border: '1px solid var(--danger)', color: 'var(--danger)' }} onClick={handleLogout}>Log Out</button>
                </div>
            </header>

            <div className="grid-dashboard">
                <div className="glass-panel animate-fade-in delay-1">
                    <h3 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '12px' }}>Total Active Policies</h3>
                    <div style={{ fontSize: '2.5rem', fontWeight: '700' }} className="text-gradient">{stats.activePolicies}</div>
                    <div style={{ marginTop: '12px', fontSize: '0.8rem', color: 'var(--success)' }}>Across all nodes</div>
                </div>
                <div className="glass-panel animate-fade-in delay-1">
                    <h3 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '12px' }}>Total Premiums Pool</h3>
                    <div style={{ fontSize: '2.5rem', fontWeight: '700' }} className="text-gradient">{stats.weeklyPremiums}</div>
                    <div style={{ marginTop: '12px', fontSize: '0.8rem', color: 'var(--success)' }}>Weekly aggregate</div>
                </div>
                <div className="glass-panel animate-fade-in delay-2">
                    <h3 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '12px' }}>Global Disruptions</h3>
                    <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--warning)' }}>{stats.disruptions}</div>
                    <div style={{ marginTop: '12px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Detected incidents</div>
                </div>
                <div className="glass-panel animate-fade-in delay-2">
                    <h3 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '12px' }}>System Health</h3>
                    <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--success)' }}>99.8%</div>
                    <div style={{ marginTop: '12px', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>All feeds up</div>
                </div>
            </div>

            <div className="glass-panel animate-fade-in delay-2" style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontSize: '1.1rem' }}>Premium Collection Trends (Weekly)</h2>
                    <span style={{ fontSize: '0.8rem', color: 'var(--success)' }}>+12.5% vs last week</span>
                </div>
                <TrendChart />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '24px' }}>
                <div className="glass-panel animate-fade-in delay-3">
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '24px' }}>Global Claim Stream (Last 20)</h2>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--card-border)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                    <th style={{ padding: '12px 16px', fontWeight: '500' }}>Claim ID</th>
                                    <th style={{ padding: '12px 16px', fontWeight: '500' }}>Worker</th>
                                    <th style={{ padding: '12px 16px', fontWeight: '500' }}>Trigger</th>
                                    <th style={{ padding: '12px 16px', fontWeight: '500' }}>Amount</th>
                                    <th style={{ padding: '12px 16px', fontWeight: '500' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentClaims.length === 0 && (
                                    <tr><td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>No claims recorded yet.</td></tr>
                                )}
                                {recentClaims.map((claim, idx) => (
                                    <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                                        <td style={{ padding: '16px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{claim.id}</td>
                                        <td style={{ padding: '16px', fontSize: '0.9rem', fontWeight: '500' }}>{claim.worker}</td>
                                        <td style={{ padding: '16px', fontSize: '0.85rem' }}>{claim.type}</td>
                                        <td style={{ padding: '16px', fontSize: '0.9rem', fontWeight: '500' }}>{claim.amount}</td>
                                        <td style={{ padding: '16px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <span className={`badge ${claim.status === 'Approved' ? 'badge-success' : (claim.status === 'Rejected' ? 'badge-danger' : 'badge-warning')}`}>
                                                    {claim.status}
                                                </span>
                                                {claim.status === 'Manual Review' && (
                                                    <div style={{ display: 'flex', gap: '4px' }}>
                                                        <button 
                                                            onClick={() => handleClaimAction(claim.id, 'approve')}
                                                            style={{ padding: '4px 8px', fontSize: '0.7rem', background: 'var(--success)', border: 'none', borderRadius: '4px', color: 'white', cursor: 'pointer' }}
                                                        >✓</button>
                                                        <button 
                                                            onClick={() => handleClaimAction(claim.id, 'reject')}
                                                            style={{ padding: '4px 8px', fontSize: '0.7rem', background: 'var(--danger)', border: 'none', borderRadius: '4px', color: 'white', cursor: 'pointer' }}
                                                        >✕</button>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="glass-panel animate-fade-in delay-3">
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '24px' }}>Trigger Map</h2>
                    <div style={{ height: '300px', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', position: 'relative' }}>
                        <InteractiveMap workers={workers} isSimulating={isSimulating} />
                    </div>
                </div>
            </div>

            <div className="glass-panel animate-fade-in delay-4" style={{ marginTop: '24px' }}>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '24px' }}>Worker Directory</h2>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--card-border)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                <th style={{ padding: '12px 16px', fontWeight: '500' }}>Worker Name</th>
                                <th style={{ padding: '12px 16px', fontWeight: '500' }}>Location</th>
                                <th style={{ padding: '12px 16px', fontWeight: '500' }}>Income</th>
                                <th style={{ padding: '12px 16px', fontWeight: '500' }}>Premium Tier</th>
                                <th style={{ padding: '12px 16px', fontWeight: '500' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {workers.length === 0 && (
                                <tr><td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>No workers enrolled yet.</td></tr>
                            )}
                            {workers.map((worker, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                                    <td style={{ padding: '16px', fontSize: '0.9rem', fontWeight: '500' }}>{worker.name}</td>
                                    <td style={{ padding: '16px', fontSize: '0.85rem' }}>{worker.location}</td>
                                    <td style={{ padding: '16px', fontSize: '0.85rem' }}>₹ {worker.weekly_income}</td>
                                    <td style={{ padding: '16px', fontSize: '0.9rem', fontWeight: '500' }}>₹ {worker.premium_tier}</td>
                                    <td style={{ padding: '16px' }}>
                                        <span className={`badge ${worker.policy_active ? 'badge-success' : 'badge-warning'}`}>
                                            {worker.policy_active ? 'Covered' : 'Inactive'}
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

export default AdminDashboard;
