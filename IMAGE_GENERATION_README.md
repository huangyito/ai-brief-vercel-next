# 图片生成功能说明

## 背景图片配置

### 文件位置
背景图片 `Background.webp` 应放置在以下位置：
```
public/photo/Background.webp
```

### 访问路径
在代码中，背景图片通过以下路径访问：
```typescript
const imagePath = '/photo/Background.webp';
```

### Next.js 静态文件服务
- Next.js 会自动将 `public/` 目录下的文件映射到根路径
- 例如：`public/photo/Background.webp` → `/photo/Background.webp`

## 部署注意事项

### 1. 本地开发
- 确保 `public/photo/Background.webp` 文件存在
- 图片路径 `/photo/Background.webp` 会自动解析

### 2. GitHub 部署
- 将整个项目（包括 `public/photo/` 目录）推送到 GitHub
- 确保 `.gitignore` 没有排除 `public/photo/` 目录

### 3. Vercel 部署
- Vercel 会自动识别 `public/` 目录
- 图片路径保持不变：`/photo/Background.webp`

### 4. 其他环境
- 确保静态文件服务正确配置
- 图片路径应该指向 `public/photo/Background.webp`

## 错误处理

### 图片加载失败时的备用方案
如果背景图片加载失败，系统会自动：
1. 使用浅色背景色
2. 绘制完整的标题和内容
3. 生成纯色背景的图片

### 调试信息
控制台会显示详细的调试信息：
- 图片加载状态
- 当前域名和完整URL
- 错误详情

## 图片规格

### 尺寸
- 宽度：1080px
- 高度：1920px
- 格式：PNG
- 方向：竖屏（Portrait）

### 内容布局
1. 背景图片（包含标题、二维码、版权信息）
2. 日期显示（叠加在背景上）
3. 产品信息列表（直接在背景上显示，最多8项）
4. 分割线（项目之间的分隔）

## 技术实现

### Canvas API
- 使用 HTML5 Canvas 进行图片生成
- 支持文本换行和自动布局
- 兼容所有现代浏览器

### 图片加载
- 异步加载背景图片
- 10秒超时保护
- 错误处理和备用方案

## 故障排除

### 常见问题

#### 1. 背景图片不显示
- 检查 `public/photo/Background.webp` 文件是否存在
- 确认文件权限正确
- 查看控制台错误信息

#### 2. 图片生成失败
- 检查浏览器控制台错误
- 确认 Canvas API 支持
- 验证数据格式正确

#### 3. 部署后不工作
- 确认 `public/photo/` 目录已上传
- 检查静态文件服务配置
- 验证域名和路径设置

### 调试步骤
1. 打开浏览器开发者工具
2. 查看 Console 标签
3. 点击"导出为图片"按钮
4. 观察控制台输出信息
5. 检查 Network 标签中的图片请求

## 更新日志

- 2024-08-15: 初始版本，支持背景图片和产品信息卡片
- 2024-08-15: 添加错误处理和超时保护
- 2024-08-15: 优化图片路径配置和部署说明
