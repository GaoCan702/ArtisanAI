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
  ) => Promise<void>;
}

export function CreateTaskSheet({
  open,
  onOpenChange,
  onSubmit,
}: CreateTaskSheetProps) {
  const [companyInfo, setCompanyInfo] = useState("");
  const [productInfo, setProductInfo] = useState("");
  const [articleCount, setArticleCount] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(companyInfo, productInfo, articleCount);
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
      <SheetContent className="sm:max-w-lg">
        <form
          onSubmit={(e) => {
            void handleSubmit(e);
          }}
        >
          <SheetHeader>
            <SheetTitle>创建新任务</SheetTitle>
            <SheetDescription>
              填写公司和产品信息，AI将为您生成营销文章。
            </SheetDescription>
          </SheetHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="company-info" className="text-right">
                公司信息
              </Label>
              <Textarea
                id="company-info"
                value={companyInfo}
                onChange={(e) => { setCompanyInfo(e.target.value); }}
                className="col-span-3"
                placeholder="例如：公司名称、业务、目标客户等"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="product-info" className="text-right">
                产品/服务信息
              </Label>
              <Textarea
                id="product-info"
                value={productInfo}
                onChange={(e) => { setProductInfo(e.target.value); }}
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
                value={articleCount}
                onChange={(e) => { setArticleCount(parseInt(e.target.value, 10)); }}
                className="col-span-3"
                min="1"
                max="20"
                required
              />
            </div>
          </div>
          <SheetFooter>
            <SheetClose asChild>
              <Button type="button" variant="ghost">
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
