### Artisan AI（智写匠）

**一款面向营销内容生产的桌面应用，基于 LLM 批量生成高质量 Markdown 文章。**

---

### 功能特性
- **任务驱动工作流**：三栏布局（任务列表 / 文章列表 / 文章详情），可折叠，实时高亮当前生成中篇目
- **批量生成**：粘贴公司与产品信息，按 1-20（引擎支持 1-100）篇批量生成
- **流式回显**：生成过程中逐步回显 Markdown 内容并更新进度
- **目标字数**：支持为每篇设置目标字数（±20% 容差）
- **复制与导出**：复制单篇/全部；后端已实现导出为 markdown/txt/html（前端入口即将上线）
- **密钥管理**：内置设置面板，保存与测试 Google Gemini API Key（本地存储，不出本机）
- **跨平台**：Tauri 2 打包，支持 macOS 与 Windows

---

### 技术栈
- 前端：Next.js 15、React 19、Tailwind CSS 4、React Markdown
- 桌面端：Tauri 2（Rust）
- 模型：Google Generative AI（Gemini 1.5 Flash）

---

### 快速开始

#### 1) 准备环境
- Node.js 20+，pnpm（通过 Corepack 自动启用）
- Rust 工具链
- Tauri 运行依赖（按平台安装）
  - 参考文档：[`Tauri - Getting Started`](https://tauri.app/start/)

#### 2) 拉取依赖
```bash
corepack enable
pnpm install --frozen-lockfile
```

#### 3) 配置 API Key（二选一）
- 打开应用后通过“设置”对话框保存 Gemini API Key（推荐）
- 或在开发时设置环境变量：`NEXT_PUBLIC_GEMINI_API_KEY="your_key"`

#### 4) 本地开发（桌面应用）
```bash
pnpm tauri dev
```

#### 5) 仅构建前端（供 Tauri 使用）
```bash
pnpm build
```
产物输出到 `dist/`，Tauri 配置已指向该目录。

#### 6) 打包应用
```bash
pnpm tauri build
```
打包产物位于 `src-tauri/target/` 下的对应平台目录。

---

### 使用指南
1. 左上角点击“新建”，填写公司信息、产品信息、生成数量与目标字数
2. 生成过程中可实时查看进度与流式内容，当前生成篇目会在列表中高亮
3. 在右侧详情中可复制单篇内容；顶部支持“复制全部”
4. 导出为文件（markdown/txt/html）功能已由后端提供，前端入口将很快上线

---

### 目录结构（节选）
```
src/
  app/page.tsx                 # 三栏主界面与任务流
  components/
    tasks/                     # 任务列表、详情、创建面板
    ui/                        # 基础 UI 组件与设置面板
  services/
    geminiService.ts           # 与 Gemini API 通信（流式/同步）
    taskService.ts             # 任务编排、进度同步与导出调用
src-tauri/
  tauri.conf.json              # Tauri 配置（dist 作为前端产物）
```

---

### 常见问题
- 生成失败或无响应？请在“设置”中检查并测试 API Key；网络需可访问 Google AI 服务
- 为什么仅能生成 1-20 篇？UI 默认限制为 1-20，底层引擎支持到 100（防止误操作）
- 内容字数不精确？目标字数为软约束，按 ±20% 容差控制

---

### 许可证
本项目采用 MIT 协议，详见 `LICENSE`。

---

### 贡献
欢迎提交 Issue 与 Pull Request，共建更好用的 AI 内容生成工具。


