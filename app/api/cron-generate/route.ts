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
      const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const today = new Date().toISOString().slice(0,10); // UTC 日期

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

      const user = `以UTC ${today} 为当天，生成“AI产品每日简报”。如某产品无更新，不必出现。`;

      const model = process.env.MODEL || 'gpt-4.1';

      const resp = await client.responses.create({
        model,
        input: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        response_format: { type: 'json_object' },
      });

      const content = resp.output_text ?? '';
      const data = JSON.parse(content);
      if (!data?.items) throw new Error('模型输出缺少 items');

      // 存储
      await redis.set('brief:latest', data);
      await redis.set(`brief:${data.date}`, data);

      return NextResponse.json({ ok: true, count: data.items.length, date: data.date });
    } catch (err: any) {
      return NextResponse.json({ ok: false, error: err?.message ?? 'failed' }, { status: 500 });
    }
  }
