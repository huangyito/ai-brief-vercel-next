'use client';

import { getColor } from '../utils/themeColors';

interface UnifiedFooterProps {
  content?: string;
  showAuthor?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export default function UnifiedFooter({ 
  content = "注：本页面自动汇总公开来源的更新信息，每天早上9点更新，仅用于学习与研究，不构成任何商业承诺或投资建议。",
  showAuthor = true,
  className = "",
  style = {}
}: UnifiedFooterProps) {
  return (
    <div 
      className={`unified-footer ${className}`}
      style={{
        fontSize: '12px', 
        lineHeight: '1.4', 
        color: 'var(--muted)', 
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        fontWeight: '200',
        marginBottom: '48px',
        ...style
      }}
    >
      <span style={{fontWeight: '200'}}>{content}</span>
      {showAuthor && (
        <span style={{fontWeight: '200'}}>由 Haynes Fang 设计并搭建</span>
      )}
    </div>
  );
}

