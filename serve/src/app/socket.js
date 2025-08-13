const WebSocket = require('ws');
const jwt = require('jsonwebtoken');

const { redisClient } = require('../db/redis.js');
const { findUnreadNotice } = require('../service/comment.service.js');

// 维护 WebSocket 连接集合：Map<articleId, Set<ws>>
const articleClientsMap = new Map();
// 维护用户连接集合：Map<userId, Set<ws>>
const userClientsMap = new Map();

function setupWebSocket(server, subClient) {
  // 1. 创建WebSocket服务器
  const wss = new WebSocket.Server({ server });

  // 2. WebSocket连接处理
  wss.on('connection', async (ws, req) => {
    const url = req.url || '';
    const queryString = url.split('?')[1];
    const params = new URLSearchParams(queryString);
    const token = params.get('token')?.replace('Bearer ', '');
    const { JWT_SECRET } = process.env;

    // token不存在，直接关闭连接
    if (!token) {
      ws.close(1008, 'Missing token');
      return;
    }
    try {
      // 验证token是否过期
      const user = jwt.verify(token, JWT_SECRET);
      ws.user = user;
    } catch (err) {
      switch (err.name) {
        case 'TokenExpiredError':
          // token过期
          ws.close(1008, 'token过期');
          break;
        case 'JsonWebTokenError':
          // token无效
          ws.close(1008, 'token无效');
          break;
        default:
          ws.close(1008, 'token验证失败');
          break;
      }

      return;
    }

    // 3. 接收客户端消息
    ws.on('message', async msg => {
      try {
        const data = JSON.parse(msg);

        if (data.type === 'INIT_USER') {
          const userId = String(ws.user.userId);

          if (!userClientsMap.has(userId)) {
            userClientsMap.set(userId, new Set());
          }

          userClientsMap.get(userId).add(ws);
          // 保存用户 ID，断开连接时可以清理
          ws.userId = userId;

          // 查询未读消息数量
          try {
            const count = await findUnreadNotice(userId);

            // 设置键值并添加过期时间（单位：秒），默认两小时
            const CACHE_TTL = parseInt(process.env.REDIS_CACHE_TTL) * 60 * 60 || 7200;
            await redisClient.set(`user:unread:${userId}`, count, { EX: CACHE_TTL });

            // 给当前 WebSocket 连接发送未读消息数
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(
                JSON.stringify({
                  type: 'UNREAD_COUNT',
                  count,
                }),
              );
            }
          } catch (err) {
            console.error('❌ 获取未读消息数量失败:', err);
            // 发送错误消息给客户端
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(
                JSON.stringify({
                  type: 'UNREAD_COUNT_ERROR',
                  message: '查询未读消息失败',
                }),
              );
            }
          }
        } else if (data.type === 'WATCH_ARTICLE') {
          const articleId = String(data.articleId);

          // 检查 Map 中是否已经有该文章 ID 的客户端集合
          if (!articleClientsMap.has(articleId)) {
            // 如果没有，则新建一个空的 Set 用来存储连接（ws）
            articleClientsMap.set(articleId, new Set());
          }

          // 将当前的 WebSocket 连接 ws 添加到该文章对应的客户端集合中
          articleClientsMap.get(articleId).add(ws);

          // 给 ws 连接对象记录它关联的文章 ID，方便后续清理或操作时使用
          // 比如关闭连接时知道它属于哪个文章，从对应集合中移除
          ws.articleId = articleId;
        } else if (data.type === 'UNWATCH_ARTICLE') {
          // 清理 Map 中的引用
          // 如果 articleId 存在，并且 articleClientsMap 里有对应的文章集合
          if (ws.articleId && articleClientsMap.has(ws.articleId)) {
            // 从该文章对应的客户端集合中删除当前关闭的 ws 连接
            const set = articleClientsMap.get(ws.articleId);
            set.delete(ws);

            // 如果删除后该集合为空，说明没有客户端再监听这个文章了
            if (set.size === 0) articleClientsMap.delete(ws.articleId);
          }
        }
      } catch (err) {
        console.error('❌ 消息解析失败:', err);
      }
    });

    // 4. 连接关闭处理
    ws.on('close', () => {
      console.log(`🔌 用户 ${ws.user.username || '未知'} 的连接关闭`);
      cleanupWebSocket(ws);
    });

    // 心跳检测
    ws.isAlive = true; // 初始化连接状态标记
    ws.on('pong', () => {
      // 当收到客户端对ping的响应时，标记连接为活跃
      ws.isAlive = true;
    });
  });

  // 5. 订阅 Redis 的所有以 'comment:'、'notify:' 开头的频道，比如 'comment:123', 'notify:456' 等
  subClient.pSubscribe('comment:*', (message, channel) => {
    // 从频道名里提取出文章ID，比如 'comment:123' -> '123'
    const articleId = channel.split(':')[1];
    // Redis 传过来的消息是字符串，这里转换成对象
    const msgObj = JSON.parse(message);

    // 检查有没有客户端连接集合对应这个文章ID
    if (articleClientsMap.has(articleId)) {
      // 遍历这个文章对应的所有 WebSocket 连接
      for (const ws of articleClientsMap.get(articleId)) {
        // 只给处于“连接打开”状态的客户端发送消息，避免报错
        if (ws.readyState === WebSocket.OPEN) {
          // 发送消息（序列化为 JSON 字符串）到客户端
          ws.send(JSON.stringify(msgObj));
        }
      }
    }
  });
  subClient.pSubscribe('notify:*', async (message, channel) => {
    const userId = channel.split(':')[1];
    const msgObj = JSON.parse(message);
    const unreadKey = `unread:notice:${userId}`;

    if (userClientsMap.has(userId)) {
      for (const ws of userClientsMap.get(userId)) {
        if (ws.readyState === WebSocket.OPEN) {
          const exists = await redisClient.exists(unreadKey);
          if (exists) {
            let count;
            // 删除评论或回复时，减少未读消息数
            if (msgObj.type === 'DELETE_NOTIFY') {
              count = await redisClient.decr(unreadKey); // 减少未读消息数（-1）
            } else if (msgObj.type === 'ADD_NOTIFY') {
              count = await redisClient.incr(unreadKey); // 增加未读消息数（+1）
            } else if (msgObj.type === 'UPDATE_NOTIFY_STATUS') {
              count = await redisClient.incrBy(unreadKey, msgObj.step); // 增加未读消息数（+msgObj.step）
              delete msgObj.step; // 删除 step 属性
            }
            if (count < 0) {
              // 防御负值
              await redisClient.set(unreadKey, 0);
              count = 0;
            }
            msgObj.count = count; // 更新消息对象中的未读数
          } else {
            // key不存在，说明缓存失效，从数据库获取最新未读数并更新缓存
            const count = await getSafeUnreadCount(userId);
            msgObj.count = count;
          }
          ws.send(JSON.stringify(msgObj));
        }
      }
    }
  });

  // 6. 错误处理（扩展WebSocket错误）
  wss.on('error', err => {
    cleanupWebSocket(ws);
    console.error('❌ WebSocket Server Error:', err);
  });

  // 7. 心跳检测定时器
  setInterval(() => {
    // 每30秒执行一次检查
    wss.clients.forEach(ws => {
      // 遍历所有活跃连接
      if (!ws.isAlive) {
        cleanupWebSocket(ws);
        return ws.terminate(); // 如果标记为非活跃，强制关闭连接
      }
      ws.isAlive = false; // 重置为待检测状态
      ws.ping(); // 发送ping帧（心跳包）
    });
  }, 30000);
}

