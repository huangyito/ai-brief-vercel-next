import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ date: string }> }
) {
  const { date } = await params;
  try {
    
    // 本地开发时返回模拟的日期简报数据
    if (process.env.NODE_ENV === 'development' && !process.env.KV_REST_API_URL) {
      const mockBriefData = {
        date: date,
        headline: `${date} AI产品动态更新`,
        items: [
          {
            product: "OpenAI GPT-5",
            type: "update",
            summary: "GPT-5新增多模态理解能力,支持视频内容分析。",
            tags: ["多模态", "视频理解"],
            sources: [{ name: "OpenAI Blog", url: "https://openai.com" }],
            time: date
          },
          {
            product: "Google Bard",
          type: "new",
            summary: "Google Bard推出实时协作功能,支持多人同时编辑对话。",
            tags: ["协作", "实时编辑"],
            sources: [{ name: "Google AI", url: "https://ai.google" }],
            time: date
          },
          {
            product: "Meta LLaMA 3",
            type: "fix",
            summary: "修复了LLaMA 3在长文本生成中的重复内容问题。",
            tags: ["长文本", "修复"],
            sources: [{ name: "Meta AI", url: "https://ai.meta.com" }],
            time: date
          },
          {
            product: "Microsoft Copilot",
            type: "feedback",
            summary: "Copilot集成了新的代码自动补全模型,提高开发效率。",
            tags: ["代码补全", "开发效率"],
            sources: [{ name: "Microsoft", url: "https://microsoft.com" }],
            time: date
          }
        ]
      };
      
      console.log(`返回${date}的模拟简报数据:`, mockBriefData);
      return NextResponse.json(mockBriefData);
    }
    
    // 生产环境使用Redis
    const { Redis } = await import('@upstash/redis');
    const redis = new Redis({
      url: process.env.KV_REST_API_URL!,
      token: process.env.KV_REST_API_URL!,
    });
    
    const data = await redis.get(`brief:${date}`);
    return NextResponse.json(data ?? { date: date, headline: '', items: [] });
  } catch (error) {
    console.error(`获取${date}简报失败:`, error);
    return NextResponse.json(
      { error: '获取简报数据失败' }, 
      { status: 500 }
    );
  }
}


