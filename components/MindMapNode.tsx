import { useState } from 'react';
import { ChevronRight, User, Target, Layers, BookOpen, Lightbulb, Zap, Star, CheckCircle2, Circle, XCircle, Clock, PlayCircle } from 'lucide-react';

// Icon 映射表
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  User,
  Target,
  Layers,
  BookOpen,
  Lightbulb,
  Zap,
  Star,
};

// 节点状态类型
export type NodeStatus = 'pending' | 'active' | 'completed' | 'abandoned';

export interface MindMapNodeData {
  id: string;
  label: string;
  type: 'root' | 'primary-target' | 'primary' | 'leaf';
  icon?: string;
  desc?: string;
  status?: NodeStatus; // 节点状态
  progress?: number; // 进度百分比 (0-100)
  startDate?: string; // 开始日期
  endDate?: string; // 结束日期
  children?: MindMapNodeData[];
}

interface MindMapNodeProps {
  data: MindMapNodeData;
  isRoot?: boolean;
  selectedId?: string | null;
  currentId?: string | null; // 当前进行中的节点ID
  onSelect: (node: MindMapNodeData) => void;
  readonly?: boolean;
  onPath?: string[]; // 已走过的路径（从根节点到当前节点的路径）
}

export const MindMapNode: React.FC<MindMapNodeProps> = ({ 
  data, 
  isRoot = false, 
  selectedId, 
  currentId,
  onSelect,
  readonly = false,
  onPath = []
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const isSelected = selectedId === data.id;
  const isCurrent = currentId === data.id; // 当前进行中的节点
  const isOnPath = onPath.includes(data.id); // 是否在已走过的路径上
  const status = data.status || 'pending';

  // 获取图标组件 - 安全处理
  const getIconComponent = () => {
    if (!data.icon) return null;
    
    if (typeof data.icon === 'string') {
      const Icon = iconMap[data.icon];
      return Icon && typeof Icon === 'function' ? Icon : null;
    }
    
    // 如果是函数组件或类组件
    if (typeof data.icon === 'function') {
      return data.icon;
    }
    
    return null;
  };

  const IconComponent = getIconComponent();

  // 获取状态图标
  const getStatusIcon = () => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'active':
        return <PlayCircle className="w-4 h-4 text-blue-500 animate-pulse" />;
      case 'abandoned':
        return <XCircle className="w-4 h-4 text-slate-400" />;
      default:
        return <Circle className="w-4 h-4 text-slate-300" />;
    }
  };

  // 获取状态样式
  const getStatusStyles = () => {
    if (isCurrent) {
      // 当前节点：特殊高亮，脉冲动画 - 使用蓝色替代紫色
      return 'ring-4 ring-blue-400/60 dark:ring-blue-500/60 shadow-2xl scale-110 animate-pulse-ring bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white';
    }
    
    switch (status) {
      case 'completed':
        return isOnPath 
          ? 'bg-emerald-50 dark:bg-emerald-900/30 border-2 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300'
          : 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400';
      case 'active':
        return 'bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300';
      case 'abandoned':
        return 'bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-400 dark:text-slate-500 line-through opacity-60';
      default:
        return '';
    }
  };

  const getNodeStyles = (type: string) => {
    const baseStyles = getStatusStyles();
    
    // 如果节点在路径上但不是当前节点，添加路径指示 - 使用蓝色替代紫色
    const pathIndicator = isOnPath && !isCurrent ? 'before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-blue-400 dark:before:bg-blue-500 before:rounded-l-2xl' : '';
    
    switch (type) {
      case 'root': 
        return isCurrent
          ? `bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 text-white shadow-2xl scale-110 ring-4 ring-blue-300/50 dark:ring-blue-500/50 ${pathIndicator}`
          : `bg-slate-900 dark:bg-slate-800 text-white shadow-xl scale-110 ring-4 ring-slate-100 dark:ring-slate-700 ${pathIndicator}`;
      case 'primary-target': 
        return isCurrent
          ? `bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white shadow-2xl ring-4 ring-blue-300/50 dark:ring-blue-500/50 ${pathIndicator}`
          : `bg-blue-600 dark:bg-blue-700 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900 ring-2 ring-blue-100 dark:ring-blue-800 ${baseStyles} ${pathIndicator}`;
      case 'primary': 
        return `bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 shadow-sm hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md ${baseStyles} ${pathIndicator}`;
      case 'leaf': 
        return `bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 text-xs py-1.5 px-3 border border-transparent hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm ${baseStyles} ${pathIndicator}`;
      default: 
        return `bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 ${baseStyles} ${pathIndicator}`;
    }
  };

  return (
    <div className="flex items-center animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col items-start relative z-10 group">
        <div 
          onClick={(e) => {
            e.stopPropagation();
            if (!readonly) {
              onSelect(data);
            }
          }}
          className={`
            relative px-5 py-3 rounded-2xl font-medium text-sm transition-all duration-300
            flex items-center gap-2 whitespace-nowrap select-none
            ${getNodeStyles(data.type)}
            ${readonly ? 'cursor-default' : 'cursor-pointer active:scale-95'}
            ${isSelected && !readonly && !isCurrent ? 'ring-4 ring-blue-400/50 dark:ring-blue-500/50 scale-105 z-20 shadow-xl' : !isRoot && !readonly && !isCurrent && 'hover:-translate-y-0.5'}
          `}
        >
          {/* 状态图标 */}
          {!isRoot && getStatusIcon()}
          
          {IconComponent && typeof IconComponent === 'function' && (
            <IconComponent className="w-4 h-4" />
          )}
          {data.label}
          
          {/* 当前节点指示器 */}
          {isCurrent && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-400 rounded-full animate-ping"></div>
          )}
          
          {/* 进度条（如果有进度） */}
          {isCurrent && data.progress !== undefined && data.progress > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-200 dark:bg-blue-900 rounded-b-2xl overflow-hidden">
              <div 
                className="h-full bg-blue-500 transition-all duration-500"
                style={{ width: `${data.progress}%` }}
              ></div>
            </div>
          )}
          
          {data.children && data.children.length > 0 && (
            <div 
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className={`
                w-5 h-5 rounded-full flex items-center justify-center text-[10px] ml-1 
                transition-transform duration-300 hover:bg-black/10 dark:hover:bg-white/10
                ${isExpanded ? 'rotate-90' : ''} 
                ${data.type.includes('primary') ? 'bg-white/20' : 'bg-slate-200 dark:bg-slate-700'}
              `}
            >
              <ChevronRight className="w-3 h-3" />
            </div>
          )}
        </div>
        {data.desc && (
          <div className="mt-1.5 ml-2 text-[10px] text-slate-400 dark:text-slate-500 font-medium max-w-[150px] leading-tight">
            {data.desc}
          </div>
        )}
      </div>
      {data.children && isExpanded && (
        <div className="flex items-center">
          <div className={`w-8 h-px transition-colors ${isOnPath || isCurrent ? 'bg-blue-300 dark:bg-blue-600' : 'bg-slate-300 dark:bg-slate-600/80'}`}></div>
          <div className="flex flex-col gap-6 relative py-2">
            <div className={`absolute left-0 top-0 bottom-0 w-px transition-colors ${isOnPath || isCurrent ? 'bg-blue-300 dark:bg-blue-600' : 'bg-slate-300 dark:bg-slate-600/80'} my-auto h-[calc(100%-2rem)] translate-y-4`}></div>
            {data.children.map((child, index) => {
              const childIsOnPath = onPath.includes(child.id);
              const childIsCurrent = currentId === child.id;
              return (
                <div key={child.id || index} className="flex items-center relative pl-0">
                  <div className={`w-6 h-px transition-colors ${childIsOnPath || childIsCurrent ? 'bg-blue-300 dark:bg-blue-600' : 'bg-slate-300 dark:bg-slate-600/80'} absolute -left-6 top-1/2 -translate-y-1/2`}>
                    <div className={`absolute -left-[1px] top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full transition-colors ${childIsCurrent ? 'bg-blue-400 dark:bg-blue-500 animate-pulse' : childIsOnPath ? 'bg-blue-300 dark:bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'}`}></div>
                  </div>
                  <MindMapNode 
                    data={child} 
                    selectedId={selectedId} 
                    currentId={currentId}
                    onSelect={onSelect} 
                    readonly={readonly}
                    onPath={onPath}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

