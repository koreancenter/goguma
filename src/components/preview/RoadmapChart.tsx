import React from 'react';
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
        const owner = match[5]?.trim() || 'Assignee';
        
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

  return (
    <div className="w-full mt-8 bg-[#0E1217] rounded-[2px] border border-white/[0.08] overflow-hidden text-[#F0F3F6] font-sans shadow-2xs">
      <div className="p-4 sm:p-5 border-b border-white/[0.08] flex items-center justify-between bg-[#13181F]">
        <h4 className="text-sm font-sans font-bold text-[#F0F3F6] tracking-tight flex items-center gap-2.5">
          <Calendar size={16} className="text-[#38BDF8]" />
          <span>월별 개발 마일스톤 및 로드맵 타임라인</span>
        </h4>
        <div className="px-2.5 py-1 bg-[#0E1217] border border-white/[0.08] text-[#94A3B8] rounded-[2px] text-xs font-mono uppercase tracking-wider">
          {new Date().getFullYear()} TIMELINE
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-[#13181F]">
              <th className="px-4 py-3 border-b border-r border-white/[0.08] min-w-[180px] text-xs font-mono uppercase tracking-wider text-[#7A889B]">
                CATEGORY & TASK
              </th>
              {months.map((m, i) => (
                <th key={i} className="px-2 py-3 border-b border-r border-white/[0.08] text-[10px] font-mono uppercase tracking-widest text-[#7A889B] text-center">
                  {m.trim()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {categoryNames.length === 0 ? (
              <tr>
                <td colSpan={months.length + 1} className="p-8 text-center text-xs text-[#7A889B] font-mono">
                  기획서에 등록된 월별 일정 데이터가 없습니다.
                </td>
              </tr>
            ) : (
              categoryNames.map((cat, catIdx) => {
                const tasks = categories[cat];
                return tasks.map((task, taskIdx) => (
                  <tr key={`${catIdx}-${taskIdx}`} className="border-b border-white/[0.08] hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-2.5 border-r border-white/[0.08]">
                      <div className="font-sans font-semibold text-xs text-[#F0F3F6] truncate max-w-[180px]">{task.name}</div>
                      <div className="text-[10px] font-mono text-[#7A889B] mt-0.5 truncate">{cat} · {task.owner}</div>
                    </td>
                    {months.map((_, mIdx) => {
                      const isActive = mIdx >= task.startMonth && mIdx <= task.endMonth;
                      const isStart = mIdx === task.startMonth;
                      const isEnd = mIdx === task.endMonth;
                      return (
                        <td key={mIdx} className="p-1 border-r border-white/[0.05] text-center relative">
                          {isActive && (
                            <div 
                              className={`h-5 flex items-center justify-center text-[10px] font-mono font-medium transition-all ${
                                isStart ? 'rounded-l-[2px]' : ''
                              } ${isEnd ? 'rounded-r-[2px]' : ''} ${
                                catIdx % 2 === 0 
                                  ? 'bg-[#2563EB] text-white font-semibold shadow-2xs' 
                                  : 'bg-blue-950/70 text-[#38BDF8] border border-blue-500/40'
                              }`}
                            >
                              {isStart && <span className="truncate px-1 text-[9px]">{task.name}</span>}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ));
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RoadmapChart;
