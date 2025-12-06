import React, { useMemo } from 'react';
import { ReviewEntry } from '../types';
import { Check, X } from 'lucide-react';

interface HabitTrackerProps {
  entries: ReviewEntry[];
}

export const HabitTracker: React.FC<HabitTrackerProps> = ({ entries }) => {
  const last14Days = useMemo(() => {
    const days = [];
    const today = new Date();
    // Normalize today to start of day
    today.setHours(0, 0, 0, 0);

    for (let i = 13; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      
      const entry = entries.find(e => {
        const entryDate = new Date(e.date);
        return entryDate.getDate() === d.getDate() && 
               entryDate.getMonth() === d.getMonth() && 
               entryDate.getFullYear() === d.getFullYear();
      });

      days.push({
        date: d,
        hasEntry: !!entry,
        score: entry?.aiAnalysis?.sentimentScore,
        isToday: i === 0
      });
    }
    return days;
  }, [entries]);

  const streak = useMemo(() => {
    let count = 0;
    const sorted = [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const today = new Date();
    today.setHours(0,0,0,0);
    
    // Check if reviewed today
    const hasToday = sorted.some(e => {
       const d = new Date(e.date);
       d.setHours(0,0,0,0);
       return d.getTime() === today.getTime();
    });

    if (!hasToday) {
        // If not reviewed today, check if streak ended yesterday
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        const hasYesterday = sorted.some(e => {
            const d = new Date(e.date);
            d.setHours(0,0,0,0);
            return d.getTime() === yesterday.getTime();
        });
        if (!hasYesterday) return 0;
    }

    // Simple calculation logic (can be improved for gaps)
    // For now, let's just count consecutive entries backwards from today/yesterday
    // This is a simplified visual streak for the UI
    let currentCheck = new Date(today);
    if (!hasToday) currentCheck.setDate(today.getDate() - 1);
    
    while (true) {
        const hasEntry = sorted.some(e => {
            const d = new Date(e.date);
            d.setHours(0,0,0,0);
            return d.getTime() === currentCheck.getTime();
        });
        
        if (hasEntry) {
            count++;
            currentCheck.setDate(currentCheck.getDate() - 1);
        } else {
            break;
        }
    }
    return count;
  }, [entries]);

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] mb-8">
      <div className="flex justify-between items-center mb-6">
        <div>
           <h3 className="font-bold text-slate-800 text-lg">习惯追踪</h3>
           <p className="text-slate-400 text-xs mt-1">过去 14 天复盘情况</p>
        </div>
        <div className="flex items-center bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100">
            <span className="text-xs text-indigo-600 font-medium mr-2">当前连续</span>
            <span className="text-xl font-bold text-indigo-700 font-mono">{streak}</span>
            <span className="text-xs text-indigo-600 font-medium ml-1">天</span>
        </div>
      </div>
      
      <div className="flex justify-between md:justify-around items-end">
        {last14Days.map((day, idx) => (
          <div key={idx} className="flex flex-col items-center gap-2 group">
             {/* Tooltip-ish date */}
             <span className="text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity absolute -mt-6 bg-slate-800 text-white px-1.5 py-0.5 rounded">
                {day.date.getDate()}日
             </span>

             <div className={`
                w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all duration-300 border-2
                ${day.hasEntry 
                    ? day.score && day.score >= 8 ? 'bg-emerald-100 border-emerald-200 text-emerald-600'
                    : day.score && day.score >= 5 ? 'bg-indigo-100 border-indigo-200 text-indigo-600'
                    : 'bg-amber-100 border-amber-200 text-amber-600'
                    : 'bg-slate-50 border-slate-100 text-slate-300'
                }
                ${day.isToday ? 'ring-2 ring-offset-2 ring-indigo-300' : ''}
             `}>
                {day.hasEntry ? <Check size={16} strokeWidth={3} /> : <span className="text-[10px] font-medium">{day.date.getDate()}</span>}
             </div>
             <span className="text-[10px] font-medium text-slate-400">
                {['周日','周一','周二','周三','周四','周五','周六'][day.date.getDay()]}
             </span>
          </div>
        ))}
      </div>
    </div>
  );
};