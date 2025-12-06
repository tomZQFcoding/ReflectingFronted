import React, { useState } from 'react';
import { X, Search, Calendar, Tag, Filter } from 'lucide-react';
import { FrameworkType } from '../types';
import { FRAMEWORKS } from '../constants';

interface AdvancedSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (filters: SearchFilters) => void;
  availableTags: string[];
}

export interface SearchFilters {
  query: string;
  framework?: FrameworkType;
  tags: string[];
  dateFrom?: Date;
  dateTo?: Date;
  minScore?: number;
  maxScore?: number;
}

export const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  isOpen,
  onClose,
  onSearch,
  availableTags,
}) => {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    tags: [],
    minScore: undefined,
    maxScore: undefined,
  });
  const [selectedTag, setSelectedTag] = useState('');

  if (!isOpen) return null;

  const handleAddTag = (tag: string) => {
    if (tag && !filters.tags.includes(tag)) {
      setFilters(prev => ({ ...prev, tags: [...prev.tags, tag] }));
      setSelectedTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFilters(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  };

  const handleSearch = () => {
    onSearch(filters);
    onClose();
  };

  const handleReset = () => {
    setFilters({
      query: '',
      tags: [],
      minScore: undefined,
      maxScore: undefined,
    });
  };

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center p-4"
      style={{
        background: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <Filter size={20} className="text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">高级搜索</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* 关键词搜索 */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              关键词
            </label>
            <div className="relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={filters.query}
                onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
                placeholder="搜索复盘内容..."
                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:text-slate-100"
              />
            </div>
          </div>

          {/* 框架筛选 */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              复盘模型
            </label>
            <select
              value={filters.framework || ''}
              onChange={(e) => setFilters(prev => ({ 
                ...prev, 
                framework: e.target.value ? (e.target.value as FrameworkType) : undefined 
              }))}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:text-slate-100"
            >
              <option value="">全部</option>
              {Object.values(FRAMEWORKS).map(fw => (
                <option key={fw.id} value={fw.id}>{fw.label}</option>
              ))}
            </select>
          </div>

          {/* 标签筛选 */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              标签
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {filters.tags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-lg text-sm"
                >
                  <Tag size={12} />
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-indigo-900 dark:hover:text-indigo-100"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && selectedTag.trim()) {
                    handleAddTag(selectedTag.trim());
                  }
                }}
                placeholder="输入标签后回车..."
                className="flex-1 px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:text-slate-100"
              />
              {availableTags.length > 0 && (
                <select
                  value=""
                  onChange={(e) => {
                    if (e.target.value) {
                      handleAddTag(e.target.value);
                    }
                  }}
                  className="px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:text-slate-100"
                >
                  <option value="">选择已有标签</option>
                  {availableTags
                    .filter(tag => !filters.tags.includes(tag))
                    .map(tag => (
                      <option key={tag} value={tag}>{tag}</option>
                    ))}
                </select>
              )}
            </div>
          </div>

          {/* 日期范围 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                开始日期
              </label>
              <div className="relative">
                <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="date"
                  value={filters.dateFrom ? filters.dateFrom.toISOString().split('T')[0] : ''}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    dateFrom: e.target.value ? new Date(e.target.value) : undefined 
                  }))}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:text-slate-100"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                结束日期
              </label>
              <div className="relative">
                <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="date"
                  value={filters.dateTo ? filters.dateTo.toISOString().split('T')[0] : ''}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    dateTo: e.target.value ? new Date(e.target.value) : undefined 
                  }))}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:text-slate-100"
                />
              </div>
            </div>
          </div>

          {/* 情绪评分范围 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                最低评分
              </label>
              <input
                type="number"
                min="0"
                max="10"
                value={filters.minScore ?? ''}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  minScore: e.target.value ? parseInt(e.target.value) : undefined 
                }))}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                最高评分
              </label>
              <input
                type="number"
                min="0"
                max="10"
                value={filters.maxScore ?? ''}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  maxScore: e.target.value ? parseInt(e.target.value) : undefined 
                }))}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:text-slate-100"
              />
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              onClick={handleReset}
              className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-semibold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
              重置
            </button>
            <button
              onClick={handleSearch}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/30 transition-all"
            >
              搜索
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

