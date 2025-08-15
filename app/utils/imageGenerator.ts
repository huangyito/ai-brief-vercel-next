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
    
    // 使用背景图片的尺寸：1920x1080 竖屏
    canvas.width = 1920;
    canvas.height = 1080;
    
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
      ctx.font = '36px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = colors.muted;
      ctx.textAlign = 'center';
      const date = brief?.date || new Date().toISOString();
      ctx.fillText(formatDate(date), canvas.width / 2, 240);
      
      // 绘制主要内容卡片（白色圆角矩形）
      const cardX = 160;
      const cardY = 300;
      const cardWidth = canvas.width - 320;
      const cardHeight = 600;
      
      // 绘制白色卡片背景（圆角矩形）
      ctx.fillStyle = colors.card;
      ctx.beginPath();
      ctx.moveTo(cardX + 20, cardY);
      ctx.lineTo(cardX + cardWidth - 20, cardY);
      ctx.quadraticCurveTo(cardX + cardWidth, cardY, cardX + cardWidth, cardY + 20);
      ctx.lineTo(cardX + cardWidth, cardY + cardHeight - 20);
      ctx.quadraticCurveTo(cardX + cardWidth, cardY + cardHeight, cardX + cardWidth - 20, cardY + cardHeight);
      ctx.lineTo(cardX + 20, cardY + cardHeight);
      ctx.quadraticCurveTo(cardX, cardY + cardHeight, cardX, cardY + cardHeight - 20);
      ctx.lineTo(cardX, cardY + 20);
      ctx.quadraticCurveTo(cardX, cardY, cardX + 20, cardY);
      ctx.closePath();
      ctx.fill();
      
      // 绘制卡片边框
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // 在卡片内绘制内容
      ctx.textAlign = 'left';
      let yPos = cardY + 80;
      
      // 绘制项目列表
      const maxItems = Math.min(6, brief?.items.length || 0);
      
      for (let i = 0; i < maxItems; i++) {
        const item = brief.items[i];
        
        // 产品名称和类型标签
        ctx.font = 'bold 42px system-ui, -apple-system, sans-serif';
        ctx.fillStyle = colors.brand;
        ctx.fillText(`${item.product} [${item.type.toUpperCase()}]`, cardX + 60, yPos);
        
        // 项目描述
        ctx.font = '32px system-ui, -apple-system, sans-serif';
        ctx.fillStyle = colors.text;
        const maxDescWidth = cardWidth - 120;
        let desc = item.summary;
        
        // 文本换行处理
        if (ctx.measureText(desc).width > maxDescWidth) {
          const words = desc.split('');
          let line = '';
          let currentY = yPos + 50;
          
          for (let char of words) {
            if (ctx.measureText(line + char).width > maxDescWidth) {
              ctx.fillText(line, cardX + 60, currentY);
              line = char;
              currentY += 45;
            } else {
              line += char;
            }
          }
          if (line) {
            ctx.fillText(line, cardX + 60, currentY);
            yPos = currentY + 30;
          } else {
            yPos += 50;
          }
        } else {
          ctx.fillText(desc, cardX + 60, yPos + 50);
          yPos += 90;
        }
        
        // 绘制分割线（除了最后一条）
        if (i < maxItems - 1) {
          ctx.strokeStyle = colors.border;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(cardX + 60, yPos + 15);
          ctx.lineTo(cardX + cardWidth - 60, yPos + 15);
          ctx.stroke();
          yPos += 30;
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
  ctx.font = 'bold 72px system-ui, -apple-system, sans-serif';
  ctx.fillText('AI 产品每日简报', width / 2, 180);
  
  // 绘制日期
  ctx.font = '36px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = colors.muted;
  const date = brief?.date || new Date().toISOString();
  ctx.fillText(formatDate(date), width / 2, 240);
  
  // 绘制主要内容卡片
  const cardX = 160;
  const cardY = 300;
  const cardWidth = width - 320;
  const cardHeight = 600;
  
  // 绘制白色卡片背景
  ctx.fillStyle = colors.card;
  ctx.beginPath();
  ctx.moveTo(cardX + 20, cardY);
  ctx.lineTo(cardX + cardWidth - 20, cardY);
  ctx.quadraticCurveTo(cardX + cardWidth, cardY, cardX + cardWidth, cardY + 20);
  ctx.lineTo(cardX + cardWidth, cardY + cardHeight - 20);
  ctx.quadraticCurveTo(cardX + cardWidth, cardY + cardHeight, cardX + cardWidth - 20, cardY + cardHeight);
  ctx.lineTo(cardX + 20, cardY + cardHeight);
  ctx.quadraticCurveTo(cardX, cardY + cardHeight, cardX, cardY + cardHeight - 20);
  ctx.lineTo(cardX, cardY + 20);
  ctx.quadraticCurveTo(cardX, cardY, cardX + 20, cardY);
  ctx.closePath();
  ctx.fill();
  
  // 绘制卡片边框
  ctx.strokeStyle = colors.border;
  ctx.lineWidth = 2;
  ctx.stroke();
  
  // 在卡片内绘制内容
  ctx.textAlign = 'left';
  let yPos = cardY + 80;
  
  // 绘制项目列表
  const maxItems = Math.min(6, brief?.items.length || 0);
  
  for (let i = 0; i < maxItems; i++) {
    const item = brief.items[i];
    
    // 产品名称和类型标签
    ctx.font = 'bold 42px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = colors.brand;
    ctx.fillText(`${item.product} [${item.type.toUpperCase()}]`, cardX + 60, yPos);
    
    // 项目描述
    ctx.font = '32px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = colors.text;
    const maxDescWidth = cardWidth - 120;
    let desc = item.summary;
    
    // 文本换行处理
    if (ctx.measureText(desc).width > maxDescWidth) {
      const words = desc.split('');
      let line = '';
      let currentY = yPos + 50;
      
      for (let char of words) {
        if (ctx.measureText(line + char).width > maxDescWidth) {
          ctx.fillText(line, cardX + 60, currentY);
          line = char;
          currentY += 45;
        } else {
          line += char;
        }
      }
      if (line) {
        ctx.fillText(line, cardX + 60, currentY);
        yPos = currentY + 30;
      } else {
        yPos += 50;
      }
    } else {
      ctx.fillText(desc, cardX + 60, yPos + 50);
      yPos += 90;
    }
    
    // 绘制分割线（除了最后一条）
    if (i < maxItems - 1) {
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cardX + 60, yPos + 15);
      ctx.lineTo(cardX + cardWidth - 60, yPos + 15);
      ctx.stroke();
      yPos += 30;
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
