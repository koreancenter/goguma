import React from 'react';
import { motion } from 'motion/react';
import { Calendar } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export const RoadmapChart = ({ schedule = '' }: { schedule?: string }) => {
  const { t } = useLanguage();
  const months = (t('month_names') || '').split(',');
  
  const parseRoadmap = (text: string = '') => {
    const lines = (text || '').split('\n');
    const tasks: { category: string; name: string; startMonth: number; endMonth: number; owner: string }[] = [];
    const monthsMap: Record<string, number> = {
      'jan': 0, 'feb': 1, 'mar': 2, 'apr': 3, 'may': 4, 'jun': 5,
      'jul': 6, 'aug': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dec': 11,
      'january': 0, 'february': 1, 'march': 2, 'april': 3, 'june': 5, 'july': 6, 'august': 7, 'september': 8, 'october': 9, 'november': 10, 'december': 11,
      '1': 0, '2': 1, '3': 2, '4': 3, '5': 4, '6': 5, '7': 6, '8': 7, '9': 8, '10': 9, '11': 10, '12': 11
    };

    lines.forEach(line => {
      const match = line.match(/^\s*•?\s*([^:]+):\s*([^\[\{]+)\[([^\]-]+)\s*-\s*([^\]]+)\](?:\s*\{([^\}]+)\})?/);
      if (match) {
        const category = match[1].trim();
        const name = match[2].trim();
        const startStr = match[3].trim().toLowerCase();
        const endStr = match[4].trim().toLowerCase();
        const owner = match[5]?.trim() || 'Add name here';
        
        let startMonth = monthsMap[startStr];
        if (startMonth === undefined) {
          const num = parseInt(startStr);
          if (!isNaN(num)) startMonth = num - 1;
        }

        let endMonth = monthsMap[endStr];
        if (endMonth === undefined) {
          const num = parseInt(endStr);
          if (!isNaN(num)) endMonth = num - 1;
        }

        if (startMonth !== undefined && endMonth !== undefined) {
          tasks.push({ category, name, startMonth, endMonth, owner });
        }
      }
    });

    const grouped: Record<string, typeof tasks> = {};
    tasks.forEach(t => {
      if (!grouped[t.category]) grouped[t.category] = [];
      grouped[t.category].push(t);
    });
    return grouped;
  };

  const categories = parseRoadmap(schedule);
  const categoryNames = Object.keys(categories);

  const getCategoryColor = (cat: string) => {
    const name = cat.toLowerCase();
    if (name.includes('discovery') || name.includes('research')) return 'bg-indigo-500';
    if (name.includes('planning')) return 'bg-blue-500';
    if (name.includes('design')) return 'bg-amber-500';
    if (name.includes('development')) return 'bg-sky-500';
    if (name.includes('testing')) return 'bg-emerald-500';
    if (name.includes('launch')) return 'bg-orange-500';
    if (name.includes('post')) return 'bg-indigo-500';
    return 'bg-blue-500';
  };

  const getBarColor = (cat: string) => {
    const name = cat.toLowerCase();
    if (name.includes('discovery') || name.includes('research')) return 'bg-indigo-400';
    if (name.includes('planning')) return 'bg-blue-400';
    if (name.includes('design')) return 'bg-amber-400';
    if (name.includes('development')) return 'bg-sky-400';
    if (name.includes('testing')) return 'bg-emerald-400';
    if (name.includes('launch')) return 'bg-orange-400';
    if (name.includes('post')) return 'bg-indigo-400';
    return 'bg-blue-400';
  };

  return (
    <div className="w-full mt-12 bg-white rounded-[32px] border-2 border-slate-100 shadow-2xl shadow-slate-200 overflow-hidden">
      <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <h4 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          <Calendar className="text-blue-600" />
          Website Development Monthly Project Plan
        </h4>
        <div className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest">
          {new Date().getFullYear()} Timeline
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-slate-50">
              <th className="px-6 py-4 border-b border-r border-slate-100 min-w-[200px]"></th>
              {months.map((m, i) => (
                <th key={i} className="px-3 py-4 border-b border-r border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-500 bg-white group hover:bg-slate-100 transition-colors text-center">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 mb-1 mx-auto group-hover:bg-blue-500 group-hover:text-white transition-all text-[10px]">
                    {m}
                  </div>
                </th>
              ))}
              <th className="px-6 py-4 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-500 min-w-[150px] text-center">
                {t('responsible_person')}
              </th>
            </tr>
          </thead>
          <tbody>
            {categoryNames.length === 0 ? (
              <tr>
                <td colSpan={14} className="py-20 text-center">
                  <div className="flex flex-col items-center gap-3 text-slate-300">
                    <Calendar size={48} strokeWidth={1} />
                    <p className="text-sm font-bold uppercase tracking-widest">{t('roadmap_desc')}</p>
                  </div>
                </td>
              </tr>
            ) : (
              categoryNames.map((cat, catIdx) => (
                <React.Fragment key={catIdx}>
                  <tr className="bg-slate-50/30">
                    <td className={`px-6 py-2 ${getCategoryColor(cat)} text-white font-black text-[10px] uppercase tracking-widest`}>
                      {cat}
                    </td>
                    {months.map((_, i) => (
                      <td key={i} className="border-r border-slate-100 bg-slate-50/10"></td>
                    ))}
                    <td className="bg-slate-50/10"></td>
                  </tr>
                  {categories[cat].map((task, taskIdx) => (
                    <tr key={taskIdx} className="group hover:bg-slate-50/50 transition-colors border-b border-slate-50">
                      <td className="px-6 py-3 border-r border-slate-100 text-[11px] font-bold text-slate-600 pl-10">
                        {task.name}
                      </td>
                      <td colSpan={12} className="relative p-0 border-r border-slate-100">
                        <div className="absolute inset-0 flex">
                          {months.map((_, i) => (
                            <div key={i} className="flex-1 border-r border-slate-100/50 last:border-0" />
                          ))}
                        </div>
                        <motion.div
                          initial={{ width: 0, opacity: 0 }}
                          animate={{ 
                            width: `${((task.endMonth - task.startMonth + 1) / 12) * 100}%`,
                            left: `${(task.startMonth / 12) * 100}%`,
                            opacity: 1
                          }}
                          className={`absolute top-1/2 -translate-y-1/2 h-4 ${getBarColor(cat)} rounded-full shadow-sm z-10 mx-1`}
                        />
                      </td>
                      <td className="px-6 py-3 text-[10px] font-bold text-slate-400 text-center">
                        {task.owner}
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RoadmapChart;
