"use client";
import { Settings as SettingsIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { ContentGenerator } from "@/components/generator/ContentGenerator";
import { TaskManager } from "@/components/tasks/TaskManager";
import { SettingsDialog } from "@/components/ui/Settings";
import { type GenerationTask, getTaskService } from "@/services/taskService";

export default function Home() {
  const [currentView, setCurrentView] = useState<"generator" | "tasks">(
    "generator",
  );
  const [tasks, setTasks] = useState<GenerationTask[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const handleSubmitTask = async (
    companyInfo: string,
    productInfo: string,
    articleCount: number,
  ) => {
    setIsSubmitting(true);

    try {
      const taskService = getTaskService();
      const newTask = await taskService.createTask(
        companyInfo,
        productInfo,
        articleCount,
      );

      // 添加任务到本地状态
      setTasks((prev) => [newTask, ...prev]);

      // 切换到任务管理视图
      setCurrentView("tasks");
    } catch (error) {
      console.error("提交任务失败:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const refreshTasks = async () => {
    try {
      const taskService = getTaskService();
      const tasksData = await taskService.getAllTasks();
      setTasks(tasksData);
    } catch (error) {
      console.error("获取任务失败:", error);
    }
  };

  // 初始化时加载任务
  useEffect(() => {
    void refreshTasks();
  }, []);

  return (
    <div className="h-screen bg-gray-50">
      <div className="h-full flex flex-col">
        {/* 导航栏 */}
        <div className="bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">AI 内容生成工具</h1>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentView("generator")}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  currentView === "generator"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                创建任务
              </button>
              <button
                type="button"
                onClick={() => setCurrentView("tasks")}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  currentView === "tasks"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                任务管理
              </button>
              <button
                type="button"
                onClick={() => setShowSettings(true)}
                className="p-2 text-gray-600 hover:text-gray-900 rounded-md hover:bg-gray-100"
                title="设置"
              >
                <SettingsIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 主内容区 */}
        <div className="flex-1 overflow-hidden">
          {currentView === "generator" ? (
            <ContentGenerator
              onSubmit={handleSubmitTask}
              isSubmitting={isSubmitting}
            />
          ) : (
            <TaskManager tasks={tasks} onRefresh={refreshTasks} />
          )}
        </div>
      </div>

      {/* 设置弹窗 */}
      {showSettings && <SettingsDialog onClose={() => setShowSettings(false)} />}
    </div>
  );
}
