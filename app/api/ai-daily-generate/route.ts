import { NextResponse } from 'next/server';
import { newsCrawler } from '../../lib/news-crawler';

// AI Daily 新闻头条生成服务
export const runtime = 'edge';

// 定义AI新闻类型
type AINewsCategory = 'Technology' | 'Business' | 'Research' | 'Policy' | 'Industry' | 'Innovation';

// 导入AI新闻源配置
import { AI_NEWS_SOURCES } from '../../lib/chinese-news-sources';

// 生成AI提示词
function generateAIPrompt(date: string): string {
  return `请为${date}生成一份AI领域每日新闻头条，要求：

1. 生成8-12条真实的AI相关新闻，包含中英文新闻
2. 每条新闻包含：标题、摘要、新闻类型、重要性评分、相关标签、信息来源、封面图片URL
3. 新闻类型包括：Technology(技术突破)、Business(商业动态)、Research(研究进展)、Policy(政策法规)、Industry(行业趋势)、Innovation(创新应用)
4. 内容要真实可信，基于当天或最近的AI新闻事件
5. 重点关注：
   - 国际：OpenAI、Google、Meta、Microsoft、Anthropic等主流公司
   - 国内：百度、阿里、腾讯、字节跳动、华为、中科院、清华等
6. 标签要简洁，如：大语言模型、计算机视觉、AI监管、自动驾驶、医疗AI等
7. 信息来源必须是真实可访问的新闻网站，提供具体的新闻文章链接
8. 封面图片URL必须是真实存在的图片链接，可以从新闻源网站获取
9. 重要性评分：1-5分，5分为最重要
10. 所有链接必须能够正常访问，确保用户可以点击阅读原文
11. 新闻内容要平衡中英文，体现全球AI发展动态

请以JSON格式返回，格式如下：
{
  "date": "${date}",
  "headline": "AI领域每日新闻头条",
  "summary": "今日AI领域重要动态概述",
  "items": [
    {
      "title": "新闻标题",
      "summary": "新闻摘要",
      "type": "Technology|Business|Research|Policy|Industry|Innovation",
      "importance": 5,
      "tags": ["标签1", "标签2"],
      "sources": [{"name": "来源名称", "url": "具体新闻文章URL"}],
      "coverImage": "封面图片URL",
      "time": "时间戳"
    }
  ]
}`;
}

// 使用新闻爬虫获取真实新闻数据
async function callAIAPI(prompt: string): Promise<any> {
  try {
    console.log('开始从新闻源获取AI新闻...');
    
    // 1. 从新闻爬虫获取真实新闻
    const newsArticles = await newsCrawler.fetchAllNews();
    console.log(`获取到 ${newsArticles.length} 条新闻`);
    
    // 2. 验证新闻链接
    const validNews = await newsCrawler.validateNewsLinks(newsArticles);
    console.log(`验证后剩余 ${validNews.length} 条有效新闻`);
    
    // 3. 转换为AI Daily格式
    const today = new Date();
    const aiDailyData = {
      date: today.toISOString().slice(0, 10),
      headline: "AI领域每日新闻头条",
      summary: "今日AI领域重要动态：基于权威新闻源的真实报道",
      items: validNews.slice(0, 8).map((article, index) => ({
        title: article.title,
        summary: article.summary,
        type: mapCategoryToType(article.category),
        importance: calculateImportance(article, index),
        tags: article.tags,
        sources: [{ 
          name: article.source, 
          url: article.url 
        }],
        coverImage: article.coverImage,
        time: article.publishedAt
      }))
    };
    
    console.log('AI Daily数据生成完成');
    return aiDailyData;
    
  } catch (error) {
    console.error('获取新闻数据失败，使用备用数据:', error);
    
    // 如果爬虫失败，返回备用数据
    return getFallbackData();
  }
}

// 将新闻分类映射到AI Daily类型
function mapCategoryToType(category: string): string {
  const typeMap: Record<string, string> = {
    'Technology': 'Technology',
    'Business': 'Business',
    'Research': 'Research',
    'Policy': 'Policy',
    'Industry': 'Industry',
    'Innovation': 'Innovation'
  };
  return typeMap[category] || 'Technology';
}

