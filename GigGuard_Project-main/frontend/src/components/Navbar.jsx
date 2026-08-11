import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const Navbar = () => {
  return (
    <motion.nav 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="sticky top-0 z-50 w-full border-b border-white/5 bg-slate-900/60 backdrop-blur-xl"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-brand-400 to-brand-600 rounded-lg flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white">GigGuard</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#how-it-works" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Platform</a>
            <a href="#coverage" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Products</a>
            <a href="#trust" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Risk Pool</a>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="text-sm font-medium text-slate-300 hover:text-white transition-colors hidden sm:block">
              Log in
            </Link>
            <Link 
              to="/dashboard" 
              className="group flex items-center gap-1 bg-white text-slate-900 px-4 py-2 rounded-full text-sm font-semibold hover:bg-slate-100 transition-all shadow-[0_0_20px_-5px_rgba(255,255,255,0.4)] hover:shadow-[0_0_25px_-5px_rgba(255,255,255,0.6)]"
            >
              Start Building
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;