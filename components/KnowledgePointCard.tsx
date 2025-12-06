import React from 'react';
import { BookOpen, Tag, Calendar, Edit2, Trash2, Star } from 'lucide-react';
import { KnowledgePoint } from '../types';
import { SearchHighlight } from './SearchHighlight';

interface KnowledgePointCardProps {
  knowledgePoint: KnowledgePoint;
  onClick: () => void;
  onEdit?: (e: React.MouseEvent) => void;
  onDelete?: (e: React.MouseEvent) => void;
  onStar?: (e: React.MouseEvent) => void;
  searchQuery?: string;
  isSelected?: boolean;
  onSelect?: (e: React.MouseEvent) => void;
}

export const KnowledgePointCard: React.FC<KnowledgePointCardProps> = ({
  knowledgePoint,
  onClick,
  onEdit,
  onDelete,
  onStar,
  searchQuery = '',
  isSelected = false,
  onSelect,
}) => {
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  const previewContent = knowledgePoint.content.length > 150 
    ? knowledgePoint.content.substring(0, 150) + '...'
    : knowledgePoint.content;

  const isStarred = (knowledgePoint as any).isStarred || false;

  return (
    <div
      onClick={onSelect || onClick}
      className={`group relative bg-white dark:bg-slate-800 rounded-2xl p-6 border transition-all duration-300 cursor-pointer overflow-hidden ${
        isSelected
          ? 'border-indigo-500 dark:border-indigo-500 shadow-lg ring-2 ring-indigo-200 dark:ring-indigo-900'
          : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-xl'
      }`}
    >
      {/* 渐变背景装饰 */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-100/50 to-purple-100/50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-full blur-2xl -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      {/* 图标 */}
      <div className="relative z-10 flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-200/50 dark:shadow-indigo-900/30">
            <BookOpen size={24} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              <SearchHighlight text={knowledgePoint.title} searchQuery={searchQuery} />
            </h3>
            {knowledgePoint.category && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                {knowledgePoint.category}
              </span>
            )}
          </div>
        </div>
        
        {/* 操作按钮 */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onStar && (
            <button
              onClick={onStar}
              className={`p-2 rounded-lg transition-colors ${
                isStarred
                  ? 'text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/30'
                  : 'text-slate-400 hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/30'
              }`}
              title={isStarred ? '取消收藏' : '收藏'}
            >
              <Star size={16} className={isStarred ? 'fill-current' : ''} />
            </button>
          )}
          {onEdit && (
            <button
              onClick={onEdit}
              className="p-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 transition-colors"
              title="编辑"
            >
              <Edit2 size={16} />
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="p-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/30 text-rose-500 transition-colors"
              title="删除"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      {/* 内容预览 */}
      <p className="relative z-10 text-slate-600 dark:text-slate-300 text-sm leading-relaxed line-clamp-3 mb-4">
        <SearchHighlight text={previewContent} searchQuery={searchQuery} />
      </p>

      {/* 底部信息 */}
      <div className="relative z-10 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
        <div className="flex items-center gap-3">
          {knowledgePoint.tags && knowledgePoint.tags.length > 0 && (
            <div className="flex items-center gap-1.5">
              <Tag size={12} />
              <span className="line-clamp-1">
                {knowledgePoint.tags.slice(0, 2).join(', ')}
                {knowledgePoint.tags.length > 2 && ` +${knowledgePoint.tags.length - 2}`}
              </span>
            </div>
          )}
          {knowledgePoint.updateTime && (
            <div className="flex items-center gap-1">
              <Calendar size={12} />
              <span>{formatDate(knowledgePoint.updateTime)}</span>
            </div>
          )}
        </div>
      </div>

      {/* 悬停时的边框高光 */}
      <div className="absolute inset-0 rounded-2xl border-2 border-indigo-400 dark:border-indigo-600 opacity-0 group-hover:opacity-20 transition-opacity pointer-events-none"></div>
    </div>
  );
};

