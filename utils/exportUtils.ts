import { ReviewEntry } from '../types';
import { FRAMEWORKS } from '../constants';

/**
 * 导出为Markdown格式
 */
export const exportToMarkdown = (entries: ReviewEntry[]): string => {
  let markdown = '# 复盘记录导出\n\n';
  markdown += `导出时间：${new Date().toLocaleString('zh-CN')}\n`;
  markdown += `共 ${entries.length} 条记录\n\n`;
  markdown += '---\n\n';

  entries.forEach((entry, index) => {
    const config = FRAMEWORKS[entry.framework];
    const date = new Date(entry.date).toLocaleDateString('zh-CN');
    
    markdown += `## ${index + 1}. ${entry.aiAnalysis?.summary || '复盘记录'}\n\n`;
    markdown += `**日期**：${date}\n\n`;
    markdown += `**框架**：${config.label}\n\n`;
    
    if (entry.tags && entry.tags.length > 0) {
      markdown += `**标签**：${entry.tags.join('、')}\n\n`;
    }
    
    if (entry.aiAnalysis) {
      markdown += `**状态评分**：${entry.aiAnalysis.sentimentScore}/10\n\n`;
      markdown += `### 核心洞察\n\n> ${entry.aiAnalysis.keyInsight}\n\n`;
      markdown += `### 摘要\n\n${entry.aiAnalysis.summary}\n\n`;
      
      if (entry.aiAnalysis.actionItems.length > 0) {
        markdown += `### 行动建议\n\n`;
        entry.aiAnalysis.actionItems.forEach((item, i) => {
          markdown += `${i + 1}. ${item}\n`;
        });
        markdown += '\n';
      }
    }
    
    markdown += `### 复盘内容\n\n`;
    Object.entries(entry.content).forEach(([key, value]) => {
      const prompt = config.prompts.find(p => p.key === key);
      markdown += `#### ${prompt?.label || key}\n\n${value}\n\n`;
    });
    
    markdown += '---\n\n';
  });

  return markdown;
};

/**
 * 导出为JSON格式
 */
export const exportToJSON = (entries: ReviewEntry[]): void => {
  downloadFile(JSON.stringify(entries, null, 2), `reflect_ai_backup_${new Date().toISOString().slice(0,10)}.json`, 'application/json');
};

/**
 * 下载文件
 */
export const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * 导出为图片（使用Canvas）
 */
export const exportToImage = async (entry: ReviewEntry): Promise<void> => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  canvas.width = 1200;
  canvas.height = 1600;
  
  // 背景
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // 标题
  ctx.fillStyle = '#1e293b';
  ctx.font = 'bold 48px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(entry.aiAnalysis?.summary || '复盘记录', canvas.width / 2, 80);
  
  // 日期
  ctx.fillStyle = '#64748b';
  ctx.font = '24px Inter, sans-serif';
  const date = new Date(entry.date).toLocaleDateString('zh-CN');
  ctx.fillText(date, canvas.width / 2, 130);
  
  // 内容
  ctx.fillStyle = '#334155';
  ctx.font = '28px Inter, sans-serif';
  ctx.textAlign = 'left';
  let y = 200;
  const lineHeight = 40;
  const padding = 60;
  const maxWidth = canvas.width - padding * 2;
  
  Object.entries(entry.content).forEach(([key, value]) => {
    const config = FRAMEWORKS[entry.framework];
    const prompt = config.prompts.find(p => p.key === key);
    
    // 标题
    ctx.fillStyle = '#6366f1';
    ctx.font = 'bold 32px Inter, sans-serif';
    ctx.fillText(prompt?.label || key, padding, y);
    y += lineHeight + 10;
    
    // 内容（换行处理）
    ctx.fillStyle = '#475569';
    ctx.font = '24px Inter, sans-serif';
    const words = value.split('');
    let line = '';
    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i];
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && i > 0) {
        ctx.fillText(line, padding, y);
        line = words[i];
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    if (line) {
      ctx.fillText(line, padding, y);
    }
    y += lineHeight * 2;
  });
  
  // 转换为图片并下载
  canvas.toBlob((blob) => {
    if (blob) {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `复盘_${date.replace(/\//g, '-')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  }, 'image/png');
};

/**
 * 导出为PDF（使用html2canvas和jsPDF，需要安装依赖）
 * 这里提供一个基础实现，实际使用时需要安装相关库
 */
export const exportToPDF = async (entries: ReviewEntry[]): Promise<void> => {
  // 注意：这需要安装 jsPDF 和 html2canvas
  // npm install jspdf html2canvas
  // 这里提供一个占位实现
  console.warn('PDF导出功能需要安装 jsPDF 和 html2canvas 库');
  // 静默降级到 Markdown 导出，不显示弹窗
  const markdown = exportToMarkdown(entries);
  downloadFile(markdown, `复盘记录_${new Date().toISOString().split('T')[0]}.md`, 'text/markdown');
};

