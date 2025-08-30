# ModelIcon 组件使用说明

## 概述

本项目提供了两个版本的智能模型图标匹配组件：

1. **ModelIcon** - 基础版本，简单易用
2. **ModelIconAdvanced** - 高级版本，功能丰富

两个组件都使用 LobeHub 图标库，能够根据 AI 模型名称自动匹配最合适的图标。

## 基础版本 - ModelIcon

### 基本用法

```tsx
import ModelIcon from './components/ModelIcon';

// 简单使用
<ModelIcon model="gpt-4" />

// 自定义尺寸
<ModelIcon model="claude-3.5" size={32} />

// 自定义样式
<ModelIcon model="gemini-pro" size={24} className="text-blue-500" />
```

### 属性说明

- `model` (必需): 模型名称
- `size` (可选): 图标尺寸，默认 24px
- `className` (可选): 自定义 CSS 类名

## 高级版本 - ModelIconAdvanced

### 基本用法

```tsx
import ModelIconAdvanced from './components/ModelIconAdvanced';

// 基础使用
<ModelIconAdvanced model="gpt-4" />

// 带工具提示
<ModelIconAdvanced 
  model="claude-3.5" 
  size={32} 
  showTooltip={true} 
  tooltipPosition="top"
/>

// 自定义回退图标
<ModelIconAdvanced 
  model="unknown-model" 
  fallbackIcon="Robot" 
  size={24}
/>
```

### 属性说明

- `model` (必需): 模型名称
- `size` (可选): 图标尺寸，默认 24px
- `className` (可选): 自定义 CSS 类名
- `fallbackIcon` (可选): 回退图标，默认 'Bot'
- `showTooltip` (可选): 是否显示工具提示，默认 false
- `tooltipPosition` (可选): 工具提示位置，可选 'top'|'bottom'|'left'|'right'，默认 'top'

## 支持的模型类型

### OpenAI 系列
- GPT-4, GPT-4o, GPT-4 Turbo, GPT-4 Vision
- GPT-3.5 Turbo, GPT-3.5
- DALL-E, Whisper
- 匹配图标: OpenAI

### Claude 系列
- Claude 3.5 Sonnet, Claude 3.5 Haiku
- Claude 3 Opus, Claude 3 Sonnet
- Claude 2, Claude Instant
- 匹配图标: Anthropic

### Gemini 系列
- Gemini Pro, Gemini Flash, Gemini Ultra, Gemini Nano
- PaLM, Codey
- 匹配图标: Google

### Meta 系列
- Llama 2, Llama 3, Code Llama, Llama Guard
- 匹配图标: Meta

### Mistral 系列
- Mistral Large, Mistral Medium, Mistral Small
- Mixtral
- 匹配图标: Mistral

### 国内模型
- Qwen 系列 → Alibaba 图标
- Baichuan 系列 → Baichuan 图标
- ChatGLM 系列 → Zhipu 图标
- Spark 系列 → Spark 图标

### 其他知名模型
- Cohere 系列 → Cohere 图标
- Stability AI 系列 → Stability 图标
- Hugging Face 系列 → HuggingFace 图标

## 使用场景示例

### 1. 模型列表展示

```tsx
const models = ['gpt-4', 'claude-3.5', 'gemini-pro'];

{models.map(model => (
  <div key={model} className="flex items-center space-x-2 p-2 border rounded">
    <ModelIcon model={model} size={20} />
    <span className="font-medium">{model}</span>
  </div>
))}
```

### 2. 模型卡片

```tsx
<div className="model-card p-4 border rounded-lg shadow-sm">
  <div className="flex items-center space-x-3">
    <ModelIconAdvanced 
      model="gpt-4" 
      size={32} 
      showTooltip={true}
    />
    <div>
      <h3 className="font-semibold text-lg">GPT-4</h3>
      <p className="text-sm text-gray-600">OpenAI 最新大语言模型</p>
    </div>
  </div>
</div>
```

### 3. 模型选择器

```tsx
const [selectedModel, setSelectedModel] = useState('gpt-4');

<div className="model-selector">
  <label className="block text-sm font-medium mb-2">选择模型</label>
  <div className="grid grid-cols-3 gap-2">
    {['gpt-4', 'claude-3.5', 'gemini-pro'].map(model => (
      <button
        key={model}
        onClick={() => setSelectedModel(model)}
        className={`p-3 border rounded-lg flex flex-col items-center ${
          selectedModel === model ? 'border-blue-500 bg-blue-50' : ''
        }`}
      >
        <ModelIcon model={model} size={24} />
        <span className="text-xs mt-1">{model}</span>
      </button>
    ))}
  </div>
</div>
```

### 4. 带工具提示的图标

```tsx
// 显示模型信息和匹配的图标名称
<ModelIconAdvanced 
  model="claude-3.5-sonnet" 
  size={40} 
  showTooltip={true}
  tooltipPosition="right"
/>
```

## 性能优化

### 使用 useMemo 优化

```tsx
import { useMemo } from 'react';

const MyComponent = ({ model }) => {
  const icon = useMemo(() => (
    <ModelIcon model={model} size={24} />
  ), [model]);

  return <div>{icon}</div>;
};
```

### 批量渲染优化

```tsx
// 对于大量图标，使用虚拟滚动或分页
const ModelIconList = ({ models }) => {
  return (
    <div className="grid grid-cols-4 gap-2">
      {models.map(model => (
        <ModelIcon key={model} model={model} size={20} />
      ))}
    </div>
  );
};
```

## 错误处理

组件内置了错误处理机制：

1. **图标未找到**: 自动使用回退图标，并在控制台输出警告
2. **类型错误**: 提供完整的 TypeScript 类型支持
3. **回退机制**: 支持自定义回退图标

## 扩展支持

### 添加新模型支持

```tsx
// 在 modelIconMap 中添加新映射
const modelIconMap = {
  // 现有映射...
  'new-model': 'NewIcon',
  'another-model': 'AnotherIcon',
};
```

### 自定义匹配逻辑

```tsx
// 可以重写 getIconForModel 函数
const customGetIconForModel = (model: string) => {
  // 自定义匹配逻辑
  if (model.includes('custom')) {
    return 'CustomIcon';
  }
  // 调用默认逻辑
  return getIconForModel(model);
};
```

## 注意事项

1. **依赖要求**: 确保项目已安装 `@lobehub/icons`
2. **类型安全**: 使用 TypeScript 获得完整的类型支持
3. **性能考虑**: 对于频繁更新的模型名称，考虑使用 useMemo 优化
4. **图标可用性**: 某些图标可能在新版本中不可用，建议测试

## 故障排除

### 常见问题

1. **图标不显示**: 检查模型名称是否正确，查看控制台警告
2. **类型错误**: 确保使用正确的 TypeScript 类型
3. **样式问题**: 检查 className 和 CSS 样式

### 调试技巧

```tsx
// 启用工具提示查看匹配结果
<ModelIconAdvanced 
  model="your-model" 
  showTooltip={true}
/>

// 查看控制台警告信息
// 组件会在找不到图标时输出警告
```
