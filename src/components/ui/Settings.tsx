"use client";
import {
  CheckCircle,
  Eye,
  EyeOff,
  FileText,
  Settings as SettingsIcon,
  TestTube,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { getGeminiService, resetGeminiService } from "@/services/geminiService";

interface SettingsProps {
  onClose: () => void;
}

// 默认内容规则
const DEFAULT_CONTENT_RULES = `# 写作要求
- 内容准确、客观、有价值
- 语言流畅，逻辑清晰
- 适合目标读者群体

# 格式规范
- 使用标准Markdown格式
- 标题层级分明
- 段落长度适中

# 质量标准
- 避免重复和冗余内容
- 确保信息的时效性和准确性`;

export function SettingsDialog({ onClose }: SettingsProps) {
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "none" | "success" | "failed"
  >("none");
  const [saveStatus, setSaveStatus] = useState<"none" | "success">("none");
  const [activeTab, setActiveTab] = useState<"api" | "rules">("api");
  const [contentRules, setContentRules] = useState("");
  const [rulesEnabled, setRulesEnabled] = useState(true);

  useEffect(() => {
    // 从环境变量或localStorage加载API Key
    const savedKey =
      localStorage.getItem("gemini_api_key") ??
      process.env.NEXT_PUBLIC_GEMINI_API_KEY ??
      "";
    setApiKey(savedKey);

    // 加载内容规则
    const savedRules =
      localStorage.getItem("content_rules") ?? DEFAULT_CONTENT_RULES;
    const savedRulesEnabled =
      localStorage.getItem("content_rules_enabled") !== "false";
    setContentRules(savedRules);
    setRulesEnabled(savedRulesEnabled);
  }, []);

  const handleSaveApiKey = async () => {
    if (apiKey.trim()) {
      setIsSaving(true);
      try {
        localStorage.setItem("gemini_api_key", apiKey.trim());
        // 重置Gemini服务实例以使用新的API Key
        resetGeminiService();
        setConnectionStatus("none");
        setSaveStatus("success");

        // 显示成功提示1秒后关闭弹窗
        setTimeout(() => {
          onClose();
        }, 1000);
      } catch (error) {
        console.error("保存配置失败:", error);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleTestConnection = async () => {
    if (!apiKey.trim()) {
      setConnectionStatus("failed");
      return;
    }

    setIsTestingConnection(true);
    try {
      resetGeminiService(); // 确保使用新的API Key
      const geminiService = getGeminiService(apiKey.trim());
      const isConnected = await geminiService.testConnection();
      setConnectionStatus(isConnected ? "success" : "failed");
    } catch (error) {
      console.error("Connection test failed:", error);
      setConnectionStatus("failed");
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleSaveRules = () => {
    localStorage.setItem("content_rules", contentRules);
    localStorage.setItem("content_rules_enabled", rulesEnabled.toString());
    setSaveStatus("success");
    setTimeout(() => setSaveStatus("none"), 2000);
  };

  const handleResetRules = () => {
    setContentRules(DEFAULT_CONTENT_RULES);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
        <Card className="border-0 shadow-none">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SettingsIcon className="w-5 h-5" />
                <CardTitle>应用设置</CardTitle>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose}>
                ×
              </Button>
            </div>
            {/* 标签页 */}
            <div className="flex gap-1 mt-4">
              <button
                onClick={() => setActiveTab("api")}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  activeTab === "api"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                API 配置
              </button>
              <button
                onClick={() => setActiveTab("rules")}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  activeTab === "rules"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                内容规则
              </button>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-4">
            {activeTab === "api" && (
              <>
                <div>
                  <label
                    htmlFor="gemini-api-key"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Gemini API Key <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="gemini-api-key"
                      type={showApiKey ? "text" : "password"}
                      value={apiKey}
                      onChange={(e) => {
                        setApiKey(e.target.value);
                      }}
                      placeholder="请输入您的 Gemini API Key"
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setShowApiKey(!showApiKey);
                      }}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    >
                      {showApiKey ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    获取API Key:{" "}
                    <a
                      href="https://makersuite.google.com/app/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Google AI Studio
                    </a>
                  </p>
                </div>

                {connectionStatus !== "none" && (
                  <div
                    className={`p-3 rounded-lg flex items-center gap-2 ${
                      connectionStatus === "success"
                        ? "bg-green-50 text-green-800"
                        : "bg-red-50 text-red-800"
                    }`}
                  >
                    {connectionStatus === "success" ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                    <span className="text-sm">
                      {connectionStatus === "success"
                        ? "API连接成功"
                        : "API连接失败，请检查密钥是否正确"}
                    </span>
                  </div>
                )}

                {saveStatus === "success" && (
                  <div className="p-3 rounded-lg flex items-center gap-2 bg-blue-50 text-blue-800">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm">配置保存成功！</span>
                  </div>
                )}

                <div className="bg-gray-50 p-3 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">使用说明</h4>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• API Key 将保存在浏览器本地存储中</li>
                    <li>• 不会上传到任何服务器</li>
                    <li>• 建议定期更换API Key以确保安全</li>
                  </ul>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleTestConnection}
                    variant="outline"
                    className="flex-1"
                    disabled={isTestingConnection || !apiKey.trim()}
                  >
                    {isTestingConnection ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                        测试中...
                      </>
                    ) : (
                      <>
                        <TestTube className="w-4 h-4 mr-2" />
                        测试连接
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={handleSaveApiKey}
                    className="flex-1"
                    disabled={isSaving || !apiKey.trim()}
                  >
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        保存中...
                      </>
                    ) : (
                      "保存配置"
                    )}
                  </Button>
                </div>
              </>
            )}

            {activeTab === "rules" && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-gray-600" />
                    <h3 className="text-lg font-medium">内容生成规则</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600">启用规则</label>
                    <input
                      type="checkbox"
                      checked={rulesEnabled}
                      onChange={(e) => setRulesEnabled(e.target.checked)}
                      className="rounded"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="content-rules"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    内容规则{" "}
                    <span className="text-gray-400">(支持Markdown格式)</span>
                  </label>
                  <Textarea
                    id="content-rules"
                    value={contentRules}
                    onChange={(e) => setContentRules(e.target.value)}
                    placeholder="输入您的内容生成规则..."
                    className="min-h-[300px] font-mono text-sm"
                    disabled={!rulesEnabled}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    这些规则将指导AI生成符合您要求的内容
                  </p>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">规则示例</h4>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div># 分类标题</div>
                    <div>- 具体规则项目</div>
                    <div>- 另一个规则项目</div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleResetRules}
                    variant="outline"
                    className="flex-1"
                  >
                    重置为默认
                  </Button>
                  <Button onClick={handleSaveRules} className="flex-1">
                    保存规则
                  </Button>
                </div>
              </>
            )}

            {saveStatus === "success" && (
              <div className="p-3 rounded-lg flex items-center gap-2 bg-blue-50 text-blue-800">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">配置保存成功！</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
