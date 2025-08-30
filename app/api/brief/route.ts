import { NextResponse } from 'next/server';

// 本地开发时使用模拟数据，生产环境使用Redis
let redis: any;

if (process.env.NODE_ENV === 'development' && !process.env.KV_REST_API_URL) {
  // 本地开发环境，使用模拟数据
  const mockData = {
    date: new Date().toISOString().slice(0, 10),
    headline: "AI产品每日动态更新",
    items: [
      {
        product: "OpenAI GPT-5",
        type: "update",
        summary: "GPT-5新增多模态理解能力,支持视频内容分析。",
        tags: ["多模态", "视频理解"],
        sources: [{ name: "OpenAI Blog", url: "https://openai.com" }],
        time: new Date().toISOString()
      },
      {
        product: "Google Bard",
        type: "new",
        summary: "Google Bard推出实时协作功能,支持多人同时编辑对话。",
        tags: ["协作", "实时编辑"],
        sources: [{ name: "Google AI", url: "https://ai.google" }],
        time: new Date().toISOString()
      },
      {
        product: "Meta LLaMA 3",
        type: "fix",
        summary: "修复了LLaMA 3在长文本生成中的重复内容问题。",
        tags: ["长文本", "修复"],
        sources: [{ name: "Meta AI", url: "https://ai.meta.com" }],
        time: new Date().toISOString()
      },
      {
        product: "Microsoft Copilot",
        type: "feedback",
        summary: "Copilot集成了新的代码自动补全模型,提高开发效率。",
        tags: ["代码补全", "开发效率"],
        sources: [{ name: "Microsoft", url: "https://microsoft.com" }],
        time: new Date().toISOString()
      }
    ]
  };
  
  redis = {
    get: async (key: string) => {
      if (key === 'brief') return mockData;
      return null;
    },
    set: async (key: string, value: any) => {
      console.log(`Mock Redis SET: ${key}`, value);
    },
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

export async function GET() {
  try {
    // 本地开发时直接返回模拟数据
    if (process.env.NODE_ENV === 'development' && !process.env.KV_REST_API_URL) {
      const mockData = {
        date: new Date().toISOString().slice(0, 10),
        headline: "AI产品每日动态更新",
        items: [
          {
            product: "OpenAI GPT-5",
            type: "update",
            summary: "GPT-5新增多模态理解能力,支持视频内容分析。",
            tags: ["多模态", "视频理解"],
            sources: [{ name: "OpenAI Blog", url: "https://openai.com" }],
            time: new Date().toISOString()
          },
          {
            product: "Google Bard",
            type: "new",
            summary: "Google Bard推出实时协作功能,支持多人同时编辑对话。",
            tags: ["协作", "实时编辑"],
            sources: [{ name: "Google AI", url: "https://ai.google" }],
            time: new Date().toISOString()
          },
          {
            product: "Meta LLaMA 3",
            type: "fix",
            summary: "修复了LLaMA 3在长文本生成中的重复内容问题。",
            tags: ["长文本", "修复"],
            sources: [{ name: "Meta AI", url: "https://ai.meta.com" }],
            time: new Date().toISOString()
          },
          {
            product: "Microsoft Copilot",
            type: "feedback",
            summary: "Copilot集成了新的代码自动补全模型,提高开发效率。",
            tags: ["代码补全", "开发效率"],
            sources: [{ name: "Microsoft", url: "https://microsoft.com" }],
            time: new Date().toISOString()
          }
        ]
      };
      
      console.log('返回模拟数据:', mockData);
      return NextResponse.json(mockData);
    }
    
    // 生产环境使用Redis
    const data = await redis.get('brief:latest');
    return NextResponse.json(data ?? { date: null, headline: '', items: [] });
  } catch (error) {
    console.error('获取简报数据失败:', error);
    return NextResponse.json(
      { error: '获取数据失败' }, 
      { status: 500 }
    );
  }
}
