"use client";
import {
  CheckCircle,
  Eye,
  EyeOff,
  Settings as SettingsIcon,
  TestTube,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getGeminiService, resetGeminiService } from "@/services/geminiService";

interface SettingsProps {
  onClose: () => void;
}

export function SettingsDialog({ onClose }: SettingsProps) {
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "none" | "success" | "failed"
  >("none");

  useEffect(() => {
    // 从环境变量或localStorage加载API Key
    const savedKey =
      localStorage.getItem("gemini_api_key") ??
      process.env.NEXT_PUBLIC_GEMINI_API_KEY ??
      "";
    setApiKey(savedKey);
  }, []);

  const handleSaveApiKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem("gemini_api_key", apiKey.trim());
      // 重置Gemini服务实例以使用新的API Key
      resetGeminiService();
      setConnectionStatus("none");
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <Card className="border-0 shadow-none">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SettingsIcon className="w-5 h-5" />
                <CardTitle>API 配置</CardTitle>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose}>
                ×
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gemini API Key <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showApiKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="请输入您的 Gemini API Key"
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
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
                disabled={!apiKey.trim()}
              >
                保存配置
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
