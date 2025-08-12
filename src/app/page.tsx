"use client";
import { useCallback, useEffect, useState } from "react";
import { Sidebar } from "@/components/navigation/Sidebar";
import { SettingsDialog } from "@/components/ui/Settings";
import { CreateTaskSheet } from "@/components/tasks/CreateTaskSheet";
import { TaskDetail } from "@/components/tasks/TaskDetail";
import { TaskList } from "@/components/tasks/TaskList";
import { type GenerationTask, getTaskService } from "@/services/taskService";

export default function Home() {
  const [tasks, setTasks] = useState<GenerationTask[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [selectedArticleIndex, setSelectedArticleIndex] = useState<number>(0);
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const [isMiddleCollapsed, setIsMiddleCollapsed] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const [isCreateSheetOpen, setCreateSheetOpen] = useState(false);

  const refreshTasks = useCallback(async () => {
    try {
      const taskService = getTaskService();
      const tasksData = await taskService.getAllTasks();
      setTasks(tasksData);
    } catch (error) {
      console.error("获取任务失败:", error);
    }
  }, []);

  // 初始化与订阅任务流（支持流式更新）
  useEffect(() => {
    const service = getTaskService();
    const unsub = service.subscribe((next) => {
      setTasks(next);
    });
    void refreshTasks();
    return () => {
      unsub();
    };
  }, [refreshTasks]);

  // 活跃任务轮询刷新，保证第一列进度能实时更新
  useEffect(() => {
    const hasActive = tasks.some(
      (t) => t.status === "pending" || t.status === "processing",
    );
    if (!hasActive) return;
    const timer = setInterval(() => {
      void refreshTasks();
    }, 1500);
    return () => clearInterval(timer);
  }, [tasks, refreshTasks]);

  const handleCreateTask = async (
    companyInfo: string,
    productInfo: string,
    articleCount: number,
    targetWordCount: number,
  ) => {
    try {
      const taskService = getTaskService();
      await taskService.createTask(companyInfo, productInfo, articleCount, targetWordCount);
      setCreateSheetOpen(false); // Close sheet on success
      await refreshTasks(); // Refresh the task list
    } catch (error) {
      console.error("创建任务失败:", error);
      // Optionally: show an error message to the user
      throw error; // Re-throw to keep the sheet's submitting state
    }
  };

  const selectedTask = tasks.find((task) => task.id === selectedTaskId);

  // 默认选中第一个任务与其第一篇文章
  useEffect(() => {
    if (!selectedTaskId && tasks.length > 0) {
      setSelectedTaskId(tasks[0].id);
      setSelectedArticleIndex(0);
    }
  }, [tasks, selectedTaskId]);

  return (
    <div className="h-screen bg-gray-50 font-sans antialiased">
      <div className="h-full flex">
        {/* Sidebar */}
        {/* Main Content Area */}
        <main role="main" className="flex-1 flex min-w-0">
          {/* 第一列：任务列表（可折叠） */}
          {!isLeftCollapsed ? (
            <div className="w-72 shrink-0">
              <TaskList
                tasks={tasks}
                selectedTaskId={selectedTaskId}
                onSelectTask={(id) => {
                  setSelectedTaskId(id);
                  setSelectedArticleIndex(0);
                }}
                onNewTask={() => { setCreateSheetOpen(true); }}
                onCollapse={() => { setIsLeftCollapsed(true); }}
                onShowSettings={() => { setShowSettings(true); }}
              />
            </div>
          ) : (
            // 折叠后保留一个窄的展开条
            <div className="w-3 shrink-0 border-r bg-white flex items-center justify-center">
              <button
                type="button"
                className="w-full h-24 text-xs text-gray-400 hover:text-gray-600"
                title="展开任务栏"
                aria-label="展开任务栏"
                onClick={() => { setIsLeftCollapsed(false); }}
              >
                »
              </button>
            </div>
          )}

          {/* 第二列：文章列表（可折叠） */}
          {!isMiddleCollapsed ? (
            <section className="w-80 shrink-0 border-r bg-white flex flex-col min-h-0">
              <div className="h-16 flex items-center justify-between px-4 border-b">
                <h3 className="text-base font-semibold">文章列表</h3>
                <button
                  type="button"
                  onClick={() => { setIsMiddleCollapsed(true); }}
                  className="px-2 py-1 text-sm rounded-md text-gray-600 hover:bg-gray-100"
                  title="折叠"
                >
                  «
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                {selectedTask?.articles && selectedTask.articles.length > 0 ? (
                  <ul>
                    {selectedTask.articles.map((a, idx) => (
                      <li key={`${a.title}-${idx}`}>
                        <button
                          type="button"
                          onClick={() => { setSelectedArticleIndex(idx); }}
                          className={`w-full text-left p-4 border-b hover:bg-gray-50 ${
                            selectedArticleIndex === idx ? "bg-blue-50" :
                            // 高亮当前生成中的文章（当任务 processing 且该 idx 为当前进度对应项）
                            (selectedTask.status === "processing" && idx === Math.floor((selectedTask.progress/100)*selectedTask.articleCount)) ? "bg-yellow-50" : ""
                          }`}
                        >
                          <p className="font-medium text-sm truncate">{a.title}</p>
                          <p className="text-xs text-gray-500 mt-1">字数：{a.wordCount}</p>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-4 text-sm text-gray-500">暂无文章</div>
                )}
              </div>
            </section>
          ) : (
            // 折叠后保留窄展开条
            <div className="w-3 shrink-0 border-r bg-white flex items-center justify-center">
              <button
                type="button"
                className="w-full h-24 text-xs text-gray-400 hover:text-gray-600"
                title="展开文章列表"
                aria-label="展开文章列表"
                onClick={() => { setIsMiddleCollapsed(false); }}
              >
                »
              </button>
            </div>
          )}

          {/* 第三列：文章详情 */}
          <section className="flex-1 min-w-0">
            <TaskDetail
              task={selectedTask}
              selectedIndex={selectedArticleIndex}
              onCollapse={() => {
                // 展开前两列，便于用户切换
                setIsLeftCollapsed(false);
                setIsMiddleCollapsed(false);
              }}
            />
          </section>
        </main>
      </div>

      {/* 设置弹窗 */}
      {showSettings && (
        <SettingsDialog onClose={() => { setShowSettings(false); }} />
      )}

      <CreateTaskSheet
        open={isCreateSheetOpen}
        onOpenChange={setCreateSheetOpen}
        onSubmit={handleCreateTask}
      />
    </div>
  );
}
