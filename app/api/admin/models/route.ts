import { NextRequest, NextResponse } from 'next/server';

// 本地开发时使用本地存储，生产环境使用Redis
let redis: any;

if (process.env.NODE_ENV === 'development' && !process.env.KV_REST_API_URL) {
  // 本地开发环境，使用内存存储
  const storage = new Map();
  redis = {
    get: async (key: string) => storage.get(key) || null,
    set: async (key: string, value: any) => storage.set(key, value),
    del: async (key: string) => storage.delete(key),
  };
} else {
  // 生产环境，使用Redis
  const { Redis } = await import('@upstash/redis');
  redis = new Redis({
    url: process.env.KV_REST_API_URL!,
    token: process.env.KV_REST_API_TOKEN!,
  });
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
    const models = await redis.get('ai_models') || [];
    return NextResponse.json(models);
  } catch (error) {
    console.error('获取模型列表失败:', error);
    return NextResponse.json({ error: '获取模型列表失败' }, { status: 500 });
  }
}

// 添加新模型
export async function POST(request: NextRequest) {
  try {
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
