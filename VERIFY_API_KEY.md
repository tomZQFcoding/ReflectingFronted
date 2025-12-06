# 验证 OpenRouter API Key 配置

## 为什么不能在控制台直接使用 import.meta？

`import.meta` 是 ES 模块的特性，只能在模块代码中使用，不能在浏览器控制台直接运行。

## 正确的验证方法

### 方法 1: 查看浏览器控制台（推荐）

启动开发服务器后，打开浏览器控制台（F12），应该能看到：

```
OpenRouter API Key Status: ✓ Configured
```

如果看到：
```
OpenRouter API Key Status: ✗ Missing
Please set VITE_OPENROUTER_API_KEY in your .env file
```

说明 API Key 未正确配置。

### 方法 2: 检查网络请求

1. 打开浏览器开发者工具（F12）
2. 切换到 "Network"（网络）标签
3. 尝试使用 AI 分析功能
4. 查看是否有对 `openrouter.ai` 的请求
5. 如果请求失败，查看错误信息

### 方法 3: 在代码中临时添加调试

如果上述方法都不行，可以在 `App.tsx` 中临时添加：

```typescript
// 在 App.tsx 的 useEffect 中添加
useEffect(() => {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
  console.log('API Key from env:', apiKey ? 'Found' : 'Not found');
  if (apiKey) {
    console.log('API Key length:', apiKey.length);
  }
}, []);
```

### 方法 4: 检查 .env 文件

确认 `.env` 文件内容：

1. 文件位置：`Reflecting_fronted/.env`
2. 文件内容应该是：
   ```
   VITE_OPENROUTER_API_KEY=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
   ```
3. 注意：
   - 没有引号
   - 没有多余空格
   - 变量名完全匹配

## 常见问题

### Q: 为什么修改 .env 后还是显示错误？

**A:** 必须重启开发服务器！
- 停止服务器（Ctrl+C）
- 重新运行 `npm run dev`

### Q: .env 文件应该放在哪里？

**A:** 必须在 `Reflecting_fronted` 目录下，不是项目根目录。

```
Reflecting/
├── Reflecting_backed/
└── Reflecting_fronted/
    ├── .env          ← 这里
    ├── package.json
    └── ...
```

### Q: 环境变量名必须是什么？

**A:** 必须是 `VITE_OPENROUTER_API_KEY`（以 `VITE_` 开头）

Vite 只会暴露以 `VITE_` 开头的环境变量到客户端代码中。

### Q: 如何确认环境变量被正确读取？

**A:** 查看开发服务器启动时的日志，或者查看浏览器控制台的日志。

## 快速测试

1. 确认 `.env` 文件存在且内容正确
2. **重启开发服务器**
3. 打开浏览器控制台，查看是否有 "OpenRouter API Key Status: ✓ Configured"
4. 尝试创建一个复盘记录并使用 AI 分析功能

如果仍然有问题，请检查：
- `.env` 文件位置
- 环境变量名称
- 是否重启了服务器
- 浏览器控制台的错误信息

