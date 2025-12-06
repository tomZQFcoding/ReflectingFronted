import React, { useState, useEffect } from 'react';
import { X, User, Camera, Edit3, Save, Sparkles } from 'lucide-react';
import { Button } from './Button';
import { userApi, LoginUserVO, UserUpdateMyRequest } from '../services/userApi';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: LoginUserVO | null;
  onUpdate: (user: LoginUserVO) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, user, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form states
  const [userName, setUserName] = useState('');
  const [userAvatar, setUserAvatar] = useState('');
  const [userProfile, setUserProfile] = useState('');

  // Initialize form data when user changes
  useEffect(() => {
    if (user) {
      setUserName(user.userName || '');
      setUserAvatar(user.userAvatar || '');
      setUserProfile(user.userProfile || '');
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const handleSave = async () => {
    setError(null);
    setLoading(true);

    try {
      const updateData: UserUpdateMyRequest = {
        userName: userName.trim() || undefined,
        userAvatar: userAvatar.trim() || undefined,
        userProfile: userProfile.trim() || undefined,
      };

      await userApi.updateProfile(updateData);
      
      // 获取更新后的用户信息
      const updatedUser = await userApi.getCurrentUser();
      onUpdate(updatedUser);
      
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || '更新失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // 重置表单
    setUserName(user.userName || '');
    setUserAvatar(user.userAvatar || '');
    setUserProfile(user.userProfile || '');
    setIsEditing(false);
    setError(null);
  };

  const getInitials = (name: string, account: string) => {
    if (name) return name.charAt(0).toUpperCase();
    if (account) return account.charAt(0).toUpperCase();
    return 'U';
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{
        background: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-lg bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
        style={{
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 transition-colors z-10"
        >
          <X size={20} className="text-slate-400" />
        </button>

        {/* Decorative Background */}
        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 opacity-10" />
        
        {/* Content */}
        <div className="relative p-8 pt-16">
          {/* Header */}
          <div className="text-center mb-8">
            {/* Avatar */}
            <div className="relative inline-block mb-4">
              {userAvatar ? (
                <img 
                  src={userAvatar} 
                  alt={userName || user.userAccount}
                  className="w-24 h-24 rounded-full border-4 border-white shadow-xl object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold border-4 border-white shadow-xl">
                  {getInitials(userName, user.userAccount)}
                </div>
              )}
              {isEditing && (
                <div className="absolute bottom-0 right-0 p-2 bg-indigo-600 rounded-full shadow-lg border-2 border-white">
                  <Camera size={16} className="text-white" />
                </div>
              )}
            </div>

            {!isEditing ? (
              <>
                <h2 className="text-2xl font-bold text-slate-800 mb-1">
                  {userName || user.userAccount}
                </h2>
                {user.userAccount && userName && (
                  <p className="text-slate-400 text-sm">@{user.userAccount}</p>
                )}
                {user.userProfile && (
                  <p className="text-slate-600 text-sm mt-3 max-w-md mx-auto leading-relaxed">
                    {user.userProfile}
                  </p>
                )}
                <div className="mt-4">
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="secondary"
                    icon={<Edit3 size={16} />}
                    className="rounded-xl"
                  >
                    编辑资料
                  </Button>
                </div>
              </>
            ) : (
              <h2 className="text-2xl font-bold text-slate-800 mb-4">编辑资料</h2>
            )}
          </div>

          {/* Edit Form */}
          {isEditing && (
            <div className="space-y-5">
              {/* Error Message */}
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-sm">
                  {error}
                </div>
              )}

              {/* Username */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  昵称
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <User size={18} className="text-slate-400" />
                  </div>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="请输入昵称"
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Avatar URL */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  头像链接
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <Camera size={18} className="text-slate-400" />
                  </div>
                  <input
                    type="url"
                    value={userAvatar}
                    onChange={(e) => setUserAvatar(e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    disabled={loading}
                  />
                </div>
                {userAvatar && (
                  <div className="mt-2 flex items-center gap-2">
                    <img 
                      src={userAvatar} 
                      alt="Preview"
                      className="w-12 h-12 rounded-full object-cover border border-slate-200"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    <span className="text-xs text-slate-500">预览</span>
                  </div>
                )}
              </div>

              {/* Profile */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  个人简介
                </label>
                <textarea
                  value={userProfile}
                  onChange={(e) => setUserProfile(e.target.value)}
                  placeholder="介绍一下自己吧..."
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  disabled={loading}
                />
              </div>

              {/* Account Info (Read-only) */}
              <div className="pt-4 border-t border-slate-200">
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  账号
                </label>
                <div className="px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-500">
                  {user.userAccount}
                </div>
                <p className="text-xs text-slate-400 mt-1">账号不可修改</p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleCancel}
                  variant="secondary"
                  className="flex-1 rounded-xl"
                  disabled={loading}
                >
                  取消
                </Button>
                <Button
                  onClick={handleSave}
                  loading={loading}
                  icon={<Save size={16} />}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white border-0 shadow-lg shadow-indigo-500/30 rounded-xl"
                >
                  保存
                </Button>
              </div>
            </div>
          )}

          {/* Stats (View Mode) */}
          {!isEditing && (
            <div className="mt-8 pt-6 border-t border-slate-200">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl">
                  <div className="text-2xl font-bold text-indigo-600 mb-1">
                    {user.id}
                  </div>
                  <div className="text-xs text-slate-500">用户ID</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
                  <div className="text-2xl font-bold text-purple-600 mb-1">
                    {user.userRole === 'admin' ? '管理员' : '用户'}
                  </div>
                  <div className="text-xs text-slate-500">角色</div>
                </div>
              </div>
              {user.createTime && (
                <div className="mt-4 text-center text-xs text-slate-400">
                  注册时间：{new Date(user.createTime).toLocaleDateString('zh-CN')}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

