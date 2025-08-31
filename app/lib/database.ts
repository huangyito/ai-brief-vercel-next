// 数据库连接和配置
import { Redis } from '@upstash/redis';

// 数据库类型
export type DatabaseType = 'redis' | 'postgres' | 'mongodb';

// 数据库配置
export interface DatabaseConfig {
  type: DatabaseType;
  url?: string;
  token?: string;
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  database?: string;
}

// 获取数据库配置
export function getDatabaseConfig(): DatabaseConfig {
  const type = (process.env.DATABASE_TYPE as DatabaseType) || 'redis';
  
  switch (type) {
    case 'redis':
      return {
        type: 'redis',
        url: process.env.KV_REST_API_URL,
        token: process.env.KV_REST_API_TOKEN
      };
    
    case 'postgres':
      return {
        type: 'postgres',
        host: process.env.POSTGRES_HOST || 'localhost',
        port: parseInt(process.env.POSTGRES_PORT || '5432'),
        username: process.env.POSTGRES_USERNAME,
        password: process.env.POSTGRES_PASSWORD,
        database: process.env.POSTGRES_DATABASE
      };
    
    case 'mongodb':
      return {
        type: 'mongodb',
        url: process.env.MONGODB_URI
      };
    
    default:
      throw new Error(`不支持的数据库类型: ${type}`);
  }
}

// Redis 数据库类
export class RedisDatabase {
  private client: Redis;
  
  constructor(config: DatabaseConfig) {
    if (!config.url || !config.token) {
      throw new Error('Redis配置不完整');
    }
    
    this.client = new Redis({
      url: config.url,
      token: config.token
    });
  }
  
  // 保存AI Daily新闻头条数据
  async saveAIDailyData(date: string, data: any): Promise<void> {
    const key = `ai-daily:${date}`;
    const timestamp = new Date().toISOString();
    
    const record = {
      ...data,
      savedAt: timestamp,
      version: '1.0'
    };
    
    await this.client.set(key, record);
    
    // 同时保存到最新记录
    await this.client.set('ai-daily:latest', record);
    
    // 保存到日期索引
    await this.client.zadd('ai-daily:dates', { score: Date.now(), member: date });
    
    console.log(`Redis: 保存AI Daily新闻头条数据成功，日期: ${date}`);
  }
  
  // 获取AI Daily新闻头条数据
  async getAIDailyData(date?: string): Promise<any> {
    if (date) {
      const key = `ai-daily:${date}`;
      return await this.client.get(key);
    } else {
      return await this.client.get('ai-daily:latest');
    }
  }
  
  // 获取最近的AI Daily新闻头条数据列表
  async getRecentAIDailyData(limit: number = 7): Promise<any[]> {
    const dates = await this.client.zrange('ai-daily:dates', 0, limit - 1, { rev: true });
    const results = [];
    
    for (const date of dates) {
      if (typeof date === 'string') {
        const data = await this.getAIDailyData(date);
        if (data) {
          results.push(data);
        }
      }
    }
    
    return results;
  }
  
  // 检查新闻头条数据是否存在
  async hasAIDailyData(date: string): Promise<boolean> {
    const key = `ai-daily:${date}`;
    const exists = await this.client.exists(key);
    return exists === 1;
  }
  
  // 删除新闻头条数据
  async deleteAIDailyData(date: string): Promise<void> {
    const key = `ai-daily:${date}`;
    await this.client.del(key);
    await this.client.zrem('ai-daily:dates', date);
    
    console.log(`Redis: 删除AI Daily新闻头条数据成功，日期: ${date}`);
  }
}

// PostgreSQL 数据库类（示例）
export class PostgresDatabase {
  private config: DatabaseConfig;
  
  constructor(config: DatabaseConfig) {
    this.config = config;
  }
  
  // 这里实现PostgreSQL的具体操作
  // 需要安装 pg 包: npm install pg @types/pg
  
  async saveAIDailyData(date: string, data: any): Promise<void> {
    console.log(`PostgreSQL: 保存AI Daily数据，日期: ${date}`);
    // TODO: 实现PostgreSQL保存逻辑
  }
  
  async getAIDailyData(date?: string): Promise<any> {
    console.log(`PostgreSQL: 获取AI Daily数据，日期: ${date || 'latest'}`);
    // TODO: 实现PostgreSQL获取逻辑
    return null;
  }
}

// MongoDB 数据库类（示例）
export class MongoDatabase {
  private config: DatabaseConfig;
  
  constructor(config: DatabaseConfig) {
    this.config = config;
  }
  
  // 这里实现MongoDB的具体操作
  // 需要安装 mongodb 包: npm install mongodb
  
  async saveAIDailyData(date: string, data: any): Promise<void> {
    console.log(`MongoDB: 保存AI Daily数据，日期: ${date}`);
    // TODO: 实现MongoDB保存逻辑
  }
  
  async getAIDailyData(date?: string): Promise<any> {
    console.log(`MongoDB: 获取AI Daily数据，日期: ${date || 'latest'}`);
    // TODO: 实现MongoDB获取逻辑
    return null;
  }
}

// 数据库工厂函数
export function createDatabase(): RedisDatabase | PostgresDatabase | MongoDatabase {
  const config = getDatabaseConfig();
  
  switch (config.type) {
    case 'redis':
      return new RedisDatabase(config);
    
    case 'postgres':
      return new PostgresDatabase(config);
    
    case 'mongodb':
      return new MongoDatabase(config);
    
    default:
      throw new Error(`不支持的数据库类型: ${config.type}`);
  }
}

// 默认数据库实例
export const db = createDatabase();
