// 图片生成工具
export interface ImageGeneratorOptions {
  themeLight?: boolean;
  brief?: any;
  counts?: any;
  onDownload?: (filename: string) => void;
}

export const generateAIBriefImage = (options: ImageGeneratorOptions) => {
  const { themeLight = false, brief, counts, onDownload } = options;
  
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // 使用背景图片的尺寸：1080x1920 竖屏
    canvas.width = 1080;
    canvas.height = 1920;
    
    // 只使用浅色主题，参考第一张图的颜色
    const colors = {
      bg: '#f7f9fc',      // 浅蓝灰色背景
      text: '#0f1624',    // 深色文字
      muted: '#5b6780',   // 灰色次要文字
      brand: '#2667ff',   // 蓝色品牌色
      card: '#ffffff',    // 白色卡片背景
      border: '#e1e5e9'   // 浅灰色边框
    };
    
    // 加载背景图片（包含标题、二维码、版权信息等）
    const bgImage = new Image();
    bgImage.crossOrigin = 'anonymous';
    
    // 确保图片路径在所有环境下都正确
    const imagePath = '/photo/Background.webp';
    console.log('尝试加载背景图片:', imagePath);
    console.log('当前域名:', window.location.origin);
    console.log('完整图片URL:', window.location.origin + imagePath);
    
    // 设置图片加载超时（10秒）
    const imageLoadTimeout = setTimeout(() => {
      console.error('图片加载超时，使用纯色背景');
      bgImage.onerror = null; // 清除错误处理
      drawContentOnPlainBackground(ctx, colors, brief, counts, canvas.width, canvas.height);
      
      const filename = `AI-brief-${brief?.date?.replace(/-/g,'') || 'preview'}.png`;
      const imageData = canvas.toDataURL('image/png');
      onDownload?.(filename);
      
      const link = document.createElement('a');
      link.download = filename;
      link.href = imageData;
      link.click();
    }, 10000);
    
    bgImage.src = imagePath;
    
    bgImage.onload = () => {
      console.log('背景图片加载成功，开始绘制...');
      clearTimeout(imageLoadTimeout); // 清除超时定时器
      
      // 绘制背景图片
      ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
      
      // 在背景图片上添加日期
      ctx.font = '30px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = '#5B6780';
      ctx.textAlign = 'center';
      const date = brief?.date || new Date().toISOString();
      ctx.fillText(formatDate(date), canvas.width / 2, 172);
      
      // 直接在背景图片上绘制内容
      ctx.textAlign = 'left';
      
      // 绘制项目列表
      const maxItems = Math.min(8, brief?.items.length || 0);
      
      // 添加调试信息
      console.log('开始绘制产品列表，项目数量:', maxItems);
      
      for (let i = 0; i < maxItems; i++) {
        const item = brief.items[i];
        
        // 计算每个内容块的起始位置
        const contentStartY = 320 + i * 200; // 每个内容块间隔200px
        const labelY = contentStartY;
        const descY = contentStartY + 50;
        
        // 产品名称
        ctx.font = '400 36px system-ui, -apple-system, sans-serif';
        ctx.fillStyle = '#000000';
        ctx.fillText(item.product, 120, labelY);
        
        // 状态标签 [NEW], [UPDATE] 等
        const labelText = `[${item.type.toUpperCase()}]`;
        const labelWidth = ctx.measureText(labelText).width;
        ctx.font = '200 30px system-ui, -apple-system, sans-serif';
        ctx.fillStyle = '#8E99AF';
        ctx.fillText(labelText, 120 + ctx.measureText(item.product).width + 10, labelY);
        
        // 项目描述
        ctx.font = '200 30px system-ui, -apple-system, sans-serif';
        ctx.fillStyle = '#000000';
        const maxDescWidth = canvas.width - 240; // 左右各120px边距
        let desc = item.summary;
        
        // 文本换行处理
        if (ctx.measureText(desc).width > maxDescWidth) {
          const words = desc.split('');
          let line = '';
          let currentY = descY;
          
          for (let char of words) {
            if (ctx.measureText(line + char).width > maxDescWidth) {
              ctx.fillText(line, 120, currentY);
              line = char;
              currentY += 45;
            } else {
              line += char;
            }
          }
          if (line) {
            ctx.fillText(line, 120, currentY);
          }
        } else {
          ctx.fillText(desc, 120, descY);
        }
        
        // 绘制分割线（除了最后一条）
        if (i < maxItems - 1) {
          const dividerY = contentStartY + 140; // 分割线在内容块下方140px
          ctx.strokeStyle = '#CCCCCC';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(120, dividerY);
          ctx.lineTo(canvas.width - 120, dividerY);
          ctx.stroke();
        }
      }
      
      // 导出图片
      const filename = `AI-brief-${brief?.date?.replace(/-/g,'') || 'preview'}.png`;
      console.log('开始导出图片:', filename);
      const imageData = canvas.toDataURL('image/png');
      onDownload?.(filename);
      
      // 自动下载
      const link = document.createElement('a');
      link.download = filename;
      link.href = imageData;
      link.click();
      console.log('图片导出完成');
    };
    
    bgImage.onerror = (error) => {
      console.error('背景图片加载失败:', error);
      console.error('图片路径:', imagePath);
      console.error('当前域名:', window.location.origin);
      console.error('完整URL:', window.location.origin + imagePath);
      
      // 如果背景图片加载失败，使用纯色背景
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // 在纯色背景上绘制内容
      drawContentOnPlainBackground(ctx, colors, brief, counts, canvas.width, canvas.height);
      
      // 导出纯色背景的图片
      const filename = `AI-brief-${brief?.date?.replace(/-/g,'') || 'preview'}.png`;
      console.log('导出纯色背景图片:', filename);
      const imageData = canvas.toDataURL('image/png');
      onDownload?.(filename);
      
      const link = document.createElement('a');
      link.download = filename;
      link.href = imageData;
      link.click();
      console.log('纯色背景图片导出完成');
    };
    
  } catch (error) {
    console.error('生成图片失败:', error);
    throw new Error('生成图片失败，请稍后重试');
  }
};

