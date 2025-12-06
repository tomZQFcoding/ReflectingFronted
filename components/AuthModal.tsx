import React, { useState } from 'react';
import { X, Mail, Lock, User, Sparkles } from 'lucide-react';
import { Button } from './Button';
import { userApi, LoginUserVO } from '../services/userApi';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: LoginUserVO) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form states
  const [userAccount, setUserAccount] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [checkPassword, setCheckPassword] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        if (!userAccount || !userPassword) {
          setError('请填写完整信息');
          setLoading(false);
          return;
        }
        const user = await userApi.login({ userAccount, userPassword });
        onSuccess(user);
      } else {
        if (!userAccount || !userPassword || !checkPassword) {
          setError('请填写完整信息');
          setLoading(false);
          return;
        }
        if (userPassword !== checkPassword) {
          setError('两次密码输入不一致');
          setLoading(false);
          return;
        }
        if (userPassword.length < 8) {
          setError('密码长度至少8位');
          setLoading(false);
          return;
        }
        await userApi.register({ userAccount, userPassword, checkPassword });
        // 注册成功后自动登录
        const user = await userApi.login({ userAccount, userPassword });
        onSuccess(user);
      }
    } catch (err: any) {
      setError(err.message || '操作失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setUserAccount('');
    setUserPassword('');
    setCheckPassword('');
    setError(null);
  };

  const switchMode = (newMode: 'login' | 'register') => {
    setMode(newMode);
    resetForm();
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
        className="relative w-full max-w-md bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden"
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
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 opacity-10" />
        
        {/* Content */}
        <div className="relative p-8 pt-12">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 mb-4 shadow-lg">
              <Sparkles size={28} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              {mode === 'login' ? '欢迎回来' : '创建账户'}
            </h2>
            <p className="text-slate-500 text-sm">
              {mode === 'login' 
                ? '开始你的复盘之旅' 
                : '加入我们，开启成长之路'}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => switchMode('login')}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all ${
                mode === 'login'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              登录
            </button>
            <button
              onClick={() => switchMode('register')}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all ${
                mode === 'register'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              注册
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error Message */}
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-sm">
                {error}
              </div>
            )}

            {/* Username */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                账号
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <User size={18} className="text-slate-400" />
                </div>
                <input
                  type="text"
                  value={userAccount}
                  onChange={(e) => setUserAccount(e.target.value)}
                  placeholder="请输入账号"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                密码
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <Lock size={18} className="text-slate-400" />
                </div>
                <input
                  type="password"
                  value={userPassword}
                  onChange={(e) => setUserPassword(e.target.value)}
                  placeholder="请输入密码"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Confirm Password (Register only) */}
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  确认密码
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <Lock size={18} className="text-slate-400" />
                  </div>
                  <input
                    type="password"
                    value={checkPassword}
                    onChange={(e) => setCheckPassword(e.target.value)}
                    placeholder="请再次输入密码"
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    disabled={loading}
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              loading={loading}
              size="lg"
              className="w-full mt-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white border-0 shadow-lg shadow-indigo-500/30 rounded-xl py-4 font-semibold"
            >
              {loading 
                ? (mode === 'login' ? '登录中...' : '注册中...')
                : (mode === 'login' ? '登录' : '注册')
              }
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-xs text-slate-400">
              {mode === 'login' ? (
                <>
                  还没有账户？{' '}
                  <button
                    onClick={() => switchMode('register')}
                    className="text-indigo-600 font-semibold hover:underline"
                  >
                    立即注册
                  </button>
                </>
              ) : (
                <>
                  已有账户？{' '}
                  <button
                    onClick={() => switchMode('login')}
                    className="text-indigo-600 font-semibold hover:underline"
                  >
                    立即登录
                  </button>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

