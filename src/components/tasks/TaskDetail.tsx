"use client";

import type { GenerationTask } from "@/services/taskService";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface TaskDetailProps {
  task: GenerationTask | undefined;
  onCollapse?: () => void;
}

export function TaskDetail({ task, onCollapse }: TaskDetailProps) {
  if (!task) {
    return (
      <section className="flex-1 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b bg-white">
          <h2 className="text-base font-semibold">任务详情</h2>
        </div>
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <p className="text-gray-500">请从左侧选择一个任务查看详情</p>
        </div>
      </section>
    );
  }

  return (
    <section className="flex-1 flex flex-col min-h-0">
      <div className="h-16 flex items-center px-6 border-b bg-white">
        <div className="truncate">
          <h2 className="text-base font-semibold truncate">
            {task.companyInfo} - {task.productInfo}
          </h2>
          <p className="text-xs text-gray-500">任务ID: {task.id}</p>
        </div>
        {/* 操作区 */}
        <div className="ml-auto flex items-center gap-2">
          {onCollapse && (
            <button
              type="button"
              onClick={onCollapse}
              className="px-2 py-1 text-sm rounded-md text-gray-600 hover:bg-gray-100"
              aria-label="折叠文章详情"
              title="折叠"
            >
              »
            </button>
          )}
          {/* 复制所有文章 */}
          {task.articles && task.articles.length > 0 && (
            <button
              type="button"
              onClick={() => {
                const combined = task.articles
                  ?.map((a) => `# ${a.title}\n\n${a.content}`)
                  .join("\n\n---\n\n");
                if (!combined) return;
                void navigator.clipboard.writeText(combined);
              }}
              className="px-3 py-1.5 text-sm rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700"
            >
              复制全部
            </button>
          )}
        </div>
      </div>
      <div className="flex-1 p-6 overflow-y-auto bg-gray-50">
        <h3 className="font-semibold mb-4">
          生成的文章 ({task.articles?.length ?? 0})
        </h3>
        {task.articles && task.articles.length > 0 ? (
          <div className="space-y-4 max-h-[calc(100vh-12rem)] overflow-y-auto pr-2">
            {task.articles.map((article, _index) => (
              <div key={article.title} className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-lg mb-2 truncate">{article.title}</h4>
                    <p className="text-sm text-gray-500 mb-4">字数: {article.wordCount}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => { void navigator.clipboard.writeText(`# ${article.title}\n\n${article.content}`); }}
                    className="shrink-0 px-2.5 py-1 text-xs rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700"
                    title="复制全文"
                  >
                    复制
                  </button>
                </div>
                <div className="prose prose-sm max-w-none text-gray-800">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {article.content}
                  </ReactMarkdown>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            <p>
              {task.status === "processing"
                ? "正在生成文章..."
                : "尚未生成文章。"}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
