// 国内科技新闻源配置
export interface ChineseNewsSource {
  name: string;
  url: string;
  category: 'Technology' | 'Business' | 'Research' | 'Industry';
  searchUrl: string;
  rssUrl?: string;
  apiKey?: string;
  description: string;
  language: 'zh-CN' | 'zh-TW' | 'en';
  region: 'china' | 'hongkong' | 'taiwan';
  priority: number; // 优先级，数字越大优先级越高
}

// 国内科技新闻源列表
export const CHINESE_NEWS_SOURCES: ChineseNewsSource[] = [
  // 头部科技媒体
  {
    name: '36氪',
    url: 'https://36kr.com',
    category: 'Technology',
    searchUrl: 'https://36kr.com/search/articles/人工智能',
    rssUrl: 'https://36kr.com/feed',
    description: '中国领先的科技媒体，专注于创业创新和科技资讯',
    language: 'zh-CN',
    region: 'china',
    priority: 10
  },
  {
    name: '虎嗅',
    url: 'https://www.huxiu.com',
    category: 'Technology',
    searchUrl: 'https://www.huxiu.com/search/0/人工智能',
    rssUrl: 'https://www.huxiu.com/rss/0.xml',
    description: '关注商业科技创新的媒体平台',
    language: 'zh-CN',
    region: 'china',
    priority: 9
  },
  {
    name: '钛媒体',
    url: 'https://www.tmtpost.com',
    category: 'Technology',
    searchUrl: 'https://www.tmtpost.com/search?q=人工智能',
    rssUrl: 'https://www.tmtpost.com/rss.xml',
    description: 'TMT领域专业媒体，深度分析科技趋势',
    language: 'zh-CN',
    region: 'china',
    priority: 9
  },
  
  // 专业AI媒体
  {
    name: '量子位',
    url: 'https://www.qbitai.com',
    category: 'Research',
    searchUrl: 'https://www.qbitai.com/search?q=人工智能',
    rssUrl: 'https://www.qbitai.com/feed',
    description: '专注AI领域的专业媒体，深度报道AI技术发展',
    language: 'zh-CN',
    region: 'china',
    priority: 10
  },
  {
    name: '机器之心',
    url: 'https://www.jiqizhixin.com',
    category: 'Research',
    searchUrl: 'https://www.jiqizhixin.com/search?q=人工智能',
    rssUrl: 'https://www.jiqizhixin.com/feed',
    description: 'AI领域专业媒体，关注前沿技术和产业应用',
    language: 'zh-CN',
    region: 'china',
    priority: 9
  },
  {
    name: 'AI前线',
    url: 'https://www.infoq.cn',
    category: 'Technology',
    searchUrl: 'https://www.infoq.cn/search?query=人工智能',
    rssUrl: 'https://www.infoq.cn/feed',
    description: 'InfoQ中文站，专注技术前沿和开发者资讯',
    language: 'zh-CN',
    region: 'china',
    priority: 8
  },
  
  // 开发者社区
  {
    name: 'CSDN',
    url: 'https://www.csdn.net',
    category: 'Technology',
    searchUrl: 'https://so.csdn.net/so/search?q=人工智能',
    rssUrl: 'https://www.csdn.net/rss',
    description: '中国最大的开发者社区，技术文章和教程丰富',
    language: 'zh-CN',
    region: 'china',
    priority: 8
  },
  {
    name: '掘金',
    url: 'https://juejin.cn',
    category: 'Technology',
    searchUrl: 'https://juejin.cn/search?query=人工智能',
    rssUrl: 'https://juejin.cn/rss',
    description: '高质量的技术社区，分享技术文章和心得',
    language: 'zh-CN',
    region: 'china',
    priority: 7
  },
  {
    name: '开源中国',
    url: 'https://www.oschina.net',
    category: 'Technology',
    searchUrl: 'https://www.oschina.net/search?scope=all&q=人工智能',
    rssUrl: 'https://www.oschina.net/news/rss',
    description: '开源技术社区，关注开源项目和开源文化',
    language: 'zh-CN',
    region: 'china',
    priority: 7
  },
  
  // 其他科技媒体
  {
    name: '爱范儿',
    url: 'https://www.ifanr.com',
    category: 'Technology',
    searchUrl: 'https://www.ifanr.com/search?q=人工智能',
    rssUrl: 'https://www.ifanr.com/feed',
    description: '关注科技生活和新消费的媒体平台',
    language: 'zh-CN',
    region: 'china',
    priority: 6
  },
  {
    name: '极客公园',
    url: 'https://www.geekpark.net',
    category: 'Technology',
    searchUrl: 'https://www.geekpark.net/search?q=人工智能',
    rssUrl: 'https://www.geekpark.net/rss',
    description: '关注科技创新和创业的媒体平台',
    language: 'zh-CN',
    region: 'china',
    priority: 6
  },
  {
    name: '雷锋网',
    url: 'https://www.leiphone.com',
    category: 'Technology',
    searchUrl: 'https://www.leiphone.com/search?q=人工智能',
    rssUrl: 'https://www.leiphone.com/feed',
    description: '关注智能硬件和科技创新的媒体',
    language: 'zh-CN',
    region: 'china',
    priority: 6
  },
  
  // 香港科技媒体
  {
    name: 'TechCrunch中文',
    url: 'https://techcrunch.cn',
    category: 'Technology',
    searchUrl: 'https://techcrunch.cn/search/人工智能',
    description: 'TechCrunch中文版，关注中国科技创业',
    language: 'zh-CN',
    region: 'hongkong',
    priority: 7
  },
  
  // 台湾科技媒体
  {
    name: 'TechNews科技新报',
    url: 'https://technews.tw',
    category: 'Technology',
    searchUrl: 'https://technews.tw/search/人工智能',
    rssUrl: 'https://technews.tw/feed',
    description: '台湾科技新闻媒体，关注全球科技趋势',
    language: 'zh-TW',
    region: 'taiwan',
    priority: 6
  }
];

