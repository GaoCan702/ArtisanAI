"use client";
import {
  Calendar,
  CheckCircle,
  Clock,
  Download,
  FileText,
  Loader,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { GenerationTask } from "@/services/taskService";

interface TaskManagerProps {
  tasks: GenerationTask[];
  onRefresh: () => void;
}

export function TaskManager({ tasks, onRefresh }: TaskManagerProps) {
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 定期刷新任务状态
  useEffect(() => {
    const interval = setInterval(() => {
      if (
        tasks.some(
          (task) => task.status === "pending" || task.status === "processing",
        )
      ) {
        onRefresh();
      }
    }, 3000);

    return () => {
      clearInterval(interval);
    };
  }, [tasks, onRefresh]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 500);
  };

  const toggleTaskSelection = (taskId: string) => {
    setSelectedTasks((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  const exportSelectedTasks = () => {
    const tasksToExport = tasks.filter(
      (task) =>
        selectedTasks.has(task.id) &&
        task.status === "completed" &&
        task.articles,
    );

    if (tasksToExport.length === 0) return;

    const allArticles = tasksToExport.flatMap((task) => task.articles || []);
    const markdownContent = allArticles
      .map((article) => `${article.content}\n\n---\n\n`)
      .join("");

    const blob = new Blob([markdownContent], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `articles-${new Date().toISOString().split("T")[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStatusIcon = (status: GenerationTask["status"]) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "processing":
        return <Loader className="w-4 h-4 text-blue-500 animate-spin" />;
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusText = (status: GenerationTask["status"]) => {
    switch (status) {
      case "pending":
        return "等待中";
      case "processing":
        return "生成中";
      case "completed":
        return "已完成";
      case "failed":
        return "失败";
    }
  };

  const getStatusVariant = (status: GenerationTask["status"]) => {
    switch (status) {
      case "pending":
        return "secondary" as const;
      case "processing":
        return "default" as const;
      case "completed":
        return "secondary" as const;
      case "failed":
        return "destructive" as const;
    }
  };

  const completedTasks = tasks.filter((task) => task.status === "completed");
  const selectedCompletedTasks = completedTasks.filter((task) =>
    selectedTasks.has(task.id),
  );

  return (
    <div className="h-full flex flex-col">
      {/* 工具栏 */}
      <div className="bg-white border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold">任务管理</h2>
            <Badge variant="outline">{tasks.length} 个任务</Badge>
          </div>

          <div className="flex items-center gap-2">
            {selectedCompletedTasks.length > 0 && (
              <Button onClick={exportSelectedTasks} size="sm" className="gap-2">
                <Download className="w-4 h-4" />
                导出选中 ({selectedCompletedTasks.length})
              </Button>
            )}

            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              disabled={isRefreshing}
              className="gap-2"
            >
              <RefreshCw
                className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
              刷新
            </Button>
          </div>
        </div>
      </div>

      {/* 任务列表 */}
      <div className="flex-1 overflow-y-auto p-4">
        {tasks.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无任务</h3>
            <p className="text-gray-500">创建您的第一个内容生成任务</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {tasks.map((task) => (
              <Card key={task.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusIcon(task.status)}
                        <CardTitle className="text-base">
                          任务 {task.id.slice(-8)}
                        </CardTitle>
                        <Badge variant={getStatusVariant(task.status)}>
                          {getStatusText(task.status)}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {task.createdAt.toLocaleString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          {task.articleCount} 篇文章
                        </div>
                      </div>
                    </div>

                    {task.status === "completed" && (
                      <input
                        type="checkbox"
                        checked={selectedTasks.has(task.id)}
                        onChange={() => {
                          toggleTaskSelection(task.id);
                        }}
                        className="rounded"
                      />
                    )}
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  {/* 进度条 */}
                  {(task.status === "processing" ||
                    task.status === "completed") && (
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>进度</span>
                        <span>{task.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* 任务详情 */}
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">
                        公司信息：
                      </span>
                      <p className="text-gray-600 mt-1 line-clamp-2">
                        {task.companyInfo}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">
                        产品信息：
                      </span>
                      <p className="text-gray-600 mt-1 line-clamp-2">
                        {task.productInfo}
                      </p>
                    </div>
                  </div>

                  {/* 结果统计 */}
                  {task.status === "completed" && task.articles && (
                    <div className="mt-3 p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-green-800">
                          生成完成
                        </span>
                        <div className="text-green-600">
                          {task.articles.length} 篇文章 • 总计{" "}
                          {task.articles.reduce(
                            (sum, a) => sum + a.wordCount,
                            0,
                          )}{" "}
                          字
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 错误信息 */}
                  {task.status === "failed" && (
                    <div className="mt-3 p-3 bg-red-50 rounded-lg">
                      <div className="text-sm text-red-800">
                        生成失败，请重新创建任务
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
