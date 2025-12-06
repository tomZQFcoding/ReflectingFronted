# OpenRouter API Key 配置故障排查

## 当前问题

浏览器控制台显示：
- `import.meta.env.VITE_OPENROUTER_API_KEY: Not found`
- 但 `import.meta.env keys: Array(2)` 显示键存在

这说明 Vite 识别了环境变量键，但值没有被正确读取。

## 可能的原因

1. **Vite 的 loadEnv 没有正确读取 .env 文件**
2. **.env 文件格式问题**（BOM、编码、隐藏字符）
3. **Vite 配置问题**（手动 define 覆盖了自动处理）

## 解决方案

### 方案 1: 检查服务器启动日志

重启服务器后，查看终端输出，应该看到：

```
=== Vite Environment Variables ===
VITE_OPENROUTER_API_KEY value: Found (sk-or-v1-29081e...)
VITE_OPENROUTER_API_KEY length: 99
```

**如果显示 "Not found or empty" 或 length: 0**，说明 `loadEnv` 没有读取到值。

### 方案 2: 验证 .env 文件

1. **确认文件位置**：`Reflecting_fronted/.env`
2. **确认文件内容**（没有引号，没有多余空格）：
   ```
   VITE_OPENROUTER_API_KEY=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
   ```
3. **检查文件编码**：应该是 UTF-8，没有 BOM

### 方案 3: 使用 Vite 的默认机制

已移除手动 `define import.meta.env.*`，让 Vite 自动处理。

Vite 会自动读取 `.env` 文件中以 `VITE_` 开头的环境变量。

### 方案 4: 临时硬编码测试（仅用于验证）

如果以上都不行，可以在 `openRouterService.ts` 中临时硬编码：

```typescript
const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY || 
               "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" || 
               "";
```

**注意：这只是临时测试，不要提交到 Git！**

## 下一步

1. **重启服务器**（完全停止并重新启动）
2. **查看服务器启动日志**，告诉我：
   - `VITE_OPENROUTER_API_KEY value:` 显示什么？
   - `VITE_OPENROUTER_API_KEY length:` 显示多少？
3. **查看浏览器控制台**，确认是否还有错误

## 如果仍然不行

请提供：
1. 服务器启动时的完整日志（特别是 `=== Vite Environment Variables ===` 部分）
2. 浏览器控制台的完整错误信息
3. `.env` 文件的完整内容（可以隐藏部分 API Key）

