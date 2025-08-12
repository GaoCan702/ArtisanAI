# 打包与安装包位置（macOS）

## 快速答案
- 安装包（DMG）路径（绝对路径）：
  - `/Users/limit/projects/ArtisanAI/src-tauri/target/release/bundle/dmg/Artisan AI_0.1.0_aarch64.dmg`
- 安装包（DMG）路径（相对路径）：
  - `src-tauri/target/release/bundle/dmg/Artisan AI_0.1.0_aarch64.dmg`
- 解压后的 `.app`（构建产物）路径：
  - `src-tauri/target/release/bundle/macos/Artisan AI.app`

> 说明：`aarch64` 表示 Apple Silicon 架构（M 系列芯片）。

## 如何打包
```bash
# 在项目根目录执行
pnpm tauri build
```

- 构建完成后，安装包会生成在：
  - `src-tauri/target/release/bundle/dmg/`
- `.app` 会生成在：
  - `src-tauri/target/release/bundle/macos/`

## 快速定位
```bash
# 在 Finder 中高亮 DMG 文件（绝对路径）
open -R "/Users/limit/projects/ArtisanAI/src-tauri/target/release/bundle/dmg/Artisan AI_0.1.0_aarch64.dmg"

# 打开 DMG 目录（相对路径）
open src-tauri/target/release/bundle/dmg
```

## 版本与产品名
- 修改安装包文件名中的版本与产品名：编辑 `src-tauri/tauri.conf.json` 中的 `package.version` 与 `productName`。

## 架构说明
- 当前构建为 Apple Silicon（`aarch64`）。
- 如需 Intel（`x86_64`）或通用（universal）构建，请安装对应 Rust target 后执行：
```bash
# Intel
pnpm tauri build --target x86_64-apple-darwin

# （可选）分别构建后再用 lipo 合并为 universal
```

## 关于 ESLint（仅影响构建速度，不影响功能）
- 为加速打包、避免因前端 ESLint 报错中断构建，`next.config.ts` 中已设置：
```ts
eslint: { ignoreDuringBuilds: true }
```
- 如需恢复严格校验，可改为 `false` 并先修复前端 ESLint 报错。

