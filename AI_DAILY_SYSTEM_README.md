# AI Daily 新闻头条系统

## 系统概述

AI Daily 是一个自动化AI新闻头条生成和推送系统，每天上午9点自动获取AI领域的最新新闻，生成新闻头条，并推送到数据库。

## 系统架构

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   定时任务      │    │   AI Daily       │    │     数据库      │
│   (每天9点)     │───▶│   生成服务       │───▶│   (Redis/DB)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   通知服务      │    │   前端展示       │    │   数据管理      │
│   (Slack/邮件)  │    │   (AI-Tracker)   │    │   (增删改查)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 核心功能

### 1. 自动新闻生成
- **时间**: 每天上午9:00自动执行
- **内容**: AI领域最新新闻头条（基于真实新闻源）
- **数量**: 5-10条重要新闻
- **类型**: 技术突破、商业动态、研究进展、政策法规、行业趋势、创新应用
- **真实性**: 所有新闻链接可直接访问原文，包含真实封面图片

### 2. 新闻分类系统
- **Technology**: 技术突破 (如GPT-5发布、自动驾驶升级)
- **Business**: 商业动态 (如AI芯片市场、公司融资)
- **Research**: 研究进展 (如蛋白质结构预测、学术论文)
- **Policy**: 政策法规 (如AI监管法案、行业标准)
- **Industry**: 行业趋势 (如医疗AI应用、产业报告)
- **Innovation**: 创新应用 (如AI新产品、应用场景)

### 3. 重要性评分
- **5分**: 重大新闻，影响整个AI行业
- **4分**: 重要新闻，影响特定领域
- **3分**: 一般新闻，值得关注
- **2分**: 次要新闻，了解即可
- **1分**: 边缘新闻，仅供参考

## API接口

### 1. 新闻生成API
```
POST /api/ai-daily-generate
Content-Type: application/json

{
  "date": "2024-01-15",
  "force": false
}
```

### 2. 定时任务API
```
GET /api/cron/ai-daily
Authorization: Bearer {CRON_SECRET}
```

### 3. 手动触发API
```
POST /api/cron/ai-daily
Authorization: Bearer {CRON_SECRET}

{
  "force": true
}
```

## 环境变量配置

```bash
# 数据库配置
DATABASE_TYPE=redis                    # 数据库类型: redis, postgres, mongodb
KV_REST_API_URL=your_redis_url        # Redis连接URL
KV_REST_API_TOKEN=your_redis_token    # Redis访问令牌

# 定时任务配置
CRON_SECRET=your_cron_secret          # 定时任务密钥
NEXT_PUBLIC_BASE_URL=http://localhost:3000  # 应用基础URL

# 通知服务配置
SLACK_WEBHOOK_URL=your_slack_webhook  # Slack通知URL

# PostgreSQL配置 (如果使用)
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USERNAME=username
POSTGRES_PASSWORD=password
POSTGRES_DATABASE=ai_daily

# MongoDB配置 (如果使用)
MONGODB_URI=your_mongodb_uri
```

## 部署说明

### 1. Vercel部署
```bash
# 安装依赖
npm install

# 设置环境变量
vercel env add CRON_SECRET
vercel env add KV_REST_API_URL
vercel env add KV_REST_API_TOKEN

# 部署
vercel --prod
```

### 2. 定时任务设置
在Vercel中设置Cron Job：
```json
{
  "crons": [
    {
      "path": "/api/cron/ai-daily",
      "schedule": "0 9 * * *"
    }
  ]
}
```

### 3. 本地开发
```bash
# 启动开发服务器
npm run dev

# 测试API
curl -X POST http://localhost:3000/api/ai-daily-generate \
  -H "Content-Type: application/json" \
  -d '{"date":"2024-01-15"}'

# 测试定时任务
curl -X GET http://localhost:3000/api/cron/ai-daily \
  -H "Authorization: Bearer your_cron_secret"
```

## 数据格式

### 新闻数据结构
```json
{
  "date": "2024-01-15",
  "headline": "AI领域每日新闻头条",
  "summary": "今日AI领域重要动态概述",
  "items": [
    {
      "title": "新闻标题",
      "summary": "新闻摘要",
      "type": "Technology",
      "importance": 5,
      "tags": ["大语言模型", "多模态"],
      "sources": [
        {
          "name": "TechCrunch",
          "url": "https://techcrunch.com/2024/01/15/specific-article-url"
        }
      ],
      "coverImage": "https://techcrunch.com/wp-content/uploads/2024/01/article-cover.jpg",
      "time": "2024-01-15T09:00:00.000Z"
    }
  ]
}
```

## 扩展功能

### 1. 真实AI API集成
替换模拟数据生成，集成真实的AI服务：
- OpenAI GPT-4
- Anthropic Claude
- Google Gemini
- 其他AI服务

### 2. 新闻源爬虫
自动爬取权威新闻源：
- **国际科技媒体**: TechCrunch、The Verge、MIT Technology Review、Ars Technica、Wired
- **国际商业媒体**: VentureBeat、Reuters Tech、AI Business
- **国际专业媒体**: Nature、AI News、Synced
- **国内科技媒体**: 36氪、虎嗅、钛媒体、爱范儿、极客公园
- **国内专业媒体**: 量子位、机器之心、AI前线、雷锋网
- **国内开发者社区**: CSDN、掘金、开源中国
- **RSS订阅**: 支持RSS源自动更新
- **链接验证**: 确保所有新闻链接可正常访问
- **中英文平衡**: 智能平衡国际和国内新闻比例

### 3. 多语言支持
支持多语言新闻生成：
- 中文
- 英文
- 其他语言

### 4. 个性化推送
根据用户兴趣推送相关新闻：
- 技术偏好
- 行业关注
- 重要性阈值

## 监控和日志

### 1. 执行日志
- 定时任务执行状态
- 新闻生成结果
- 错误和异常信息

### 2. 性能监控
- API响应时间
- 数据库操作性能
- 系统资源使用

### 3. 通知告警
- 任务执行失败
- 系统异常
- 数据异常

## 故障排除

### 1. 常见问题
- **定时任务不执行**: 检查CRON_SECRET和环境变量
- **数据生成失败**: 检查AI API配置和网络连接
- **数据库连接失败**: 检查数据库配置和权限

### 2. 调试方法
- 查看控制台日志
- 检查API响应状态
- 验证环境变量配置

## 贡献指南

欢迎提交Issue和Pull Request来改进系统：
- 报告Bug
- 提出新功能
- 优化代码
- 改进文档

## 许可证

MIT License
