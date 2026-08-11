import React from 'react';
import { CloudRain, Wind, AlertTriangle, ThermometerSun, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

const data = [
  { name: 'Mon', earnings: 1200, disruption: 0 },
  { name: 'Tue', earnings: 1500, disruption: 0 },
  { name: 'Wed', earnings: 800, disruption: 600 },
  { name: 'Thu', earnings: 1400, disruption: 0 },
  { name: 'Fri', earnings: 1100, disruption: 0 },
  { name: 'Sat', earnings: 900, disruption: 800 },
  { name: 'Sun', earnings: 1800, disruption: 0 },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

const Dashboard = () => {
  return (
    <motion.div 
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-slate-900 tracking-tight leading-none mb-1">Welcome back, Arjun</h1>
          <p className="text-slate-500 text-sm">Here's your payout and risk coverage overview.</p>
        </div>
        <div className="flex items-center text-[13px] font-medium text-slate-600 bg-white shadow-sm border border-slate-200 px-3 py-1.5 rounded-lg">
          <div className="w-1.5 h-1.5 rounded-full bg-brand-500 mr-2 animate-pulse"></div>
          Monitoring: Bangalore, IN
        </div>
      </motion.div>

      {/* Primary Financial Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-premium hover:shadow-premium-hover transition-all duration-300 relative group overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-500 text-sm font-medium">Net Earnings</h3>
            <select className="text-xs bg-slate-50 border-none text-slate-600 rounded bg-transparent p-0 py-1 pr-6 focus:ring-0 cursor-pointer font-medium">
              <option>This Week</option>
            </select>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-semibold text-slate-900 tracking-tight">₹8,700</span>
            <span className="text-xs font-medium text-green-600 bg-green-50 px-1.5 py-0.5 rounded flex items-center">
              +12%
            </span>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-premium hover:shadow-premium-hover transition-all duration-300 group">
          <div className="flex items-center justify-between mb-4">
             <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-brand-600" />
                <h3 className="text-slate-500 text-sm font-medium">Active Coverage</h3>
             </div>
             <span className="bg-emerald-50 text-emerald-600 border border-emerald-100/50 text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide">
               Active
             </span>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-semibold text-slate-900 tracking-tight">₹10,500</span>
            <span className="text-sm font-normal text-slate-400">max / wk</span>
          </div>
          <p className="text-[13px] text-slate-500 mt-2 flex items-center">
            Premium: ₹45 auto-deducted
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-premium hover:shadow-premium-hover transition-all duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-500 text-sm font-medium">Disruption Payouts</h3>
          </div>
          <div className="flex items-baseline space-x-2 mb-2">
            <span className="text-3xl font-semibold text-brand-600 tracking-tight">₹1,400</span>
          </div>
          <button className="text-sm text-brand-600 hover:text-brand-700 font-medium inline-flex items-center mt-1 transition-colors">
            View recent claims <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </div>

      {/* AI Insight Bar */}
      <motion.div variants={itemVariants} className="bg-gradient-to-r from-brand-50 to-indigo-50/50 border border-brand-100 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center">
          <div className="bg-white p-1.5 rounded-md shadow-sm border border-brand-100 mr-3 shrink-0">
             <Sparkles className="w-4 h-4 text-brand-500" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-brand-900">AI Risk Forecast</h4>
            <p className="text-[13px] text-brand-700/80 mt-0.5">Weather models predict 80% chance of heavy rainfall tomorrow between 2 PM - 5 PM. Your income is protected.</p>
          </div>
        </div>
      </motion.div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart */}
        <motion.div variants={itemVariants} className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/60 shadow-card p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
             <h3 className="text-base font-semibold text-slate-900 tracking-tight">Income vs Payouts</h3>
          </div>
          <div className="h-64 w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorDisruption" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontSize: '13px', fontWeight: 500 }}
                  labelStyle={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}
                />
                <Area type="monotone" dataKey="earnings" stroke="#94a3b8" strokeWidth={2} fillOpacity={1} fill="url(#colorEarnings)" />
                <Area type="monotone" dataKey="disruption" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorDisruption)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Live Triggers Panel */}
        <motion.div variants={itemVariants} className="lg:col-span-1 bg-white rounded-2xl border border-slate-200/60 shadow-card flex flex-col">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-900 tracking-tight">Active Triggers</h3>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
          </div>
          <div className="p-4 space-y-2 flex-1">
            <TriggerItem icon={<CloudRain />} label="Rainfall Tracker" value="12 mm/h" subtext="Threshold: 15mm" status="warning" />
            <TriggerItem icon={<Wind />} label="AQI Monitor" value="310 (Poor)" subtext="Threshold: 400" status="safe" />
            <TriggerItem icon={<ThermometerSun />} label="Heat Index" value="39°C" subtext="Threshold: 45°C" status="safe" />
            <TriggerItem icon={<AlertTriangle />} label="Govt Curfews" value="None" subtext="Clear active" status="safe" />
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
};

const TriggerItem = ({ icon, label, value, subtext, status }) => {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
      <div className="flex items-center">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center mr-3 shadow-sm border ${status === 'warning' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-white text-slate-500 border-slate-200'}`}>
          {React.cloneElement(icon, { className: "w-4 h-4" })}
        </div>
        <div>
          <h4 className="text-[13px] font-semibold text-slate-900 leading-none mb-1">{label}</h4>
          <p className="text-[11px] text-slate-500">{subtext}</p>
        </div>
      </div>
      <div className="text-right">
        <p className={`text-[13px] font-bold ${status === 'warning' ? 'text-amber-600' : 'text-slate-900'}`}>{value}</p>
      </div>
    </div>
  )
}

export default Dashboard;