// 清理 Map 中的引用
function cleanupWebSocket(ws) {
  // 如果 articleId 存在，并且 articleClientsMap 里有对应的文章集合
  if (ws.articleId && articleClientsMap.has(ws.articleId)) {
    // 从该文章对应的客户端集合中删除当前关闭的 ws 连接
    const set = articleClientsMap.get(ws.articleId);
    set.delete(ws);

    // 如果删除后该集合为空，说明没有客户端再监听这个文章了
    if (set.size === 0) articleClientsMap.delete(ws.articleId);
  }

  // 如果 userId 存在，并且 userClientsMap 里有对应的用户集合
  if (ws.userId && userClientsMap.has(ws.userId)) {
    // 从该用户对应的客户端集合中删除当前关闭的 ws 连接
    const set = userClientsMap.get(ws.userId);
    set.delete(ws);

    // 如果删除后该集合为空，说明没有客户端再监听这个用户了
    if (set.size === 0) userClientsMap.delete(ws.userId);
  }
}

/**
 * 安全获取用户未读消息数
 * - 优先从 Redis 读缓存
 * - 缓存异常时，从数据库读取并修正 Redis
 * - 控制对数据库的访问频率，避免频繁查询
 * @param {string|number} userId 用户ID
 * @returns {Promise<number>} 未读消息数
 */
async function getSafeUnreadCount(userId) {
  const unreadKey = 'unread:' + userId;
  const lastCheckKey = 'unread:last_check:' + userId;

  // 1. 先尝试读取 Redis 缓存
  const [cached, lastCheck] = await redisClient.mGet(unreadKey, lastCheckKey);
  const now = Date.now();

  // 2. 判断缓存是否有效（存在且为合法数字且非负）
  if (cached && !isNaN(cached) && Number(cached) >= 0) {
    return Number(cached); // 缓存有效，直接返回
  }

  // 3. 缓存无效，判断上次校验时间，避免频繁访问数据库
  if (lastCheck && now - Number(lastCheck) < 5 * 60 * 1000) {
    // 5分钟内已校验过
    // 虽然缓存异常，但校验频率限制，直接返回缓存（可能是 null 或非法）
    return cached ? Number(cached) : 0;
  }

  // 4. 访问数据库查询真实未读数
  const dbCount = await findUnreadNotice(userId);

  // 5. 更新 Redis 缓存和校验时间
  const CACHE_TTL = parseInt(process.env.REDIS_CACHE_TTL) * 60 * 60 || 7200;
  await redisClient.set(unreadKey, dbCount, { EX: CACHE_TTL }); // 默认缓存2小时
  await redisClient.set(lastCheckKey, now.toString(), { EX: 600 }); // 10分钟内不再访问DB

  return dbCount;
}

module.exports = setupWebSocket;
