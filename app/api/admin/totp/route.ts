import { NextRequest, NextResponse } from 'next/server';
import { 
  generateTOTPSecret, 
  generateTOTPConfig, 
  generateTOTPQRCode,
  verifyTOTPToken 
} from '../../../utils/totp';

// 创建Redis客户端函数
async function createRedisClient() {
  if (process.env.NODE_ENV === 'development' && !process.env.KV_REST_API_URL) {
    // 本地开发环境，使用内存存储
    console.log('使用本地内存存储');
    
    // 使用全局变量来保持数据在请求之间
    if (!global.localStorage) {
      (global as any).localStorage = new Map();
    }
    
    return {
      get: async (key: string) => {
        const value = global.localStorage.get(key);
        console.log(`获取 ${key}:`, value);
        return value || null;
      },
      set: async (key: string, value: any) => {
        console.log(`设置 ${key}:`, value);
        global.localStorage.set(key, value);
        return 'OK';
      },
      del: async (key: string) => {
        console.log(`删除 ${key}`);
        global.localStorage.delete(key);
        return 1;
      },
    };
  } else {
    // 生产环境，使用Redis
    const { Redis } = await import('@upstash/redis');
    return new Redis({
      url: process.env.KV_REST_API_URL!,
      token: process.env.KV_REST_API_TOKEN!,
    });
  }
}

export const runtime = 'edge';

// 获取TOTP配置
export async function GET() {
  try {
    const redis = await createRedisClient();
    const config = await redis.get('totp_config');
    
    if (!config) {
      return NextResponse.json({ 
        enabled: false,
        message: 'TOTP未配置' 
      });
    }
    
    return NextResponse.json({
      enabled: true,
      config: {
        issuer: config.issuer,
        label: config.label,
        algorithm: config.algorithm,
        digits: config.digits,
        period: config.period
      }
    });
  } catch (error) {
    console.error('获取TOTP配置失败:', error);
    return NextResponse.json(
      { error: '获取TOTP配置失败' }, 
      { status: 500 }
    );
  }
}

// 设置TOTP配置
export async function POST(request: NextRequest) {
  try {
    const redis = await createRedisClient();
    const { action } = await request.json();
    
    if (action === 'setup') {
      // 生成新的TOTP配置
      const secret = generateTOTPSecret();
      const config = generateTOTPConfig(secret);
      
      // 保存配置到Redis
      await redis.set('totp_config', config);
      await redis.set('totp_secret', secret);
      
      // 生成二维码
      const qrCode = await generateTOTPQRCode(config);
      
      return NextResponse.json({
        success: true,
        message: 'TOTP配置成功',
        config: {
          secret,
          qrCode,
          otpauthUrl: `otpauth://totp/${encodeURIComponent(config.label)}?secret=${secret}&issuer=${encodeURIComponent(config.issuer)}&algorithm=${config.algorithm}&digits=${config.digits}&period=${config.period}`
        }
      });
    } else if (action === 'disable') {
      // 禁用TOTP
      await redis.del('totp_config');
      await redis.del('totp_secret');
      
      return NextResponse.json({
        success: true,
        message: 'TOTP已禁用'
      });
    } else {
      return NextResponse.json(
        { error: '无效的操作' }, 
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('设置TOTP配置失败:', error);
    return NextResponse.json(
      { error: '设置TOTP配置失败' }, 
      { status: 500 }
    );
  }
}

// 验证TOTP令牌
export async function PUT(request: NextRequest) {
  try {
    const redis = await createRedisClient();
    const { token, rememberDevice } = await request.json();
    
    if (!token) {
      return NextResponse.json(
        { error: '动态口令不能为空' }, 
        { status: 400 }
      );
    }
    
    // 获取TOTP密钥
    const secret = await redis.get('totp_secret');
    if (!secret) {
      return NextResponse.json(
        { error: 'TOTP未配置' }, 
        { status: 400 }
      );
    }
    
    // 验证令牌
    const result = verifyTOTPToken(token, secret);
    
          if (result.isValid) {
        // 如果选择记住设备，生成设备令牌
        let deviceToken = null;
        if (rememberDevice) {
          deviceToken = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          await redis.set(`device_token:${deviceToken}`, {
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30天
          });
        }
        
        // 创建响应
        const response = NextResponse.json({
          success: true,
          message: '验证成功',
          deviceToken
        });
        
        // 如果选择记住设备，设置cookie
        if (rememberDevice && deviceToken) {
          response.cookies.set('admin_device_token', deviceToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 30 * 24 * 60 * 60, // 30天
            path: '/'
          });
        }
        
        return response;
      } else {
      return NextResponse.json(
        { error: result.message || '验证失败' }, 
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('验证TOTP失败:', error);
    return NextResponse.json(
      { error: '验证失败' }, 
      { status: 500 }
    );
  }
}

// 验证设备令牌
export async function PATCH(request: NextRequest) {
  try {
    const redis = await createRedisClient();
    const { deviceToken } = await request.json();
    
    if (!deviceToken) {
      return NextResponse.json(
        { error: '设备令牌不能为空' }, 
        { status: 400 }
      );
    }
    
    // 检查设备令牌是否有效
    const deviceInfo = await redis.get(`device_token:${deviceToken}`);
    if (!deviceInfo) {
      return NextResponse.json(
        { error: '设备令牌无效' }, 
        { status: 400 }
      );
    }
    
    // 检查是否过期
    if (new Date(deviceInfo.expiresAt) < new Date()) {
      await redis.del(`device_token:${deviceToken}`);
      return NextResponse.json(
        { error: '设备令牌已过期' }, 
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: '设备令牌有效'
    });
  } catch (error) {
    console.error('验证设备令牌失败:', error);
    return NextResponse.json(
      { error: '验证失败' }, 
      { status: 500 }
    );
  }
}
