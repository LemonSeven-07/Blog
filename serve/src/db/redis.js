const { createClient } = require('redis');

const redisConfig = {
  url: `redis://:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${
    process.env.REDIS_PORT || 6379
  }`,
  // 套接字连接配置
  socket: {
    // 连接超时时间（毫秒）
    connectTimeout: 10000,
    // 重连策略函数
    reconnectStrategy: retries => {
      // 如果重试次数超过5次，抛出错误
      if (retries > 5) return new Error('超过最大重连次数');
      // 每次重试间隔 = 100ms * 已重试次数（指数退避）
      return 100 * retries;
    },
  },
  name: process.env.REDIS_NAME, // 连接名称
  // 选择Redis数据库编号（0-15）
  database: 0,
};

// 创建 Redis 客户端
const redisClient = createClient(redisConfig);

// 错误监听
redisClient.on('error', err => {
  console.error('❌ Redis 连接错误:', err);
});

let pubClient;
let subClient;

async function connectRedis() {
  // 创建发布和订阅客户端实例
  pubClient = createClient(redisConfig);
  subClient = pubClient.duplicate();

  pubClient.on('error', err => console.error('❌ Redis pubClient error:', err));
  subClient.on('error', err => console.error('❌ Redis subClient error:', err));

  try {
    await redisClient.connect();
    console.log('✅ Redis 主客户端连接成功');

    await pubClient.connect();
    console.log('✅ Redis 发布客户端连接成功');

    await subClient.connect();
    console.log('✅ Redis 订阅客户端连接成功');
  } catch (err) {
    console.log(err);
  }

  return { pubClient, subClient };
}

module.exports = { connectRedis };
