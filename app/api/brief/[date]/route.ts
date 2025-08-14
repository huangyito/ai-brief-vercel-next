import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
export const runtime = 'edge';

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

export async function GET(_: Request, { params }: { params: { date: string } }) {
  const data = await redis.get(`brief:${params.date}`);
  return NextResponse.json(data ?? { date: params.date, headline: '', items: [] });
}


