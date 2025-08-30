import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET() {
  try {
    // 本地开发时返回模拟的归档数据
    if (process.env.NODE_ENV === 'development' && !process.env.KV_REST_API_URL) {
      const mockDates = [
        '2025-08-15',
        '2025-08-14', 
        '2025-08-13',
        '2025-08-12',
        '2025-08-11',
        '2025-08-10',
        '2025-08-09',
        '2025-08-08'
      ];
      
      console.log('返回模拟归档日期:', mockDates);
      return NextResponse.json({ dates: mockDates });
    }
    
    // 生产环境使用Redis
    const { Redis } = await import('@upstash/redis');
    const redis = new Redis({
      url: process.env.KV_REST_API_URL!,
      token: process.env.KV_REST_API_TOKEN!,
    });
    
    const dates = await redis.zrange<string[]>('brief:index', 0, 199, { rev: true });
    return NextResponse.json({ dates });
  } catch (error) {
    console.error('获取归档日期失败:', error);
    return NextResponse.json(
      { error: '获取归档数据失败' }, 
      { status: 500 }
    );
  }
}


