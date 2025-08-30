import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 只对管理路由进行保护
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    // 检查是否有设备令牌（cookie或临时令牌）
    const deviceToken = request.cookies.get('admin_device_token')?.value;
    
    // 如果没有cookie中的设备令牌，检查是否是临时访问（开发环境）
    if (!deviceToken) {
      // 在开发环境中，如果没有配置TOTP，允许访问
      // 在生产环境中，应该严格检查设备令牌
      if (process.env.NODE_ENV === 'development') {
        // 开发环境：允许访问管理页面
        return NextResponse.next();
      } else {
        // 生产环境：重定向到登录页面
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }
    }
    
    // 有设备令牌，继续访问
    return NextResponse.next();
  }
  
  // 其他路由正常访问
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
