import { useState, useEffect, useMemo } from 'react';
import { Layout, Edit3, X, CornerDownRight, Trash2, User, Target, Layers, BookOpen, Lightbulb, Zap, Star, Eye, Presentation, Maximize2, Minimize2, PlayCircle, CheckCircle2, Circle, XCircle, Clock, MapPin, Plus, Folder, FolderOpen, ChevronRight } from 'lucide-react';
import { MindMapNode, MindMapNodeData, NodeStatus } from './MindMapNode';
import { mindMapApi } from '../services/mindMapApi';
import { mindMapCategoryApi, MindMapCategoryVO } from '../services/mindMapCategoryApi';
import { AlertDialog } from './AlertDialog';
import { ConfirmDialog } from './ConfirmDialog';

// 模式类型
type MindMapMode = 'view' | 'edit' | 'presentation';

// Icon 映射表（与 MindMapNode 中保持一致）
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  User,
  Target,
  Layers,
  BookOpen,
  Lightbulb,
  Zap,
  Star,
};

const initialMapData: MindMapNodeData = {
  id: "root-1",
  label: "我的目标",
  type: "root",
  icon: "User",
  children: [
    {
      id: "node-2",
      label: "核心目标",
      type: "primary-target",
      icon: "Target",
      desc: "最重要的目标",
      children: [
        { 
          id: "node-3",
          label: "技能提升", 
          type: "primary", 
          children: [
            { id: "node-4", label: "学习新技术", type: "leaf" },
            { id: "node-5", label: "实践项目", type: "leaf" },
          ] 
        },
      ]
    },
    {
      id: "node-6",
      label: "其他目标",
      type: "primary",
      icon: "Layers",
      desc: "次要目标",
      children: [
        { id: "node-7", label: "保持健康", type: "leaf" },
      ]
    }
  ]
};

// 清理数据中的 icon，确保都是字符串格式
const cleanMapData = (data: MindMapNodeData | null): MindMapNodeData | null => {
  if (!data || typeof data !== 'object') return data;
  
  const cleaned = { ...data };
  
  // 如果 icon 是函数（组件引用），转换为字符串
  if (cleaned.icon) {
    if (typeof cleaned.icon === 'function') {
      // 尝试从组件名推断
      const iconName = (cleaned.icon as any).name || (cleaned.icon as any).displayName;
      cleaned.icon = iconMap[iconName] ? iconName : undefined;
    } else if (typeof cleaned.icon !== 'string') {
      // 如果不是字符串也不是函数，设为 undefined
      cleaned.icon = undefined;
    }
    // 如果已经是字符串，保持不变
  }
  
  // 递归清理子节点
  if (cleaned.children && Array.isArray(cleaned.children)) {
    cleaned.children = cleaned.children.map(child => cleanMapData(child)!).filter(Boolean);
  }
  
  return cleaned;
};

interface MindMapProps {
  title?: string;
  description?: string;
  storageKey?: string;
}

