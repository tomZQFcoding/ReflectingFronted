# 环境变量配置指南

## 快速配置 OpenRouter API Key

### 步骤 1: 创建 .env 文件

在 `Reflecting_fronted` 目录下创建 `.env` 文件：

**Windows (PowerShell):**
```powershell
cd Reflecting_fronted
New-Item -Path .env -ItemType File -Force
Add-Content -Path .env -Value "VITE_OPENROUTER_API_KEY=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"
```

**Windows (CMD):**
```cmd
cd Reflecting_fronted
echo VITE_OPENROUTER_API_KEY=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 > .env
```

**Linux/Mac:**
```bash
cd Reflecting_fronted
echo "VITE_OPENROUTER_API_KEY=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" > .env
```

### 步骤 2: 手动创建（推荐）

1. 在 `Reflecting_fronted` 目录下创建新文件，命名为 `.env`
2. 复制以下内容到文件中：

```env
VITE_OPENROUTER_API_KEY=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
```

**重要提示：**
- 文件名必须是 `.env`（注意前面的点）
- 文件必须在 `Reflecting_fronted` 目录下（不是项目根目录）
- 环境变量名必须以 `VITE_` 开头

### 步骤 3: 验证文件内容

`.env` 文件内容应该是：
```
VITE_OPENROUTER_API_KEY=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
```

### 步骤 4: 重启开发服务器

**重要：修改 .env 文件后必须重启开发服务器！**

1. 停止当前运行的开发服务器（按 `Ctrl+C`）
2. 重新启动：
   ```bash
   npm run dev
   ```

### 步骤 5: 验证配置

1. 打开浏览器开发者工具（F12）
2. 在控制台中输入：
   ```javascript
   console.log(import.meta.env.VITE_OPENROUTER_API_KEY)
   ```
3. 应该能看到你的 API Key（部分显示）

## 故障排查

### 问题 1: 仍然显示 "OpenRouter API Key is missing"

**解决方案：**
1. 确认 `.env` 文件在 `Reflecting_fronted` 目录下
2. 确认环境变量名是 `VITE_OPENROUTER_API_KEY`（注意大小写）
3. **重启开发服务器**（这是最重要的步骤）
4. 检查 `.env` 文件中没有多余的空格或引号

### 问题 2: 无法创建 .env 文件

**Windows 解决方案：**
- 使用文本编辑器（如 VS Code、Notepad++）创建文件
- 保存时选择"所有文件"类型，文件名输入 `.env`

**或者使用命令行：**
```powershell
cd Reflecting_fronted
"VITE_OPENROUTER_API_KEY=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" | Out-File -FilePath .env -Encoding utf8
```

### 问题 3: 环境变量读取不到

**检查清单：**
- [ ] `.env` 文件在 `Reflecting_fronted` 目录下
- [ ] 环境变量名以 `VITE_` 开头
- [ ] 没有多余的空格或引号
- [ ] 已重启开发服务器
- [ ] 文件编码是 UTF-8

### 问题 4: 开发服务器无法启动

如果修改 `.env` 后服务器无法启动，检查：
1. 文件格式是否正确（每行一个变量）
2. 没有语法错误
3. 可以尝试删除 `.env` 文件后重新创建

## 文件位置示例

```
Reflecting/
├── Reflecting_backed/
└── Reflecting_fronted/
    ├── .env          ← 在这里创建
    ├── package.json
    ├── vite.config.ts
    └── ...
```

## 安全提示

- ✅ `.env` 文件已添加到 `.gitignore`，不会被提交到 Git
- ❌ 不要将 API Key 分享给他人
- ❌ 不要将 `.env` 文件提交到版本控制
- ✅ 如果 API Key 泄露，立即在 OpenRouter 重新生成

## 测试配置

配置完成后，测试步骤：
1. 创建新的复盘记录
2. 填写内容
3. 点击"生成报告"按钮
4. 应该能正常调用 AI 分析功能

如果仍有问题，请检查浏览器控制台的错误信息。

