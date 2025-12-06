import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, Save, X, Tag } from 'lucide-react';
import { KnowledgePoint } from '../types';
import { Button } from './Button';
import { TagAutocomplete } from './TagAutocomplete';

interface KnowledgePointEditorProps {
  knowledgePoint?: KnowledgePoint;
  onSave: (kp: Omit<KnowledgePoint, 'id' | 'createTime' | 'updateTime'>) => Promise<void>;
  onCancel: () => void;
  onDelete?: (id: string) => Promise<void>;
  availableTags?: string[];
}

export const KnowledgePointEditor: React.FC<KnowledgePointEditorProps> = ({
  knowledgePoint,
  onSave,
  onCancel,
  onDelete,
  availableTags = [],
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (knowledgePoint) {
      setTitle(knowledgePoint.title);
      setContent(knowledgePoint.content);
      setCategory(knowledgePoint.category || '');
      setTags(knowledgePoint.tags || []);
    } else {
      setTitle('');
      setContent('');
      setCategory('');
      setTags([]);
    }
  }, [knowledgePoint]);

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      return;
    }
    setIsSaving(true);
    try {
      await onSave({
        title: title.trim(),
        content: content.trim(),
        category: category.trim() || undefined,
        tags,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!knowledgePoint || !onDelete) return;
    if (window.confirm('确定删除这个知识点吗？')) {
      setIsDeleting(true);
      try {
        await onDelete(knowledgePoint.id);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const isFormValid = title.trim().length > 0 && content.trim().length > 0;

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-900/50 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onCancel}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">
              {knowledgePoint ? '编辑知识点' : '新建知识点'}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {knowledgePoint && onDelete && (
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors disabled:opacity-50"
              >
                {isDeleting ? '删除中...' : '删除'}
              </button>
            )}
            <Button
              onClick={handleSave}
              disabled={!isFormValid || isSaving}
              loading={isSaving}
              icon={<Save size={18} />}
              className="rounded-xl px-6 shadow-lg"
            >
              {isSaving ? '保存中...' : '保存'}
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="space-y-6">
            {/* 标题 */}
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                标题 <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="例如：什么是五险一金"
                className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-lg font-medium"
              />
            </div>

            {/* 分类 */}
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                分类
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="例如：职场知识、生活常识"
                className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>

            {/* 标签 */}
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center">
                <Tag size={14} className="mr-2 text-indigo-500" /> 标签
              </label>
              <TagAutocomplete
                tags={tags}
                availableTags={availableTags}
                onChange={setTags}
                placeholder="输入标签后回车..."
              />
            </div>

            {/* 内容 */}
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                内容 <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="在这里输入知识点的详细内容..."
                rows={20}
                className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none leading-relaxed"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

