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
    
    canvas.width = 800;
    canvas.height = 1200;
    
    // 设置主题颜色
    const colors = themeLight ? {
      bg: '#f7f9fc',
      text: '#0f1624',
      muted: '#5b6780',
      brand: '#2667ff',
      card: '#ffffff'
    } : {
      bg: '#0b0f16',
      text: '#e6ecff',
      muted: '#9fb0cf',
      brand: '#5aa9ff',
      card: '#0f1624'
    };
    
    // 加载背景图片
    const bgImage = new Image();
    bgImage.crossOrigin = 'anonymous';
    bgImage.src = '/photo/Background.webp';
    
    bgImage.onload = () => {
      // 绘制背景图片（包含标题、二维码、版权信息等）
      ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
      
      // 绘制日期
      ctx.font = 'bold 32px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = colors.muted;
      const date = brief?.date || new Date().toISOString();
      ctx.fillText(formatDate(date), canvas.width / 2, 130);
      
      // 绘制要点
      ctx.font = 'bold 36px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = colors.text;
      ctx.fillText('今日要点', canvas.width / 2, 200);
      
      ctx.font = '28px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = colors.muted;
      const headline = brief?.headline || '今日要点';
      const maxWidth = canvas.width - 80;
      if (ctx.measureText(headline).width > maxWidth) {
        const words = headline.split('');
        let line = '';
        let y = 250;
        for (let char of words) {
          if (ctx.measureText(line + char).width > maxWidth) {
            ctx.fillText(line, canvas.width / 2, y);
            line = char;
            y += 40;
          } else {
            line += char;
          }
        }
        if (line) ctx.fillText(line, canvas.width / 2, y);
      } else {
        ctx.fillText(headline, canvas.width / 2, 250);
      }
      
      // 绘制统计信息
      ctx.font = 'bold 32px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = colors.text;
      ctx.fillText('今日统计', canvas.width / 2, 350);
      
      ctx.font = '24px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = colors.muted;
      const statsText = `条目: ${brief?.items.length || 0} | 新发布: ${counts?.new || 0} | 更新: ${counts?.update || 0}`;
      ctx.fillText(statsText, canvas.width / 2, 380);
      
      // 绘制项目列表（最多6条，每条之间有分割线）
      let yPos = 450;
      const maxItems = Math.min(6, brief?.items.length || 0);
      
      for (let i = 0; i < maxItems; i++) {
        const item = brief.items[i];
        
        // 绘制产品名称和类型
        ctx.font = 'bold 24px system-ui, -apple-system, sans-serif';
        ctx.fillStyle = colors.brand;
        ctx.textAlign = 'left';
        ctx.fillText(`${item.product} [${item.type.toUpperCase()}]`, 60, yPos);
        
        // 绘制项目描述
        ctx.font = '20px system-ui, -apple-system, sans-serif';
        ctx.fillStyle = colors.text;
        const maxDescWidth = canvas.width - 120;
        let desc = item.summary;
        if (ctx.measureText(desc).width > maxDescWidth) {
          desc = desc.substring(0, 50) + '...';
        }
        ctx.fillText(desc, 60, yPos + 30);
        
        // 绘制分割线（除了最后一条）
        if (i < maxItems - 1) {
          ctx.strokeStyle = colors.muted;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(60, yPos + 50);
          ctx.lineTo(canvas.width - 60, yPos + 50);
          ctx.stroke();
        }
        
        yPos += 80;
      }
      
      // 导出图片
      const filename = `AI-brief-${brief?.date?.replace(/-/g,'') || 'preview'}.png`;
      const imageData = canvas.toDataURL('image/png');
      onDownload?.(filename);
      
      // 自动下载
      const link = document.createElement('a');
      link.download = filename;
      link.href = imageData;
      link.click();
    };
    
    bgImage.onerror = () => {
      // 如果背景图片加载失败，使用纯色背景
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      console.warn('背景图片加载失败，使用纯色背景');
    };
    
  } catch (error) {
    console.error('生成图片失败:', error);
    throw new Error('生成图片失败，请稍后重试');
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
