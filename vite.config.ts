import path from 'path';
import fs from 'fs';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const envDir = path.resolve(__dirname);
    const envFilePath = path.join(envDir, '.env');
    
    let openRouterApiKey = '';
    
    // 方法1: 尝试使用 loadEnv
    const env = loadEnv(mode, envDir, '');
    openRouterApiKey = env.VITE_OPENROUTER_API_KEY || env.OPENROUTER_API_KEY || '';
    
    // 方法2: 如果 loadEnv 读取不到，直接读取文件
    if (!openRouterApiKey) {
      try {
        if (fs.existsSync(envFilePath)) {
          let envFileContent = fs.readFileSync(envFilePath, 'utf-8');
          
          // 移除 UTF-8 BOM
          if (envFileContent.charCodeAt(0) === 0xFEFF || envFileContent.charCodeAt(0) === 65279) {
            envFileContent = envFileContent.slice(1);
          }
          envFileContent = envFileContent.replace(/^\uFEFF/, '');
          
          // 使用正则表达式匹配
          const apiKeyMatch = envFileContent.match(/VITE_OPENROUTER_API_KEY\s*=\s*([^\s\r\n]+)/);
          if (apiKeyMatch && apiKeyMatch[1]) {
            openRouterApiKey = apiKeyMatch[1].trim();
            openRouterApiKey = openRouterApiKey.replace(/^["']|["']$/g, '');
          } else {
            // 查找等号位置，然后提取后面的内容
            const equalIndex = envFileContent.indexOf('VITE_OPENROUTER_API_KEY=');
            if (equalIndex !== -1) {
              const afterEqual = envFileContent.substring(equalIndex + 'VITE_OPENROUTER_API_KEY='.length);
              const endIndex = afterEqual.search(/[\r\n]/);
              if (endIndex !== -1) {
                openRouterApiKey = afterEqual.substring(0, endIndex).trim();
              } else {
                openRouterApiKey = afterEqual.trim();
              }
              openRouterApiKey = openRouterApiKey.replace(/^["']|["']$/g, '');
            }
            
            // 如果还是失败，尝试按行解析
            if (!openRouterApiKey) {
              const lines = envFileContent.split(/\r?\n/);
              for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                const cleanLine = line.replace(/^\uFEFF/, '').trim();
                const match = cleanLine.match(/^VITE_OPENROUTER_API_KEY\s*=\s*(.+)$/);
                if (match && match[1]) {
                  openRouterApiKey = match[1].trim();
                  openRouterApiKey = openRouterApiKey.replace(/^["']|["']$/g, '');
                  break;
                }
              }
            }
          }
        }
      } catch (error) {
        // 静默处理错误
      }
    }
    
    // 方法3: 从 process.env 读取（作为最后的后备）
    if (!openRouterApiKey) {
      openRouterApiKey = process.env.VITE_OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY || '';
    }
    
    return {
      server: {
        port: 3001,
        host: '0.0.0.0',
        proxy: {
          '/api': {
            target: 'http://localhost:8101',
            changeOrigin: true,
            secure: false,
          }
        }
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(openRouterApiKey || env.GEMINI_API_KEY || ''),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || ''),
        'import.meta.env.VITE_OPENROUTER_API_KEY': JSON.stringify(openRouterApiKey),
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
