# Mac系统需要执行以下启动脚本避免端口被占用提前释放端口，如果是Windows系统只需执行nodemon ./src/main.js命令就行

#!/bin/bash

# 加载 .env 文件中的环境变量
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

# 设置默认端口（可以通过环境变量覆盖）
APP_PORT=${APP_PORT}
WS_PORT=${WS_PORT}

echo "🧹 清理占用端口: $APP_PORT 和 $WS_PORT..."

# 查找并杀死占用端口的进程
for PORT in $APP_PORT $WS_PORT; do
  PID=$(lsof -ti :$PORT)
  if [ -n "$PID" ]; then
    echo "🔪 端口 $PORT 被 PID $PID 占用，正在杀死..."
    kill -9 $PID
  else
    echo "✅ 端口 $PORT 空闲。"
  fi
done

echo "🚀 启动 Node 服务 (nodemon)..."
APP_PORT=$APP_PORT WS_PORT=$WS_PORT nodemon ./src/main.js
