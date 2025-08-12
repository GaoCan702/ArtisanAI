# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Tauri 2.0 + Next.js 15 desktop application template that combines a React frontend with a Rust backend. The application uses static site generation (SSG) to bundle the Next.js frontend into the Tauri webview.

## Development Commands

- `pnpm tauri dev` - Start development server with Tauri window (recommended for development)
- `pnpm dev` - Start Next.js development server only (runs on localhost:3000)
- `pnpm build` - Build Next.js for production
- `pnpm tauri build` - Build complete Tauri application for release
- `pnpm lint` - Run Biome and ESLint checks
- `pnpm fix` - Auto-fix linting issues with Biome and ESLint
- `pnpm test` - Run tests with Vitest

## Architecture

### Frontend (Next.js)
- **Framework**: Next.js 15 with App Router
- **Styling**: TailwindCSS 4 with utility-first approach
- **Fonts**: Geist Sans and Geist Mono loaded via next/font/google
- **Structure**: 
  - `src/app/` - Next.js App Router pages and layouts
  - `src/components/` - Reusable React components
  - `src/styles/` - Global CSS styles

### Backend (Tauri/Rust)
- **Framework**: Tauri 2.0 for desktop app wrapper
- **Commands**: Rust functions exposed to frontend via `#[tauri::command]`
- **Structure**:
  - `src-tauri/src/lib.rs` - Main Tauri application entry point
  - `src-tauri/src/main.rs` - Application main function
  - `src-tauri/tauri.conf.json` - Tauri configuration

### Frontend-Backend Communication
- Use `@tauri-apps/api/core` `invoke()` function to call Rust commands
- Import Tauri functions lazily in client components to avoid SSR issues
- Example: `invoke<string>("greet")` calls the `greet` Rust command

## Important Configuration Notes

- **App Identifier**: Must be changed in `src-tauri/tauri.conf.json` before building for release
- **Static Export**: Next.js is configured for static export only (no SSR)
- **Image Optimization**: `next/image` uses `unoptimized: true` for static builds
- **Testing**: Uses Vitest with React Testing Library

## Linting and Formatting

- **Biome**: Primary tool for TypeScript formatting, linting, and import sorting
- **ESLint**: Covers Next.js-specific rules not handled by Biome
- **Rust**: Uses clippy and rustfmt for Rust code quality