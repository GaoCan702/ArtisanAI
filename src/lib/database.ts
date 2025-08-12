import Database from '@tauri-apps/plugin-sql';

let db: Database | null = null;

export async function initDatabase() {
  if (db) return db;
  
  db = await Database.load('sqlite:artisan.db');
  
  // 创建数据表
  await db.execute(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  await db.execute(`
    CREATE TABLE IF NOT EXISTS data_sources (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL, -- 'csv', 'json', 'manual'
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects (id)
    )
  `);
  
  await db.execute(`
    CREATE TABLE IF NOT EXISTS generation_tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      data_source_id INTEGER NOT NULL,
      template TEXT NOT NULL,
      status TEXT DEFAULT 'pending', -- 'pending', 'running', 'completed', 'failed'
      progress INTEGER DEFAULT 0,
      total_items INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      completed_at DATETIME,
      FOREIGN KEY (project_id) REFERENCES projects (id),
      FOREIGN KEY (data_source_id) REFERENCES data_sources (id)
    )
  `);
  
  await db.execute(`
    CREATE TABLE IF NOT EXISTS generated_articles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id INTEGER NOT NULL,
      data_row_index INTEGER NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (task_id) REFERENCES generation_tasks (id)
    )
  `);
  
  return db;
}

export async function getDatabase() {
  if (!db) {
    await initDatabase();
  }
  return db!;
}

// 项目管理
export interface Project {
  id?: number;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export async function createProject(project: Omit<Project, 'id'>) {
  const db = await getDatabase();
  const result = await db.execute(
    'INSERT INTO projects (name, description) VALUES (?, ?)',
    [project.name, project.description ?? '']
  );
  return result.lastInsertId;
}

export async function getProjects(): Promise<Project[]> {
  const db = await getDatabase();
  return await db.select('SELECT * FROM projects ORDER BY updated_at DESC');
}

// 数据源管理
export interface DataSource {
  id?: number;
  project_id: number;
  name: string;
  type: 'csv' | 'json' | 'manual';
  content: string;
  created_at?: string;
}

export async function createDataSource(dataSource: Omit<DataSource, 'id'>) {
  const db = await getDatabase();
  const result = await db.execute(
    'INSERT INTO data_sources (project_id, name, type, content) VALUES (?, ?, ?, ?)',
    [dataSource.project_id, dataSource.name, dataSource.type, dataSource.content]
  );
  return result.lastInsertId;
}

export async function getDataSources(projectId: number): Promise<DataSource[]> {
  const db = await getDatabase();
  return await db.select(
    'SELECT * FROM data_sources WHERE project_id = ? ORDER BY created_at DESC',
    [projectId]
  );
}

// 生成任务管理
export interface GenerationTask {
  id?: number;
  project_id: number;
  data_source_id: number;
  template: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  total_items: number;
  created_at?: string;
  completed_at?: string;
}

export async function createGenerationTask(task: Omit<GenerationTask, 'id'>) {
  const db = await getDatabase();
  const result = await db.execute(
    'INSERT INTO generation_tasks (project_id, data_source_id, template, total_items) VALUES (?, ?, ?, ?)',
    [task.project_id, task.data_source_id, task.template, task.total_items]
  );
  return result.lastInsertId;
}

export async function updateTaskProgress(
  taskId: number,
  progress: number,
  status?: 'pending' | 'running' | 'completed' | 'failed'
) {
  const db = await getDatabase();
  const updateFields = ['progress = ?'];
  const values: Array<number | string> = [progress];
  
  if (status) {
    updateFields.push('status = ?');
    values.push(status);
    
    if (status === 'completed') {
      updateFields.push('completed_at = CURRENT_TIMESTAMP');
    }
  }
  
  await db.execute(
    `UPDATE generation_tasks SET ${updateFields.join(', ')} WHERE id = ?`,
    [...values, taskId]
  );
}

// 生成文章管理
export interface GeneratedArticle {
  id?: number;
  task_id: number;
  data_row_index: number;
  title: string;
  content: string;
  created_at?: string;
}

export async function saveGeneratedArticle(article: Omit<GeneratedArticle, 'id'>) {
  const db = await getDatabase();
  const result = await db.execute(
    'INSERT INTO generated_articles (task_id, data_row_index, title, content) VALUES (?, ?, ?, ?)',
    [article.task_id, article.data_row_index, article.title, article.content]
  );
  return result.lastInsertId;
}

export async function getGeneratedArticles(taskId: number): Promise<GeneratedArticle[]> {
  const db = await getDatabase();
  return await db.select(
    'SELECT * FROM generated_articles WHERE task_id = ? ORDER BY data_row_index',
    [taskId]
  );
}