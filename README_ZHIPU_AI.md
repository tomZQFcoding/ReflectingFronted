# 智谱AI (GLM-4.5-Flash) 配置指南

## 概述

本项目现在支持两种AI模型：
1. **OpenRouter** - Olmo 3 32B Think (免费)
2. **智谱AI** - GLM-4.5-Flash (免费)

## 获取智谱AI API Key

1. 访问 [智谱AI开放平台](https://open.bigmodel.cn/)
2. 注册/登录账号
3. 进入控制台，创建API Key
4. 复制你的API Key

## 配置环境变量

在 `Reflecting_fronted/.env` 文件中添加：

```env
VITE_ZHIPU_API_KEY=your_zhipu_api_key_here
```

或者：

```env
ZHIPU_API_KEY=your_zhipu_api_key_here
```

## 使用模型选择功能

1. 在创建或编辑复盘记录时，点击底部的模型选择按钮（显示当前选定的模型名称）
2. 从下拉菜单中选择要使用的AI模型：
   - **OpenRouter** - Olmo 3 32B Think
   - **智谱AI** - GLM-4.5-Flash
3. 选择的模型会被保存到本地存储，下次打开应用时会自动使用上次选择的模型

## API端点

智谱AI使用以下API端点：
- URL: `https://open.bigmodel.cn/api/paas/v4/chat/completions`
- Model: `glm-4.5-flash`
- 支持深度思考模式（默认启用）

## 注意事项

- 确保 `.env` 文件位于 `Reflecting_fronted` 目录下
- 修改 `.env` 文件后需要重启开发服务器
- 如果API Key未配置，对应的模型选项仍然可以显示，但无法使用AI分析功能
- 两种模型可以同时配置，用户可以根据需要切换使用

## 故障排除

如果遇到问题：

1. **API Key未识别**
   - 检查 `.env` 文件是否在正确的位置
   - 确认环境变量名称是否正确（必须以 `VITE_` 开头）
   - 重启开发服务器

2. **API调用失败**
   - 检查API Key是否有效
   - 确认网络连接正常
   - 查看浏览器控制台的错误信息

3. **模型选择器不显示**
   - 检查是否正确导入了相关组件
   - 查看浏览器控制台是否有错误

## 参考文档

- [智谱AI GLM-4.5-Flash 官方文档](https://docs.bigmodel.cn/cn/guide/models/free/glm-4.5-flash)

