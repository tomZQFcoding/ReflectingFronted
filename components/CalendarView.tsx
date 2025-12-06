import React from 'react';
import { ReviewEntry } from '../types';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';

interface CalendarViewProps {
  entries: ReviewEntry[];
  onDateClick: (date: Date, entry?: ReviewEntry) => void;
  currentDate: Date;
  onMonthChange: (date: Date) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ entries, onDateClick, currentDate, onMonthChange }) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sunday

  const days = [];
  // Empty slots for previous month
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  // Days of current month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i));
  }

  const handlePrevMonth = () => {
    onMonthChange(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    onMonthChange(new Date(year, month + 1, 1));
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-slate-800">
           {year}年 {month + 1}月
        </h2>
        <div className="flex gap-2">
            <button onClick={handlePrevMonth} className="p-2 hover:bg-slate-50 rounded-full text-slate-500 transition-colors">
                <ChevronLeft size={20} />
            </button>
            <button onClick={handleNextMonth} className="p-2 hover:bg-slate-50 rounded-full text-slate-500 transition-colors">
                <ChevronRight size={20} />
            </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-2 text-center">
        {['日', '一', '二', '三', '四', '五', '六'].map(d => (
            <div key={d} className="text-xs font-bold text-slate-400 py-2">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2 auto-rows-fr">
        {days.map((date, idx) => {
            if (!date) return <div key={`empty-${idx}`} className="aspect-square"></div>;
            
            // Find entry for this date
            const entry = entries.find(e => {
                const eDate = new Date(e.date);
                return eDate.getDate() === date.getDate() && 
                       eDate.getMonth() === date.getMonth() && 
                       eDate.getFullYear() === date.getFullYear();
            });

            const score = entry?.aiAnalysis?.sentimentScore;
            
            let bgClass = "bg-slate-50 border-slate-100 text-slate-400 hover:border-indigo-200 hover:text-indigo-500";
            if (entry && score !== undefined) {
                if (score >= 8) bgClass = "bg-emerald-100/80 border-emerald-200 text-emerald-700 hover:bg-emerald-200";
                else if (score >= 5) bgClass = "bg-indigo-100/80 border-indigo-200 text-indigo-700 hover:bg-indigo-200";
                else bgClass = "bg-amber-100/80 border-amber-200 text-amber-700 hover:bg-amber-200";
            }

            const isToday = new Date().toDateString() === date.toDateString();

            return (
                <button 
                    key={date.toISOString()} 
                    onClick={() => onDateClick(date, entry)}
                    className={`
                        aspect-square rounded-xl flex flex-col items-center justify-center relative transition-all duration-200 border
                        group ${bgClass} ${isToday ? 'ring-2 ring-indigo-400 ring-offset-2' : ''}
                    `}
                >
                    <span className={`text-sm font-bold ${entry ? '' : 'opacity-70'}`}>
                        {date.getDate()}
                    </span>
                    
                    {entry ? (
                        <div className="mt-1 w-1.5 h-1.5 rounded-full bg-current opacity-50"></div>
                    ) : (
                         <Plus size={12} className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity text-indigo-400" />
                    )}

                    {/* Tooltip on Hover */}
                    {entry && (
                        <div className="absolute z-20 bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 bg-slate-800 text-white text-xs p-3 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-xl">
                            <div className="font-bold mb-1 truncate">{entry.aiAnalysis?.summary}</div>
                            <div className="text-slate-300">评分: {score}/10</div>
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1 w-2 h-2 bg-slate-800 rotate-45"></div>
                        </div>
                    )}
                </button>
            );
        })}
      </div>
    </div>
  );
};