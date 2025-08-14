import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
export const runtime = 'edge';

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

export async function GET() {
  // 最近 200 天，按需调整
  const dates = await redis.zrange<string[]>('brief:index', 0, 199, { rev: true });
  return NextResponse.json({ dates });
}


