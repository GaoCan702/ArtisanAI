"use client";

import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";
import type { GenerationTask } from "@/services/taskService";
import { Settings as SettingsIcon } from "lucide-react";

interface TaskListProps {
  tasks: GenerationTask[];
  selectedTaskId: string | null;
  onSelectTask: (id: string) => void;
  onNewTask: () => void;
  onCollapse?: () => void;
  onShowSettings?: () => void;
}

export function TaskList({
  tasks,
  selectedTaskId,
  onSelectTask,
  onNewTask,
  onCollapse,
  onShowSettings,
}: TaskListProps) {
  return (
    <section className="flex flex-col bg-white border-r h-full">
      <div className="h-16 flex items-center justify-between px-4 border-b gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <h1 className="text-base font-semibold truncate">Artisan AI</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onNewTask}
            className="px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            title="新建任务"
          >
            新建
          </button>
          {onShowSettings && (
            <button
              type="button"
              onClick={onShowSettings}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-md"
              title="设置"
              aria-label="打开设置"
            >
              <SettingsIcon className="w-4 h-4" />
            </button>
          )}
          {onCollapse && (
            <button
              type="button"
              onClick={onCollapse}
              className="px-2 py-1 text-sm rounded-md text-gray-600 hover:bg-gray-100"
              aria-label="折叠任务栏"
              title="折叠"
            >
              «
            </button>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {tasks.length === 0 ? (
          <div className="p-4 text-center text-sm text-gray-500">
            <p>还没有任务。</p>
            <p>点击“新建”来创建一个新任务。</p>
          </div>
        ) : (
          <ul>
            {tasks.map((task) => (
              <li key={task.id}>
                <button
                  type="button"
                  onClick={() => { onSelectTask(task.id); }}
                  className={`w-full text-left p-4 border-b hover:bg-gray-50 focus:outline-none ${
                    selectedTaskId === task.id ? "bg-blue-50" : ""
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <p className="font-semibold text-sm truncate">
                      {task.companyInfo}
                    </p>
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(task.createdAt, {
                        addSuffix: true,
                        locale: zhCN,
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 truncate">
                    {task.productInfo}
                  </p>
                  <div className="mt-2 space-y-1">
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          task.status === "failed"
                            ? "bg-red-500"
                            : task.status === "completed"
                              ? "bg-green-500"
                              : "bg-blue-500"
                        }`}
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-gray-500">
                      <span>{task.status}</span>
                      <span>
                        {Math.floor((task.progress / 100) * task.articleCount)} / {task.articleCount}
                        
                        <span className="ml-1">({task.progress}%)</span>
                      </span>
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
