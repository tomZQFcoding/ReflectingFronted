import React, { useState, useEffect } from 'react';
import { ChevronLeft, Shield, Users, Settings, Database, Search, Trash2, RefreshCw, AlertTriangle, CheckCircle2, Edit3, UserCog, X, TrendingUp, BarChart3, UsersRound, Flame } from 'lucide-react';
import { UserRole } from '../types';
import { LoginUserVO, userApi, adminApi, PlatformStats, AdminTrends, WeeklyRetentionItem, ActivityHeatmap } from '../services/userApi';
import { Button } from './Button';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, BarChart, Bar } from 'recharts';
import type { HeatmapCell } from '../services/userApi';

type AdminSubView = 'overview' | 'users' | 'system' | 'data';

function ActivityHeatmapGrid({ cells }: { cells: HeatmapCell[] }) {
  const maxCount = Math.max(1, ...cells.map((c) => c.count));
  const dayLabels = ['日', '一', '二', '三', '四', '五', '六'];
  const grid: number[][] = Array.from({ length: 24 }, () => Array(7).fill(0));
  cells.forEach((c) => {
    grid[c.hour][c.dayOfWeek] = c.count;
  });
  return (
    <div className="overflow-x-auto">
      <div className="inline-flex flex-col gap-0.5 min-w-0">
        <div className="flex gap-0.5 mb-1 pl-10">
          {dayLabels.map((d) => (
            <div key={d} className="w-6 h-4 flex items-center justify-center text-[10px] text-slate-500 dark:text-slate-400">
              {d}
            </div>
          ))}
        </div>
        {grid.map((row, hour) => (
          <div key={hour} className="flex gap-0.5 items-center">
            <div className="w-8 text-[10px] text-slate-500 dark:text-slate-400 text-right pr-1">{hour}时</div>
            <div className="flex gap-0.5">
              {row.map((count, day) => {
                const intensity = maxCount > 0 ? count / maxCount : 0;
                const bg = intensity === 0
                  ? 'bg-slate-100 dark:bg-slate-700/50'
                  : intensity < 0.25
                    ? 'bg-emerald-200 dark:bg-emerald-800/60'
                    : intensity < 0.5
                      ? 'bg-emerald-400 dark:bg-emerald-700'
                      : intensity < 0.75
                        ? 'bg-emerald-500 dark:bg-emerald-600'
                        : 'bg-emerald-600 dark:bg-emerald-500';
                return (
                  <div
                    key={day}
                    className={`w-6 h-4 rounded-sm ${bg} transition-colors`}
                    title={`周${dayLabels[day]} ${hour}时: ${count} 次`}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface AdminPanelProps {
  currentUser: LoginUserVO | null;
  onBack: () => void;
  triggerToast?: (msg: string, type?: 'success' | 'error') => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ currentUser, onBack, triggerToast }) => {
  const isAdmin = currentUser?.userRole?.toLowerCase() === UserRole.ADMIN;
  const [subView, setSubView] = useState<AdminSubView>('overview');
  
  // 用户管理
  const [users, setUsers] = useState<LoginUserVO[]>([]);
  const [usersTotal, setUsersTotal] = useState(0);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [userSearch, setUserSearch] = useState('');
  const [userPage, setUserPage] = useState(1);

  // 系统设置（仅前端存储，影响当前浏览器体验）
  const [confirmOnDelete, setConfirmOnDelete] = useState<boolean>(() => {
    const stored = localStorage.getItem('admin_confirm_on_delete');
    return stored ? stored === 'true' : true;
  });
  const [showDangerTips, setShowDangerTips] = useState<boolean>(() => {
    const stored = localStorage.getItem('admin_show_danger_tips');
    return stored ? stored === 'true' : true;
  });
  const [exportIncludeAi, setExportIncludeAi] = useState<boolean>(() => {
    const stored = localStorage.getItem('admin_export_include_ai');
    return stored ? stored === 'true' : true;
  });
  const [listPageSize, setListPageSize] = useState<number>(() => {
    const stored = localStorage.getItem('admin_list_page_size');
    const n = stored ? parseInt(stored, 10) : 10;
    return [10, 20, 50].includes(n) ? n : 10;
  });
  const [defaultReminderTime, setDefaultReminderTime] = useState<string>(() => {
    return localStorage.getItem('admin_default_reminder_time') || '20:00';
  });
  const [compactTable, setCompactTable] = useState<boolean>(() => {
    const stored = localStorage.getItem('admin_compact_table');
    return stored ? stored === 'true' : false;
  });
  const [defaultTheme, setDefaultTheme] = useState<string>(() => {
    return localStorage.getItem('admin_default_theme') || 'system';
  });
  const [statsAutoRefresh, setStatsAutoRefresh] = useState<number>(() => {
    const stored = localStorage.getItem('admin_stats_auto_refresh');
    const n = stored ? parseInt(stored, 10) : 0;
    return [0, 30, 60, 120].includes(n) ? n : 0;
  });
  const [userListSort, setUserListSort] = useState<string>(() => {
    return localStorage.getItem('admin_user_list_sort') || 'desc';
  });
  const [exportMaxCount, setExportMaxCount] = useState<number>(() => {
    const stored = localStorage.getItem('admin_export_max_count');
    const n = stored ? parseInt(stored, 10) : 0;
    return [0, 100, 500, 1000, 5000].includes(n) ? n : 0;
  });
  const [showLastRefreshTime, setShowLastRefreshTime] = useState<boolean>(() => {
    const stored = localStorage.getItem('admin_show_last_refresh_time');
    return stored ? stored === 'true' : true;
  });

  const pageSize = listPageSize;

  useEffect(() => {
    localStorage.setItem('admin_confirm_on_delete', String(confirmOnDelete));
  }, [confirmOnDelete]);
  useEffect(() => {
    localStorage.setItem('admin_show_danger_tips', String(showDangerTips));
  }, [showDangerTips]);
  useEffect(() => {
    localStorage.setItem('admin_export_include_ai', String(exportIncludeAi));
  }, [exportIncludeAi]);
  useEffect(() => {
    localStorage.setItem('admin_list_page_size', String(listPageSize));
  }, [listPageSize]);
  useEffect(() => {
    localStorage.setItem('admin_default_reminder_time', defaultReminderTime);
  }, [defaultReminderTime]);
  useEffect(() => {
    localStorage.setItem('admin_compact_table', String(compactTable));
  }, [compactTable]);
  useEffect(() => {
    localStorage.setItem('admin_default_theme', defaultTheme);
  }, [defaultTheme]);
  useEffect(() => {
    localStorage.setItem('admin_stats_auto_refresh', String(statsAutoRefresh));
  }, [statsAutoRefresh]);
  useEffect(() => {
    localStorage.setItem('admin_user_list_sort', userListSort);
  }, [userListSort]);
  useEffect(() => {
    localStorage.setItem('admin_export_max_count', String(exportMaxCount));
  }, [exportMaxCount]);
  useEffect(() => {
    localStorage.setItem('admin_show_last_refresh_time', String(showLastRefreshTime));
  }, [showLastRefreshTime]);

  // 数据概览
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [statsLastRefresh, setStatsLastRefresh] = useState<Date | null>(null);
  const [trends, setTrends] = useState<AdminTrends | null>(null);
  const [trendsLoading, setTrendsLoading] = useState(false);
  const [trendDays, setTrendDays] = useState(14);
  const [retention, setRetention] = useState<WeeklyRetentionItem[] | null>(null);
  const [retentionLoading, setRetentionLoading] = useState(false);
  const [retentionWeeks, setRetentionWeeks] = useState(8);
  const [heatmap, setHeatmap] = useState<ActivityHeatmap | null>(null);
  const [heatmapLoading, setHeatmapLoading] = useState(false);

  const loadUsers = async () => {
    setUsersError(null);
    setUsersLoading(true);
    try {
      const res = await userApi.listUsers({
        current: userPage,
        pageSize,
        userName: userSearch || undefined,
        sortOrder: userListSort,
      });
      setUsers(res.records || []);
      setUsersTotal(res.total ?? 0);
    } catch (err: any) {
      setUsersError(err.message || '加载用户列表失败');
      setUsers([]);
      setUsersTotal(0);
    } finally {
      setUsersLoading(false);
    }
  };

  const loadStats = async () => {
    setStatsError(null);
    setStatsLoading(true);
    try {
      const data = await adminApi.getPlatformStats();
      setStats(data);
      setStatsLastRefresh(new Date());
    } catch (err: any) {
      setStatsError(err.message || '加载数据概览失败');
      setStats(null);
    } finally {
      setStatsLoading(false);
    }
  };

  const loadTrends = async () => {
    setTrendsLoading(true);
    try {
      const data = await adminApi.getTrends(trendDays);
      setTrends(data);
    } catch (_) {
      setTrends(null);
    } finally {
      setTrendsLoading(false);
    }
  };

  const loadRetention = async () => {
    setRetentionLoading(true);
    try {
      const data = await adminApi.getRetention(retentionWeeks);
      setRetention(data);
    } catch (_) {
      setRetention(null);
    } finally {
      setRetentionLoading(false);
    }
  };

  const loadHeatmap = async () => {
    setHeatmapLoading(true);
    try {
      const data = await adminApi.getHeatmap();
      setHeatmap(data);
    } catch (_) {
      setHeatmap(null);
    } finally {
      setHeatmapLoading(false);
    }
  };

  useEffect(() => {
    if (subView === 'users') loadUsers();
    if (subView === 'data') {
      if (!stats && !statsLoading) loadStats();
      if (!trends && !trendsLoading) loadTrends();
      loadRetention();
      loadHeatmap();
    }
  }, [subView, userPage, listPageSize, userListSort]);

  useEffect(() => {
    if (subView === 'data') loadTrends();
  }, [trendDays]);

  useEffect(() => {
    if (subView === 'data') loadRetention();
  }, [retentionWeeks]);

  useEffect(() => {
    if (subView !== 'data' || statsAutoRefresh <= 0 || !stats) return;
    const timer = setInterval(loadStats, statsAutoRefresh * 1000);
    return () => clearInterval(timer);
  }, [subView, statsAutoRefresh, stats]);

  const handleDeleteUser = async (id: number) => {
    if (confirmOnDelete && !window.confirm('确定删除该用户？此操作不可恢复。')) return;
    try {
      await userApi.deleteUser(id);
      triggerToast?.('删除成功', 'success');
      loadUsers();
    } catch (err: any) {
      triggerToast?.(err.message || '删除失败', 'error');
    }
  };

  const [editingUser, setEditingUser] = useState<LoginUserVO | null>(null);
  const [editForm, setEditForm] = useState({ userName: '', userProfile: '', userAvatar: '' });
  const [editSaving, setEditSaving] = useState(false);

  const handleOpenEdit = (u: LoginUserVO) => {
    setEditingUser(u);
    setEditForm({
      userName: u.userName || u.userAccount || '',
      userProfile: u.userProfile || '',
      userAvatar: u.userAvatar || '',
    });
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;
    setEditSaving(true);
    try {
      await userApi.updateUser({
        id: editingUser.id,
        userName: editForm.userName || undefined,
        userProfile: editForm.userProfile || undefined,
        userAvatar: editForm.userAvatar || undefined,
      });
      triggerToast?.('保存成功', 'success');
      setEditingUser(null);
      loadUsers();
    } catch (err: any) {
      triggerToast?.(err.message || '保存失败', 'error');
    } finally {
      setEditSaving(false);
    }
  };

  // 封禁时长弹窗（选择 ban 时弹出）
  const [banModalUser, setBanModalUser] = useState<LoginUserVO | null>(null);
  const [banModalDays, setBanModalDays] = useState<number | null>(7); // 7=7天, null=永久

  const handleRoleChange = async (u: LoginUserVO, newRole: string) => {
    if (u.userRole?.toLowerCase() === newRole.toLowerCase()) return;
    if (u.id === currentUser?.id && newRole === 'ban') {
      triggerToast?.('不能封禁自己', 'error');
      return;
    }
    if (newRole === 'ban') {
      // 封禁：弹出系统内封禁时长弹窗
      setBanModalUser(u);
      setBanModalDays(7);
      return;
    }
    if (confirmOnDelete && newRole === 'admin' && !window.confirm(`确定将用户角色改为「管理员」？`)) return;
    try {
      await userApi.updateUserRole(u.id, newRole);
      triggerToast?.('角色已更新', 'success');
      loadUsers();
    } catch (err: any) {
      triggerToast?.(err.message || '更新失败', 'error');
    }
  };

  const handleBanConfirm = async () => {
    if (!banModalUser) return;
    try {
      await userApi.updateUserRole(banModalUser.id, 'ban', banModalDays ?? undefined);
      triggerToast?.('角色已更新', 'success');
      setBanModalUser(null);
      loadUsers();
    } catch (err: any) {
      triggerToast?.(err.message || '更新失败', 'error');
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center p-8">
          <Shield size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
          <h2 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">权限不足</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6">仅管理员可访问此页面</p>
          <button
            onClick={onBack}
            className="px-6 py-2.5 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-colors font-medium"
          >
            返回
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <button
                onClick={subView === 'overview' ? onBack : () => setSubView('overview')}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <ChevronLeft size={20} className="text-slate-500 dark:text-slate-400" />
              </button>
              <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2">
                <Shield size={28} className="text-indigo-500" />
                管理员面板
              </h1>
            </div>
            <p className="text-slate-500 dark:text-slate-400 mt-2 ml-12">
              仅管理员可见 · 系统管理功能
            </p>
          </div>
        </div>

        {subView === 'overview' && (
          <>
            {/* 功能入口卡片 */}
            <div className="space-y-4">
              <button
                onClick={() => setSubView('users')}
                className="w-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 hover:border-indigo-200 dark:hover:border-indigo-800 transition-all text-left shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
                    <Users size={24} className="text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">用户管理</h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      查看、管理平台用户，修改角色
                    </p>
                  </div>
                  <ChevronLeft size={20} className="text-slate-400 rotate-180 ml-auto" />
                </div>
              </button>

              <button
                onClick={() => setSubView('system')}
                className="w-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50 hover:bg-amber-50/50 dark:hover:bg-amber-900/20 hover:border-amber-200 dark:hover:border-amber-800 transition-all text-left shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-900/30">
                    <Settings size={24} className="text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">系统设置</h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      全局配置、权限规则
                    </p>
                  </div>
                  <ChevronLeft size={20} className="text-slate-400 rotate-180 ml-auto" />
                </div>
              </button>

              <button
                onClick={() => setSubView('data')}
                className="w-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20 hover:border-emerald-200 dark:hover:border-emerald-800 transition-all text-left shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
                    <Database size={24} className="text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">数据概览</h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      平台整体数据统计
                    </p>
                  </div>
                  <ChevronLeft size={20} className="text-slate-400 rotate-180 ml-auto" />
                </div>
              </button>
            </div>
          </>
        )}

        {subView === 'users' && (
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200/50 dark:border-slate-700/50 flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[160px]">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="搜索用户名..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { setUserPage(1); loadUsers(); } }}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>
              <Button
                variant="secondary"
                onClick={() => { setUserPage(1); loadUsers(); }}
                disabled={usersLoading}
              >
                搜索
              </Button>
              <Button variant="secondary" icon={<RefreshCw size={16} />} onClick={loadUsers} disabled={usersLoading}>
                刷新
              </Button>
            </div>
            <div className=" overflow-x-auto">
              {usersError ? (
                <div className="p-8 text-center">
                  <p className="text-slate-500 dark:text-slate-400 mb-2">{usersError}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    请确认后端已实现 <code className="bg-slate-100 dark:bg-slate-700 px-1 rounded">GET /api/user/list/page</code> 接口
                  </p>
                </div>
              ) : usersLoading ? (
                <div className="p-8 text-center text-slate-500 dark:text-slate-400">加载中...</div>
              ) : users.length === 0 ? (
                <div className="p-8 text-center text-slate-500 dark:text-slate-400">暂无用户数据</div>
              ) : (
                <table className={`w-full text-sm ${compactTable ? 'table-compact' : ''}`}>
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/80">
                      <th className={`text-left font-semibold text-slate-700 dark:text-slate-300 ${compactTable ? 'py-1.5 px-2' : 'p-3'}`}>ID</th>
                      <th className={`text-left font-semibold text-slate-700 dark:text-slate-300 ${compactTable ? 'py-1.5 px-2' : 'p-3'}`}>用户名</th>
                      <th className={`text-left font-semibold text-slate-700 dark:text-slate-300 ${compactTable ? 'py-1.5 px-2' : 'p-3'}`}>角色</th>
                      <th className={`text-left font-semibold text-slate-700 dark:text-slate-300 ${compactTable ? 'py-1.5 px-2' : 'p-3'}`}>注册时间</th>
                      <th className={`text-right font-semibold text-slate-700 dark:text-slate-300 ${compactTable ? 'py-1.5 px-2' : 'p-3'}`}>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr
                        key={u.id}
                        className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50/50 dark:hover:bg-slate-700/30"
                      >
                        <td className={`text-slate-600 dark:text-slate-400 ${compactTable ? 'py-1.5 px-2' : 'p-3'}`}>{u.id}</td>
                        <td className={`font-medium text-slate-800 dark:text-slate-200 ${compactTable ? 'py-1.5 px-2' : 'p-3'}`}>
                          {u.userName || u.userAccount || '-'}
                        </td>
                        <td className={compactTable ? 'py-1.5 px-2' : 'p-3'}>
                          {u.id === currentUser?.id ? (
                            <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300">
                              管理员（当前）
                            </span>
                          ) : (
                            <select
                              value={u.userRole?.toLowerCase() || 'user'}
                              onChange={(e) => handleRoleChange(u, e.target.value)}
                              className={`text-xs font-medium rounded-lg border px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 ${
                              u.userRole?.toLowerCase() === UserRole.ADMIN
                                  ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300'
                                  : u.userRole?.toLowerCase() === 'ban'
                                  ? 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300'
                                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300'
                              }`}
                            >
                              <option value="user">普通用户</option>
                              <option value="admin">管理员</option>
                              <option value="ban">已封禁</option>
                            </select>
                          )}
                        </td>
                        <td className={`text-slate-500 dark:text-slate-400 text-xs ${compactTable ? 'py-1.5 px-2' : 'p-3'}`}>
                          {u.createTime ? new Date(u.createTime).toLocaleDateString('zh-CN') : '-'}
                        </td>
                        <td className={`text-right ${compactTable ? 'py-1.5 px-2' : 'p-3'}`}>
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleOpenEdit(u)}
                              className="p-2 rounded-lg text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
                              title="编辑用户"
                            >
                              <Edit3 size={16} />
                            </button>
                            {u.id !== currentUser?.id && (
                            <button
                              onClick={() => handleDeleteUser(u.id)}
                              className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors"
                              title="删除用户"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            {!usersError && usersTotal > pageSize && (
              <div className="p-3 border-t border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>共 {usersTotal} 条</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setUserPage((p) => Math.max(1, p - 1))}
                    disabled={userPage <= 1}
                    className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 disabled:opacity-50"
                  >
                    上一页
                  </button>
                  <button
                    onClick={() => setUserPage((p) => p + 1)}
                    disabled={userPage * pageSize >= usersTotal}
                    className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 disabled:opacity-50"
                  >
                    下一页
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 封禁时长弹窗 */}
        {banModalUser && (
          <div className="fixed inset-0 bg-slate-900/40 dark:bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setBanModalUser(null)}>
            <div
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <AlertTriangle size={20} className="text-rose-500" />
                  封禁用户
                </h3>
                <button
                  onClick={() => setBanModalUser(null)}
                  className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                确定要封禁 <span className="font-medium text-slate-800 dark:text-slate-200">{banModalUser.userName || banModalUser.userAccount}</span> 吗？请选择封禁时长：
              </p>
              <div className="grid grid-cols-2 gap-2 mb-6">
                {[
                  { days: 1, label: '1 天' },
                  { days: 7, label: '7 天' },
                  { days: 30, label: '30 天' },
                  { days: null, label: '永久' },
                ].map(({ days, label }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setBanModalDays(days)}
                    className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                      banModalDays === days
                        ? 'border-rose-500 bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300'
                        : 'border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setBanModalUser(null)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm font-medium"
                >
                  取消
                </button>
                <button
                  onClick={handleBanConfirm}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-rose-500 text-white hover:bg-rose-600 transition-colors text-sm font-medium"
                >
                  确认封禁
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 编辑用户弹窗 */}
        {editingUser && (
          <div className="fixed inset-0 bg-slate-900/40 dark:bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setEditingUser(null)}>
            <div
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <UserCog size={20} className="text-indigo-500" />
                  编辑用户
                </h3>
                <button
                  onClick={() => setEditingUser(null)}
                  className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                账号：{editingUser.userAccount || '-'} · ID：{editingUser.id}
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">昵称</label>
                  <input
                    type="text"
                    value={editForm.userName}
                    onChange={(e) => setEditForm((f) => ({ ...f, userName: e.target.value }))}
                    placeholder="用户昵称"
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">简介</label>
                  <textarea
                    value={editForm.userProfile}
                    onChange={(e) => setEditForm((f) => ({ ...f, userProfile: e.target.value }))}
                    placeholder="用户简介"
                    rows={3}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">头像 URL</label>
                  <input
                    type="text"
                    value={editForm.userAvatar}
                    onChange={(e) => setEditForm((f) => ({ ...f, userAvatar: e.target.value }))}
                    placeholder="https://..."
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setEditingUser(null)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm font-medium"
                >
                  取消
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={editSaving}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-500 text-white hover:bg-indigo-600 disabled:opacity-50 transition-colors text-sm font-medium"
                >
                  {editSaving ? '保存中...' : '保存'}
                </button>
              </div>
            </div>
          </div>
        )}

        {subView === 'system' && (
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">系统设置</h2>
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-100">删除用户前进行二次确认</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    关闭后，点击删除将立即生效，仅适合测试环境使用。
                  </p>
                </div>
                <button
                  onClick={() => setConfirmOnDelete((v) => !v)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    confirmOnDelete ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-slate-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      confirmOnDelete ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-100">显示风险操作提示</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    关闭后不再显示下方的权限与安全说明卡片。
                  </p>
                </div>
                <button
                  onClick={() => setShowDangerTips((v) => !v)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    showDangerTips ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-slate-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      showDangerTips ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-100">导出时包含 AI 分析</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    导出 JSON/Markdown 时是否包含 AI 摘要、评分、行动建议等，关闭后导出体积更小。
                  </p>
                </div>
                <button
                  onClick={() => setExportIncludeAi((v) => !v)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    exportIncludeAi ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-slate-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      exportIncludeAi ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-100">用户列表每页条数</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    管理页用户表格每页显示的数量。
                  </p>
                </div>
                <select
                  value={listPageSize}
                  onChange={(e) => setListPageSize(Number(e.target.value))}
                  className="rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-1.5 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-100">默认每日提醒时间</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    每日复盘提醒的建议时间，需在前端或系统定时任务中生效。
                  </p>
                </div>
                <select
                  value={defaultReminderTime}
                  onChange={(e) => setDefaultReminderTime(e.target.value)}
                  className="rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-1.5 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                >
                  <option value="08:00">08:00</option>
                  <option value="12:00">12:00</option>
                  <option value="18:00">18:00</option>
                  <option value="20:00">20:00</option>
                  <option value="21:00">21:00</option>
                  <option value="22:00">22:00</option>
                </select>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-100">紧凑表格布局</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    用户列表等表格使用更紧凑的行高与内边距，便于一次查看更多行。
                  </p>
                </div>
                <button
                  onClick={() => setCompactTable((v) => !v)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    compactTable ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-slate-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      compactTable ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-100">平台默认主题</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    新访客或未设置主题时的默认外观，需在应用启动时读取。
                  </p>
                </div>
                <select
                  value={defaultTheme}
                  onChange={(e) => setDefaultTheme(e.target.value)}
                  className="rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-1.5 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                >
                  <option value="system">跟随系统</option>
                  <option value="light">浅色</option>
                  <option value="dark">深色</option>
                </select>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-100">数据概览自动刷新</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    在数据概览页时，按间隔自动重新拉取统计。
                  </p>
                </div>
                <select
                  value={statsAutoRefresh}
                  onChange={(e) => setStatsAutoRefresh(Number(e.target.value))}
                  className="rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-1.5 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                >
                  <option value={0}>关闭</option>
                  <option value={30}>30 秒</option>
                  <option value={60}>60 秒</option>
                  <option value={120}>2 分钟</option>
                </select>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-100">用户列表排序</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    按注册时间排序方式，倒序为最新优先。
                  </p>
                </div>
                <select
                  value={userListSort}
                  onChange={(e) => setUserListSort(e.target.value)}
                  className="rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-1.5 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                >
                  <option value="desc">倒序（最新优先）</option>
                  <option value="asc">正序（最早优先）</option>
                </select>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-100">导出最大条数</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    单次导出复盘记录的最大条数，0 表示不限制。
                  </p>
                </div>
                <select
                  value={exportMaxCount}
                  onChange={(e) => setExportMaxCount(Number(e.target.value))}
                  className="rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-1.5 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                >
                  <option value={0}>不限制</option>
                  <option value={100}>100 条</option>
                  <option value={500}>500 条</option>
                  <option value={1000}>1000 条</option>
                  <option value={5000}>5000 条</option>
                </select>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-100">显示上次刷新时间</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    在数据概览底部显示最近一次统计的刷新时间。
                  </p>
                </div>
                <button
                  onClick={() => setShowLastRefreshTime((v) => !v)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    showLastRefreshTime ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-slate-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      showLastRefreshTime ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {showDangerTips && (
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200/70 dark:border-amber-800/60 flex items-start gap-3">
                <div className="mt-0.5">
                  <AlertTriangle size={18} className="text-amber-500" />
                </div>
                <div className="space-y-2 text-sm">
                  <p className="font-medium text-amber-900 dark:text-amber-200">权限与安全说明</p>
                  <ul className="list-disc list-inside space-y-1 text-amber-800/90 dark:text-amber-100/80">
                    <li>仅 <span className="font-semibold">管理员（admin）</span> 账户可以访问本页面。</li>
                    <li>管理员可以删除任意用户、修改用户角色，请谨慎操作生产环境数据。</li>
                    <li>普通用户仅能管理自己的复盘、目标、习惯和闪念等数据。</li>
                  </ul>
                </div>
              </div>
              )}

              <p className="text-xs text-slate-400 dark:text-slate-500">
                后续如需增加全局配置（如注册开关、AI 模型选择等），可以在此扩展并接入后端配置接口。
              </p>
            </div>
          </div>
        )}

        {subView === 'data' && (
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">数据概览</h2>
            {statsError ? (
              <div className="text-sm text-rose-500 mb-2">{statsError}</div>
            ) : null}

            {statsLoading ? (
              <div className="py-10 text-center text-slate-500 dark:text-slate-400 text-sm">加载中...</div>
            ) : !stats ? (
              <div className="py-10 text-center text-slate-500 dark:text-slate-400 text-sm">
                暂无统计数据，请稍后重试。
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100/70 dark:border-indigo-800/60">
                    <p className="text-xs text-slate-600 dark:text-slate-300 mb-1">总用户数</p>
                    <p className="text-2xl font-semibold text-indigo-600 dark:text-indigo-300">{stats.totalUsers}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      管理员 {stats.adminUsers} · 普通 {stats.normalUsers} · 封禁 {stats.bannedUsers}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100/70 dark:border-emerald-800/60">
                    <p className="text-xs text-slate-600 dark:text-slate-300 mb-1">复盘记录</p>
                    <p className="text-2xl font-semibold text-emerald-600 dark:text-emerald-300">
                      {stats.totalReviewEntries}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">包含所有用户的复盘条目</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-sky-50 dark:bg-sky-900/20 border border-sky-100/70 dark:border-sky-800/60">
                    <p className="text-xs text-slate-600 dark:text-slate-300 mb-1">目标总数</p>
                    <p className="text-2xl font-semibold text-sky-600 dark:text-sky-300">{stats.totalGoals}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">用户创建的长期 / 短期目标</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-900/20 border border-purple-100/70 dark:border-purple-800/60">
                    <p className="text-xs text-slate-600 dark:text-slate-300 mb-1">知识点</p>
                    <p className="text-2xl font-semibold text-purple-600 dark:text-purple-300">
                      {stats.totalKnowledgePoints}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">知识卡片与笔记</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-900/20 border border-rose-100/70 dark:border-rose-800/60">
                    <p className="text-xs text-slate-600 dark:text-slate-300 mb-1">闪念速记</p>
                    <p className="text-2xl font-semibold text-rose-600 dark:text-rose-300">{stats.totalMemos}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">灵感 / 备忘记录</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100/70 dark:border-amber-800/60">
                    <p className="text-xs text-slate-600 dark:text-slate-300 mb-1">习惯</p>
                    <p className="text-2xl font-semibold text-amber-600 dark:text-amber-300">{stats.totalHabits}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">打卡与养成习惯</p>
                  </div>
                </div>

                {/* 每日趋势折线图 */}
                {trendsLoading ? (
                  <div className="mt-8 p-8 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 text-center text-slate-500 dark:text-slate-400 text-sm">
                    加载趋势数据中...
                  </div>
                ) : trends && (
                  <div className="mt-8 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <TrendingUp size={18} className="text-indigo-500" />
                        每日数据趋势
                      </h3>
                      <select
                        value={trendDays}
                        onChange={(e) => setTrendDays(Number(e.target.value))}
                        className="text-xs rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 py-1 text-slate-700 dark:text-slate-200"
                      >
                        <option value={7}>近 7 天</option>
                        <option value={14}>近 14 天</option>
                        <option value={30}>近 30 天</option>
                      </select>
                    </div>
                    <div className="h-64">
                      {trends.dailyTrends.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-slate-400 dark:text-slate-500 text-sm">
                          暂无趋势数据
                        </div>
                      ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={trends.dailyTrends.map((d) => ({
                            ...d,
                            label: d.date.slice(5),
                          }))}
                          margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
                        >
                          <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748b' }} />
                          <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'rgba(255,255,255,0.95)',
                              borderRadius: '8px',
                              border: '1px solid #e2e8f0',
                              fontSize: '12px',
                            }}
                          />
                          <Legend />
                          <Line type="monotone" dataKey="reviewEntries" name="复盘" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
                          <Line type="monotone" dataKey="newUsers" name="新用户" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                          <Line type="monotone" dataKey="goals" name="目标" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} />
                          <Line type="monotone" dataKey="knowledgePoints" name="知识点" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
                          <Line type="monotone" dataKey="memos" name="闪念" stroke="#f43f5e" strokeWidth={2} dot={{ r: 4 }} />
                          <Line type="monotone" dataKey="habits" name="习惯" stroke="#06b6d4" strokeWidth={2} dot={{ r: 4 }} />
                        </LineChart>
                      </ResponsiveContainer>
                      )}
                    </div>
                  </div>
                )}

                {/* 按周留存率 */}
                {retentionLoading ? (
                  <div className="mt-8 p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 text-center text-slate-500 dark:text-slate-400 text-sm">
                    加载留存数据中...
                  </div>
                ) : retention && retention.length > 0 && (
                  <div className="mt-8 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <UsersRound size={18} className="text-violet-500" />
                        按周留存率
                      </h3>
                      <select
                        value={retentionWeeks}
                        onChange={(e) => setRetentionWeeks(Number(e.target.value))}
                        className="text-xs rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 py-1 text-slate-700 dark:text-slate-200"
                      >
                        <option value={4}>近 4 周</option>
                        <option value={8}>近 8 周</option>
                        <option value={12}>近 12 周</option>
                      </select>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                      每周新增用户中，次周仍有活跃（复盘/目标/知识点/闪念/习惯）的比例
                    </p>
                    <div className="h-56">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={retention} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                          <XAxis dataKey="weekLabel" tick={{ fontSize: 10, fill: '#64748b' }} />
                          <YAxis tick={{ fontSize: 10, fill: '#64748b' }} domain={[0, 100]} />
                          <Tooltip
                            content={({ active, payload, label }) =>
                              active && payload?.[0]?.payload ? (
                                <div className="bg-white dark:bg-slate-800 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 shadow-lg text-xs">
                                  <p className="font-medium text-slate-700 dark:text-slate-200 mb-1">{label}</p>
                                  <p>新增: {payload[0].payload.newUsers}人 · 留存: {payload[0].payload.retainedUsers}人</p>
                                  <p>留存率: {payload[0].payload.retentionRate}%</p>
                                </div>
                              ) : null
                            }
                          />
                          <Bar dataKey="retentionRate" name="retentionRate" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* 按时间段活跃热力图 */}
                {heatmapLoading ? (
                  <div className="mt-8 p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 text-center text-slate-500 dark:text-slate-400 text-sm">
                    加载热力图数据中...
                  </div>
                ) : heatmap && heatmap.cells && heatmap.cells.length > 0 && (
                  <div className="mt-8 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
                    <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-2 flex items-center gap-2">
                      <Flame size={18} className="text-amber-500" />
                      按时间段活跃热力图
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                      横轴：周日~周六 · 纵轴：0~23 时 · 颜色越深表示该时段创建内容越多
                    </p>
                    <ActivityHeatmapGrid cells={heatmap.cells} />
                  </div>
                )}

                {/* 用户行为统计 */}
                {trends && (
                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100/70 dark:border-indigo-800/50">
                      <p className="text-xs text-slate-600 dark:text-slate-300 mb-1">近 7 天活跃用户</p>
                      <p className="text-2xl font-semibold text-indigo-600 dark:text-indigo-300">{trends.activeUsersLast7Days}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">有创建复盘、目标、知识点、闪念或习惯的用户</p>
                    </div>
                    {trends.reviewFrameworkDistribution && Object.keys(trends.reviewFrameworkDistribution).length > 0 && (
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
                        <p className="text-xs text-slate-600 dark:text-slate-300 mb-3 flex items-center gap-1">
                          <BarChart3 size={14} className="text-emerald-500" />
                          复盘框架分布
                        </p>
                        <div className="h-32">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={Object.entries(trends.reviewFrameworkDistribution).map(([name, value]) => ({
                                name: name === 'OTHER' ? '其他' : name,
                                value,
                              }))}
                              layout="vertical"
                              margin={{ top: 0, right: 20, left: 50, bottom: 0 }}
                            >
                              <XAxis type="number" tick={{ fontSize: 10 }} />
                              <YAxis type="category" dataKey="name" width={50} tick={{ fontSize: 10 }} />
                              <Tooltip />
                              <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-6">
                  <div className="flex items-center gap-1">
                    <CheckCircle2 size={14} className="text-emerald-500" />
                    <span>以上统计为全局维度，便于管理员掌握平台使用情况。</span>
                    {showLastRefreshTime && statsLastRefresh && (
                      <span className="text-slate-400 dark:text-slate-500">
                        · 上次刷新：{statsLastRefresh.toLocaleTimeString('zh-CN')}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => { loadStats(); loadTrends(); loadRetention(); loadHeatmap(); }}
                    className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600"
                  >
                    重新统计
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
