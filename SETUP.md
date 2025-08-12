# ArtisanAI 设置指南

## 快速开始

### 1. 安装依赖
```bash
pnpm install
```

### 2. 配置Gemini API
1. 访问 [Google AI Studio](https://makersuite.google.com/app/apikey) 获取API Key
2. 复制 `.env.local.example` 为 `.env.local`
3. 在 `.env.local` 中填入你的API Key：
```bash
NEXT_PUBLIC_GEMINI_API_KEY=your_actual_api_key_here
```

### 3. 启动开发服务器
```bash
# 启动Tauri应用（推荐）
pnpm tauri dev

# 或者只启动网页版
pnpm dev
```

## 项目架构

### 前端（Next.js）
- **页面**: `src/app/page.tsx` - 主应用界面
- **组件**: 
  - `src/components/generator/` - 任务创建界面
  - `src/components/tasks/` - 任务管理界面
  - `src/components/ui/` - UI组件库
- **服务**: 
  - `src/services/geminiService.ts` - AI内容生成服务
  - `src/services/taskService.ts` - 任务管理服务

### 后端（Rust/Tauri）
- **主文件**: `src/lib.rs` - 任务队列管理和文件操作
- **职责**: 数据持久化、文件导出、系统级操作

## 功能说明

### 任务创建
1. 填写公司信息和产品信息
2. 设置要生成的文章数量（1-50篇）
3. 点击提交创建任务

### 任务管理
1. 查看所有任务的状态和进度
2. 实时监控任务处理进度
3. 导出完成的文章（Markdown/HTML/TXT格式）

### AI生成
- 使用预设的营销文章模板
- 每篇文章800-1200字
- 自动提取标题和统计字数

## 开发命令

```bash
# 开发
pnpm tauri dev    # Tauri应用开发
pnpm dev          # 网页开发

# 构建
pnpm build        # 构建前端
pnpm tauri build  # 构建完整应用

# 代码质量
pnpm lint         # 检查代码风格
pnpm fix          # 自动修复代码风格
pnpm test         # 运行测试
```

## 故障排除

### API连接问题
- 检查网络连接
- 确认API Key是否正确
- 查看浏览器开发者工具的错误信息

### 编译问题
- 确保所有依赖已安装：`pnpm install`
- 清理缓存：`rm -rf .next node_modules && pnpm install`
- 检查Rust工具链：`rustc --version`

### 任务处理慢
- Gemini API有速率限制，任务间会自动添加延迟
- 大批量文章生成需要更长时间
- 可以在任务管理界面查看实时进度