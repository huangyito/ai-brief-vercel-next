import { NextResponse } from 'next/server';

// AI Daily 新闻头条定时任务服务
export const runtime = 'edge';

// 验证定时任务密钥（防止未授权访问）
function validateCronSecret(request: Request): boolean {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  if (!cronSecret) {
    console.warn('CRON_SECRET 环境变量未设置，跳过验证');
    return true;
  }
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  
  const token = authHeader.substring(7);
  return token === cronSecret;
}

// 检查是否应该执行任务
function shouldExecuteCron(): boolean {
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();
  
  // 只在9:00-9:59之间执行
  if (hour !== 9) {
    console.log(`当前时间 ${hour}:${minute}，不在执行时间范围内`);
    return false;
  }
  
  // 避免重复执行（每分钟只执行一次）
  if (minute > 0) {
    console.log(`当前时间 ${hour}:${minute}，跳过执行`);
    return false;
  }
  
  return true;
}

// 生成今天的日期
function getTodayDate(): string {
  return new Date().toISOString().slice(0, 10);
}

// 调用AI Daily新闻头条生成服务
async function generateAIDailyData(date: string): Promise<any> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/ai-daily-generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.CRON_SECRET || 'cron-secret'}`
      },
      body: JSON.stringify({ date, force: false })
    });
    
    if (!response.ok) {
      throw new Error(`AI Daily新闻头条生成服务返回错误: ${response.status}`);
    }
    
    const result = await response.json();
    return result;
    
  } catch (error) {
    console.error('调用AI Daily新闻头条生成服务失败:', error);
    throw error;
  }
}

// 发送通知（可选）
async function sendNotification(message: string): Promise<void> {
  try {
    // 这里可以集成各种通知服务
    // 如：Slack、Discord、邮件、钉钉等
    
    console.log('发送通知:', message);
    
    // 示例：发送到Slack
    if (process.env.SLACK_WEBHOOK_URL) {
      await fetch(process.env.SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `🤖 AI Daily 定时任务: ${message}`,
          attachments: [{
            color: 'good',
            fields: [
              { title: '执行时间', value: new Date().toLocaleString('zh-CN') },
              { title: '状态', value: '成功' }
            ]
          }]
        })
      });
    }
    
  } catch (error) {
    console.error('发送通知失败:', error);
  }
}

export async function GET(request: Request) {
  try {
    // 验证请求
    if (!validateCronSecret(request)) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      );
    }
    
    // 检查执行时间
    if (!shouldExecuteCron()) {
      return NextResponse.json({
        success: false,
        message: '不在执行时间范围内',
        currentTime: new Date().toLocaleString('zh-CN'),
        nextExecution: '明天 9:00'
      });
    }
    
    const today = getTodayDate();
    console.log(`开始执行AI Daily定时任务，日期: ${today}`);
    
    // 生成AI Daily数据
    const result = await generateAIDailyData(today);
    
    if (result.success) {
              // 发送成功通知
        await sendNotification(`成功生成 ${today} 的AI Daily新闻头条，共 ${result.data.items.length} 条新闻`);
      
      return NextResponse.json({
        success: true,
        message: 'AI Daily新闻头条定时任务执行成功',
        date: today,
        data: result.data,
        executedAt: new Date().toISOString()
      });
    } else {
      throw new Error(result.error || '生成数据失败');
    }
    
  } catch (error) {
    console.error('AI Daily新闻头条定时任务执行失败:', error);
    
    // 发送失败通知
    await sendNotification(`AI Daily新闻头条定时任务执行失败: ${error instanceof Error ? error.message : '未知错误'}`);
    
    return NextResponse.json(
      {
        success: false,
        error: '新闻头条定时任务执行失败',
        details: error instanceof Error ? error.message : '未知错误',
        executedAt: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// 手动触发定时任务（用于测试）
export async function POST(request: Request) {
  try {
    // 验证请求
    if (!validateCronSecret(request)) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      );
    }
    
    const { force = false } = await request.json();
    
    if (!force) {
      return NextResponse.json(
        { error: '需要设置 force=true 来手动触发' },
        { status: 400 }
      );
    }
    
    const today = getTodayDate();
    console.log(`手动触发AI Daily定时任务，日期: ${today}`);
    
    // 生成AI Daily数据
    const result = await generateAIDailyData(today);
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: '手动触发AI Daily定时任务成功',
        date: today,
        data: result.data,
        executedAt: new Date().toISOString()
      });
    } else {
      throw new Error(result.error || '生成数据失败');
    }
    
  } catch (error) {
    console.error('手动触发AI Daily定时任务失败:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: '手动触发失败',
        details: error instanceof Error ? error.message : '未知错误',
        executedAt: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
