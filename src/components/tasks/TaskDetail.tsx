"use client";

import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import removeMd from "remove-markdown";
import type { GenerationTask } from "@/services/taskService";

interface TaskDetailProps {
  task: GenerationTask | undefined;
  selectedIndex?: number;
  onCollapse?: () => void;
}

export function TaskDetail({
  task,
  selectedIndex = 0,
  onCollapse,
}: TaskDetailProps) {
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedSingle, setCopiedSingle] = useState(false);
  const [showSingleCopyMenu, setShowSingleCopyMenu] = useState(false);
  const singleCopyMenuRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (singleCopyMenuRef.current && !singleCopyMenuRef.current.contains(event.target as Node)) {
        setShowSingleCopyMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCopyAllMarkdown = async () => {
    if (!task?.articles || task.articles.length === 0) return;

    const combined = task.articles
      .map((a) => `# ${a.title}\n\n${a.content}`)
      .join("\n\n---\n\n");

    try {
      await navigator.clipboard.writeText(combined);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    } catch (error) {
      console.error("复制失败:", error);
    }
  };

  const handleCopyAllText = async () => {
    if (!task?.articles || task.articles.length === 0) return;

    const combined = task.articles
      .map((a) => {
        const plainTitle = removeMd(a.title);
        // 移除内容中的第一行标题（如果存在）
        const contentWithoutTitle = a.content.replace(/^#\s+.+$/m, '').trim();
        const plainContent = removeMd(contentWithoutTitle);
        return `${plainTitle}\n\n${plainContent}`;
      })
      .join("\n\n---\n\n");

    try {
      await navigator.clipboard.writeText(combined);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    } catch (error) {
      console.error("复制失败:", error);
    }
  };

  const handleCopySingleMarkdown = async (article: {
    title: string;
    content: string;
  }) => {
    try {
      await navigator.clipboard.writeText(
        `# ${article.title}\n\n${article.content}`,
      );
      setCopiedSingle(true);
      setTimeout(() => setCopiedSingle(false), 2000);
    } catch (error) {
      console.error("复制失败:", error);
    }
  };

  const handleCopySingleText = async (article: {
    title: string;
    content: string;
  }) => {
    try {
      const plainTitle = removeMd(article.title);
      // 移除内容中的第一行标题（如果存在）
      const contentWithoutTitle = article.content.replace(/^#\s+.+$/m, '').trim();
      const plainContent = removeMd(contentWithoutTitle);
      await navigator.clipboard.writeText(`${plainTitle}\n\n${plainContent}`);
      setCopiedSingle(true);
      setTimeout(() => setCopiedSingle(false), 2000);
    } catch (error) {
      console.error("复制失败:", error);
    }
  };

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
          {/* 复制按钮 */}
          {task.articles && task.articles.length > 0 && (
            <div className="flex gap-1">
              <button
                type="button"
                onClick={handleCopyAllText}
                className={`px-2.5 py-1.5 text-xs rounded-md transition-colors flex items-center gap-1 ${
                  copiedAll
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
                title="复制为纯文本"
              >
                📄 Copy text
              </button>
              <button
                type="button"
                onClick={handleCopyAllMarkdown}
                className={`px-2.5 py-1.5 text-xs rounded-md transition-colors flex items-center gap-1 ${
                  copiedAll
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
                title="复制为Markdown格式"
              >
                📝 Copy markdown
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="flex-1 p-6 overflow-y-auto bg-gray-50">
        {task.articles && task.articles.length > 0 ? (
          <div className="max-h-[calc(100vh-12rem)] overflow-y-auto pr-2">
            {(() => {
              const article =
                task.articles?.[
                  Math.min(selectedIndex, task.articles?.length || 0 - 1)
                ];
              if (!article) return null;
              return (
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-lg mb-2 truncate">
                        {article.title}
                      </h4>
                      <p className="text-sm text-gray-500 mb-4">
                        字数: {article.wordCount}
                      </p>
                    </div>
                    <div className="relative" ref={singleCopyMenuRef}>
                      <button
                        type="button"
                        onClick={() => setShowSingleCopyMenu(!showSingleCopyMenu)}
                        className={`shrink-0 px-2.5 py-1 text-xs rounded-md transition-colors flex items-center gap-1 ${
                          copiedSingle
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                        }`}
                        title="复制全文"
                      >
                        {copiedSingle ? "已复制" : "复制"}
                        <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                      
                      {showSingleCopyMenu && (
                        <div className="absolute right-0 top-full mt-1 bg-white border rounded-md shadow-lg z-10 min-w-[120px]">
                          <button
                            type="button"
                            onClick={() => {
                              handleCopySingleText(article);
                              setShowSingleCopyMenu(false);
                            }}
                            className="w-full px-2.5 py-1.5 text-left text-xs hover:bg-gray-50 flex items-center gap-1.5"
                          >
                            📄 Copy text
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              handleCopySingleMarkdown(article);
                              setShowSingleCopyMenu(false);
                            }}
                            className="w-full px-2.5 py-1.5 text-left text-xs hover:bg-gray-50 flex items-center gap-1.5"
                          >
                            📝 Copy markdown
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="prose prose-sm max-w-none text-gray-800">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {article.content}
                    </ReactMarkdown>
                  </div>
                </div>
              );
            })()}
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
