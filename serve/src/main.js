const http = require('http');

require('./config/config.default.js');
const app = require('./app/app.js');
const setupWebSocket = require('./app/socket.js');
const db = require('./model/index.js');
const { connectRedis } = require('./db/redis.js');

// 创建HTTP服务器（承载Koa和WebSocket）
const server = http.createServer(app.callback());

async function main() {
  // 连接 Redis
  const { pubClient, subClient } = await connectRedis();

  // 给其他模块用，发布者可挂载到 ctx 或单独导出，这里示例直接挂载
  app.context.pubClient = pubClient;

  await db.sequelize
    .sync({ force: false })
    .then(() => {
      console.log('✅ mySql 已连接');
    })
    .catch(err => {
      console.log('❌ mySql 连接错误:', err);
    });

  // 启动 WebSocket，传入订阅客户端
  setupWebSocket(server, subClient);

  server.listen(process.env.PORT, () => {
    console.log(`✅ Server is running on localhost:${process.env.PORT}`);
  });
}

main().catch(err => {
  console.error('❌ Error during server startup:', err);
  process.exit(1); // 如果启动失败，退出进程
});
