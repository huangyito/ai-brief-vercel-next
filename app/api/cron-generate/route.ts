import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { Redis } from '@upstash/redis';

export const runtime = 'edge';

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

export async function GET() {
  try {
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
      baseURL: process.env.OPENAI_API_BASE_URL || undefined, // 例如 https://openai.weavex.tech/v1
    });

    const todayUTC = new Date().toISOString().slice(0, 10);

    const system = `你是一名“AI产品变更日志”编辑，输出JSON，字段：
{
  "date": "YYYY-MM-DD",
  "headline": "string",
  "items": [
    {
      "product": "string",
      "type": "new|update|feedback|fix",
      "summary": "一句话更新",
      "tags": ["string"],
      "sources": [{"name":"string","url":"string"}]
    }
  ]
}
规则：精简、客观，像App更新日志；若无确切新闻，不要编造；优先覆盖：OpenAI、Anthropic、Google、Meta、Mistral、xAI、Microsoft、百度、阿里、字节、讯飞、Kimi。`;

    const user = `以UTC ${todayUTC} 为当天，生成“AI产品每日简报”。如某产品无更新，不必出现。仅输出JSON对象。`;

    const model = process.env.MODEL || 'gpt-4o-mini';

    async function createOnce(useJsonMode: boolean) {
      return await client.chat.completions.create({
        model,
        ...(useJsonMode ? { response_format: { type: 'json_object' as any } } : {}),
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        temperature: 0.2,
      } as any);
    }

    // 先试 JSON Mode，不行则降级
    let completion;
    try {
      completion = await createOnce(true);
    } catch {
      completion = await createOnce(false);
    }

    const raw = completion.choices?.[0]?.message?.content ?? '';
    const cleaned = raw
      .replace(/^\s*```json\s*/i, '')
      .replace(/\s*```\s*$/i, '')
      .trim();

    let data: any;
    try {
      data = JSON.parse(cleaned);
    } catch (e) {
      throw new Error('模型返回的内容不是合法JSON：' + (cleaned?.slice(0, 120) || ''));
    }

    if (!data?.items || !Array.isArray(data.items)) throw new Error('模型输出缺少 items');
    if (!data?.date) data.date = todayUTC;

    // 存储
    await redis.set('brief:latest', data);
    await redis.set(`brief:${data.date}`, data);

    // ✅ 新增：把日期加入有序集合，按时间排序（score=当天 00:00 的 UNIX 时间）
    const ts = Math.floor(new Date(data.date + 'T00:00:00Z').getTime() / 1000);
    await redis.zadd('brief:index', { score: ts, member: data.date });

    return NextResponse.json({ ok: true, count: data.items.length, date: data.date });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message ?? 'failed' }, { status: 500 });
  }
}