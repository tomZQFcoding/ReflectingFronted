# 从 Gemini 迁移到 OpenRouter 说明

## 概述

项目已从 Google Gemini API 迁移到 OpenRouter API，使用 `allenai/olmo-3-32b-think:free` 模型（免费版本）。

## 主要变更

### 1. API 服务文件
- **旧文件**: `services/geminiService.ts`
- **新文件**: `services/openRouterService.ts`
- **功能**: 保持相同的接口，内部实现改为调用 OpenRouter API

### 2. 环境变量配置

#### 旧配置（Gemini）
```env
GEMINI_API_KEY=your_gemini_api_key
```

#### 新配置（OpenRouter）
```env
# 方式1：使用 OPENROUTER_API_KEY
OPENROUTER_API_KEY=your_openrouter_api_key

# 方式2：使用 Vite 环境变量（推荐）
VITE_OPENROUTER_API_KEY=your_openrouter_api_key
```

### 3. 获取 OpenRouter API Key

1. 访问 [OpenRouter](https://openrouter.ai/)
2. 注册账号并登录
3. 进入 [API Keys](https://openrouter.ai/keys) 页面
4. 创建新的 API Key
5. 复制 API Key 到 `.env` 文件

### 4. 使用的模型

- **模型名称**: `allenai/olmo-3-32b-think:free`
- **特点**: 
  - 32B 参数的大型语言模型
  - 专为深度推理和复杂逻辑链设计
  - 完全免费使用
  - 支持 65,536 tokens 上下文窗口
  - Apache 2.0 开源许可证

参考文档: [OpenRouter - Olmo 3 32B Think](https://openrouter.ai/allenai/olmo-3-32b-think:free)

## 代码变更详情

### App.tsx
- 导入从 `geminiService` 改为 `openRouterService`
- API Key 检查改为支持 `VITE_OPENROUTER_API_KEY` 或 `OPENROUTER_API_KEY`

### vite.config.ts
- 添加了 `VITE_OPENROUTER_API_KEY` 环境变量支持
- 保持向后兼容 `GEMINI_API_KEY`

### 服务接口保持不变
- `analyzeEntry()` - 分析复盘记录
- `generateWeeklyReport()` - 生成周报

## API 调用方式

### OpenRouter API 格式
```typescript
POST https://openrouter.ai/api/v1/chat/completions
Headers:
  Authorization: Bearer {API_KEY}
  Content-Type: application/json
  HTTP-Referer: {your_app_url} (可选)
  X-Title: ReflectAI (可选)

Body:
{
  "model": "allenai/olmo-3-32b-think:free",
  "messages": [
    { "role": "system", "content": "..." },
    { "role": "user", "content": "..." }
  ],
  "temperature": 0.7,
  "max_tokens": 2000,
  "response_format": { "type": "json_object" } // 可选
}
```

## 功能对比

| 功能 | Gemini | OpenRouter (Olmo) |
|------|--------|-------------------|
| 模型 | gemini-2.5-flash | olmo-3-32b-think:free |
| 费用 | 按使用量收费 | 完全免费 |
| 上下文窗口 | 较大 | 65,536 tokens |
| JSON 响应 | 原生支持 | 通过 response_format 支持 |
| 推理能力 | 强 | 专为深度推理设计 |

## 迁移步骤

1. **更新环境变量**
   ```bash
   # 在 .env 文件中添加
   VITE_OPENROUTER_API_KEY=your_api_key_here
   ```

2. **重启开发服务器**
   ```bash
   npm run dev
   ```

3. **测试功能**
   - 创建新的复盘记录
   - 测试 AI 分析功能
   - 测试周报生成功能

## 注意事项

1. **API Key 安全**: 不要将 API Key 提交到版本控制系统
2. **错误处理**: 如果 API Key 缺失，会显示友好的错误提示
3. **向后兼容**: 代码仍支持旧的 `GEMINI_API_KEY` 配置（如果存在）
4. **JSON 解析**: OpenRouter 返回的 JSON 可能被代码块包裹，代码已自动处理

## 故障排查

### API Key 未生效
- 检查 `.env` 文件是否在项目根目录
- 确认环境变量名称正确（`VITE_OPENROUTER_API_KEY`）
- 重启开发服务器

### API 调用失败
- 检查网络连接
- 确认 API Key 有效
- 查看浏览器控制台的错误信息
- 检查 OpenRouter 服务状态

### JSON 解析错误
- 代码已自动处理代码块包裹的情况
- 如果仍有问题，检查 AI 返回的内容格式

## 参考资源

- [OpenRouter 官方文档](https://openrouter.ai/docs)
- [Olmo 3 32B Think 模型页面](https://openrouter.ai/allenai/olmo-3-32b-think:free)
- [OpenRouter API 参考](https://openrouter.ai/docs/api-reference)

