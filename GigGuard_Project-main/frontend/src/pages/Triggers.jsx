import React from 'react';
import { motion } from 'framer-motion';
import { CloudRain, Activity, AlertTriangle, CheckCircle2, ShieldAlert, Info } from 'lucide-react';

const triggersConfig = [
  {
    id: 1,
    name: 'Severe Rainfall',
    icon: CloudRain,
    status: 'monitoring', // monitoring, active, triggered
    dataSource: 'IMD API (Live)',
    threshold: '> 15mm / hr',
    currentRead: '2.4mm / hr',
    color: 'emerald',
    description: 'Triggers a payout when continuous rainfall exceeds 15mm per hour, preventing safe food delivery.'
  },
  {
    id: 2,
    name: 'Platform Outage (Swiggy/Zomato)',
    icon: Activity,
    status: 'triggered',
    dataSource: 'Platform Status Webhooks',
    threshold: '> 2 hrs downtime',
    currentRead: '2.5 hrs (Active)',
    color: 'rose',
    description: 'Compensates for lost earning time when primary delivery platforms experience severe outages.'
  },
  {
    id: 3,
    name: 'Heatwave Alert',
    icon: AlertTriangle,
    status: 'monitoring',
    dataSource: 'Local Weather Stations',
    threshold: '> 42°C',
    currentRead: '34°C',
    color: 'amber',
    description: 'Activates safety payout allowing workers to stay offline during extreme, unsafe heat conditions.'
  }
];

const getStatusStyles = (status) => {
  switch(status) {
    case 'monitoring': return { bg: 'bg-emerald-50 text-emerald-700 ring-emerald-500/20', icon: 'text-emerald-500', label: 'Monitor Active' };
    case 'triggered': return { bg: 'bg-rose-50 text-rose-700 ring-rose-500/20', icon: 'text-rose-500', label: 'Triggered Today' };
    default: return { bg: 'bg-slate-50 text-slate-700 ring-slate-500/20', icon: 'text-slate-500', label: 'Unknown' };
  }
};

const Triggers = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-slate-900 tracking-tight leading-none mb-1">Smart Triggers</h1>
          <p className="text-slate-500 text-sm">Real-time parametric conditions mapped to your active policy.</p>
        </div>
        
        <div className="flex items-center gap-2 bg-emerald-50/50 px-3 py-1.5 rounded-full border border-emerald-100">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[11px] font-medium text-emerald-700 uppercase tracking-widest">IMD Webhooks connected</span>
        </div>
      </div>

      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        initial="hidden"
        animate="show"
        variants={{
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
          }
        }}
      >
        {triggersConfig.map((trigger) => {
          const statusStyle = getStatusStyles(trigger.status);
          const Icon = trigger.icon;

          return (
            <motion.div 
              key={trigger.id}
              variants={{
                hidden: { opacity: 0, y: 15 },
                show: { opacity: 1, y: 0, transition: { type: 'spring', bounce: 0.4 } }
              }}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-card transition-all duration-300 group"
            >
              <div className="p-5 border-b border-slate-100 relative">
                {/* Status Badge */}
                <span className={`absolute top-4 right-4 inline-flex items-center rounded-md px-2 py-1 text-[10px] font-medium ring-1 ring-inset ${statusStyle.bg}`}>
                  {trigger.status === 'triggered' && <ShieldAlert className="w-3 h-3 mr-1" />}
                  {statusStyle.label}
                </span>

                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${
                  trigger.status === 'triggered' ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-600'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                
                <h3 className="font-semibold text-slate-900 mb-1">{trigger.name}</h3>
                <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{trigger.description}</p>
              </div>

              <div className="bg-slate-50/50 p-5 space-y-3">
                 <div className="flex justify-between items-center text-xs">
                   <span className="text-slate-500 font-medium">Data Source</span>
                   <span className="text-slate-700 flex items-center bg-white px-2 py-0.5 rounded border border-slate-200 shadow-sm">
                     <CheckCircle2 className="w-3 h-3 text-brand-500 mr-1" />
                     {trigger.dataSource}
                   </span>
                 </div>
                 
                 <div className="pt-2">
                   <div className="flex justify-between text-[11px] mb-1.5 uppercase font-medium tracking-wider text-slate-400">
                     <span>Current Read</span>
                     <span>Threshold</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <div className={`flex-1 rounded-md p-2 text-center text-sm font-mono border ${
                        trigger.status === 'triggered' ? 'bg-rose-50 border-rose-100 text-rose-700 font-semibold' : 'bg-white border-slate-200 text-slate-600'
                      }`}>
                        {trigger.currentRead}
                      </div>
                      <div className="text-slate-300">→</div>
                      <div className="flex-1 rounded-md p-2 text-center text-sm font-mono border border-slate-200 bg-slate-100/50 text-slate-500">
                        {trigger.threshold}
                      </div>
                   </div>
                 </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      <div className="mt-8 bg-brand-50 border border-brand-100 rounded-2xl p-5 flex items-start">
        <Info className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
        <div className="ml-3">
          <h4 className="text-sm font-medium text-brand-900">How Oracles Work</h4>
          <p className="text-xs text-brand-700 mt-1 leading-relaxed">
            Smart contract oracles automatically monitor connected premium data sources. When a triggering condition is met, claim processing initiates instantly with zero manual intervention required.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Triggers;