export const MindMap: React.FC<MindMapProps> = ({ 
  title = "思维导图",
  description = "点击节点进行编辑、添加或删除",
  storageKey = 'reflect_ai_mindmap'
}) => {
  const [mode, setMode] = useState<MindMapMode>('view');
  const [mapDataRaw, setMapDataRaw] = useState<MindMapNodeData>(initialMapData);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // 分类相关状态
  const [currentCategoryId, setCurrentCategoryId] = useState<number | null>(null);
  const [categories, setCategories] = useState<MindMapCategoryVO[]>([]);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [alertDialog, setAlertDialog] = useState<{isOpen: boolean, title: string, message: string, type?: 'success' | 'error' | 'warning' | 'info'}>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
  });
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type?: 'danger' | 'warning' | 'info';
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'warning',
    onConfirm: () => {},
  });
  
  // 使用 useMemo 确保数据清理只在必要时执行
  const mapData = useMemo(() => cleanMapData(mapDataRaw) || initialMapData, [mapDataRaw]);
  
  // 加载分类列表
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await mindMapCategoryApi.getMyCategories();
        setCategories(cats);
        if (cats.length > 0 && (!currentCategoryId || !cats.find(c => c.id === currentCategoryId))) {
          setCurrentCategoryId(cats[0].id);
        } else if (cats.length === 0) {
          // 如果没有分类，自动创建默认分类
          try {
            const defaultCategoryId = await mindMapCategoryApi.addCategory({
              name: '默认分类',
              description: '',
            });
            const updatedCats = await mindMapCategoryApi.getMyCategories();
            setCategories(updatedCats);
            setCurrentCategoryId(defaultCategoryId);
          } catch (createError) {
            console.error('Failed to create default category:', createError);
          }
        }
      } catch (error) {
        console.error('Failed to load categories:', error);
        // 如果是500错误，可能是表不存在，尝试创建默认分类
        if (error instanceof Error && error.message.includes('500')) {
          try {
            const defaultCategoryId = await mindMapCategoryApi.addCategory({
              name: '默认分类',
              description: '',
            });
            const updatedCats = await mindMapCategoryApi.getMyCategories();
            setCategories(updatedCats);
            setCurrentCategoryId(defaultCategoryId);
          } catch (createError) {
            console.error('Failed to create default category after error:', createError);
          }
        }
      }
    };
    loadCategories();
  }, []);
  
  // 从后端加载数据（根据当前分类）
  useEffect(() => {
    const loadMindMap = async () => {
      try {
        setIsLoading(true);
        const data = await mindMapApi.getMyMindMap(currentCategoryId || undefined);
        setMapDataRaw(data);
      } catch (error) {
        console.error('Failed to load mind map:', error);
        // 使用默认数据
        setMapDataRaw(initialMapData);
      } finally {
        setIsLoading(false);
      }
    };
    if (currentCategoryId !== null) {
    loadMindMap();
    }
  }, [currentCategoryId]);

  // 保存数据到后端
  const saveMindMap = async (newData: MindMapNodeData) => {
    try {
      setIsSaving(true);
      await mindMapApi.updateMyMindMap(newData, title, currentCategoryId || undefined);
      setMapDataRaw(cleanMapData(newData)!);
    } catch (error) {
      console.error('Failed to save mind map:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  // 创建新分类
  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      setAlertDialog({
        isOpen: true,
        title: '输入错误',
        message: '请输入分类名称',
        type: 'warning',
      });
      return;
    }
    if (categories.find(c => c.name === newCategoryName.trim())) {
      setAlertDialog({
        isOpen: true,
        title: '分类已存在',
        message: '该分类已存在',
        type: 'warning',
      });
      return;
    }
    try {
      const categoryId = await mindMapCategoryApi.addCategory({
        name: newCategoryName.trim(),
        description: '',
      });
      // 重新加载分类列表
      const cats = await mindMapCategoryApi.getMyCategories();
      setCategories(cats);
      setCurrentCategoryId(categoryId);
      setNewCategoryName('');
      setShowCategoryManager(false);
    } catch (error) {
      console.error('Failed to create category:', error);
      setAlertDialog({
        isOpen: true,
        title: '创建失败',
        message: '创建分类失败',
        type: 'error',
      });
    }
  };

  // 删除分类
  const handleDeleteCategory = async (categoryId: number) => {
    if (categories.length <= 1) {
      setAlertDialog({
        isOpen: true,
        title: '无法删除',
        message: '至少需要保留一个分类',
        type: 'warning',
      });
      return;
    }
    
    setConfirmDialog({
      isOpen: true,
      title: '删除分类',
      message: '确定要删除此分类吗？删除后，该分类下的思维导图数据将保留，但分类关联会被移除。',
      type: 'danger',
      onConfirm: async () => {
        try {
          // 删除分类（外键会自动将思维导图的categoryId设为NULL）
          await mindMapCategoryApi.deleteCategory(categoryId);
          
          // 重新加载分类列表
          const cats = await mindMapCategoryApi.getMyCategories();
          setCategories(cats);
          // 如果删除的是当前分类，切换到第一个分类
          if (categoryId === currentCategoryId && cats.length > 0) {
            setCurrentCategoryId(cats[0].id);
          }
          setConfirmDialog({ ...confirmDialog, isOpen: false });
        } catch (error) {
          console.error('Failed to delete category:', error);
          setAlertDialog({
            isOpen: true,
            title: '删除失败',
            message: '删除分类失败',
            type: 'error',
          });
          setConfirmDialog({ ...confirmDialog, isOpen: false });
        }
      },
    });
  };
  
  const setMapData = (newData: MindMapNodeData) => {
    const cleaned = cleanMapData(newData)!;
    setMapDataRaw(cleaned);
    // 异步保存到后端（不阻塞UI）
    saveMindMap(cleaned).catch(err => {
      console.error('Background save failed:', err);
    });
  };

  const [selectedNode, setSelectedNode] = useState<MindMapNodeData | null>(null);
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null); // 当前进行中的节点ID
  const [editLabel, setEditLabel] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editStatus, setEditStatus] = useState<NodeStatus>('pending');
  const [editProgress, setEditProgress] = useState<number>(0);

  // 计算已走过的路径（从根节点到当前节点的路径）
  const getPathToNode = (nodeId: string | null, tree: MindMapNodeData, path: string[] = []): string[] | null => {
    if (!nodeId) return null;
    
    const currentPath = [...path, tree.id];
    
    if (tree.id === nodeId) {
      return currentPath;
    }
    
    if (tree.children) {
      for (const child of tree.children) {
        const result = getPathToNode(nodeId, child, currentPath);
        if (result) return result;
      }
    }
    
    return null;
  };

  const onPath = useMemo(() => {
    if (!currentNodeId) return [];
    return getPathToNode(currentNodeId, mapData) || [];
  }, [currentNodeId, mapData]);

  const updateTree = (node: MindMapNodeData, nodeId: string, updateFn: (node: MindMapNodeData) => MindMapNodeData): MindMapNodeData | null => {
    if (node.id === nodeId) {
      return updateFn(node);
    }
    if (node.children) {
      const updatedChildren = node.children
        .map(child => updateTree(child, nodeId, updateFn))
        .filter((child): child is MindMapNodeData => child !== null);
      return {
        ...node,
        children: updatedChildren
      };
    }
    return node;
  };

  const handleAddChild = () => {
    if (!selectedNode) return;
    const newNode: MindMapNodeData = {
      id: `node-${Date.now()}`,
      label: "新节点",
      type: "leaf",
      desc: "",
      children: []
    };
    
    const newMap = updateTree(mapData, selectedNode.id, (node) => ({
      ...node,
      children: [...(node.children || []), newNode]
    }));
    
    if (newMap) {
      setMapData(newMap);
      setSelectedNode(newNode);
      setEditLabel(newNode.label);
      setEditDesc(newNode.desc || "");
    }
  };

  const handleDeleteNode = () => {
    if (!selectedNode || selectedNode.type === 'root') return;
    
    setConfirmDialog({
      isOpen: true,
      title: '删除节点',
      message: '确定要删除此节点及其所有子节点吗？此操作无法撤销。',
      type: 'danger',
      onConfirm: () => {
        const deleteFromTree = (node: MindMapNodeData, targetId: string): MindMapNodeData => {
          if (!node.children) return node;
          return {
            ...node,
            children: node.children
              .filter(child => child.id !== targetId)
              .map(child => deleteFromTree(child, targetId))
          };
        };
        
        const newMap = deleteFromTree(mapData, selectedNode.id);
        setMapData(newMap);
        setSelectedNode(null);
        setConfirmDialog({ ...confirmDialog, isOpen: false });
      },
    });
  };

  const handleUpdateNode = () => {
    if (!selectedNode) return;
    const newMap = updateTree(mapData, selectedNode.id, (node) => {
      const updated = {
        ...node,
        label: editLabel,
        desc: editDesc,
        status: editStatus,
        progress: editProgress
      };
      
      // 如果设置为active，清除其他节点的active状态
      if (editStatus === 'active') {
        setCurrentNodeId(node.id);
      } else if (currentNodeId === node.id && editStatus !== 'active') {
        setCurrentNodeId(null);
      }
      
      return updated;
    });
    
    if (newMap) {
      setMapData(newMap);
      setSelectedNode({ ...selectedNode, label: editLabel, desc: editDesc, status: editStatus, progress: editProgress });
    }
  };

  const handleSetCurrent = () => {
    if (!selectedNode) return;
    setCurrentNodeId(selectedNode.id);
    setEditStatus('active');
    handleUpdateNode();
  };

  useEffect(() => {
    if (selectedNode) {
      setEditLabel(selectedNode.label);
      setEditDesc(selectedNode.desc || "");
      setEditStatus(selectedNode.status || 'pending');
      setEditProgress(selectedNode.progress || 0);
    }
  }, [selectedNode]);

  // 初始化时查找当前节点
  useEffect(() => {
    const findCurrentNode = (node: MindMapNodeData): string | null => {
      if (node.status === 'active') {
        return node.id;
      }
      if (node.children) {
        for (const child of node.children) {
          const result = findCurrentNode(child);
          if (result) return result;
        }
      }
      return null;
    };
    
    const current = findCurrentNode(mapData);
    setCurrentNodeId(current);
  }, [mapData]);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
            <div className="animate-spin"><Layout size={20} /></div>
            <span className="font-medium">加载中...</span>
          </div>
        </div>
      </div>
    );
  }

  // 演示模式全屏视图
  if (mode === 'presentation') {
    return (
      <div className="fixed inset-0 z-50 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-black dark:via-slate-900 dark:to-black flex flex-col">
        {/* 顶部控制栏 */}
        <div className="absolute top-0 left-0 right-0 z-10 p-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="h-1 w-1 rounded-full bg-white/30"></div>
            <div className="h-1 w-1 rounded-full bg-white/30"></div>
            <div className="h-1 w-1 rounded-full bg-white/30"></div>
          </div>
          <button
            onClick={() => setMode('view')}
            className="bg-white/10 backdrop-blur-2xl text-white px-5 py-2.5 rounded-2xl text-sm font-semibold hover:bg-white/20 transition-all flex items-center gap-2 border border-white/20 shadow-lg"
          >
            <Minimize2 size={16} />
            退出演示
          </button>
        </div>
        
        {/* 主内容区 */}
        <div className="flex-1 overflow-auto flex items-center justify-center p-20">
          <div className="min-w-max transform transition-all duration-500">
            <MindMapNode 
              data={mapData} 
              isRoot={true} 
              selectedId={null} 
              onSelect={() => {}} 
              readonly={true}
            />
          </div>
        </div>
        
        {/* 底部指示器 */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
          <div className="bg-white/10 backdrop-blur-2xl px-4 py-2 rounded-full border border-white/20 flex items-center gap-2">
            <Presentation size={14} className="text-white/80" />
            <span className="text-white/80 text-xs font-medium">演示模式</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col animate-in fade-in pb-20 md:pb-0 relative">
      <div className="mb-6 flex flex-col gap-4">
        <div className="flex justify-between items-center px-1">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">{title}</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              {mode === 'view' ? '浏览思维导图' : mode === 'edit' ? '编辑思维导图' : '演示模式'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isSaving && (
              <div className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-2">
                <div className="animate-spin"><Layout className="w-3 h-3" /></div>
                保存中...
              </div>
            )}
          </div>
        </div>

        {/* iOS风格分类导航栏 */}
        <div className="flex items-center gap-3 px-1">
          <div className="flex-1 overflow-x-auto no-scrollbar">
            <div className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800/50 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm min-w-max backdrop-blur-sm">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCurrentCategoryId(cat.id)}
                  className={`
                    relative px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 whitespace-nowrap
                    ${cat.id === currentCategoryId
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-lg scale-[1.02]'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 active:scale-95'
                    }
                  `}
                >
                  <span className="relative z-10">{cat.name}</span>
                  {cat.id === currentCategoryId && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-10 h-1 bg-indigo-500 dark:bg-indigo-400 rounded-full"></div>
                  )}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={() => setShowCategoryManager(!showCategoryManager)}
            className="px-3 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl text-sm font-medium hover:bg-indigo-100 dark:hover:bg-indigo-900/50 active:scale-95 transition-all duration-200 flex items-center gap-2 border border-indigo-200 dark:border-indigo-800 shrink-0 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            管理
          </button>
        </div>

        {/* 分类管理面板 */}
        {showCategoryManager && (
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-lg">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">分类管理</h3>
              <button
                onClick={() => setShowCategoryManager(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              {/* 创建新分类 */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="输入新分类名称"
                  className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-500 dark:focus:border-indigo-400 outline-none"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleCreateCategory();
                    }
                  }}
                />
                <button
                  onClick={handleCreateCategory}
                  className="px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
                >
                  创建
                </button>
              </div>
              {/* 分类列表 */}
              <div className="space-y-2">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-900 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <FolderOpen className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {cat.name}
                        {cat.id === currentCategoryId && (
                          <span className="ml-2 text-xs text-indigo-600 dark:text-indigo-400">(当前)</span>
                        )}
                      </span>
                    </div>
                    {categories.length > 1 && (
                      <button
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors"
                        title="删除分类"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* iOS风格的模式切换器 */}
        <div className="flex items-center gap-3 px-1">
          <div className="inline-flex bg-slate-100 dark:bg-slate-800/50 p-1 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <button
              onClick={() => setMode('view')}
              className={`
                px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2
                ${mode === 'view' 
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                }
              `}
            >
              <Eye size={14} className={mode === 'view' ? 'text-indigo-500' : 'text-slate-400'} />
              <span>查看</span>
            </button>
            <button
              onClick={() => setMode('edit')}
              className={`
                px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2
                ${mode === 'edit' 
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                }
              `}
            >
              <Edit3 size={14} className={mode === 'edit' ? 'text-indigo-500' : 'text-slate-400'} />
              <span>编辑</span>
            </button>
            <button
              onClick={() => setMode('presentation')}
              className={`
                px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2
                ${mode === 'presentation' 
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                }
              `}
            >
              <Presentation size={14} className={mode === 'presentation' ? 'text-indigo-500' : 'text-slate-400'} />
              <span>演示</span>
            </button>
          </div>
        </div>
      </div>
      
      <div 
        className={`flex-1 overflow-auto bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-inner relative flex items-center justify-start p-10 min-h-[500px] ${mode === 'view' ? 'cursor-default' : ''}`}
        onClick={() => mode === 'edit' && setSelectedNode(null)} 
      >
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(#444 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
        <div className="min-w-max transform transition-transform">
          <MindMapNode 
            data={mapData} 
            isRoot={true} 
            selectedId={mode === 'edit' ? selectedNode?.id : null} 
            currentId={currentNodeId}
            onSelect={mode === 'edit' ? setSelectedNode : () => {}} 
            readonly={mode === 'view'}
            onPath={onPath}
          />
        </div>
      </div>

      {selectedNode && mode === 'edit' && (
        <div className="absolute bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-slate-200 dark:border-slate-700 shadow-2xl rounded-2xl p-4 animate-in slide-in-from-bottom-4 duration-300 z-30">
          <div className="flex justify-between items-start mb-3 border-b border-slate-100 dark:border-slate-700 pb-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-indigo-500" /> 编辑节点
            </h3>
            <button 
              onClick={() => setSelectedNode(null)} 
              className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-3">
            <div className="flex gap-2">
              <input 
                value={editLabel}
                onChange={(e) => setEditLabel(e.target.value)}
                placeholder="节点名称"
                className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-bold text-slate-900 dark:text-slate-100 focus:border-indigo-500 dark:focus:border-indigo-400 outline-none transition-colors"
              />
              <button 
                onClick={handleUpdateNode}
                className="bg-indigo-600 dark:bg-indigo-500 text-white px-3 py-2 rounded-lg text-xs font-bold hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
              >
                保存
              </button>
            </div>
            <input 
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              placeholder="简短描述 (可选)"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-600 dark:text-slate-400 focus:border-indigo-500 dark:focus:border-indigo-400 outline-none transition-colors"
            />
            
            {/* 状态选择 */}
            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={() => setEditStatus('pending')}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1 ${
                  editStatus === 'pending'
                    ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-2 border-slate-400 dark:border-slate-500'
                    : 'bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Circle size={12} />
                未开始
              </button>
              <button
                onClick={() => {
                  setEditStatus('active');
                  setCurrentNodeId(selectedNode.id);
                }}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1 ${
                  editStatus === 'active'
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-2 border-blue-400 dark:border-blue-600'
                    : 'bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <PlayCircle size={12} />
                进行中
              </button>
              <button
                onClick={() => {
                  setEditStatus('completed');
                  if (currentNodeId === selectedNode.id) {
                    setCurrentNodeId(null);
                  }
                }}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1 ${
                  editStatus === 'completed'
                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-2 border-emerald-400 dark:border-emerald-600'
                    : 'bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <CheckCircle2 size={12} />
                已完成
              </button>
              <button
                onClick={() => {
                  setEditStatus('abandoned');
                  if (currentNodeId === selectedNode.id) {
                    setCurrentNodeId(null);
                  }
                }}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1 ${
                  editStatus === 'abandoned'
                    ? 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border-2 border-slate-400 dark:border-slate-600'
                    : 'bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <XCircle size={12} />
                已放弃
              </button>
            </div>

            {/* 进度条（仅在active状态时显示） */}
            {editStatus === 'active' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">进度</span>
                  <span className="text-blue-600 dark:text-blue-400 font-bold">{editProgress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500 rounded-full"
                    style={{ width: `${editProgress}%` }}
                  ></div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={editProgress}
                  onChange={(e) => setEditProgress(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            )}
            
            <div className="flex gap-2 pt-2">
              <button 
                onClick={handleAddChild}
                className="flex-1 flex items-center justify-center gap-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 py-2 rounded-lg text-xs font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
              >
                <CornerDownRight className="w-3 h-3" /> 添加子节点
              </button>
              {selectedNode.type !== 'root' && (
                <button 
                  onClick={handleDeleteNode}
                  className="flex-1 flex items-center justify-center gap-2 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 py-2 rounded-lg text-xs font-bold hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors"
                >
                  <Trash2 className="w-3 h-3" /> 删除节点
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* 当前节点指示器（浮动提示） */}
      {currentNodeId && mode !== 'presentation' && (
        <div className="fixed bottom-24 md:bottom-20 left-1/2 -translate-x-1/2 z-40 animate-in slide-in-from-bottom-4 duration-300">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 border border-blue-400/50 backdrop-blur-xl">
            <MapPin size={16} className="animate-pulse" />
            <span className="text-sm font-semibold">当前进行中</span>
            <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
          </div>
        </div>
      )}
      
      <style>{`
        @keyframes pulse-ring {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
          }
          50% {
            box-shadow: 0 0 0 8px rgba(59, 130, 246, 0);
          }
        }
        .animate-pulse-ring {
          animation: pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>

      {/* 提示弹窗 */}
      <AlertDialog
        isOpen={alertDialog.isOpen}
        title={alertDialog.title}
        message={alertDialog.message}
        type={alertDialog.type}
        onClose={() => setAlertDialog({ ...alertDialog, isOpen: false })}
      />

      {/* 确认对话框 */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
      />
    </div>
  );
};

