import { GoogleGenerativeAI, type GenerativeModel, type GenerateContentResult } from '@google/generative-ai';

export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
  }

  async generateContent(prompt: string): Promise<string> {
    try {
      const result: GenerateContentResult = await this.model.generateContent(prompt);
      const text = result.response.text();
      return text;
    } catch (error) {
      console.error('Gemini API error:', error);
      throw new Error('Failed to generate content');
    }
  }

  async generateArticle(
    topic: string,
    keywords: string[],
    tone: string,
    length: number
  ): Promise<string> {
    const prompt = `请为以下主题生成一篇营销文章：

主题：${topic}
关键词：${keywords.join(', ')}
语调：${tone}
字数要求：约${length}字

请确保文章：
1. 包含所有关键词
2. 符合指定的语调风格
3. 具有营销价值和吸引力
4. 结构清晰，逻辑性强

文章内容：`;

    return this.generateContent(prompt);
  }
}