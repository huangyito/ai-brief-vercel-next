// 主题颜色配置
export const themeColors = {
  light: {
    // 背景色系
    background: {
      primary: '#f9fafb',      // 页面主背景
      secondary: '#ffffff',    // 卡片背景
      tertiary: '#f8fafc',    // 悬停背景
      placeholder: '#f3f4f6', // 图片占位符背景
      search: '#ffffff',      // 搜索框背景
      searchHover: '#f9fafb', // 搜索框悬停背景
    },
    
    // 边框色系
    border: {
      primary: '#e5e7eb',     // 主要边框
      secondary: '#d1d5db',   // 次要边框
      hover: '#d1d5db',       // 悬停边框
      focus: '#5aa9ff',       // 焦点边框
    },
    
    // 文字色系
    text: {
      primary: '#111827',     // 主要标题
      secondary: '#374151',   // 次要标题
      body: '#4b5563',        // 正文内容
      caption: '#6b7280',     // 说明文字
      placeholder: '#9ca3af', // 占位符文字
      muted: '#9ca3af',       // 静默文字
    },
    
    // 标签色系
    tag: {
      background: '#f3f4f6',  // 标签背景
      text: '#374151',        // 标签文字
    },
    
    // 交互色系
    interactive: {
      primary: '#5aa9ff',     // 主要交互色（品牌色）
      hover: '#f3f4f6',       // 悬停背景
    }
  },
  
  dark: {
    // 背景色系
    background: {
      primary: '#1c1c1e',     // 页面主背景 (macOS)
      secondary: '#2c2c2e',   // 卡片背景 (macOS)
      tertiary: '#2c2c2e',    // 悬停背景 (macOS)
      placeholder: '#3a3a3c', // 图片占位符背景 (macOS)
      search: '#1c1c1e',      // 搜索框背景 (macOS)
      searchHover: '#2c2c2e', // 搜索框悬停背景 (macOS)
    },
    
    // 边框色系
    border: {
      primary: '#38383a',     // 主要边框 (macOS)
      secondary: '#48484a',   // 次要边框 (macOS)
      hover: '#48484a',       // 悬停边框 (macOS)
      focus: '#5aa9ff',       // 焦点边框（品牌色）
    },
    
    // 文字色系
    text: {
      primary: '#ffffff',     // 主要标题 (macOS)
      secondary: '#ffffff',   // 次要标题 (macOS)
      body: '#8e8e93',        // 正文内容 (macOS)
      caption: '#8e8e93',     // 说明文字 (macOS)
      placeholder: '#8e8e93', // 占位符文字 (macOS)
      muted: '#8e8e93',       // 静默文字 (macOS)
    },
    
    // 标签色系
    tag: {
      background: '#3a3a3c',  // 标签背景 (macOS)
      text: '#ffffff',        // 标签文字 (macOS)
    },
    
    // 交互色系
    interactive: {
      primary: '#5aa9ff',     // 主要交互色（品牌色）
      hover: '#2c2c2e',       // 悬停背景 (macOS)
    }
  }
};

// 获取主题颜色的辅助函数
export const getThemeColor = (isLightTheme: boolean, colorPath: string) => {
  const theme = isLightTheme ? themeColors.light : themeColors.dark;
  const path = colorPath.split('.');
  let result: any = theme;
  
  for (const key of path) {
    if (result && typeof result === 'object' && key in result) {
      result = result[key];
    } else {
      console.warn(`Color path "${colorPath}" not found in theme`);
      return '#000000'; // 默认黑色
    }
  }
  
  return result;
};

// 常用的颜色快捷方式
export const getColor = {
  // 背景色
  bg: (isLight: boolean) => getThemeColor(isLight, 'background.primary'),
  bgCard: (isLight: boolean) => getThemeColor(isLight, 'background.secondary'),
  bgHover: (isLight: boolean) => getThemeColor(isLight, 'background.tertiary'),
  bgPlaceholder: (isLight: boolean) => getThemeColor(isLight, 'background.placeholder'),
  bgSearch: (isLight: boolean) => getThemeColor(isLight, 'background.search'),
  
  // 边框色
  border: (isLight: boolean) => getThemeColor(isLight, 'border.primary'),
  borderHover: (isLight: boolean) => getThemeColor(isLight, 'border.hover'),
  borderFocus: () => getThemeColor(true, 'border.focus'), // 品牌色，不随主题变化
  
  // 文字色
  text: (isLight: boolean) => getThemeColor(isLight, 'text.primary'),
  textSecondary: (isLight: boolean) => getThemeColor(isLight, 'text.secondary'),
  textBody: (isLight: boolean) => getThemeColor(isLight, 'text.body'),
  textCaption: (isLight: boolean) => getThemeColor(isLight, 'text.caption'),
  textMuted: (isLight: boolean) => getThemeColor(isLight, 'text.muted'),
  
  // 标签色
  tagBg: (isLight: boolean) => getThemeColor(isLight, 'tag.background'),
  tagText: (isLight: boolean) => getThemeColor(isLight, 'tag.text'),
  
  // 交互色
  primary: () => getThemeColor(true, 'interactive.primary'), // 品牌色，不随主题变化
  hover: (isLight: boolean) => getThemeColor(isLight, 'interactive.hover'),
};
