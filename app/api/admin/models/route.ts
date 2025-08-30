import { NextRequest, NextResponse } from 'next/server';

// 创建Redis客户端函数
async function createRedisClient() {
  if (process.env.NODE_ENV === 'development' && !process.env.KV_REST_API_URL) {
    // 本地开发环境，使用内存存储
    console.log('使用本地内存存储');
    
    // 使用全局变量来保持数据在请求之间
    if (!global.localStorage) {
      (global as any).localStorage = new Map();
    }
    
    return {
      get: async (key: string) => {
        const value = global.localStorage.get(key);
        console.log(`获取 ${key}:`, value);
        return value || [];
      },
      set: async (key: string, value: any) => {
        console.log(`设置 ${key}:`, value);
        global.localStorage.set(key, value);
        return 'OK';
      },
      del: async (key: string) => {
        console.log(`删除 ${key}`);
        global.localStorage.delete(key);
        return 1;
      },
    };
  } else {
    // 生产环境，使用Redis
    const { Redis } = await import('@upstash/redis');
    return new Redis({
      url: process.env.KV_REST_API_URL!,
      token: process.env.KV_REST_API_TOKEN!,
    });
  }
}

export const runtime = 'edge';

// 模型配置类型
export type ModelConfig = {
  id: string;
  name: string;
  isActive: boolean;
  priority: number;
  createdAt: string;
  updatedAt: string;
};

// 获取所有模型
export async function GET() {
  try {
    const redis = await createRedisClient();
    let models = await redis.get('ai_models') || [];
    
    // 本地开发环境，如果没有数据则返回空数组（不自动初始化测试数据）
    if (process.env.NODE_ENV === 'development' && !process.env.KV_REST_API_URL && models.length === 0) {
      console.log('本地开发环境，返回空模型列表');
      return NextResponse.json([]);
    }
    
    console.log('返回模型数据:', models);
    return NextResponse.json(models);
  } catch (error) {
    console.error('获取模型列表失败:', error);
    return NextResponse.json({ error: '获取模型列表失败' }, { status: 500 });
  }
}

// 添加新模型
export async function POST(request: NextRequest) {
  try {
    const redis = await createRedisClient();
    const { name, priority = 1 } = await request.json();
    
    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: '模型名称不能为空' }, { status: 400 });
    }

    const existingModels = await redis.get('ai_models') || [];
    const newModel: ModelConfig = {
      id: Date.now().toString(),
      name: name.trim(),
      isActive: true,
      priority: Number(priority) || 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedModels = [...existingModels, newModel];
    await redis.set('ai_models', updatedModels);

    return NextResponse.json(newModel, { status: 201 });
  } catch (error) {
    console.error('添加模型失败:', error);
    return NextResponse.json({ error: '添加模型失败' }, { status: 500 });
  }
}

// 更新模型
export async function PUT(request: NextRequest) {
  try {
    const redis = await createRedisClient();
    const { id, name, isActive, priority } = await request.json();
    
    if (!id) {
      return NextResponse.json({ error: '模型ID不能为空' }, { status: 400 });
    }

    const existingModels = await redis.get('ai_models') || [];
    const modelIndex = existingModels.findIndex((m: ModelConfig) => m.id === id);
    
    if (modelIndex === -1) {
      return NextResponse.json({ error: '模型不存在' }, { status: 404 });
    }

    const updatedModel = {
      ...existingModels[modelIndex],
      name: name || existingModels[modelIndex].name,
      isActive: isActive !== undefined ? isActive : existingModels[modelIndex].isActive,
      priority: priority !== undefined ? Number(priority) : existingModels[modelIndex].priority,
      updatedAt: new Date().toISOString(),
    };

    existingModels[modelIndex] = updatedModel;
    await redis.set('ai_models', existingModels);

    return NextResponse.json(updatedModel);
  } catch (error) {
    console.error('更新模型失败:', error);
    return NextResponse.json({ error: '更新模型失败' }, { status: 500 });
  }
}

// 删除模型
export async function DELETE(request: NextRequest) {
  try {
    const redis = await createRedisClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: '模型ID不能为空' }, { status: 400 });
    }

    const existingModels = await redis.get('ai_models') || [];
    const filteredModels = existingModels.filter((m: ModelConfig) => m.id !== id);
    
    if (filteredModels.length === existingModels.length) {
      return NextResponse.json({ error: '模型不存在' }, { status: 404 });
    }

    await redis.set('ai_models', filteredModels);

    return NextResponse.json({ message: '模型删除成功' });
  } catch (error) {
    console.error('删除模型失败:', error);
    return NextResponse.json({ error: '删除模型失败' }, { status: 500 });
  }
}
