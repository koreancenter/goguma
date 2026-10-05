import React from 'react';
import { motion } from 'motion/react';
import { LucideIcon, Monitor, Smartphone } from 'lucide-react';
import { useSitePlan } from '../../contexts/SitePlanContext';

interface StepHeaderProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  color?: string;
  badge?: string;
}

export const StepHeader = ({ title, subtitle, icon: Icon, color = 'blue', badge }: StepHeaderProps) => {
  const { plan } = useSitePlan();
  const platform = plan?.metadata?.platform;

  const colorMap: Record<string, string> = {
    goguma: 'bg-goguma/10 text-goguma border border-goguma/20',
    blue: 'bg-blue-50 text-blue-600 border border-blue-200/60',
    emerald: 'bg-emerald-50 text-emerald-600 border border-emerald-200/60',
    indigo: 'bg-indigo-50 text-indigo-600 border border-indigo-200/60',
    slate: 'bg-slate-100 text-slate-800 border border-slate-200/80',
    violet: 'bg-violet-50 text-violet-600 border border-violet-200/60',
    rose: 'bg-rose-50 text-rose-600 border border-rose-200/60',
    amber: 'bg-amber-50 text-amber-700 border border-amber-200/60',
  };

  const bgClass = colorMap[color] || colorMap.blue;

  return (
    <div className="mb-8 relative flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200/60">
      <div className="flex items-center gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`w-12 h-12 ${bgClass} rounded-2xl flex items-center justify-center shrink-0 shadow-xs`}
        >
          <Icon size={24} strokeWidth={2} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="flex items-center gap-2 mb-1">
            {badge && (
              <span className="inline-block px-2.5 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[10px] font-bold uppercase tracking-wider">
                {badge}
              </span>
            )}
            {platform && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-slate-900 text-white rounded-md text-[10px] font-bold uppercase tracking-wider">
                {platform === 'WEB' ? <Monitor size={10} /> : <Smartphone size={10} />}
                {platform}
              </span>
            )}
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 uppercase">
            {title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium leading-normal max-w-2xl mt-0.5">
            {subtitle}
          </p>
        </motion.div>
      </div>
    </div>
  );
};
