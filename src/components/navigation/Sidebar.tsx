"use client";

import { Settings as SettingsIcon } from "lucide-react";

interface SidebarProps {
  onShowSettings: () => void;
}

export function Sidebar({ onShowSettings }: SidebarProps) {
  // 此侧栏已由左侧任务栏替代，保留占位或未来导航扩展使用
  return null;
}
