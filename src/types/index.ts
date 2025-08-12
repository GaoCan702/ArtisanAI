export interface Company {
  id: number;
  name: string;
  industry: string;
  description: string;
  website?: string;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: number;
  company_id: number;
  name: string;
  description: string;
  features: string[];
  target_audience: string;
  price_range?: string;
  created_at: string;
  updated_at: string;
}

export interface GenerationTemplate {
  id: number;
  name: string;
  description: string;
  prompt_template: string;
  output_format: "article" | "social_media" | "email" | "press_release";
  created_at: string;
  updated_at: string;
}

export interface GenerationTask {
  id: number;
  company_id: number;
  product_id?: number;
  template_id: number;
  title: string;
  status: "pending" | "generating" | "completed" | "failed";
  input_data: Record<string, any>;
  generated_content?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface GenerationResult {
  id: number;
  task_id: number;
  content: string;
  word_count: number;
  export_formats: string[];
  created_at: string;
}
