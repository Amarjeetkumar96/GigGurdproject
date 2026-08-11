import React from 'react';
import { DownloadCloud, ArrowUpRight, ArrowDownRight, Building2, Smartphone, ShieldCheck, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const transactions = [
  { id: 'tx_pay_9921', type: 'payout', amount: '+₹650.00', date: 'Mar 18, 2026, 4:30 PM', status: 'Succeeded', method: 'UPI • paytm' },
  { id: 'tx_prem_002', type: 'premium', amount: '-₹45.00', date: 'Mar 16, 2026, 8:00 AM', status: 'Succeeded', method: 'GigGuard Wallet' },
  { id: 'tx_prem_003', type: 'premium', amount: '-₹45.00', date: 'Mar 09, 2026, 8:00 AM', status: 'Succeeded', method: 'GigGuard Wallet' },
  { id: 'tx_pay_8911', type: 'payout', amount: '+₹1,200.00', date: 'Feb 23, 2026, 1:15 PM', status: 'Succeeded', method: 'Bank Transfer • 4301' },
];

const Payouts = () => {
  return (
    <motion.div 
      className="space-y-8"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-slate-900 tracking-tight leading-none mb-1">Balances & Payouts</h1>
          <p className="text-slate-500 text-sm">Manage your stored limits and payout destinations.</p>
        </div>
        <button className="flex items-center justify-center text-[13px] font-medium text-slate-700 bg-white border border-slate-200 shadow-sm px-4 py-2 rounded-lg hover:bg-slate-50 transition-all hover:shadow-md">
          <DownloadCloud className="w-4 h-4 mr-2" /> Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Wallet Card - Stripe Style */}
        <div className="md:col-span-3 bg-slate-900 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden group">
           <div className="absolute inset-0 bg-noise mix-blend-overlay"></div>
           <div className="absolute -right-20 -top-20 w-64 h-64 bg-brand-500 rounded-full blur-[100px] opacity-20 group-hover:opacity-30 transition-opacity duration-700"></div>
           
           <div className="relative z-10 flex flex-col h-full justify-between">
             <div className="flex items-center justify-between mb-8">
               <div className="flex items-center space-x-2">
                 <ShieldCheck className="w-5 h-5 text-brand-400" />
                 <p className="text-brand-100 text-sm font-medium tracking-wide">GigGuard Balance</p>
               </div>
               <span className="bg-white/10 text-white/90 text-xs px-2.5 py-1 rounded-full backdrop-blur-md border border-white/10">Active</span>
             </div>

             <div>
               <h2 className="text-5xl font-semibold tracking-tighter mb-2">₹345.00</h2>
               <p className="text-slate-400 text-sm">Available for premiums or withdrawal.</p>
             </div>
             
             <div className="mt-10 flex items-center justify-between pt-6 border-t border-slate-700/50">
               <div>
                 <p className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold mb-1">Next Auto-Deduction</p>
                 <p className="text-sm font-medium text-slate-200">₹45.00 on Mar 23</p>
               </div>
               <button className="bg-white text-slate-900 px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm">
                 + Add Funds
               </button>
             </div>
           </div>
        </div>

        {/* Payout Destinations */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200/60 shadow-card flex flex-col">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-900 tracking-tight">Payout Methods</h3>
          </div>
          
          <div className="p-4 space-y-3 flex-1">
             <div className="flex items-center justify-between p-3 border border-brand-200 bg-brand-50/50 rounded-xl relative overflow-hidden group hover:border-brand-300 transition-colors cursor-pointer">
               <div className="absolute top-0 left-0 w-1 h-full bg-brand-500"></div>
               <div className="flex items-center pl-2">
                 <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center mr-3 shadow-sm border border-slate-200/60">
                   <Smartphone className="w-5 h-5 text-brand-600" />
                 </div>
                 <div>
                   <p className="text-[13px] font-semibold text-slate-900">UPI / Wallet</p>
                   <p className="text-[11px] text-slate-500 font-mono mt-0.5">****@paytm</p>
                 </div>
               </div>
               <span className="text-[10px] bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">Default</span>
             </div>

             <div className="flex items-center justify-between p-3 border border-slate-200 bg-white rounded-xl hover:border-slate-300 transition-colors cursor-pointer">
               <div className="flex items-center pl-2">
                 <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center mr-3 border border-slate-200/60">
                   <Building2 className="w-5 h-5 text-slate-500" />
                 </div>
                 <div>
                   <p className="text-[13px] font-medium text-slate-800">HDFC Bank</p>
                   <p className="text-[11px] text-slate-500 font-mono mt-0.5">**** 4301</p>
                 </div>
               </div>
             </div>
          </div>

          <div className="p-4 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl">
            <button className="w-full py-2.5 border-2 border-dashed border-slate-300 rounded-xl text-[13px] font-medium text-slate-600 hover:text-brand-600 hover:border-brand-300 hover:bg-brand-50 transition-all">
              Add destination account
            </button>
          </div>
        </div>
      </div>

      {/* Transaction History (Stripe Style List) */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-card overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
          <h3 className="text-base font-semibold text-slate-900 tracking-tight">Recent Transactions</h3>
          <button className="text-[13px] text-brand-600 font-medium hover:text-brand-700 inline-flex items-center">
            View all <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>
        <div className="divide-y divide-slate-100">
          {transactions.map((txn) => (
            <div key={txn.id} className="p-4 sm:px-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors group">
              <div className="flex items-center space-x-4">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 border-white shadow-sm ${
                  txn.type === 'payout' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                }`}>
                  {txn.type === 'payout' ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                     <p className="text-[13px] font-semibold text-slate-900">
                       {txn.type === 'payout' ? 'Payout to Bank/UPI' : 'Premium Deduction'}
                     </p>
                     <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md uppercase tracking-wider">{txn.status}</span>
                  </div>
                  <p className="text-[12px] text-slate-500 mt-0.5">{txn.date} • <span className="font-mono text-[11px]">{txn.id}</span></p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm font-semibold font-mono ${txn.type === 'payout' ? 'text-emerald-600' : 'text-slate-900'}`}>
                  {txn.amount}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5 flex items-center justify-end">
                  {txn.method}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default Payouts;