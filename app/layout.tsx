import { ThemeProvider } from './components/ThemeProvider';
import './globals.css';

export const metadata = { title: 'AI 产品每日简报', description: '自动更新的第一梯队AI产品动态' };

export default function RootLayout({ children }: { children: React.ReactNode }){
  return (
    <html lang="zh-CN">
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
