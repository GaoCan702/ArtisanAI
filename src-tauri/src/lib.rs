// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use std::time::{SystemTime, UNIX_EPOCH};
use std::collections::HashMap;
use std::path::PathBuf;
use std::fs;
use serde_json::Value;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Serialize, Deserialize, Clone, Debug)]
struct GenerationTask {
    id: String,
    company_info: String,
    product_info: String,
    article_count: u32,
    status: String, // 'pending', 'processing', 'completed', 'failed'
    progress: u32,
    created_at: u64,
    completed_at: Option<u64>,
    articles: Option<Vec<GeneratedArticle>>,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
struct GeneratedArticle {
    title: String,
    content: String,
    word_count: u32,
}

#[tauri::command]
fn greet() -> String {
  let now = SystemTime::now();
  let epoch_ms = now.duration_since(UNIX_EPOCH).unwrap().as_millis();
  format!("Hello world from Rust! Current epoch: {epoch_ms}")
}

#[tauri::command]
async fn create_generation_task(
    company_info: String,
    product_info: String,
    article_count: u32
) -> Result<GenerationTask, String> {
    let task = GenerationTask {
        id: Uuid::new_v4().to_string(),
        company_info,
        product_info,
        article_count,
        status: "pending".to_string(),
        progress: 0,
        created_at: SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs(),
        completed_at: None,
        articles: None,
    };
    
    // TODO: Save task to SQLite database
    
    Ok(task)
}

#[tauri::command]
async fn get_all_tasks() -> Result<Vec<GenerationTask>, String> {
    // TODO: Load tasks from SQLite database
    // For now, return empty vector
    Ok(vec![])
}

#[tauri::command]
async fn update_task_progress(
    task_id: String,
    status: String,
    progress: u32
) -> Result<(), String> {
    // TODO: Update task in SQLite database
    println!("Updating task {} progress: {} ({}%)", task_id, status, progress);
    Ok(())
}

#[tauri::command]
async fn update_task_articles(
    task_id: String,
    articles: Vec<GeneratedArticle>
) -> Result<(), String> {
    // TODO: Update task articles in SQLite database
    println!("Updating task {} with {} articles", task_id, articles.len());
    Ok(())
}

#[tauri::command]
async fn get_prompt_template() -> Result<String, String> {
    // 返回预设的prompt模板
    let template = r#"你是一个专业的内容营销专家。根据以下信息生成高质量的营销文章：

公司信息：{company_info}
产品信息：{product_info}

要求：
1. 文章标题要吸引人，突出产品特色
2. 内容要专业、有说服力
3. 语言要通俗易懂
4. 字数控制在800-1200字
5. 结构清晰，包含引言、主体和结论
6. 适当融入产品卖点

请生成一篇markdown格式的营销文章。"#;
    
    Ok(template.to_string())
}

#[derive(Serialize, Deserialize, Clone)]
struct ExportOptions {
    format: String,
    filename: Option<String>,
    metadata: Option<HashMap<String, Value>>,
    styling: Option<HashMap<String, Value>>,
}

#[derive(Serialize, Deserialize)]
struct ExportResult {
    success: bool,
    #[serde(rename = "filePath")]
    file_path: Option<String>,
    error: Option<String>,
    #[serde(rename = "fileSize")]
    file_size: Option<u64>,
}

#[derive(Serialize, Deserialize)]
struct BatchExportRequest {
    contents: Vec<HashMap<String, Value>>,
    options: ExportOptions,
}

#[tauri::command]
async fn export_content(content: String, options: ExportOptions) -> Result<ExportResult, String> {
    // TODO: Implement actual export functionality
    // For now, create a simple text file export
    
    let filename = options.filename.unwrap_or_else(|| {
        let timestamp = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs();
        format!("export_{}.{}", timestamp, options.format)
    });
    
    let export_dir = PathBuf::from("./exports");
    if !export_dir.exists() {
        fs::create_dir_all(&export_dir).map_err(|e| e.to_string())?;
    }
    
    let file_path = export_dir.join(&filename);
    
    match options.format.as_str() {
        "txt" => {
            fs::write(&file_path, &content).map_err(|e| e.to_string())?;
        }
        "html" => {
            let html_content = format!(
                "<!DOCTYPE html><html><head><title>Export</title></head><body><pre>{}</pre></body></html>",
                content
            );
            fs::write(&file_path, html_content).map_err(|e| e.to_string())?;
        }
        "markdown" => {
            fs::write(&file_path, &content).map_err(|e| e.to_string())?;
        }
        _ => {
            return Ok(ExportResult {
                success: false,
                file_path: None,
                error: Some(format!("Unsupported format: {}", options.format)),
                file_size: None,
            });
        }
    }
    
    let file_size = fs::metadata(&file_path)
        .map(|m| m.len())
        .unwrap_or(0);
    
    Ok(ExportResult {
        success: true,
        file_path: Some(file_path.to_string_lossy().to_string()),
        error: None,
        file_size: Some(file_size),
    })
}

#[tauri::command]
async fn export_batch(request: BatchExportRequest) -> Result<Vec<ExportResult>, String> {
    let mut results = Vec::new();
    
    for (index, item) in request.contents.iter().enumerate() {
        let content = item.get("content")
            .and_then(|v| v.as_str())
            .unwrap_or("")
            .to_string();
        
        let title = item.get("title")
            .and_then(|v| v.as_str());
        
        let mut options = request.options.clone();
        if let Some(title) = title {
            options.filename = Some(format!("{}_{}.{}", title, index, options.format));
        }
        
        match export_content(content, options).await {
            Ok(result) => results.push(result),
            Err(e) => results.push(ExportResult {
                success: false,
                file_path: None,
                error: Some(e),
                file_size: None,
            }),
        }
    }
    
    Ok(results)
}

#[tauri::command]
async fn get_supported_formats() -> Result<Vec<String>, String> {
    Ok(vec![
        "txt".to_string(),
        "html".to_string(),
        "markdown".to_string(),
        "pdf".to_string(),
        "docx".to_string(),
    ])
}

#[tauri::command]
async fn validate_export_path(path: String) -> Result<bool, String> {
    let path_buf = PathBuf::from(&path);
    Ok(path_buf.parent().map_or(false, |p| p.exists()))
}

#[tauri::command]
async fn get_default_export_path() -> Result<String, String> {
    let export_dir = PathBuf::from("./exports");
    if !export_dir.exists() {
        fs::create_dir_all(&export_dir).map_err(|e| e.to_string())?;
    }
    Ok(export_dir.to_string_lossy().to_string())
}

#[tauri::command]
async fn preview_export(content: String, options: ExportOptions) -> Result<String, String> {
    match options.format.as_str() {
        "html" => {
            Ok(format!(
                "<!DOCTYPE html><html><head><title>Preview</title></head><body><pre>{}</pre></body></html>",
                content
            ))
        }
        "markdown" => Ok(content),
        "txt" => Ok(content),
        _ => Ok(format!("Preview for {} format", options.format))
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_opener::init())
    .plugin(tauri_plugin_sql::Builder::default().build())
    .invoke_handler(tauri::generate_handler![
      greet,
      create_generation_task,
      get_all_tasks,
      update_task_progress,
      update_task_articles,
      get_prompt_template,
      export_content,
      export_batch,
      get_supported_formats,
      validate_export_path,
      get_default_export_path,
      preview_export
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
