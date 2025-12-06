import React from 'react';
import { Trash2, Download, X, CheckSquare, Square } from 'lucide-react';
import { Button } from './Button';

interface BatchActionsProps<T extends { id: string }> {
  items: T[];
  selectedIds: Set<string>;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onDelete: (ids: string[]) => void;
  onExport?: (items: T[]) => void;
  getItemName?: (item: T) => string;
}

export function BatchActions<T extends { id: string }>({
  items,
  selectedIds,
  onSelectAll,
  onDeselectAll,
  onDelete,
  onExport,
  getItemName,
}: BatchActionsProps<T>) {
  const selectedCount = selectedIds.size;
  const allSelected = selectedCount === items.length && items.length > 0;

  const handleDelete = () => {
    if (window.confirm(`确定删除选中的 ${selectedCount} 项吗？`)) {
      onDelete(Array.from(selectedIds));
    }
  };

  const handleExport = () => {
    if (onExport) {
      const selectedItems = items.filter((item) => selectedIds.has(item.id));
      onExport(selectedItems);
    }
  };

  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 shadow-lg">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={allSelected ? onDeselectAll : onSelectAll}
            className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            {allSelected ? (
              <>
                <CheckSquare size={20} />
                <span className="text-sm font-medium">取消全选</span>
              </>
            ) : (
              <>
                <Square size={20} />
                <span className="text-sm font-medium">全选</span>
              </>
            )}
          </button>
          <span className="text-sm text-slate-600 dark:text-slate-400">
            已选择 <strong className="text-indigo-600 dark:text-indigo-400">{selectedCount}</strong> 项
          </span>
        </div>
        <div className="flex items-center gap-3">
          {onExport && (
            <Button
              onClick={handleExport}
              variant="secondary"
              icon={<Download size={16} />}
              className="rounded-xl"
            >
              导出
            </Button>
          )}
          <Button
            onClick={handleDelete}
            variant="secondary"
            icon={<Trash2 size={16} />}
            className="rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30"
          >
            删除
          </Button>
          <button
            onClick={onDeselectAll}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

