import React from 'react';
import { motion } from 'framer-motion';
import { FileText, ChevronRight, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

const claimsData = [
  {
    id: 'CLM-992-881',
    date: 'Oct 24, 2024',
    trigger: 'Severe Rainfall Alert (> 15mm/hr)',
    amount: '₹350',
    status: 'paid', // paid, processing, pending
    method: 'UPI Auto-Pay',
    time: '2:15 PM'
  },
  {
    id: 'CLM-992-743',
    date: 'Sep 12, 2024',
    trigger: 'Platform Outage (Zomato)',
    amount: '₹500',
    status: 'paid',
    method: 'Bank Transfer',
    time: '4:30 PM'
  },
  {
    id: 'CLM-992-411',
    date: 'Aug 05, 2024',
    trigger: 'Heatwave Threshold Exceeded',
    amount: '₹400',
    status: 'processing',
    method: 'UPI Auto-Pay',
    time: '1:00 PM'
  }
];

const StatusBadge = ({ status }) => {
  switch(status) {
    case 'paid':
      return (
        <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
          <CheckCircle2 className="w-3 h-3 mr-1" /> Paid
        </span>
      );
    case 'processing':
      return (
        <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">
          <Clock className="w-3 h-3 mr-1" /> Processing
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center rounded-md bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10">
          Pending
        </span>
      );
  }
};

const Claims = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-[28px] font-bold text-slate-900 tracking-tight leading-none mb-1">Claim History</h1>
        <p className="text-slate-500 text-sm">Review your automatically processed parametric payouts.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-slate-100 bg-slate-50/50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          <div className="col-span-3 lg:col-span-2">Claim ID</div>
          <div className="col-span-4 lg:col-span-4">Trigger Event</div>
          <div className="col-span-2 hidden lg:block">Method</div>
          <div className="col-span-2">Amount</div>
          <div className="col-span-3 lg:col-span-2 text-right">Status</div>
        </div>

        {/* Table Body */}
        <motion.div 
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: { staggerChildren: 0.05 }
            }
          }}
          className="divide-y divide-slate-100"
        >
          {claimsData.length === 0 ? (
             <div className="p-12 text-center flex flex-col items-center justify-center">
               <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                 <FileText className="w-8 h-8 text-slate-300" />
               </div>
               <h3 className="text-sm font-medium text-slate-900 mb-1">No claims yet</h3>
               <p className="text-xs text-slate-500 max-w-sm">When a parametric condition is met, your automated payouts will appear here in real-time.</p>
             </div>
          ) : (
            claimsData.map((claim) => (
              <motion.div 
                key={claim.id}
                variants={{
                  hidden: { opacity: 0, x: -10 },
                  show: { opacity: 1, x: 0 }
                }}
                className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-slate-50 transition-colors group cursor-pointer"
              >
                <div className="col-span-3 lg:col-span-2">
                  <span className="font-mono text-xs text-slate-900 font-medium">{claim.id}</span>
                  <div className="text-[11px] text-slate-500 mt-0.5">{claim.date}</div>
                </div>
                
                <div className="col-span-4 lg:col-span-4">
                  <span className="text-sm font-medium text-slate-900 line-clamp-1">{claim.trigger}</span>
                  <div className="text-[11px] text-slate-500 mt-0.5">{claim.time}</div>
                </div>

                <div className="col-span-2 hidden lg:block text-xs text-slate-600">
                  {claim.method}
                </div>

                <div className="col-span-2">
                  <span className="text-sm font-semibold text-slate-900">{claim.amount}</span>
                </div>

                <div className="col-span-3 lg:col-span-2 flex items-center justify-end">
                  <StatusBadge status={claim.status} />
                  <ChevronRight className="w-4 h-4 text-slate-300 ml-2 group-hover:text-slate-500 transition-colors hidden sm:block" />
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>
      
      <div className="flex justify-between items-center text-xs text-slate-500 px-2">
        <p>Showing 3 automated claims</p>
        <div className="flex items-center gap-1 cursor-pointer hover:text-brand-600 transition-colors">
          <AlertCircle className="w-3 h-3" /> Report missing claim
        </div>
      </div>

    </div>
  );
};

export default Claims;