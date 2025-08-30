#!/usr/bin/env node

/**
 * AI Daily 系统测试脚本
 * 用于测试新闻生成、爬虫和API功能
 */

const BASE_URL = 'http://localhost:3000';

// 测试配置
const TEST_CONFIG = {
  timeout: 10000,
  retries: 3
};

// 颜色输出
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// 测试新闻生成API
async function testNewsGeneration() {
  log('\n🧪 测试新闻生成API...', 'blue');
  
  try {
    const response = await fetch(`${BASE_URL}/api/ai-daily-generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        date: new Date().toISOString().slice(0, 10),
        force: false
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.success) {
      log('✅ 新闻生成成功', 'green');
      log(`📰 生成日期: ${data.data.date}`, 'green');
      log(`📊 新闻数量: ${data.data.items.length}`, 'green');
      log(`📝 头条: ${data.data.headline}`, 'green');
      
      // 验证新闻数据结构
      validateNewsStructure(data.data);
      
    } else {
      log('❌ 新闻生成失败', 'red');
      log(`错误: ${data.error}`, 'red');
    }
    
  } catch (error) {
    log('❌ 测试失败', 'red');
    log(`错误: ${error.message}`, 'red');
  }
}

// 测试定时任务API
async function testCronAPI() {
  log('\n⏰ 测试定时任务API...', 'blue');
  
  try {
    const response = await fetch(`${BASE_URL}/api/cron/ai-daily`, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer test-cron-secret'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.success) {
      log('✅ 定时任务执行成功', 'green');
      log(`📅 执行日期: ${data.date}`, 'green');
      log(`📊 数据: ${data.message}`, 'green');
    } else {
      log('⚠️ 定时任务未执行（可能不在执行时间）', 'yellow');
      log(`原因: ${data.message}`, 'yellow');
    }
    
  } catch (error) {
    log('❌ 测试失败', 'red');
    log(`错误: ${error.message}`, 'red');
  }
}

// 测试手动触发
async function testManualTrigger() {
  log('\n🚀 测试手动触发...', 'blue');
  
  try {
    const response = await fetch(`${BASE_URL}/api/cron/ai-daily`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-cron-secret'
      },
      body: JSON.stringify({
        force: true
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.success) {
      log('✅ 手动触发成功', 'green');
      log(`📅 生成日期: ${data.date}`, 'green');
      log(`📊 新闻数量: ${data.data.items.length}`, 'green');
    } else {
      log('❌ 手动触发失败', 'red');
      log(`错误: ${data.error}`, 'red');
    }
    
  } catch (error) {
    log('❌ 测试失败', 'red');
    log(`错误: ${error.message}`, 'red');
  }
}

// 验证新闻数据结构
function validateNewsStructure(data) {
  log('\n🔍 验证新闻数据结构...', 'blue');
  
  const requiredFields = ['date', 'headline', 'summary', 'items'];
  const itemRequiredFields = ['title', 'summary', 'type', 'importance', 'tags', 'sources', 'coverImage', 'time'];
  
  // 检查顶层字段
  for (const field of requiredFields) {
    if (!(field in data)) {
      log(`❌ 缺少顶层字段: ${field}`, 'red');
      return false;
    }
  }
  
  // 检查新闻项
  if (!Array.isArray(data.items) || data.items.length === 0) {
    log('❌ 新闻项数组为空或无效', 'red');
    return false;
  }
  
  // 检查每个新闻项
  data.items.forEach((item, index) => {
    for (const field of itemRequiredFields) {
      if (!(field in item)) {
        log(`❌ 新闻项 ${index + 1} 缺少字段: ${field}`, 'red');
        return false;
      }
    }
    
    // 验证链接
    if (item.sources && item.sources.length > 0) {
      item.sources.forEach((source, sourceIndex) => {
        if (!source.url || !source.url.startsWith('http')) {
          log(`❌ 新闻项 ${index + 1} 来源 ${sourceIndex + 1} URL无效: ${source.url}`, 'red');
        }
      });
    }
    
    // 验证封面图片
    if (item.coverImage && !item.coverImage.startsWith('http')) {
      log(`❌ 新闻项 ${index + 1} 封面图片URL无效: ${item.coverImage}`, 'red');
    }
  });
  
  log('✅ 数据结构验证通过', 'green');
  return true;
}

// 测试新闻链接可访问性
async function testNewsLinks() {
  log('\n🔗 测试新闻链接可访问性...', 'blue');
  
  try {
    const response = await fetch(`${BASE_URL}/api/ai-daily-generate`, {
      method: 'GET'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.success && data.data.items) {
      const links = data.data.items.flatMap(item => 
        item.sources.map(source => source.url)
      );
      
      log(`📊 测试 ${links.length} 个链接...`, 'blue');
      
      for (const link of links) {
        try {
          const linkResponse = await fetch(link, { 
            method: 'HEAD',
            timeout: 5000 
          });
          
          if (linkResponse.ok) {
            log(`✅ ${link}`, 'green');
          } else {
            log(`⚠️ ${link} - HTTP ${linkResponse.status}`, 'yellow');
          }
        } catch (error) {
          log(`❌ ${link} - ${error.message}`, 'red');
        }
      }
    }
    
  } catch (error) {
    log('❌ 链接测试失败', 'red');
    log(`错误: ${error.message}`, 'red');
  }
}

// 测试国内新闻源
async function testChineseNewsSources() {
  log('\n🇨🇳 测试国内新闻源...', 'blue');
  
  try {
    const response = await fetch(`${BASE_URL}/api/ai-daily-generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        date: new Date().toISOString().slice(0, 10),
        force: true,
        preferChinese: true
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.success) {
      log('✅ 国内新闻生成成功', 'green');
      
      // 统计中英文新闻比例
      const chineseNews = data.data.items.filter(item => 
        /[\u4e00-\u9fa5]/.test(item.title)
      );
      const englishNews = data.data.items.filter(item => 
        !/[\u4e00-\u9fa5]/.test(item.title)
      );
      
      log(`📊 中文新闻: ${chineseNews.length} 条`, 'green');
      log(`📊 英文新闻: ${englishNews.length} 条`, 'green');
      log(`📊 中英文比例: ${(chineseNews.length / data.data.items.length * 100).toFixed(1)}% : ${(englishNews.length / data.data.items.length * 100).toFixed(1)}%`, 'green');
      
      // 显示中文新闻标题
      if (chineseNews.length > 0) {
        log('\n📰 中文新闻标题:', 'blue');
        chineseNews.forEach((news, index) => {
          log(`${index + 1}. ${news.title}`, 'cyan');
        });
      }
      
    } else {
      log('❌ 国内新闻生成失败', 'red');
      log(`错误: ${data.error}`, 'red');
    }
    
  } catch (error) {
    log('❌ 测试失败', 'red');
    log(`错误: ${error.message}`, 'red');
  }
}

// 主测试函数
async function runTests() {
  log('🚀 开始AI Daily系统测试', 'blue');
  log(`📍 测试地址: ${BASE_URL}`, 'blue');
  log(`⏰ 开始时间: ${new Date().toLocaleString('zh-CN')}`, 'blue');
  
  try {
    // 测试新闻生成
    await testNewsGeneration();
    
    // 测试定时任务
    await testCronAPI();
    
    // 测试手动触发
    await testManualTrigger();
    
    // 测试链接可访问性
    await testNewsLinks();
    
    // 测试国内新闻源
    await testChineseNewsSources();
    
    log('\n🎉 所有测试完成!', 'green');
    
  } catch (error) {
    log('\n💥 测试过程中发生错误', 'red');
    log(`错误: ${error.message}`, 'red');
  }
}

// 运行测试
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  runTests,
  testNewsGeneration,
  testCronAPI,
  testManualTrigger,
  testNewsLinks,
  testChineseNewsSources
};
