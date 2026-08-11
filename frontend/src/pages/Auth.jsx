import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ email: '', password: '', name: '', role: 'worker', city: 'Bangalore', work_type: 'Delivery' });
  const navigate = useNavigate();

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = isLogin ? '/auth/login' : '/auth/register';
    const payload = isLogin
      ? { email: form.email, password: form.password }
      : { email: form.email, password: form.password, name: form.name, role: form.role, city: form.city, work_type: form.work_type };

    try {
      const res = await fetch(`http://127.0.0.1:8000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed');

      if (isLogin) {
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('role', data.role);
        localStorage.setItem('email', form.email);
        navigate(data.role === 'admin' ? '/admin' : '/worker');
      } else {
        setError('');
        setIsLogin(true);
        setForm(f => ({ ...f, password: '' }));
        // show success message
        setTimeout(() => setError('✓ Account created! Please sign in.'), 100);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div style={{ width: '100%', maxWidth: '440px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '2.8rem', marginBottom: '8px' }}>🛡️</div>
          <div className="auth-logo">
            <span className="text-gradient">Gig</span>Guard
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '4px' }}>
            Parametric Insurance for India's Gig Workers
          </div>
        </div>

        <div className="auth-box fade-in">
          <h2 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '4px' }}>
            {isLogin ? 'Welcome back' : 'Create your account'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', marginBottom: '24px' }}>
            {isLogin ? 'Sign in to access your dashboard' : 'Start protecting your income today'}
          </p>

          {error && (
            <div className={`alert ${error.startsWith('✓') ? 'alert-success' : 'alert-danger'}`} style={{ marginBottom: '16px' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {!isLogin && (
              <>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input className="form-input" type="text" placeholder="Rahul Kumar" value={form.name} onChange={set('name')} required />
                </div>
                <div className="form-group">
                  <label className="form-label">I am a</label>
                  <select className="form-input" value={form.role} onChange={set('role')}>
                    <option value="worker">Gig Worker (Swiggy / Zomato / Uber)</option>
                    <option value="admin">System Administrator</option>
                  </select>
                </div>
                {form.role === 'worker' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="form-group">
                      <label className="form-label">City</label>
                      <select className="form-input" value={form.city} onChange={set('city')}>
                        <option>Bangalore</option>
                        <option>Mumbai</option>
                        <option>Delhi</option>
                        <option>Chennai</option>
                        <option>Hyderabad</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Work Type</label>
                      <select className="form-input" value={form.work_type} onChange={set('work_type')}>
                        <option>Delivery</option>
                        <option>Cab Driver</option>
                        <option>Freelancer</option>
                        <option>Logistics</option>
                      </select>
                    </div>
                  </div>
                )}
              </>
            )}
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" placeholder="••••••••" value={form.password} onChange={set('password')} required />
            </div>
            <button className="btn btn-primary btn-lg" type="submit" disabled={loading} style={{ marginTop: '6px', width: '100%', justifyContent: 'center' }}>
              {loading ? <span className="spinner" /> : (isLogin ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.84rem', color: 'var(--text-muted)' }}>
            {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
            <span style={{ color: 'var(--accent)', cursor: 'pointer', fontWeight: '600' }} onClick={() => { setIsLogin(l => !l); setError(''); }}>
              {isLogin ? 'Sign up' : 'Sign in'}
            </span>
          </p>
        </div>

        {/* Demo hint */}
        <div style={{ textAlign: 'center', marginTop: '16px', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
          Register as <strong style={{ color: 'var(--text-sub)' }}>worker</strong> to see Worker Dashboard • as <strong style={{ color: 'var(--text-sub)' }}>admin</strong> to see Admin Panel
        </div>
      </div>
    </div>
  );
};

export default Auth;
