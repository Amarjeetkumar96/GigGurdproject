import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

const LandingLayout = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-50 selection:bg-brand-500 selection:text-white">
      <Navbar />
      <main>
        <Outlet />
      </main>
      
      {/* Premium Footer */}
      <footer className="border-t border-white/10 bg-slate-950 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-slate-800 rounded flex items-center justify-center">
              <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <span className="text-slate-400 text-sm font-medium">GigGuard &copy; {new Date().getFullYear()}</span>
          </div>
          <div className="flex gap-6 text-sm text-slate-500">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">System Status</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingLayout;