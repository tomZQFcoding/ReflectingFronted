import React from 'react';
import { ChevronLeft, Edit2, Trash2, Tag, Calendar, BookOpen } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { KnowledgePoint } from '../types';

interface KnowledgePointDetailProps {
  knowledgePoint: KnowledgePoint;
  onEdit: () => void;
  onDelete: () => void;
  onBack: () => void;
}

export const KnowledgePointDetail: React.FC<KnowledgePointDetailProps> = ({
  knowledgePoint,
  onEdit,
  onDelete,
  onBack,
}) => {
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('zh-CN', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-900/50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-200/50 dark:shadow-indigo-900/30">
                <BookOpen size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                  知识点详情
                </h1>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onEdit}
              className="px-4 py-2 rounded-xl text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors flex items-center gap-2"
            >
              <Edit2 size={16} />
              编辑
            </button>
            <button
              onClick={onDelete}
              className="px-4 py-2 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors flex items-center gap-2"
            >
              <Trash2 size={16} />
              删除
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Title */}
        <div className="mb-6">
          <h2 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 mb-4 leading-tight">
            {knowledgePoint.title}
          </h2>
          
          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
            {knowledgePoint.category && (
              <span className="inline-flex items-center px-3 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-medium">
                {knowledgePoint.category}
              </span>
            )}
            {knowledgePoint.tags && knowledgePoint.tags.length > 0 && (
              <div className="flex items-center gap-2">
                <Tag size={14} className="text-slate-400" />
                <div className="flex flex-wrap gap-2">
                  {knowledgePoint.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {knowledgePoint.updateTime && (
              <div className="flex items-center gap-1.5">
                <Calendar size={14} className="text-slate-400" />
                <span>更新于 {formatDate(knowledgePoint.updateTime)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Content with Markdown - iOS Style */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 md:p-10 border border-slate-200/60 dark:border-slate-700/60 shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
          <div className="markdown-content ios-markdown">
            <ReactMarkdown
              components={{
                h1: ({ node, ...props }) => (
                  <h1 className="text-3xl font-extrabold mb-6 mt-10 first:mt-0 text-slate-900 dark:text-slate-50 tracking-tight leading-tight" {...props} />
                ),
                h2: ({ node, ...props }) => (
                  <h2 className="text-2xl font-bold mb-4 mt-8 text-slate-800 dark:text-slate-100 tracking-tight leading-tight flex items-center gap-3">
                    <span className="w-1 h-6 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full shadow-sm"></span>
                    <span {...props} />
                  </h2>
                ),
                h3: ({ node, ...props }) => (
                  <h3 className="text-xl font-semibold mb-3 mt-6 text-slate-800 dark:text-slate-100 tracking-tight" {...props} />
                ),
                h4: ({ node, ...props }) => (
                  <h4 className="text-lg font-semibold mb-2.5 mt-5 text-indigo-600 dark:text-indigo-400 tracking-tight" {...props} />
                ),
                p: ({ node, ...props }) => (
                  <p className="mb-5 leading-[1.75] text-[16px] text-slate-700 dark:text-slate-200 font-[400]" {...props} />
                ),
                ul: ({ node, ...props }) => (
                  <ul className="list-none mb-6 space-y-3 text-slate-700 dark:text-slate-200" {...props} />
                ),
                ol: ({ node, ...props }) => (
                  <ol className="list-none mb-6 space-y-3 text-slate-700 dark:text-slate-200 counter-reset-[list-counter]" {...props} />
                ),
                li: ({ node, ...props }: any) => {
                  const parentNode = node?.parent;
                  const isOrdered = parentNode?.tagName === 'ol' || (parentNode?.type === 'list' && parentNode?.ordered === true);
                  
                  return (
                    <li className={`flex items-start gap-3 mb-0 group ${isOrdered ? 'ios-ordered-item' : 'ios-unordered-item'}`}>
                      {!isOrdered ? (
                        <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400 mt-2.5 shadow-sm"></span>
                      ) : (
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40 flex items-center justify-center text-xs font-semibold text-indigo-600 dark:text-indigo-400 mt-0.5 shadow-sm">
                          <span className="ios-counter"></span>
                        </span>
                      )}
                      <span className="flex-1 leading-[1.75] text-[16px]">{props.children}</span>
                    </li>
                  );
                },
                blockquote: ({ node, ...props }) => (
                  <blockquote className="relative my-6 pl-5 pr-5 py-4 bg-gradient-to-r from-indigo-50/80 via-purple-50/50 to-pink-50/80 dark:from-indigo-900/20 dark:via-purple-900/15 dark:to-pink-900/20 rounded-2xl border border-indigo-100/60 dark:border-indigo-800/30 shadow-[0_1px_3px_rgba(99,102,241,0.1)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.3)] backdrop-blur-sm">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-400 via-purple-400 to-pink-400 rounded-l-2xl shadow-sm"></div>
                    <div className="relative pl-4 text-slate-700 dark:text-slate-200 leading-[1.75] text-[15px] italic">
                      {props.children}
                    </div>
                  </blockquote>
                ),
                code: ({ node, inline, ...props }: any) => {
                  if (inline) {
                    return (
                      <code className="bg-indigo-50/80 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-md text-[14px] font-mono font-medium border border-indigo-200/60 dark:border-indigo-800/40 shadow-sm" {...props} />
                    );
                  }
                  return (
                    <pre className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-100 p-5 rounded-2xl overflow-x-auto my-6 shadow-xl border border-slate-700/50 dark:border-slate-800/50">
                      <code className="text-[14px] font-mono leading-relaxed" {...props} />
                    </pre>
                  );
                },
                a: ({ node, ...props }) => (
                  <a className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition-colors underline decoration-2 decoration-indigo-300/60 dark:decoration-indigo-600/60 underline-offset-2" target="_blank" rel="noopener noreferrer" {...props} />
                ),
                strong: ({ node, ...props }) => (
                  <strong className="font-semibold text-slate-900 dark:text-slate-50" {...props} />
                ),
                em: ({ node, ...props }) => (
                  <em className="italic text-slate-800 dark:text-slate-200" {...props} />
                ),
                hr: ({ node, ...props }) => (
                  <hr className="my-8 border-0 h-px bg-gradient-to-r from-transparent via-slate-300/60 dark:via-slate-600/60 to-transparent" {...props} />
                ),
                table: ({ node, ...props }) => (
                  <div className="overflow-x-auto my-6 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm bg-white dark:bg-slate-800/50">
                    <table className="min-w-full border-collapse" {...props} />
                  </div>
                ),
                thead: ({ node, ...props }) => (
                  <thead className="bg-gradient-to-r from-indigo-50/80 to-purple-50/80 dark:from-indigo-900/30 dark:to-purple-900/30" {...props} />
                ),
                tbody: ({ node, ...props }) => (
                  <tbody className="bg-white dark:bg-slate-800/50" {...props} />
                ),
                tr: ({ node, ...props }) => (
                  <tr className="border-b border-slate-200/60 dark:border-slate-700/60 hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors" {...props} />
                ),
                th: ({ node, ...props }) => (
                  <th className="px-5 py-3.5 text-left font-semibold text-slate-800 dark:text-slate-100 text-sm uppercase tracking-wider" {...props} />
                ),
                td: ({ node, ...props }) => (
                  <td className="px-5 py-3.5 text-slate-700 dark:text-slate-300 text-[15px]" {...props} />
                ),
              }}
            >
              {knowledgePoint.content}
            </ReactMarkdown>
          </div>
        </div>
      </div>
      
      <style>{`
        .ios-markdown ol {
          counter-reset: ios-counter;
          padding-left: 0;
        }
        
        .ios-markdown .ios-ordered-item {
          counter-increment: ios-counter;
        }
        
        .ios-markdown .ios-ordered-item .ios-counter::before {
          content: counter(ios-counter);
        }
        
        .ios-markdown ul li::before,
        .ios-markdown ol li::before {
          content: '';
        }
        
        .ios-markdown pre code {
          display: block;
        }
        
        .ios-markdown pre::-webkit-scrollbar {
          height: 8px;
        }
        
        .ios-markdown pre::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
        }
        
        .ios-markdown pre::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 4px;
        }
        
        .ios-markdown pre::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
        
        /* 优化段落间距 */
        .ios-markdown p + p {
          margin-top: 1.25rem;
        }
        
        /* 优化标题间距 */
        .ios-markdown h1 + p,
        .ios-markdown h2 + p,
        .ios-markdown h3 + p {
          margin-top: 0.5rem;
        }
      `}</style>
    </div>
  );
};

