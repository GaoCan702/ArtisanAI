// 内容规则服务
export interface ContentRules {
  rules: string;
  enabled: boolean;
}

// 默认内容规则
export const DEFAULT_CONTENT_RULES = `# 写作要求
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

/**
 * 获取内容规则
 */
export function getContentRules(): ContentRules {
  const rules = localStorage.getItem("content_rules") ?? DEFAULT_CONTENT_RULES;
  const enabled = localStorage.getItem("content_rules_enabled") !== "false";

  return { rules, enabled };
}

/**
 * 保存内容规则
 */
export function saveContentRules(contentRules: ContentRules): void {
  localStorage.setItem("content_rules", contentRules.rules);
  localStorage.setItem(
    "content_rules_enabled",
    contentRules.enabled.toString(),
  );
}

/**
 * 将规则应用到prompt中
 */
export function applyRulesToPrompt(basePrompt: string): string {
  const { rules, enabled } = getContentRules();

  if (!enabled || !rules.trim()) {
    return basePrompt;
  }

  return `${basePrompt}

请遵循以下内容生成规则：
${rules}

请确保生成的内容严格按照上述规则要求进行编写。`;
}
