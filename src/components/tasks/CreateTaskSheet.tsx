"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";

interface CreateTaskSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (
    companyInfo: string,
    productInfo: string,
    articleCount: number,
    targetWordCount: number,
  ) => Promise<void>;
}

export function CreateTaskSheet({
  open,
  onOpenChange,
  onSubmit,
}: CreateTaskSheetProps) {
  const [companyInfo, setCompanyInfo] = useState("");
  const [productInfo, setProductInfo] = useState("");
  // 使用字符串作为受控值，避免清空输入时出现 NaN 警告
  const [articleCountInput, setArticleCountInput] = useState("5");
  const [targetWordCountInput, setTargetWordCountInput] = useState("800");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // 提交时再进行安全解析与边界约束
      const parsedArticleCount = Math.min(
        20,
        Math.max(1, Number.parseInt(articleCountInput, 10) || 5),
      );
      const parsedTarget = Math.min(
        2000,
        Math.max(200, Number.parseInt(targetWordCountInput, 10) || 800),
      );
      await onSubmit(
        companyInfo,
        productInfo,
        parsedArticleCount,
        parsedTarget,
      );
      // Success will trigger the sheet to close via onOpenChange
    } catch (error) {
      console.error("Failed to submit task:", error);
      // Optionally show an error message to the user
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {/* 聚焦：半透明遮罩 + 轻微背景模糊；统一内容内边距与宽度 */}
      <SheetContent
        withOverlay
        overlayClassName="bg-black/45 backdrop-blur-[2px]"
        className="w-[560px] sm:max-w-lg p-6"
      >
        <form
          onSubmit={(e) => {
            void handleSubmit(e);
          }}
        >
          <SheetHeader className="p-0 pb-4 border-b">
            <SheetTitle>创建新任务</SheetTitle>
            <SheetDescription>
              填写公司和产品信息，AI将为您生成营销文章。
            </SheetDescription>
          </SheetHeader>
          <div className="grid gap-5 py-4">
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="company-info" className="text-right">
                公司信息
              </Label>
              <Textarea
                id="company-info"
                value={companyInfo}
                onChange={(e) => {
                  setCompanyInfo(e.target.value);
                }}
                className="col-span-3"
                placeholder="例如：公司名称、业务、目标客户等"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="product-info" className="text-right">
                产品/服务信息
              </Label>
              <Textarea
                id="product-info"
                value={productInfo}
                onChange={(e) => {
                  setProductInfo(e.target.value);
                }}
                className="col-span-3"
                placeholder="例如：产品特性、优势、应用场景等"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="article-count" className="text-right">
                生成数量
              </Label>
              <Input
                id="article-count"
                type="number"
                value={articleCountInput}
                onChange={(e) => {
                  setArticleCountInput(e.target.value);
                }}
                className="col-span-3"
                min="1"
                max="20"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="target-words" className="text-right">
                目标字数
              </Label>
              <Input
                id="target-words"
                type="number"
                value={targetWordCountInput}
                onChange={(e) => {
                  setTargetWordCountInput(e.target.value);
                }}
                className="col-span-3"
                min="200"
                max="2000"
                step="50"
                required
              />
            </div>
          </div>
          <SheetFooter className="mt-6 p-0 pt-4 border-t flex-row justify-end items-center gap-2">
            <SheetClose asChild>
              <Button type="button" variant="outline">
                取消
              </Button>
            </SheetClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "正在创建..." : "创建任务"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
