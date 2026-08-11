import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { Menu, Bell, AlertTriangle, X, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    // Show a mock toast notification
    const timer = setTimeout(() => {
      setShowToast(true);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex bg-[#F7F9FC] text-slate-900 font-sans">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 z-20 xl:hidden backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <div className={`fixed xl:static inset-y-0 left-0 z-30 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} xl:translate-x-0 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]`}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Navbar */}
        <header className="bg-[#F7F9FC]/80 backdrop-blur-md px-6 py-3 border-b border-slate-200/50 flex items-center justify-between z-10 sticky top-0">
          <div className="flex items-center">
            <button 
              className="xl:hidden p-2 -ml-2 rounded-lg hover:bg-slate-200/50 mr-2 text-slate-600 transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex items-center text-sm text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
               <Search className="w-4 h-4 mr-2 text-slate-400" />
               <span className="w-48 text-left">Search transactions...</span>
               <div className="ml-4 flex items-center space-x-1">
                 <kbd className="font-sans px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px]">⌘</kbd>
                 <kbd className="font-sans px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px]">K</kbd>
               </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button className="relative p-2 rounded-lg hover:bg-slate-200/50 transition-colors">
              <Bell className="w-5 h-5 text-slate-500" />
              <span className="absolute top-2 right-2.5 w-1.5 h-1.5 bg-brand-500 rounded-full ring-2 ring-[#F7F9FC]"></span>
            </button>
            <div className="h-5 w-px bg-slate-200 mx-1"></div>
            <button className="flex items-center space-x-2 p-1 pl-2 pr-3 rounded-full hover:bg-slate-200/50 transition-colors">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white text-xs font-semibold shadow-sm">
                JD
              </div>
            </button>
          </div>
        </header>

        {/* Scrollable Flow */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-10 hide-scrollbar">
          <div className="max-w-6xl mx-auto pb-20">
             <Outlet />
          </div>
        </main>
      </div>

      {/* Floating Alerts */}
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="fixed bottom-6 right-6 z-50 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-200/60 rounded-xl bg-white/90 backdrop-blur-xl p-4 max-w-sm w-full"
          >
            <div className="flex items-start">
              <div className="bg-amber-100 p-2 rounded-full mr-3 shrink-0">
                 <AlertTriangle className="w-4 h-4 text-amber-600" />
              </div>
              <div className="flex-1 mr-3">
                <h4 className="text-[13px] font-semibold text-slate-900 leading-none mb-1">Trigger Event Detected</h4>
                <p className="text-[13px] text-slate-500 leading-snug">
                  Heavy rainfall (&gt;15mm/h) reported in Bangalore South. Claim review auto-initiated.
                </p>
              </div>
              <button 
                onClick={() => setShowToast(false)} 
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 transition-colors -m-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DashboardLayout;