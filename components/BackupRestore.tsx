import React, { useState } from 'react';
import { Download, Upload, CheckCircle2, AlertCircle, FileText } from 'lucide-react';
import { ReviewEntry } from '../types';

interface BackupRestoreProps {
  entries: ReviewEntry[];
  onRestore: (entries: ReviewEntry[]) => void;
}

export const BackupRestore: React.FC<BackupRestoreProps> = ({ entries, onRestore }) => {
  const [restoreStatus, setRestoreStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [restoreMessage, setRestoreMessage] = useState('');

  const handleBackup = () => {
    try {
      const backupData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        entries: entries,
        count: entries.length,
      };

      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reflect_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setRestoreStatus('success');
      setRestoreMessage('备份成功！');
      setTimeout(() => {
        setRestoreStatus('idle');
        setRestoreMessage('');
      }, 3000);
    } catch (error) {
      setRestoreStatus('error');
      setRestoreMessage('备份失败，请重试');
      setTimeout(() => {
        setRestoreStatus('idle');
        setRestoreMessage('');
      }, 3000);
    }
  };

  const handleRestore = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const backupData = JSON.parse(content);

        // 验证备份文件格式
        if (!backupData.entries || !Array.isArray(backupData.entries)) {
          throw new Error('无效的备份文件格式');
        }

        // 确认恢复
        if (window.confirm(`确定要恢复 ${backupData.count || backupData.entries.length} 条记录吗？这将覆盖当前数据。`)) {
          onRestore(backupData.entries);
          setRestoreStatus('success');
          setRestoreMessage(`成功恢复 ${backupData.entries.length} 条记录`);
          setTimeout(() => {
            setRestoreStatus('idle');
            setRestoreMessage('');
          }, 3000);
        }
      } catch (error) {
        setRestoreStatus('error');
        setRestoreMessage('恢复失败：文件格式错误');
        setTimeout(() => {
          setRestoreStatus('idle');
          setRestoreMessage('');
        }, 3000);
      }
    };
    reader.readAsText(file);
    
    // 重置input，允许重复选择同一文件
    event.target.value = '';
  };

  return (
    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/50 dark:border-slate-700/50">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
        <FileText size={20} />
        数据备份与恢复
      </h3>

      <div className="space-y-4">
        {/* 备份 */}
        <div>
          <button
            onClick={handleBackup}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl font-medium transition-all active:scale-95 shadow-lg shadow-blue-500/25"
          >
            <Download size={18} />
            备份数据 ({entries.length} 条记录)
          </button>
        </div>

        {/* 恢复 */}
        <div>
          <label className="block">
            <input
              type="file"
              accept=".json"
              onChange={handleRestore}
              className="hidden"
            />
            <div className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-2xl font-medium transition-all active:scale-95 cursor-pointer">
              <Upload size={18} />
              恢复数据
            </div>
          </label>
        </div>

        {/* 状态提示 */}
        {restoreStatus !== 'idle' && (
          <div
            className={`flex items-center gap-2 p-3 rounded-xl ${
              restoreStatus === 'success'
                ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
            }`}
          >
            {restoreStatus === 'success' ? (
              <CheckCircle2 size={18} />
            ) : (
              <AlertCircle size={18} />
            )}
            <span className="text-sm">{restoreMessage}</span>
          </div>
        )}

        {/* 说明 */}
        <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
          <p>• 备份文件包含所有复盘记录</p>
          <p>• 恢复将覆盖当前数据，请谨慎操作</p>
          <p>• 建议定期备份重要数据</p>
        </div>
      </div>
    </div>
  );
};

