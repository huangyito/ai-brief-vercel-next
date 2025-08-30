'use client';

import React from 'react';
import { 
  Claude, OpenAI, Anthropic, Google, Meta, Microsoft, Alibaba, ByteDance, Spark,
  Qwen, Baichuan, ElevenLabs, Runway, CodeGeeX, LLaVA, ChatGLM, Mistral, Grok,
  Stability, HuggingFace, Figma, Adobe, Aws, Cohere, AiStudio
} from '@lobehub/icons';

interface ColorfulModelIconProps {
  model: string;
  size?: number;
  className?: string;
}

// 模型名称到彩色图标组件的映射
const colorfulIconMap: Record<string, React.ComponentType<any>> = {
  // 主要品牌图标 - 使用彩色版本
  'Claude': Claude,
  'OpenAI': OpenAI,
  'Anthropic': Anthropic,
  'Google': Google,
  'Meta': Meta,
  'Microsoft': Microsoft,
  'Alibaba': Alibaba,
  'ByteDance': ByteDance,
  'Spark': Spark,
  'Qwen': Qwen,
  'Baichuan': Baichuan,
  'ElevenLabs': ElevenLabs,
  'Runway': Runway,
  'CodeGeeX': CodeGeeX,
  'LLaVA': LLaVA,
  'ChatGLM': ChatGLM,
  'Mistral': Mistral,
  'Grok': Grok,
  'Stability': Stability,
  'HuggingFace': HuggingFace,
  'Figma': Figma,
  'Adobe': Adobe,
  'AWS': Aws,
  'IBM': Aws,
  'Oracle': Aws,
  'Cohere': Cohere,
  
  // 默认图标
  'default': AiStudio,
};

const ColorfulModelIcon: React.FC<ColorfulModelIconProps> = ({ 
  model, 
  size = 24, 
  className = '' 
}) => {
  // 直接查找映射的彩色图标组件
  const IconComponent = colorfulIconMap[model] || colorfulIconMap.default;
  
  // 渲染彩色图标组件
  return <IconComponent size={size} className={className} />;
};

export default ColorfulModelIcon;

