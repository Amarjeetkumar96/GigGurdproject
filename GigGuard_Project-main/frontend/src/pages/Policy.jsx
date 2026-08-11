import React, { useState } from 'react';
import { Shield, Info, CheckCircle2, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const brackets = [
  { id: 'tier_1', amount: '₹0 - ₹5k', label: 'Part-time Gig', coverage: 3500, premium: 25 },
  { id: 'tier_2', amount: '₹5k - ₹10k', label: 'Active Earner', coverage: 7000, premium: 45, recommended: true },
  { id: 'tier_3', amount: '₹10k+', label: 'Power Driver', coverage: 12000, premium: 75 },
];

const Policy = () => {
  const [selectedTier, setSelectedTier] = useState('tier_2');
  const selectedData = brackets.find(b => b.id === selectedTier);

  return (
    <motion.div 
      className="max-w-4xl mx-auto space-y-8"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div>
        <h1 className="text-[28px] font-bold text-slate-900 tracking-tight leading-none mb-1">Coverage Configuration</h1>
        <p className="text-slate-500 text-sm">Select your average weekly income to calibrate your parametric threshold.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Radio Cards */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-semibold text-slate-900 tracking-tight flex items-center">
            <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] mr-2">1</span>
            Select Income Bracket
          </h2>
          
          <div className="space-y-3">
            {brackets.map((bracket) => (
              <label 
                key={bracket.id}
                className={`relative flex cursor-pointer rounded-2xl border p-5 focus:outline-none transition-all duration-300 ${
                  selectedTier === bracket.id 
                    ? 'bg-brand-50/30 border-brand-500 shadow-[0_0_0_1px_#3b82f6]' 
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
                }`}
              >
                <input 
                  type="radio" 
                  name="income_tier" 
                  value={bracket.id} 
                  className="sr-only"
                  onChange={() => setSelectedTier(bracket.id)}
                />
                <span className="flex flex-1 items-center justify-between">
                  <span className="flex flex-col">
                    <span className="block text-sm font-semibold text-slate-900 flex items-center mb-1">
                      {bracket.amount} <span className="mx-2 text-slate-300">|</span> <span className="text-slate-500 font-normal">{bracket.label}</span>
                      {bracket.recommended && (
                        <span className="ml-3 inline-flex items-center rounded-md bg-brand-100 px-2 py-0.5 text-[10px] font-bold text-brand-700 uppercase tracking-widest">
                          Popular
                        </span>
                      )}
                    </span>
                    <span className="flex items-center text-[13px] text-slate-500">
                      Guarantees up to <strong className="mx-1 text-slate-700 font-mono">₹{bracket.coverage.toLocaleString()}</strong> payout per week
                    </span>
                  </span>
                  
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                    selectedTier === bracket.id ? 'border-brand-600 bg-brand-600' : 'border-slate-300'
                  }`}>
                     {selectedTier === bracket.id && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </div>
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Right Column: Summary Panel */}
        <div className="lg:col-span-1">
           <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl sticky top-24">
              <h3 className="text-sm font-medium text-slate-400 mb-6 uppercase tracking-wider">Plan Summary</h3>
              
              <AnimatePresence mode="popLayout">
                <motion.div 
                  key={selectedData.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div>
                    <p className="text-[13px] text-slate-400 mb-1">Weekly Premium</p>
                    <p className="text-4xl font-semibold tracking-tighter text-white">₹{selectedData.premium}<span className="text-lg text-slate-500 font-normal">.00</span></p>
                  </div>
                  
                  <div className="h-px w-full bg-slate-800" />
                  
                  <div>
                     <p className="text-[13px] text-slate-400 mb-2">Coverage Details</p>
                     <ul className="space-y-3">
                       <li className="flex justify-between text-[13px]">
                         <span className="text-slate-300">Max Payout</span>
                         <span className="font-mono text-emerald-400">₹{selectedData.coverage}</span>
                       </li>
                       <li className="flex justify-between text-[13px]">
                         <span className="text-slate-300">Auto-trigger</span>
                         <span className="text-white">Active</span>
                       </li>
                       <li className="flex justify-between text-[13px]">
                         <span className="text-slate-300">Deductible</span>
                         <span className="text-white">₹0</span>
                       </li>
                     </ul>
                  </div>

                  <div className="bg-slate-800/50 rounded-xl p-3 flex items-start border border-slate-700">
                    <Info className="w-4 h-4 text-brand-400 shrink-0 mt-0.5 rounded-full bg-brand-400/10" />
                    <p className="text-[11px] text-slate-300 ml-2 leading-relaxed">
                      Premium is auto-deducted every Monday via default payment method. Cancel anytime.
                    </p>
                  </div>
                  
                  <button className="w-full bg-white text-slate-900 py-3 rounded-xl font-medium shadow-sm hover:bg-slate-100 transition-colors flex items-center justify-center mt-4">
                    Confirm & Activate <ChevronRight className="w-4 h-4 ml-1 text-slate-500" />
                  </button>
                </motion.div>
              </AnimatePresence>
           </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Policy;