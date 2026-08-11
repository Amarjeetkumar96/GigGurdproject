import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  FileText, 
  Activity, 
  PieChart, 
  CreditCard, 
  ShieldAlert,
  Zap
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { name: 'Overview', path: '/dashboard', icon: Home },
  { name: 'Active Policy', path: '/dashboard/policy', icon: FileText },
  { name: 'Trigger Monitors', path: '/dashboard/triggers', icon: Activity },
  { name: 'Claims Center', path: '/dashboard/claims', icon: PieChart },
  { name: 'Wallets & Payouts', path: '/dashboard/payouts', icon: CreditCard },
  { name: 'Developer Admin', path: '/dashboard/admin', icon: Zap },
];

const Sidebar = ({ onClose }) => {
  return (
    <div className="w-[260px] bg-[#F7F9FC] border-r border-[#E2E8F0] h-full flex flex-col font-sans">
      <div className="h-16 flex items-center px-6 pt-2">
        <div className="flex items-center space-x-2.5">
          <div className="bg-brand-600 p-1.5 rounded-lg shadow-sm">
            <ShieldAlert className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-lg text-slate-900 tracking-tight">GigGuard</span>
        </div>
      </div>

      <div className="px-6 py-4">
        <div className="h-[1px] w-full bg-slate-200/60" />
      </div>

      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === '/dashboard'}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200',
                  isActive
                    ? 'bg-white text-brand-700 shadow-sm ring-1 ring-slate-200/50'
                    : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={cn(
                      'mr-3 flex-shrink-0 h-4 w-4 transition-colors duration-200',
                      isActive ? 'text-brand-600' : 'text-slate-400 group-hover:text-slate-600'
                    )}
                  />
                  {item.name}
                  {isActive && (
                    <span className="ml-auto w-1 h-4 bg-brand-600 rounded-full" />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 mt-auto">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200/50">
          <div className="flex items-center space-x-2 mb-2">
             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
             <h4 className="text-xs font-semibold text-slate-900 tracking-wide uppercase">System Live</h4>
          </div>
          <p className="text-[#64748B] text-xs leading-relaxed mb-3">All API triggers operating at low latency.</p>
          <button className="w-full text-xs font-medium bg-slate-50 border border-slate-200 text-slate-700 py-2 rounded-lg hover:bg-slate-100 transition-colors">
            View Status
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;