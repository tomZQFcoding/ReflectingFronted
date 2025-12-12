import React from 'react';
import { Info, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

interface AlertDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  onClose: () => void;
}

export const AlertDialog: React.FC<AlertDialogProps> = ({
  isOpen,
  title,
  message,
  type = 'info',
  onClose,
}) => {
  if (!isOpen) return null;

  const typeConfig = {
    success: {
      icon: CheckCircle2,
      iconColor: 'text-emerald-500',
      iconBg: 'bg-emerald-50 dark:bg-emerald-900/20',
      button: 'bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 shadow-emerald-500/25',
    },
    error: {
      icon: XCircle,
      iconColor: 'text-red-500',
      iconBg: 'bg-red-50 dark:bg-red-900/20',
      button: 'bg-red-500 hover:bg-red-600 active:bg-red-700 shadow-red-500/25',
    },
    warning: {
      icon: AlertTriangle,
      iconColor: 'text-amber-500',
      iconBg: 'bg-amber-50 dark:bg-amber-900/20',
      button: 'bg-amber-500 hover:bg-amber-600 active:bg-amber-700 shadow-amber-500/25',
    },
    info: {
      icon: Info,
      iconColor: 'text-blue-500',
      iconBg: 'bg-blue-50 dark:bg-blue-900/20',
      button: 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700 shadow-blue-500/25',
    },
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <div 
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] transition-opacity duration-300"
      onClick={onClose}
    >
      <div 
        className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-sm mx-4 transform transition-all duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-start gap-4 mb-4">
            <div className={`flex-shrink-0 w-12 h-12 rounded-full ${config.iconBg} flex items-center justify-center`}>
              <Icon size={24} className={config.iconColor} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                {title}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {message}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`w-full px-4 py-3 rounded-2xl text-white font-medium shadow-lg transition-all active:scale-95 ${config.button}`}
          >
            确定
          </button>
        </div>
      </div>
    </div>
  );
};

