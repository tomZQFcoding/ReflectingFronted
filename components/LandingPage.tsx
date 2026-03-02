import React from 'react';
import { Sparkles, Target, BookOpen, PenLine, Lightbulb, ChevronRight } from 'lucide-react';
import { Button } from './Button';

interface LandingPageProps {
  onLogin: () => void;
}

const FEATURES = [
  {
    icon: PenLine,
    title: '复盘记录',
    desc: '多框架复盘，AI 智能分析，沉淀每日思考与成长',
  },
  {
    icon: Target,
    title: '目标追踪',
    desc: '拆解目标、追踪进度，让每一步都清晰可见',
  },
  {
    icon: BookOpen,
    title: '知识点管理',
    desc: '构建个人知识体系，思维导图串联所学',
  },
  {
    icon: Lightbulb,
    title: '闪念胶囊',
    desc: '随时捕捉灵感，不再错过每一个好想法',
  },
];

export const LandingPage: React.FC<LandingPageProps> = ({ onLogin }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 overflow-hidden relative">
      {/* 背景：渐变网格 + 光晕 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-indigo-500/20 blur-[120px]" />
        <div className="absolute top-1/2 -left-32 w-80 h-80 rounded-full bg-violet-500/15 blur-[100px]" />
        <div className="absolute bottom-20 right-1/4 w-64 h-64 rounded-full bg-cyan-500/10 blur-[80px]" />
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* 顶部导航 */}
        <header className="flex items-center justify-between px-6 py-5 sm:px-8">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Sparkles size={18} className="text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">Reflecting</span>
          </div>
          <Button
            onClick={onLogin}
            variant="secondary"
            className="rounded-xl bg-white/5 border-white/10 text-slate-200 hover:bg-white/10 hover:text-white backdrop-blur-sm"
          >
            登录 / 注册
          </Button>
        </header>

        {/* Hero */}
        <main className="flex-1 flex flex-col items-center justify-center px-6 sm:px-8 py-16 sm:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6">
              <span className="bg-gradient-to-r from-white via-indigo-100 to-violet-200 bg-clip-text text-transparent">
                记录成长
              </span>
              <br />
              <span className="text-slate-300">复盘每一天</span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-400 mb-12 max-w-xl mx-auto leading-relaxed">
              综合型个人成长管理平台 · 复盘、目标、习惯、知识点与闪念，一站式沉淀你的思考与进步
            </p>
            <Button
              onClick={onLogin}
              size="lg"
              className="rounded-2xl px-8 py-4 text-base font-semibold bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white shadow-xl shadow-indigo-500/25 border-0"
            >
              开始使用
              <ChevronRight size={20} className="ml-2" />
            </Button>
          </div>

          {/* 功能卡片 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mt-20 sm:mt-28 w-full max-w-5xl mx-auto">
            {FEATURES.map(({ icon: Icon, title, desc }, i) => (
              <div
                key={title}
                className="group p-5 sm:p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 hover:border-indigo-500/30 transition-all duration-300"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="w-11 h-11 rounded-xl bg-indigo-500/20 flex items-center justify-center mb-4 group-hover:bg-indigo-500/30 transition-colors">
                  <Icon size={20} className="text-indigo-400" />
                </div>
                <h3 className="text-base font-semibold text-slate-100 mb-2">{title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </main>

        {/* 底部 */}
        <footer className="py-8 text-center">
          <p className="text-xs text-slate-500">
            登录后即可使用全部功能 · 数据安全存储
          </p>
        </footer>
      </div>
    </div>
  );
};
