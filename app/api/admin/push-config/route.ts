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

// 推送配置类型
export type PushConfig = {
  id: string;
  pushTime: string;    // 推送时间 (HH:mm)
  timezone: string;    // 时区
  isEnabled: boolean;  // 是否启用自动推送
  updatedAt: string;
};

// 获取推送配置
export async function GET() {
  try {
    let config = await redis.get('push_config');
    
    // 如果没有配置，返回默认配置
    if (!config) {
      config = {
        id: 'default',
        pushTime: '09:00',
        timezone: 'Asia/Shanghai',
        isEnabled: true,
        updatedAt: new Date().toISOString(),
      };
      // 保存默认配置
      await redis.set('push_config', config);
    }
    
    return NextResponse.json(config);
  } catch (error) {
    console.error('获取推送配置失败:', error);
    return NextResponse.json({ error: '获取推送配置失败' }, { status: 500 });
  }
}

// 更新推送配置
export async function PUT(request: NextRequest) {
  try {
    const { pushTime, timezone, isEnabled } = await request.json();
    
    // 验证推送时间格式 (HH:mm)
    if (pushTime && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(pushTime)) {
      return NextResponse.json({ error: '推送时间格式不正确，应为 HH:mm' }, { status: 400 });
    }

    // 验证时区
    if (timezone && !Intl.supportedValuesOf('timeZone').includes(timezone)) {
      return NextResponse.json({ error: '时区格式不正确' }, { status: 400 });
    }

    const existingConfig = await redis.get('push_config') || {
      id: 'default',
      pushTime: '09:00',
      timezone: 'Asia/Shanghai',
      isEnabled: true,
      updatedAt: new Date().toISOString(),
    };

    const updatedConfig: PushConfig = {
      ...existingConfig,
      pushTime: pushTime || existingConfig.pushTime,
      timezone: timezone || existingConfig.timezone,
      isEnabled: isEnabled !== undefined ? isEnabled : existingConfig.isEnabled,
      updatedAt: new Date().toISOString(),
    };

    await redis.set('push_config', updatedConfig);

    return NextResponse.json(updatedConfig);
  } catch (error) {
    console.error('更新推送配置失败:', error);
    return NextResponse.json({ error: '更新推送配置失败' }, { status: 500 });
  }
}
