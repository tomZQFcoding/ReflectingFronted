import React from 'react';
import { ReviewEntry } from '../types';
import { FRAMEWORKS } from '../constants';
import { Calendar, TrendingUp, Tag } from 'lucide-react';

interface EntryCardProps {
  entry: ReviewEntry;
  onClick: () => void;
}

export const EntryCard: React.FC<EntryCardProps> = ({ entry, onClick }) => {
  const frameworkName = FRAMEWORKS[entry.framework]?.label || entry.framework;
  const score = entry.aiAnalysis?.sentimentScore ?? 0;
  
  // Color coding for score
  const scoreColor = score >= 8 ? "text-emerald-700 bg-emerald-100/50 border-emerald-200" 
    : score >= 5 ? "text-indigo-700 bg-indigo-100/50 border-indigo-200" 
    : "text-amber-700 bg-amber-100/50 border-amber-200";

  return (
    <div 
      onClick={onClick}
      className="group bg-white rounded-2xl border border-slate-100 p-6 cursor-pointer hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden flex flex-col h-full"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider text-slate-500 bg-slate-100 uppercase mb-2 border border-slate-200/50">
             {frameworkName}
          </div>
          <h3 className="text-lg font-bold text-slate-800 line-clamp-1 tracking-tight">
            {entry.aiAnalysis?.summary || "未命名复盘"}
          </h3>
        </div>
        {entry.aiAnalysis && (
           <div className={`px-2.5 py-1 rounded-full border text-xs font-bold flex items-center gap-1.5 ${scoreColor}`}>
             <TrendingUp size={12} />
             {score}
           </div>
        )}
      </div>
      
      <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 mb-4 flex-grow">
        {entry.aiAnalysis?.keyInsight || "暂无 AI 洞察..."}
      </p>

      {/* Tags Row */}
      {entry.tags && entry.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
            {entry.tags.slice(0, 3).map(tag => (
                <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] bg-slate-50 text-slate-500 border border-slate-100">
                    <Tag size={8} className="mr-1 opacity-50"/> {tag}
                </span>
            ))}
            {entry.tags.length > 3 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] bg-slate-50 text-slate-400">
                    +{entry.tags.length - 3}
                </span>
            )}
        </div>
      )}

      <div className="flex items-center text-slate-400 text-xs mt-auto pt-4 border-t border-slate-50">
        <Calendar size={13} className="mr-2 opacity-70" />
        {new Date(entry.date).toLocaleDateString('zh-CN', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })}
      </div>
      
      {/* Decorative gradient blob */}
      <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/10 transition-colors pointer-events-none"></div>
    </div>
  );
};
