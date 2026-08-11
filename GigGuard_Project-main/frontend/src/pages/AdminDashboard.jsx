import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, TrendingUp, ShieldCheck, AlertOctagon, 
  ArrowUpRight, ArrowDownRight, Activity, Search
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const data = [
  { name: 'Mon', revenue: 4000, payouts: 1200 },
  { name: 'Tue', revenue: 5000, payouts: 1100 },
  { name: 'Wed', revenue: 4500, payouts: 3500 }, // Rain event
  { name: 'Thu', revenue: 6000, payouts: 1500 },
  { name: 'Fri', revenue: 5500, payouts: 1300 },
  { name: 'Sat', revenue: 7000, payouts: 2000 },
  { name: 'Sun', revenue: 6500, payouts: 1800 },
];

const StatCard = ({ title, value, trend, isUp, icon: Icon, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    className="bg-white p-5 rounded-2xl border border-slate-200 hover:shadow-card transition-shadow"
  >
    <div className="flex justify-between items-start mb-4">
      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100">
        <Icon className="w-5 h-5 text-slate-600" />
      </div>
      <div className={`flex items-center text-xs font-semibold px-2 py-1 rounded-full ${
        isUp ? 'text-emerald-700 bg-emerald-50 border border-emerald-100' : 'text-rose-700 bg-rose-50 border border-rose-100'
      }`}>
        {isUp ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
        {trend}
      </div>
    </div>
    <div>
      <h3 className="text-slate-500 text-sm font-medium">{title}</h3>
      <p className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">{value}</p>
    </div>
  </motion.div>
);

const AdminDashboard = () => {
  const [timeframe, setTimeframe] = useState('7d');

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-slate-900 tracking-tight leading-none mb-1">Platform Operations</h1>
          <p className="text-slate-500 text-sm">System metrics and risk pool overview.</p>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
          {['24h', '7d', '30d', 'All'].map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                timeframe === t ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard title="Total Active Policies" value="12,482" trend="+14.2%" isUp={true} icon={Users} delay={0.1} />
        <StatCard title="Weekly Premium Rev" value="₹4.2M" trend="+8.1%" isUp={true} icon={TrendingUp} delay={0.15} />
        <StatCard title="Total Payouts (7d)" value="₹1.8M" trend="-2.4%" isUp={false} icon={AlertOctagon} delay={0.2} />
        <StatCard title="Pool Health Ratio" value="2.3x" trend="Stable" isUp={true} icon={ShieldCheck} delay={0.25} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold text-slate-900">Financial Flow (Premiums vs Payouts)</h3>
            <button className="text-brand-600 text-xs font-medium hover:text-brand-700">Export Report</button>
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} tickFormatter={(value) => `₹${value / 1000}k`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)' }}
                  itemStyle={{ fontSize: '13px', fontWeight: 500 }}
                  labelStyle={{ color: '#64748b', fontSize: '12px', marginBottom: '4px' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
                <Area type="monotone" dataKey="payouts" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorOut)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Oracle Status & Quick Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="space-y-6"
        >
          {/* Oracle Status */}
          <div className="bg-slate-900 rounded-2xl p-5 text-white shadow-xl bg-noise">
            <h3 className="text-sm font-medium text-slate-400 mb-4 flex items-center">
              <Activity className="w-4 h-4 mr-2 text-brand-400" />
              Oracle Network Status
            </h3>
            
            <div className="space-y-4">
              {[
                { name: 'IMD Weather Nodes', status: 'operational', ping: '12ms' },
                { name: 'Zomato/Swiggy API', status: 'operational', ping: '45ms' },
                { name: 'Payout Gateway', status: 'operational', ping: '98ms' }
              ].map((node, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]"></div>
                    <span className="text-sm text-slate-200">{node.name}</span>
                  </div>
                  <span className="text-xs font-mono text-slate-500">{node.ping}</span>
                </div>
              ))}
            </div>
            
            <div className="mt-5 pt-4 border-t border-slate-700/50">
              <button className="w-full py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg transition-colors">
                Run Diagnostics
              </button>
            </div>
          </div>

          {/* Recent Alerts */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-900 mb-4">Risk Alerts</h3>
            <div className="space-y-3">
               <div className="p-3 bg-amber-50 text-amber-800 rounded-xl text-xs flex items-start border border-amber-100">
                 <AlertOctagon className="w-4 h-4 shrink-0 mr-2 mt-0.5" />
                 <div>
                   <strong className="block font-semibold mb-0.5">Elevated Heat Warning</strong>
                   Probability of extreme heat trigger in Delhi NCR region increased to 85% for tomorrow.
                 </div>
               </div>
               <div className="p-3 bg-slate-50 text-slate-600 rounded-xl text-xs flex items-start border border-slate-100">
                 <ShieldCheck className="w-4 h-4 shrink-0 mr-2 mt-0.5" />
                 <div>
                   <strong className="block text-slate-900 font-semibold mb-0.5">Smart Contract Updated</strong>
                   Core logic v2.1.4 successfully deployed and verified.
                 </div>
               </div>
            </div>
          </div>
        </motion.div>
      </div>

    </div>
  );
};

export default AdminDashboard;