import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Zap, Activity, CheckCircle2, ChevronRight, BarChart4 } from 'lucide-react';

const Landing = () => {
  return (
    <div className="relative overflow-hidden selection:bg-brand-500 selection:text-white">
      
      {/* Premium Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] opacity-30 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-500 to-emerald-500 blur-[120px] rounded-full mix-blend-screen" />
      </div>
      <div className="absolute inset-0 bg-noise opacity-10 pointer-events-none" />

      {/* Hero Section */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-4xl mx-auto space-y-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-brand-300 text-sm font-medium mb-4 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
            V2 Oracles Now Live
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-white leading-[1.1]">
            Financial infrastructure for <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-brand-200 to-brand-500">
              the gig economy.
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Automated parametric insurance powered by smart contracts. When life happens—heavy rain, extreme heat, or platform outages—you get paid instantly. No claims. No waiting.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link 
              to="/dashboard" 
              className="w-full sm:w-auto bg-white text-slate-900 px-8 py-4 rounded-xl font-semibold shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:scale-[1.02] hover:bg-slate-50 transition-all flex items-center justify-center"
            >
              Enter Dashboard <ChevronRight className="w-5 h-5 ml-1 text-slate-500" />
            </Link>
            <a 
              href="#how-it-works"
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-semibold text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all flex items-center justify-center"
            >
              Read the docs
            </a>
          </div>
          
          <p className="text-sm text-slate-500 mt-6 font-medium">
            Trusted by 12,000+ power drivers across India
          </p>
        </motion.div>
      </div>

      {/* Trust & Architecture Section */}
      <div id="how-it-works" className="border-t border-white/5 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Platform Architecture</h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">Powered by decentralized oracles and advanced smart contracts.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/[0.07] transition-colors"
            >
              <div className="w-12 h-12 rounded-2xl bg-brand-500/20 flex items-center justify-center mb-6 border border-brand-500/30">
                <Activity className="w-6 h-6 text-brand-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Live Oracles</h3>
              <p className="text-slate-400 leading-relaxed text-sm">
                Connected directly to IMD APIs and platform webhooks. Real-time condition monitoring with zero human intervention.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/[0.07] transition-colors"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center mb-6 border border-emerald-500/30">
                <Zap className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Instant Execution</h3>
              <p className="text-slate-400 leading-relaxed text-sm">
                Smart contracts trigger payouts automatically the moment thresholds are breached. Funds settle via IMPS instantly.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/[0.07] transition-colors"
            >
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center mb-6 border border-purple-500/30">
                <Shield className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Protected Pool</h3>
              <p className="text-slate-400 leading-relaxed text-sm">
                Transparent cryptographic reserves guarantee payout solvency. Risk modeled dynamically based on regional data.
              </p>
            </motion.div>

          </div>
        </div>
      </div>

      {/* Coverage / Products Section */}
      <div id="coverage" className="border-t border-white/5 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Protection Products</h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">Comprehensive event triggers customized for your region.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/[0.07] transition-colors">
              <h3 className="text-2xl font-bold text-white mb-4">Weather Guard</h3>
              <p className="text-slate-400 mb-6">Triggers automatically during extreme rainfall (&gt;15mm/hr) or severe heatwaves (&gt;42°C).</p>
              <ul className="space-y-3">
                <li className="flex items-center text-slate-300"><CheckCircle2 className="w-5 h-5 text-emerald-500 mr-2" /> Live IMD integration</li>
                <li className="flex items-center text-slate-300"><CheckCircle2 className="w-5 h-5 text-emerald-500 mr-2" /> Hourly limit tracking</li>
              </ul>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/[0.07] transition-colors">
              <h3 className="text-2xl font-bold text-white mb-4">Platform Outage</h3>
              <p className="text-slate-400 mb-6">Compensates for lost hours when major delivery or mobility platforms go offline.</p>
              <ul className="space-y-3">
                <li className="flex items-center text-slate-300"><CheckCircle2 className="w-5 h-5 text-emerald-500 mr-2" /> Webhook verifications</li>
                <li className="flex items-center text-slate-300"><CheckCircle2 className="w-5 h-5 text-emerald-500 mr-2" /> Automatic pro-rata payouts</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Pool Section */}
      <div id="trust" className="border-t border-white/5 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Transparent Risk Pool</h2>
            <p className="text-slate-400 text-lg mb-10 leading-relaxed">
              Our decentralized risk pool is entirely verifiable on-chain. Premiums form the capital base, while conservative risk modeling ensures total system solvency across massive trigger events.
            </p>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-center max-w-2xl mx-auto">
              <div>
                <p className="text-sm text-slate-400 mb-1">Total Value Locked (TVL)</p>
                <p className="text-3xl font-bold text-emerald-400">₹45.2M</p>
              </div>
              <div className="h-px md:h-12 w-full md:w-px bg-white/10 my-4 md:my-0" />
              <div>
                <p className="text-sm text-slate-400 mb-1">Active Policies</p>
                <p className="text-3xl font-bold text-white">12,482</p>
              </div>
              <div className="h-px md:h-12 w-full md:w-px bg-white/10 my-4 md:my-0" />
              <div>
                <p className="text-sm text-slate-400 mb-1">Payout Ratio</p>
                <p className="text-3xl font-bold text-brand-400">99.9%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Landing;