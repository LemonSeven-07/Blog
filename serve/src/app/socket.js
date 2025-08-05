const Websocket = require('ws');
const jwt = require('jsonwebtoken');

const {
  wsCommentSchema,
  wsReplySchema,
  wsDelInteractiveSchema,
  wsGetNoticeSchema,
} = require('../constant/schema.js');
const { getUserInfo } = require('../service/user.service');

// 创建Websocket服务器，监听端口8010
const socket = new Websocket.Server({ port: process.env.WS_PORT });

module.exports.listen = () => {
  // 监听客户端的连接
  // ws：代表的是客户端连接的 socket 对象
  socket.on('connection', (ws, req) => {
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

    // 监听客户端消息
    // msg：由客户端发给服务端的数据
    ws.on('message', async msg => {
      let params = {};
      try {
        params = JSON.parse(msg);
      } catch {
        ws.send(JSON.stringify({ type: 'error', message: '无效的JSON' }));
        return;
      }

      try {
        // 针对当前用户评论评论权限判断
        const res = await getUserInfo({ id: ws.user.userId });
        if (res) {
          if (res.disabledDiscuss) {
            ws.send(JSON.stringify({ type: 'error', message: '您已被禁言，请文明留言' }));
            return;
          }

          switch (params.method) {
            // 创建一级评论 -》广播，重新获取消息通知
            case 'comment':
              break;
            // 对评论的回复 -》广播，重新获取消息通知
            case 'reply':
              break;
            // 删除评论 -》硬删除，广播，重新获取消息通知
            case 'delComment':
            // 删除回复 -》硬删除，广播，重新获取消息通知
            case 'delReply':
              break;
            // 获取消息通知
            case 'getNotice':
              break;
            // 查看消息通知 -》改变消息查看状态（以查看），重新获取消息通知
            case 'viewNotice':
              break;
            // 删除消息通知 -》软删除，重新获取消息通知
            case 'delNotice':
              break;
            default:
              break;
          }
        } else {
          throw new Error();
        }
      } catch {
        ws.send(JSON.stringify({ type: 'error', message: '评论失败' }));
        return;
      }
      console.log(1222, msg);
      // // 广播所有评论消息
      // socket.clients.forEach(client => {
      //   client.send(String(msg));
      // });
    });
  });

  // 服务器启动，显示启动消息
  console.log(`websocket is running on ws://localhost:${process.env.WS_PORT}`);
};