// 计算新闻重要性评分
function calculateImportance(article: any, index: number): number {
  // 基于多个因素计算重要性
  let score = 5;
  
  // 标题关键词权重（国际+国内）
  const internationalKeywords = ['OpenAI', 'GPT', 'Claude', 'Google', 'Meta', 'Tesla', 'NVIDIA'];
  const chineseKeywords = ['百度', '文心一言', '阿里', '通义千问', '腾讯', '混元', '字节', '豆包', '华为', '昇腾', '中科院', '清华'];
  
  const hasInternationalKeywords = internationalKeywords.some(keyword => 
    article.title.toLowerCase().includes(keyword.toLowerCase())
  );
  const hasChineseKeywords = chineseKeywords.some(keyword => 
    article.title.toLowerCase().includes(keyword)
  );
  
  if (hasInternationalKeywords) score += 1;
  if (hasChineseKeywords) score += 1;
  
  // 新闻源权重（国际+国内）
  const internationalPremiumSources = ['TechCrunch', 'MIT Technology Review', 'Nature', 'Reuters', 'The Verge'];
  const chinesePremiumSources = ['36氪', '虎嗅', '钛媒体', '量子位', '机器之心', 'CSDN'];
  
  if (internationalPremiumSources.includes(article.source)) score += 1;
  if (chinesePremiumSources.includes(article.source)) score += 1;
  
  // 时间权重（越新越重要）
  const hoursSincePublished = (Date.now() - new Date(article.publishedAt).getTime()) / (1000 * 60 * 60);
  if (hoursSincePublished < 24) score += 1;
  
  // 地域权重（平衡中英文新闻）
  const isChineseNews = /[\u4e00-\u9fa5]/.test(article.title);
  if (isChineseNews) score += 0.5; // 中文新闻稍微加分，平衡中英文比例
  
  // 确保分数在1-5范围内
  return Math.min(Math.max(Math.round(score), 1), 5);
}

// 备用数据（当爬虫失败时使用）
function getFallbackData() {
  const today = new Date();
  return {
    date: today.toISOString().slice(0, 10),
    headline: "AI领域每日新闻头条",
    summary: "今日AI领域重要动态（备用数据）",
    items: [
      {
        title: "AI技术发展持续加速，多领域应用突破",
        summary: "人工智能技术在各领域持续取得突破，从大语言模型到自动驾驶，技术发展日新月异。",
        type: "Technology",
        importance: 4,
        tags: ["AI技术", "发展", "突破"],
        sources: [{ 
          name: "AI Daily", 
          url: "https://example.com/ai-news" 
        }],
        coverImage: "https://via.placeholder.com/800x400/4A90E2/FFFFFF?text=AI+Technology",
        time: today.toISOString()
      }
    ]
  };
}

// 保存AI Daily新闻数据到数据库/Redis
async function saveToDatabase(data: any): Promise<void> {
  // 这里应该保存到真实的数据库
  // 目前使用console.log模拟
  
  console.log('保存AI Daily新闻数据到数据库:', {
    date: data.date,
    headline: data.headline,
    itemCount: data.items.length,
    timestamp: new Date().toISOString()
  });
  
  // TODO: 实现真实的数据库保存逻辑
  // 可以使用：PostgreSQL、MongoDB、Redis等
}

export async function POST(request: Request) {
  try {
    const { date, force = false } = await request.json();
    
    // 验证请求
    if (!date) {
      return NextResponse.json(
        { error: '缺少日期参数' },
        { status: 400 }
      );
    }
    
    // 检查是否已经生成过当天的数据
    if (!force) {
      // TODO: 检查数据库中是否已存在当天的数据
      console.log(`检查${date}的数据是否已存在...`);
    }
    
    console.log(`开始为${date}生成AI Daily数据...`);
    
    // 1. 生成AI提示词
    const prompt = generateAIPrompt(date);
    console.log('AI提示词:', prompt);
    
    // 2. 调用AI API
    console.log('调用AI API...');
    const aiData = await callAIAPI(prompt);
    console.log('AI返回数据:', aiData);
    
    // 3. 数据验证和清理
    if (!aiData || !aiData.items || !Array.isArray(aiData.items)) {
      throw new Error('AI返回的数据格式无效');
    }
    
    // 4. 保存到数据库
    console.log('保存数据到数据库...');
    await saveToDatabase(aiData);
    
    // 5. 返回结果
    return NextResponse.json({
      success: true,
      message: `成功生成${date}的AI Daily数据`,
      data: aiData,
      generatedAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('生成AI Daily数据失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: '生成数据失败',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
}

// 手动触发数据生成（用于测试）
export async function GET() {
  try {
    const today = new Date().toISOString().slice(0, 10);
    
    // 直接调用AI API生成今天的数据
    const aiData = await callAIAPI(generateAIPrompt(today));
    
    return NextResponse.json({
      success: true,
      message: '手动生成成功',
      data: aiData,
      generatedAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('手动生成失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: '手动生成失败',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
}