// 按优先级排序
export const PRIORITIZED_CHINESE_SOURCES = CHINESE_NEWS_SOURCES.sort((a, b) => b.priority - a.priority);

// 按分类分组
export const CHINESE_SOURCES_BY_CATEGORY = CHINESE_NEWS_SOURCES.reduce((acc, source) => {
  if (!acc[source.category]) {
    acc[source.category] = [];
  }
  acc[source.category].push(source);
  return acc;
}, {} as Record<string, ChineseNewsSource[]>);

// 按地区分组
export const CHINESE_SOURCES_BY_REGION = CHINESE_NEWS_SOURCES.reduce((acc, source) => {
  if (!acc[source.region]) {
    acc[source.region] = [];
  }
  acc[source.region].push(source);
  return acc;
}, {} as Record<string, ChineseNewsSource[]>);

// 获取指定优先级的新闻源
export function getSourcesByPriority(minPriority: number): ChineseNewsSource[] {
  return CHINESE_NEWS_SOURCES.filter(source => source.priority >= minPriority);
}

// 获取指定分类的新闻源
export function getSourcesByCategory(category: string): ChineseNewsSource[] {
  return CHINESE_NEWS_SOURCES.filter(source => source.category === category);
}

// 获取指定地区的新闻源
export function getSourcesByRegion(region: string): ChineseNewsSource[] {
  return CHINESE_NEWS_SOURCES.filter(source => source.region === region);
}

// 获取所有中文新闻源
export function getAllChineseSources(): ChineseNewsSource[] {
  return CHINESE_NEWS_SOURCES;
}

// 验证新闻源配置
export function validateChineseSources(): { valid: ChineseNewsSource[], invalid: string[] } {
  const valid: ChineseNewsSource[] = [];
  const invalid: string[] = [];
  
  for (const source of CHINESE_NEWS_SOURCES) {
    if (source.url && source.name && source.category) {
      valid.push(source);
    } else {
      invalid.push(source.name);
    }
  }
  
  return { valid, invalid };
}

