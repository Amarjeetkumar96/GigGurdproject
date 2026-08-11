import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import LandingLayout from './layouts/LandingLayout';
import DashboardLayout from './layouts/DashboardLayout';

import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Policy from './pages/Policy';
import Triggers from './pages/Triggers';
import Claims from './pages/Claims';
import Payouts from './pages/Payouts';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingLayout />}>
          <Route index element={<Landing />} />
        </Route>

        {/* Dashboard Routes */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="policy" element={<Policy />} />
          <Route path="triggers" element={<Triggers />} />
          <Route path="claims" element={<Claims />} />
          <Route path="payouts" element={<Payouts />} />
          <Route path="admin" element={<AdminDashboard />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;