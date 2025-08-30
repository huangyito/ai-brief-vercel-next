#!/bin/bash

# 后台启动Next.js开发服务器
echo "🚀 启动Next.js开发服务器..."

# 检查是否已有进程在运行
if lsof -i :3000 > /dev/null 2>&1; then
    echo "⚠️  端口3000已被占用，正在停止现有进程..."
    lsof -ti :3000 | xargs kill -9
    sleep 2
fi

# 后台启动服务器
nohup npm run dev > dev.log 2>&1 &

# 获取进程ID
DEV_PID=$!
echo "✅ 开发服务器已启动 (PID: $DEV_PID)"
echo "📝 日志文件: dev.log"
echo "🌐 访问地址: http://localhost:3000"
echo ""
echo "💡 管理命令:"
echo "  查看日志: tail -f dev.log"
echo "  停止服务器: kill $DEV_PID"
echo "  检查状态: lsof -i :3000"
