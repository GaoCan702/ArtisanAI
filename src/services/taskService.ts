import { invoke } from "@tauri-apps/api/core";
import { type GeneratedArticle, getGeminiService } from "./geminiService";

export interface GenerationTask {
  id: string;
  companyInfo: string;
  productInfo: string;
  articleCount: number;
  targetWordCount?: number;
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  createdAt: Date;
  completedAt?: Date;
  articles?: GeneratedArticle[];
}

// Rust后端返回的任务类型
interface RustTask {
  id: string;
  company_info: string;
  product_info: string;
  article_count: number;
  status: string;
  progress: number;
  created_at: number;
  completed_at?: number;
  articles?: GeneratedArticle[];
}

export class TaskService {
  private tasks = new Map<string, GenerationTask>();
  private listeners = new Set<(tasks: GenerationTask[]) => void>();

  private snapshot(): GenerationTask[] {
    return Array.from(this.tasks.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
  }

  private notify(): void {
    const current = this.snapshot();
    for (const listener of this.listeners) listener(current);
  }

  subscribe(listener: (tasks: GenerationTask[]) => void): () => void {
    this.listeners.add(listener);
    listener(this.snapshot());
    return () => {
      this.listeners.delete(listener);
    };
  }

  async createTask(
    companyInfo: string,
    productInfo: string,
    articleCount: number,
    targetWordCount?: number,
  ): Promise<GenerationTask> {
    try {
      // 调用Rust后端创建任务
      const rustTask = await invoke<RustTask>("create_generation_task", {
        companyInfo,
        productInfo,
        articleCount,
      });

      if (!rustTask || !rustTask.id) {
        throw new Error("Invalid response from backend");
      }

      const task: GenerationTask = {
        id: rustTask.id,
        companyInfo: rustTask.company_info,
        productInfo: rustTask.product_info,
        articleCount: rustTask.article_count,
        targetWordCount,
        status: "pending" as const,
        progress: 0,
        createdAt: new Date(rustTask.created_at * 1000),
        completedAt: undefined,
        articles: undefined,
      };

      this.tasks.set(task.id, task);
      this.notify();

      // 异步开始处理任务
      this.processTask(task.id).catch((err) => {
        console.error("Task processing failed:", err);
        // 将任务标记为失败
        const failedTask = this.tasks.get(task.id);
        if (failedTask) {
          failedTask.status = "failed";
          failedTask.completedAt = new Date();
        }
      });

      return task;
    } catch (error) {
      console.error("Failed to create task:", error);
      throw new Error(
        `创建任务失败: ${error instanceof Error ? error.message : "未知错误"}`,
      );
    }
  }

  async getAllTasks(): Promise<GenerationTask[]> {
    // 从Rust后端获取任务（未来实现数据库持久化时使用）
    // const rustTasks = await invoke<any[]>('get_all_tasks');

    // 现在返回内存中的任务
    return Array.from(this.tasks.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
  }

  getTask(id: string): GenerationTask | undefined {
    return this.tasks.get(id);
  }

  private async processTask(taskId: string): Promise<void> {
    const task = this.tasks.get(taskId);
    if (!task) return;

    try {
      // 更新任务状态为处理中
      task.status = "processing";
      task.progress = 0;
      await this.updateTaskProgress(taskId, "processing", 0);
      this.notify();

      // 获取prompt模板
      const promptTemplate = await invoke<string>("get_prompt_template");

      // 使用Gemini生成文章
      const geminiService = getGeminiService();
      const articles = await geminiService.generateArticles(
        task.companyInfo,
        task.productInfo,
        task.articleCount,
        promptTemplate,
        (progress) => {
          task.progress = progress;
          // 同步更新Rust后端状态
          this.updateTaskProgress(taskId, "processing", progress).catch(
            (err) => {
              console.warn("Failed to update backend progress:", err);
            },
          );
          this.notify();
        },
        task.targetWordCount,
        (index, partial) => {
          // 可选：在此处实现局部流式渲染的回调（后续接入 UI 状态管理）
          const t = this.tasks.get(taskId);
          if (!t) return;
          if (!t.articles) {
            t.articles = [];
          }
          t.articles[index] = {
            title: `文章 ${index + 1}`,
            content: partial,
            wordCount: partial.replace(/[#*\-\n\r\s]/g, "").length,
          };
          this.notify();
        },
      );

      // 更新任务为完成状态
      task.status = "completed";
      task.progress = 100;
      task.completedAt = new Date();
      task.articles = articles;

      await this.updateTaskProgress(taskId, "completed", 100);
      await this.updateTaskArticles(taskId, articles);
      this.notify();
    } catch (error) {
      console.error("Task processing failed:", error);

      // 更新任务为失败状态
      task.status = "failed";
      task.completedAt = new Date();

      await this.updateTaskProgress(taskId, "failed", task.progress);
      this.notify();
    }
  }

  private async updateTaskProgress(
    taskId: string,
    status: string,
    progress: number,
  ): Promise<void> {
    try {
      await invoke("update_task_progress", { taskId, status, progress });
    } catch (error) {
      console.error("Failed to update task progress:", error);
    }
  }

  private async updateTaskArticles(
    taskId: string,
    articles: GeneratedArticle[],
  ): Promise<void> {
    try {
      // 将前端的camelCase转换为Rust后端的snake_case
      const articlesForBackend = articles.map((article) => ({
        title: article.title,
        content: article.content,
        word_count: article.wordCount,
      }));

      await invoke("update_task_articles", {
        taskId,
        articles: articlesForBackend,
      });
    } catch (error: unknown) {
      console.error("Failed to update task articles:", error);
    }
  }

  async exportTaskResults(
    taskId: string,
    format: "markdown" | "txt" | "html" = "markdown",
  ): Promise<string | null> {
    const task = this.tasks.get(taskId);
    if (!task || !task.articles) return null;

    try {
      // 合并所有文章内容
      const combinedContent = task.articles
        .map((article) => `# ${article.title}\n\n${article.content}\n\n---\n\n`)
        .join("");

      // 与 Rust 导出的 ExportResult 字段保持一致（filePath/fileSize）
      interface ExportResult {
        success: boolean;
        filePath?: string;
        error?: string;
        fileSize?: number;
      }

      // 调用Rust后端导出功能
      const result = await invoke<ExportResult>("export_content", {
        content: combinedContent,
        options: {
          format,
          filename: `task_${taskId}_articles.${format}`,
          metadata: {
            taskId,
            companyInfo: task.companyInfo,
            productInfo: task.productInfo,
            articleCount: task.articleCount,
            generatedAt: task.completedAt?.toISOString(),
          },
        },
      });

      return result.success ? result.filePath ?? null : null;
    } catch (error) {
      console.error("Failed to export task results:", error);
      return null;
    }
  }
}

// 单例实例
let taskServiceInstance: TaskService | null = null;

export function getTaskService(): TaskService {
  if (!taskServiceInstance) {
    taskServiceInstance = new TaskService();
  }
  return taskServiceInstance;
}
