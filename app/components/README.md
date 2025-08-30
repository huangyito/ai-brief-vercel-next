# ModelIcon 组件

这是一个智能匹配模型图标的 React 组件，使用 LobeHub 图标库来自动为不同的 AI 模型匹配最合适的图标。

## 功能特性

- 🎯 **智能匹配**: 根据模型名称自动匹配最合适的图标
- 🔍 **模糊匹配**: 支持部分名称匹配，如 "gpt-4" 会匹配到 OpenAI 图标
- 🎨 **多种尺寸**: 支持自定义图标尺寸
- 🏷️ **CSS 类名**: 支持自定义 CSS 类名
- 🛡️ **类型安全**: 完整的 TypeScript 类型支持

## 支持的模型类型

### OpenAI 系列
- GPT-4, GPT-4o, GPT-4 Turbo
- GPT-3.5 Turbo, GPT-3.5
- 匹配图标: OpenAI

### Claude 系列
- Claude 3.5 Sonnet, Claude 3.5 Haiku
- Claude 3 Opus, Claude 3 Sonnet
- 匹配图标: Anthropic

### Gemini 系列
- Gemini Pro, Gemini Flash, Gemini Ultra
- 匹配图标: Google

### 其他模型
- Llama 系列 → Meta 图标
- Mistral 系列 → Mistral 图标
- Qwen 系列 → Alibaba 图标
- Baichuan 系列 → Baichuan 图标
- ChatGLM 系列 → Zhipu 图标
- Spark 系列 → Spark 图标

## 使用方法

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

### 在列表中使用

```tsx
const models = ['gpt-4', 'claude-3.5', 'gemini-pro'];

{models.map(model => (
  <div key={model} className="flex items-center space-x-2">
    <ModelIcon model={model} size={20} />
    <span>{model}</span>
  </div>
))}
```

### 在卡片中使用

```tsx
<div className="model-card">
  <div className="flex items-center space-x-3">
    <ModelIcon model="gpt-4" size={32} />
    <div>
      <h3 className="font-semibold">GPT-4</h3>
      <p className="text-sm text-gray-600">OpenAI 最新模型</p>
    </div>
  </div>
</div>
```

## 组件属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `model` | `string` | 必需 | 模型名称，用于匹配图标 |
| `size` | `number` | `24` | 图标尺寸（像素） |
| `className` | `string` | `''` | 自定义 CSS 类名 |

## 智能匹配逻辑

1. **精确匹配**: 首先尝试在预定义映射表中精确匹配
2. **关键词匹配**: 如果精确匹配失败，使用关键词进行模糊匹配
3. **默认图标**: 如果都不匹配，返回 Bot 图标作为默认值

## 注意事项

- 确保项目中已安装 `@lobehub/icons` 依赖
- 模型名称匹配不区分大小写
- 如果找不到对应的图标组件，会在控制台输出警告并使用默认图标

## 扩展支持

如需支持新的模型类型，可以在 `modelIconMap` 中添加新的映射规则：

```tsx
const modelIconMap: Record<string, keyof typeof Icons> = {
  // 现有映射...
  'new-model': 'NewIcon',
};
```

## 示例组件

项目包含了一个完整的示例组件 `ModelIconExample.tsx`，展示了各种使用场景和不同尺寸的图标效果。
