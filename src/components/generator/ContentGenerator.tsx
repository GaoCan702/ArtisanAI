"use client";
import { FileText, Settings, Zap } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface ContentGeneratorProps {
  onSubmit: (
    companyInfo: string,
    productInfo: string,
    articleCount: number,
  ) => void;
  isSubmitting: boolean;
}

export function ContentGenerator({
  onSubmit,
  isSubmitting,
}: ContentGeneratorProps) {
  const [companyInfo, setCompanyInfo] = useState("");
  const [productInfo, setProductInfo] = useState("");
  const [articleCount, setArticleCount] = useState(25);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (companyInfo.trim() && productInfo.trim()) {
      onSubmit(companyInfo.trim(), productInfo.trim(), articleCount);
    }
  };

  const presetCounts = [20, 25, 30, 40, 50];

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto p-6">
        {/* 工具简介 */}
        <div className="mb-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              AI 批量内容生成
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              基于您的公司简介和产品说明，自动生成 20-50 篇高质量 Markdown
              文章，适用于 SEO 优化和 geo 发布平台。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">批量生成</h3>
                <p className="text-sm text-gray-600">一次生成多篇文章</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">智能优化</h3>
                <p className="text-sm text-gray-600">SEO 友好的内容</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Settings className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">任务队列</h3>
                <p className="text-sm text-gray-600">后台异步处理</p>
              </div>
            </div>
          </div>
        </div>

        {/* 生成表单 */}
        <Card>
          <CardHeader>
            <CardTitle>内容生成设置</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="company"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  公司简介 <span className="text-red-500">*</span>
                </label>
                <Textarea
                  id="company"
                  value={companyInfo}
                  onChange={(e) => setCompanyInfo(e.target.value)}
                  placeholder="请输入您的公司简介，包括公司定位、核心业务、发展历程等信息..."
                  className="min-h-[120px]"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  详细的公司信息有助于生成更准确的内容
                </p>
              </div>

              <div>
                <label
                  htmlFor="product"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  产品说明 <span className="text-red-500">*</span>
                </label>
                <Textarea
                  id="product"
                  value={productInfo}
                  onChange={(e) => setProductInfo(e.target.value)}
                  placeholder="请输入您的产品说明，包括产品特点、优势、应用场景、目标用户等..."
                  className="min-h-[120px]"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  清晰的产品描述是生成高质量文章的关键
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  文章数量
                </label>
                <div className="space-y-3">
                  <div className="flex gap-2 flex-wrap">
                    {presetCounts.map((count) => (
                      <Button
                        key={count}
                        type="button"
                        variant={articleCount === count ? "default" : "outline"}
                        size="sm"
                        onClick={() => setArticleCount(count)}
                      >
                        {count} 篇
                      </Button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">自定义：</span>
                    <input
                      type="number"
                      min="10"
                      max="100"
                      value={articleCount}
                      onChange={(e) => setArticleCount(Number(e.target.value))}
                      className="w-20 px-3 py-1 border border-gray-300 rounded-md text-sm"
                    />
                    <span className="text-sm text-gray-600">篇</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">预设生成策略</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      格式
                    </Badge>
                    <span>Markdown</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      字数
                    </Badge>
                    <span>300-800 字/篇</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      优化
                    </Badge>
                    <span>SEO 友好</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      用途
                    </Badge>
                    <span>geo 发布平台</span>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={
                  isSubmitting || !companyInfo.trim() || !productInfo.trim()
                }
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    提交中...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    创建生成任务
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