// 在纯色背景上绘制内容的备用函数
const drawContentOnPlainBackground = (ctx: CanvasRenderingContext2D, colors: any, brief: any, counts: any, width: number, height: number) => {
  // 绘制标题
  ctx.fillStyle = colors.text;
  ctx.textAlign = 'center';
  ctx.font = '48px system-ui, -apple-system, sans-serif';
  ctx.fillText('AI 产品每日简报', width / 2, 120);
  
  // 绘制日期
  ctx.font = '30px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = '#5B6780';
  const date = brief?.date || new Date().toISOString();
  ctx.fillText(formatDate(date), width / 2, 172);
  
  // 直接在背景上绘制内容
  ctx.textAlign = 'left';
  
  // 绘制项目列表
  const maxItems = Math.min(8, brief?.items.length || 0);
  
  for (let i = 0; i < maxItems; i++) {
    const item = brief.items[i];
    
    // 计算每个内容块的起始位置
    const contentStartY = 320 + i * 200; // 每个内容块间隔200px
    const labelY = contentStartY;
    const descY = contentStartY + 50;
    
    // 产品名称
    ctx.font = '400 36px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#000000';
    ctx.fillText(item.product, 120, labelY);
    
    // 状态标签 [NEW], [UPDATE] 等
    const labelText = `[${item.type.toUpperCase()}]`;
    const labelWidth = ctx.measureText(labelText).width;
    ctx.font = '200 30px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#8E99AF';
    ctx.fillText(labelText, 120 + ctx.measureText(item.product).width + 10, labelY);
    
    // 项目描述
    ctx.font = '200 30px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#000000';
    const maxDescWidth = width - 240; // 左右各120px边距
    let desc = item.summary;
    
    // 文本换行处理
    if (ctx.measureText(desc).width > maxDescWidth) {
      const words = desc.split('');
      let line = '';
      let currentY = descY;
      
      for (let char of words) {
        if (ctx.measureText(line + char).width > maxDescWidth) {
          ctx.fillText(line, 120, currentY);
          line = char;
          currentY += 45;
        } else {
          line += char;
        }
      }
      if (line) {
        ctx.fillText(line, 120, currentY);
      }
    } else {
      ctx.fillText(desc, 120, descY);
    }
    
    // 绘制分割线（除了最后一条）
    if (i < maxItems - 1) {
      const dividerY = contentStartY + 140; // 分割线在内容块下方140px
      ctx.strokeStyle = '#CCCCCC';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(120, dividerY);
      ctx.lineTo(width - 120, dividerY);
      ctx.stroke();
    }
  }
};

// 日期格式化函数
const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const weekday = weekdays[date.getDay()];
    
    return `${year}年${month}月${day}日 (${weekday})`;
  } catch (error) {
    return '日期格式错误';
  }
};
