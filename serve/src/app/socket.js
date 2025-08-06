const WebSocket = require('ws');
const jwt = require('jsonwebtoken');

// 维护 WebSocket 连接集合：Map<articleId, Set<ws>>
const articleClientsMap = new Map();

function setupWebSocket(server, subClient) {
  // 1. 创建WebSocket服务器
  const wss = new WebSocket.Server({ server });

  // 2. WebSocket连接处理
  wss.on('connection', (ws, req) => {
    const url = req.url || '';
    const queryString = url.split('?')[1];
    const params = new URLSearchParams(queryString);
    const token = params.get('token')?.replace('Bearer ', '');
    const { JWT_SECRET } = process.env;

    if (!token) {
      ws.close(1008, 'Missing token');
      return;
    }

    try {
      // 1. 验证token是否过期
      const user = jwt.verify(token, JWT_SECRET);
      ws.user = user;
    } catch (err) {
      switch (err.name) {
        case 'TokenExpiredError':
          // 1. token过期
          ws.close(1008, 'token过期');
        case 'JsonWebTokenError':
          // 2. token无效
          ws.close(1008, 'token无效');
        default:
          ws.close(1008, 'token验证失败');
      }

      return;
    }

    // 客户端连接后，需要发送所观看的文章ID
    ws.on('message', msg => {
      try {
        const data = JSON.parse(msg);

        if (data.type === 'WATCH_ARTICLE') {
          const articleId = data.articleId;

          // 检查 Map 中是否已经有该文章 ID 的客户端集合
          if (!articleClientsMap.has(articleId)) {
            // 如果没有，则新建一个空的 Set 用来存储连接（ws）
            articleClientsMap.set(articleId, new Set());

            // 只有第一次创建该文章客户端集合时，才订阅 Redis 或消息队列的对应频道
            // 频道名格式是 `comment:${articleId}`，用于接收该文章的评论通知
            subClient.subscribe(`comment:${articleId}`);
          }

          // 将当前的 WebSocket 连接 ws 添加到该文章对应的客户端集合中
          articleClientsMap.get(articleId).add(ws);

          // 给 ws 连接对象记录它关联的文章 ID，方便后续清理或操作时使用
          // 比如关闭连接时知道它属于哪个文章，从对应集合中移除
          ws.articleId = articleId;
        }
      } catch (err) {
        console.error('❌ 消息解析失败:', err);
      }
    });

    // 断开连接清理 ws
    ws.on('close', () => {
      // 取出之前存储在 ws 上的文章 ID
      const articleId = ws.articleId;
      // 如果 articleId 存在，并且 articleClientsMap 里有对应的文章集合
      if (articleId && articleClientsMap.has(articleId)) {
        // 从该文章对应的客户端集合中删除当前关闭的 ws 连接
        articleClientsMap.get(articleId).delete(ws);
      }
    });

    // 心跳检测
    ws.isAlive = true; // 初始化连接状态标记
    ws.on('pong', () => {
      // 当收到客户端对ping的响应时，标记连接为活跃
      ws.isAlive = true;
    });
  });

  // 3. 心跳检测定时器
  setInterval(() => {
    // 每30秒执行一次检查
    wss.clients.forEach(ws => {
      // 遍历所有活跃连接
      if (!ws.isAlive) return ws.terminate(); // 如果标记为非活跃，强制关闭连接
      ws.isAlive = false; // 重置为待检测状态
      ws.ping(); // 发送ping帧（心跳包）
    });
  }, 30000);

  // 4. 订阅 Redis 的所有以 'comment:' 开头的频道，比如 'comment:123', 'comment:456' 等
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

  // 5. 错误处理（扩展WebSocket错误）
  wss.on('error', err => {
    console.error('❌ WebSocket Server Error:', err);
  });
}

module.exports = setupWebSocket;
