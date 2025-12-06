# 前后端整合说明

## 概述

前端项目已成功整合后端API，现在前端可以通过API调用后端服务。

## 配置说明

### 1. 后端服务配置

后端服务运行在：
- 地址: `http://localhost:8101`
- API路径前缀: `/api`
- 完整API地址: `http://localhost:8101/api`

### 2. 前端代理配置

前端开发服务器已配置代理，所有 `/api` 开头的请求会自动转发到后端：
- 前端开发服务器: `http://localhost:3000`
- 代理配置: `/api` -> `http://localhost:8101`

### 3. 环境变量

创建 `.env` 文件（参考 `.env.example`）：
```env
# OpenRouter API Key (推荐使用)
OPENROUTER_API_KEY=your_openrouter_api_key_here
# 或者使用 VITE_OPENROUTER_API_KEY (Vite 环境变量)
VITE_OPENROUTER_API_KEY=your_openrouter_api_key_here

# 兼容旧配置（可选）
GEMINI_API_KEY=your_gemini_api_key_here
```

**获取 OpenRouter API Key:**
1. 访问 [OpenRouter](https://openrouter.ai/)
2. 注册账号并创建 API Key
3. 当前使用的模型：`allenai/olmo-3-32b-think:free` (免费)
4. 将 API Key 配置到 `.env` 文件中

## 启动步骤

### 1. 启动后端服务

```bash
cd Reflecting_backed
# 确保数据库已配置并运行
mvn spring-boot:run
```

后端将在 `http://localhost:8101` 启动

### 2. 启动前端服务

```bash
cd Reflecting_fronted
npm install  # 如果还没安装依赖
npm run dev
```

前端将在 `http://localhost:3000` 启动

## API接口说明

### 复盘记录相关接口

- `GET /api/reviewEntry/my/list` - 获取当前用户的所有复盘记录
- `GET /api/reviewEntry/get?id={id}` - 根据ID获取复盘记录
- `POST /api/reviewEntry/add` - 创建复盘记录
- `POST /api/reviewEntry/edit` - 更新复盘记录
- `POST /api/reviewEntry/delete` - 删除复盘记录

### 健康检查接口

- `GET /api/health` - 健康检查
- `GET /api/health/detail` - 详细健康信息

## 代码结构

### API服务层

- `services/apiClient.ts` - API客户端基础配置（GET/POST/PUT/DELETE）
- `services/reviewEntryApi.ts` - 复盘记录API服务
- `services/healthApi.ts` - 健康检查API服务

### 数据转换

前端和后端的数据格式略有不同：
- 后端使用JSON字符串存储 `content` 和 `tags`
- 前端使用对象和数组
- `reviewEntryApi.ts` 中已实现自动转换

## 注意事项

1. **CORS配置**: 后端已配置CORS，允许前端跨域访问
2. **Session认证**: API请求会自动携带cookie（credentials: 'include'）
3. **错误处理**: API调用失败时会显示错误提示，并尝试从localStorage加载（兼容模式）
4. **数据同步**: 前端操作会立即同步到后端，不再依赖localStorage

## 故障排查

### 前端无法连接后端

1. 确认后端服务已启动（访问 `http://localhost:8101/api/health`）
2. 检查浏览器控制台是否有CORS错误
3. 确认Vite代理配置正确

### 数据加载失败

1. 检查后端数据库连接
2. 确认用户已登录（如果需要）
3. 查看浏览器Network标签页的请求详情

## 开发建议

1. 使用浏览器开发者工具监控API请求
2. 查看后端日志了解请求处理情况
3. 使用Swagger文档（如果已配置）查看API详情

