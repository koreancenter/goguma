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
    <div className="w-full mt-8 bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden text-[#111827] font-sans shadow-[0_8px_24px_-4px_rgba(15,23,42,0.05)]">
      <div className="p-4 sm:p-5 border-b border-[#E5E7EB] flex items-center justify-between bg-[#F7F8FA]">
        <h4 className="text-sm font-sans font-semibold text-[#111827] tracking-tight flex items-center gap-2.5">
          <Calendar size={16} className="text-[#1E3A8A]" />
          <span>월별 개발 마일스톤 및 로드맵 타임라인</span>
        </h4>
        <div className="px-2.5 py-1 bg-white border border-[#E5E7EB] text-[#4B5563] rounded-lg text-xs font-mono uppercase tracking-wider">
          {new Date().getFullYear()} TIMELINE
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-[#F7F8FA]">
              <th className="px-4 py-3 border-b border-r border-[#E5E7EB] min-w-[180px] text-xs font-mono uppercase tracking-wider text-[#6B7280]">
                CATEGORY & TASK
              </th>
              {months.map((m, i) => (
                <th key={i} className="px-2 py-3 border-b border-r border-[#E5E7EB] text-[10px] font-mono uppercase tracking-widest text-[#6B7280] text-center">
                  {m.trim()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {categoryNames.length === 0 ? (
              <tr>
                <td colSpan={months.length + 1} className="p-8 text-center text-xs text-[#6B7280] font-mono">
                  기획서에 등록된 월별 일정 데이터가 없습니다.
                </td>
              </tr>
            ) : (
              categoryNames.map((cat, catIdx) => {
                const tasks = categories[cat];
                return tasks.map((task, taskIdx) => (
                  <tr key={`${catIdx}-${taskIdx}`} className="border-b border-[#E5E7EB] hover:bg-[#F7F8FA]/60 transition-colors">
                    <td className="px-4 py-2.5 border-r border-[#E5E7EB]">
                      <div className="font-sans font-semibold text-xs text-[#111827] truncate max-w-[180px]">{task.name}</div>
                      <div className="text-[10px] font-mono text-[#6B7280] mt-0.5 truncate">{cat} · {task.owner}</div>
                    </td>
                    {months.map((_, mIdx) => {
                      const isActive = mIdx >= task.startMonth && mIdx <= task.endMonth;
                      const isStart = mIdx === task.startMonth;
                      const isEnd = mIdx === task.endMonth;
                      return (
                        <td key={mIdx} className="p-1 border-r border-[#E5E7EB]/60 text-center relative">
                          {isActive && (
                            <div 
                              className={`h-5 flex items-center justify-center text-[10px] font-mono font-medium transition-all ${
                                isStart ? 'rounded-l-md' : ''
                              } ${isEnd ? 'rounded-r-md' : ''} ${
                                catIdx % 2 === 0 
                                  ? 'bg-[#1E3A8A] text-white font-semibold' 
                                  : 'bg-[#EFF6FF] text-[#1E3A8A] border border-[#1E3A8A]/20'
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
