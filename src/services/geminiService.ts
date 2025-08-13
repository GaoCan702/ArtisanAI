import {
  type GenerativeModel,
  GoogleGenerativeAI,
} from "@google/generative-ai";
import { applyRulesToPrompt } from "./rulesService";

export interface GeneratedArticle {
  title: string;
  content: string;
  wordCount: number;
}

export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel;

  constructor(apiKey?: string) {
    // 优先级: 传入的API Key > localStorage > 环境变量
    const savedKey =
      typeof window !== "undefined"
        ? localStorage.getItem("gemini_api_key")
        : null;
    const key = apiKey ?? savedKey ?? process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!key) {
      throw new Error("Gemini API key is required");
    }

    this.genAI = new GoogleGenerativeAI(key);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  }

  async generateArticles(
    companyInfo: string,
    productInfo: string,
    articleCount: number,
    promptTemplate: string,
    onProgress?: (progress: number) => void,
    targetWordCount?: number,
    onPartial?: (index: number, partialMarkdown: string) => void,
  ): Promise<GeneratedArticle[]> {
    const articles: GeneratedArticle[] = [];

    if (articleCount <= 0 || articleCount > 100) {
      throw new Error("文章数量必须在1-100之间");
    }

    for (let i = 0; i < articleCount; i++) {
      try {
        // 填充模板
        const prompt = promptTemplate
          .replace("{company_info}", companyInfo)
          .replace("{product_info}", productInfo);

        const basePrompt = targetWordCount
          ? `${prompt}\n\n请严格输出标准化 Markdown 结构（#、##、段落空行、列表）。目标字数约 ${targetWordCount} 字（±20%），不要输出多余元信息。`
          : `${prompt}\n\n请严格输出标准化 Markdown 结构（#、##、段落空行、列表），不要输出多余元信息。`;

        // 应用内容规则
        const finalPrompt = applyRulesToPrompt(basePrompt);

        // 调用Gemini API（优先流式）
        let content = "";
        if (onPartial) {
          const streamResult =
            await this.model.generateContentStream(finalPrompt);
          for await (const chunk of streamResult.stream) {
            const chunkText = chunk.text();
            if (chunkText) {
              content += chunkText;
              onPartial(i, content);
            }
          }
          const aggregated = await streamResult.response;
          content = aggregated.text();
        } else {
          const result = await this.model.generateContent(finalPrompt);
          const response = result.response;
          content = response.text();
        }

        if (!content?.trim()) {
          throw new Error("生成内容为空");
        }

        // 解析标题（从markdown的第一个#标题）
        const titleMatch = /^#\s+(.+)$/m.exec(content);
        const title = titleMatch?.[1]?.trim() ?? `文章 ${i + 1}`;

        // 计算字数（简单计算，排除标记符号）
        const wordCount = content.replace(/[#*\-\n\r\s]/g, "").length;

        articles.push({
          title,
          content,
          wordCount,
        });

        // 更新进度
        const progress = Math.round(((i + 1) / articleCount) * 100);
        onProgress?.(progress);

        // 添加延迟避免API限制
        if (i < articleCount - 1) {
          await this.delay(1000); // 1秒延迟
        }
      } catch (error) {
        console.error(`Error generating article ${i + 1}:`, error);
        // 生成失败时添加错误文章
        const errorMessage =
          error instanceof Error ? error.message : "未知错误";
        articles.push({
          title: `文章 ${i + 1} (生成失败)`,
          content: `# 生成失败\n\n生成文章时出现错误: ${errorMessage}\n\n请检查网络连接和API配置。`,
          wordCount: 0,
        });
      }
    }

    return articles;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // 测试API连接
  async testConnection(): Promise<boolean> {
    try {
      const result = await this.model.generateContent("测试连接");
      const response = result.response;
      return Boolean(response.text());
    } catch (error) {
      console.error("Gemini API connection test failed:", error);
      return false;
    }
  }
}

// 单例实例
let geminiServiceInstance: GeminiService | null = null;

export function getGeminiService(apiKey?: string): GeminiService {
  geminiServiceInstance ??= new GeminiService(apiKey);
  return geminiServiceInstance;
}

export function resetGeminiService(): void {
  geminiServiceInstance = null;
}
