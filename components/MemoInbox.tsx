import React, { useEffect, useMemo, useState, useRef } from 'react';
import {
  ChevronLeft,
  Search,
  Pin,
  PinOff,
  Tag as TagIcon,
  MoreVertical,
  Trash2,
  Edit3,
  Send,
  X,
} from 'lucide-react';
import { Memo } from '../types';
import { TagAutocomplete } from './TagAutocomplete';

interface MemoInboxProps {
  memos: Memo[];
  isLoading: boolean;
  onCreate: (memo: Omit<Memo, 'id' | 'createTime' | 'updateTime'>) => Promise<void>;
  onUpdate: (memo: Memo) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onRefresh: () => Promise<void>;
  onBack: () => void;
  triggerToast?: (msg: string, type?: 'success' | 'error') => void;
}

const formatDate = (value?: string) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

export const MemoInbox: React.FC<MemoInboxProps> = ({
  memos,
  isLoading,
  onCreate,
  onUpdate,
  onDelete,
  onRefresh,
  onBack,
  triggerToast,
}) => {
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [editingMemo, setEditingMemo] = useState<Memo | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [tagFilter, setTagFilter] = useState<string>('ALL');
  const [isSaving, setIsSaving] = useState(false);
  const [showTagInput, setShowTagInput] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editingMemo) {
      setContent(editingMemo.content || '');
      setTags(editingMemo.tags || []);
    } else {
      setContent('');
      setTags([]);
    }
  }, [editingMemo]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const availableTags = useMemo(() => {
    const set = new Set<string>();
    memos.forEach((memo) => memo.tags?.forEach((t) => set.add(t)));
    return Array.from(set);
  }, [memos]);

  const filteredMemos = useMemo(() => {
    return [...memos]
      .filter((memo) => {
        const matchesSearch =
          !searchTerm ||
          memo.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
          memo.tags?.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesTag = tagFilter === 'ALL' || memo.tags?.includes(tagFilter);
        return matchesSearch && matchesTag;
      })
      .sort((a, b) => {
        const pinnedDiff = (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0);
        if (pinnedDiff !== 0) return pinnedDiff;
        const dateA = new Date(a.captureTime || a.updateTime || a.createTime || 0).getTime();
        const dateB = new Date(b.captureTime || b.updateTime || b.createTime || 0).getTime();
        return dateB - dateA;
      });
  }, [memos, searchTerm, tagFilter]);

  const handleSave = async () => {
    if (!content.trim()) {
      return;
    }
    setIsSaving(true);
    const payload = {
      content: content.trim(),
      tags,
      color: 'indigo', // 保留字段但使用默认值
      isPinned: false,
    };
    try {
      if (editingMemo) {
        await onUpdate({ ...editingMemo, ...payload });
        triggerToast?.('已更新');
      } else {
        await onCreate(payload);
        triggerToast?.('已保存');
      }
      setContent('');
      setTags([]);
      setEditingMemo(null);
      setShowTagInput(false);
      textareaRef.current?.focus();
    } catch (error) {
      console.error(error);
      triggerToast?.('保存失败', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSave();
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('确定要删除这条速记吗？')) return;
    try {
      await onDelete(id);
      triggerToast?.('已删除');
      if (editingMemo?.id === id) {
        setEditingMemo(null);
        setContent('');
        setTags([]);
      }
      setActiveMenuId(null);
    } catch (error) {
      console.error(error);
      triggerToast?.('删除失败', 'error');
    }
  };

  const handlePinToggle = async (memo: Memo) => {
    try {
      await onUpdate({ ...memo, isPinned: !memo.isPinned });
      setActiveMenuId(null);
    } catch (error) {
      console.error(error);
      triggerToast?.('操作失败', 'error');
    }
  };

  const handleEdit = (memo: Memo) => {
    setEditingMemo(memo);
    setContent(memo.content || '');
    setTags(memo.tags || []);
    setActiveMenuId(null);
    setTimeout(() => textareaRef.current?.focus(), 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 rounded-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all shadow-sm hover:shadow"
            >
              <ChevronLeft size={20} className="text-slate-700 dark:text-slate-300" />
            </button>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">闪念胶囊</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 rounded-2xl px-4 py-2 shadow-sm">
              <Search size={16} className="text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="搜索..."
                className="bg-transparent outline-none text-sm text-slate-700 dark:text-slate-200 w-32 placeholder-slate-400"
              />
            </div>
            {availableTags.length > 0 && (
              <select
                value={tagFilter}
                onChange={(e) => setTagFilter(e.target.value)}
                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 rounded-2xl px-4 py-2 text-sm text-slate-700 dark:text-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="ALL">全部</option>
                {availableTags.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="mb-8">
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 rounded-3xl p-6 shadow-lg">
            {editingMemo && (
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-200/50 dark:border-slate-700/50">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">编辑速记</span>
                <button
                  onClick={() => {
                    setEditingMemo(null);
                    setContent('');
                    setTags([]);
                  }}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-xl transition-colors"
                >
                  <X size={16} className="text-slate-500 dark:text-slate-400" />
                </button>
              </div>
            )}
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="现在的想法是..."
              rows={3}
              className="w-full bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none resize-none text-base leading-relaxed font-normal"
            />
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setShowTagInput(!showTagInput)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-xl text-slate-600 dark:text-slate-400 transition-colors"
                  title="添加标签"
                >
                  <TagIcon size={18} />
                </button>
                {tags.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-medium shadow-sm"
                      >
                        {tag}
                        <button
                          onClick={() => setTags(tags.filter((t) => t !== tag))}
                          className="hover:text-indigo-900 dark:hover:text-indigo-100 transition-colors"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={handleSave}
                disabled={!content.trim() || isSaving}
                className="p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-2xl transition-all shadow-md hover:shadow-lg disabled:shadow-none"
              >
                <Send size={18} />
              </button>
            </div>
            {showTagInput && (
              <div className="mt-4 pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
                <TagAutocomplete
                  tags={tags}
                  availableTags={availableTags}
                  onChange={(newTags) => {
                    setTags(newTags);
                    setShowTagInput(false);
                  }}
                  placeholder="输入标签后回车..."
                />
              </div>
            )}
          </div>
        </div>

        {/* Memo List */}
        <div className="space-y-4">
          {isLoading && (
            <div className="text-center text-slate-500 dark:text-slate-400 py-16 text-sm">加载中...</div>
          )}
          {!isLoading && filteredMemos.length === 0 && (
            <div className="text-center text-slate-400 dark:text-slate-500 py-16 text-sm">
              {searchTerm || tagFilter !== 'ALL' ? '没有找到匹配的速记' : '还没有速记，试着记录第一条想法吧'}
            </div>
          )}
          {filteredMemos.map((memo) => (
            <div
              key={memo.id}
              className="group relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 rounded-2xl p-5 shadow-md hover:shadow-xl transition-all duration-200 hover:border-slate-300/50 dark:hover:border-slate-600/50"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 mb-3">
                    {memo.isPinned && (
                      <Pin size={16} className="text-indigo-500 dark:text-indigo-400 flex-shrink-0" />
                    )}
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 tracking-wide">
                      {formatDate(memo.captureTime || memo.createTime)}
                    </span>
                  </div>
                  <p className="text-slate-900 dark:text-slate-100 leading-relaxed whitespace-pre-wrap break-words text-[15px] mb-3">
                    {memo.content}
                  </p>
                  {memo.tags && memo.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {memo.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2.5 py-1 bg-slate-100/80 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400 rounded-full text-xs font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="relative flex-shrink-0">
                  <button
                    onClick={() => setActiveMenuId(activeMenuId === memo.id ? null : memo.id)}
                    className="p-2 hover:bg-slate-100/80 dark:hover:bg-slate-700/50 rounded-xl opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <MoreVertical size={18} className="text-slate-400 dark:text-slate-500" />
                  </button>
                  {activeMenuId === memo.id && (
                    <div
                      ref={menuRef}
                      className="absolute right-0 top-10 z-10 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 rounded-2xl shadow-xl py-2 min-w-[140px]"
                    >
                      <button
                        onClick={() => handlePinToggle(memo)}
                        className="w-full px-4 py-2.5 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-2.5 transition-colors first:rounded-t-2xl"
                      >
                        {memo.isPinned ? (
                          <>
                            <PinOff size={16} />
                            取消置顶
                          </>
                        ) : (
                          <>
                            <Pin size={16} />
                            置顶
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleEdit(memo)}
                        className="w-full px-4 py-2.5 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-2.5 transition-colors"
                      >
                        <Edit3 size={16} />
                        编辑
                      </button>
                      <button
                        onClick={() => handleDelete(memo.id)}
                        className="w-full px-4 py-2.5 text-left text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50/50 dark:hover:bg-rose-900/20 flex items-center gap-2.5 transition-colors last:rounded-b-2xl"
                      >
                        <Trash2 size={16} />
                        删除
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};


