import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import { ToastProvider } from './components/Toast';
import Auth from './pages/Auth';
// Worker pages
import WorkerDashboard from './pages/worker/Dashboard';
import WorkerPolicy from './pages/worker/Policy';
import WorkerClaims from './pages/worker/Claims';
import WorkerPayments from './pages/worker/Payments';
import WorkerAlerts from './pages/worker/Alerts';
import WorkerEarnings from './pages/worker/Earnings';
// Admin pages
import AdminOverview from './pages/admin/Overview';
import AdminTriggers from './pages/admin/TriggerSimulator';
import AdminWorkers from './pages/admin/Workers';
import AdminClaims from './pages/admin/ClaimsManagement';
import AdminFraud from './pages/admin/FraudPanel';
import AdminTransactions from './pages/admin/Transactions';
import AdminAnalytics from './pages/admin/Analytics';

const AppLayout = ({ children, role, email }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadAlerts, setUnreadAlerts] = useState(0);

  useEffect(() => {
    if (role === 'worker') {
      const token = localStorage.getItem('token');
      fetch('http://127.0.0.1:8000/me/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      }).then(r => r.json()).then(data => {
        if (Array.isArray(data)) setUnreadAlerts(data.filter(n => !n.is_read).length);
      }).catch(() => {});
    }
  }, [role, location.pathname]);

  return (
    <div className="app-layout">
      <Sidebar
        role={role}
        email={email}
        onNavigate={navigate}
        currentPath={location.pathname}
        unreadAlerts={unreadAlerts}
      />
      <div className="main-content">
        <div className="page-container">
          {children}
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const location = useLocation();
  const role = localStorage.getItem('role');
  const email = localStorage.getItem('email');

  const isAuth = location.pathname === '/auth' || location.pathname === '/';

  if (isAuth) {
    return (
      <ToastProvider>
        <Routes>
          <Route path="/" element={<Auth />} />
          <Route path="/auth" element={<Auth />} />
        </Routes>
      </ToastProvider>
    );
  }

  return (
    <ToastProvider>
      <AppLayout role={role} email={email}>
        <Routes>
          {/* Worker */}
          <Route path="/worker" element={<WorkerDashboard />} />
          <Route path="/worker/policy" element={<WorkerPolicy />} />
          <Route path="/worker/claims" element={<WorkerClaims />} />
          <Route path="/worker/payments" element={<WorkerPayments />} />
          <Route path="/worker/alerts" element={<WorkerAlerts />} />
          <Route path="/worker/earnings" element={<WorkerEarnings />} />
          {/* Admin */}
          <Route path="/admin" element={<AdminOverview />} />
          <Route path="/admin/triggers" element={<AdminTriggers />} />
          <Route path="/admin/workers" element={<AdminWorkers />} />
          <Route path="/admin/claims" element={<AdminClaims />} />
          <Route path="/admin/fraud" element={<AdminFraud />} />
          <Route path="/admin/transactions" element={<AdminTransactions />} />
          <Route path="/admin/analytics" element={<AdminAnalytics />} />
        </Routes>
      </AppLayout>
    </ToastProvider>
  );
};

export default App;
