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
      ctx.font = '28px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = colors.muted;
      ctx.textAlign = 'center';
      const date = brief?.date || new Date().toISOString();
      ctx.fillText(formatDate(date), canvas.width / 2, 180);
      
      // 直接在背景图片上绘制内容
      ctx.textAlign = 'left';
      let yPos = 280; // 从日期下方开始
      
      // 绘制项目列表
      const maxItems = Math.min(8, brief?.items.length || 0);
      
      for (let i = 0; i < maxItems; i++) {
        const item = brief.items[i];
        
        // 产品名称和类型标签
        ctx.font = '32px system-ui, -apple-system, sans-serif';
        ctx.fillStyle = colors.muted;
        ctx.fillText(`${item.product} [${item.type.toUpperCase()}]`, 120, yPos);
        
        // 项目描述
        ctx.font = '24px system-ui, -apple-system, sans-serif';
        ctx.fillStyle = colors.text;
        const maxDescWidth = canvas.width - 240; // 左右各120px边距
        let desc = item.summary;
        
        // 文本换行处理
        if (ctx.measureText(desc).width > maxDescWidth) {
          const words = desc.split('');
          let line = '';
          let currentY = yPos + 40;
          
          for (let char of words) {
            if (ctx.measureText(line + char).width > maxDescWidth) {
              ctx.fillText(line, 120, currentY);
              line = char;
              currentY += 35;
            } else {
              line += char;
            }
          }
          if (line) {
            ctx.fillText(line, 120, currentY);
            yPos = currentY + 25;
          } else {
            yPos += 40;
          }
        } else {
          ctx.fillText(desc, 120, yPos + 40);
          yPos += 70;
        }
        
        // 绘制分割线（除了最后一条）
        if (i < maxItems - 1) {
          ctx.strokeStyle = colors.border;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(120, yPos + 10);
          ctx.lineTo(canvas.width - 120, yPos + 10);
          ctx.stroke();
          yPos += 20;
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
  ctx.font = '28px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = colors.muted;
  const date = brief?.date || new Date().toISOString();
  ctx.fillText(formatDate(date), width / 2, 180);
  
  // 直接在背景上绘制内容
  ctx.textAlign = 'left';
  let yPos = 280; // 从标题和日期下方开始
  
  // 绘制项目列表
  const maxItems = Math.min(8, brief?.items.length || 0);
  
  for (let i = 0; i < maxItems; i++) {
    const item = brief.items[i];
    
    // 产品名称和类型标签
    ctx.font = '32px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = colors.muted;
    ctx.fillText(`${item.product} [${item.type.toUpperCase()}]`, 120, yPos);
    
    // 项目描述
    ctx.font = '24px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = colors.text;
    const maxDescWidth = width - 240; // 左右各120px边距
    let desc = item.summary;
    
    // 文本换行处理
    if (ctx.measureText(desc).width > maxDescWidth) {
      const words = desc.split('');
      let line = '';
      let currentY = yPos + 40;
      
      for (let char of words) {
        if (ctx.measureText(line + char).width > maxDescWidth) {
          ctx.fillText(line, 120, currentY);
          line = char;
          currentY += 35;
        } else {
          line += char;
        }
      }
      if (line) {
        ctx.fillText(line, 120, currentY);
        yPos = currentY + 25;
      } else {
        yPos += 40;
      }
    } else {
      ctx.fillText(desc, 120, yPos + 40);
      yPos += 70;
    }
    
    // 绘制分割线（除了最后一条）
    if (i < maxItems - 1) {
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(120, yPos + 10);
      ctx.lineTo(width - 120, yPos + 10);
      ctx.stroke();
      yPos += 20;
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
