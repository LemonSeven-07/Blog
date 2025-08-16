const jwt = require('jsonwebtoken');

const { issueTokens } = require('../utils/index.js');
const { redisClient } = require('../db/redis.js');
const { disconnectWs } = require('../app/socket.js');
const {
  tokenExpiredError,
  jsonWebTokenError,
  tokenFormatError,
  userOfflineError,
  hasNotAdminPermission,
} = require('../constant/err.type.js');

/**
 * @description: 校验token
 * @param {*} ctx 上下文对象
 * @param {*} next 下一个中间件
 * @return {*}
 */
const auth = async (ctx, next) => {
  const { authorization = '' } = ctx.request.headers;
  const accessToken = authorization.replace('Bearer ', '');
  const { JWT_SECRET, NODE_ENV, REDIS_TOKEN_CACHE_TTL } = process.env;
  try {
    // 1. 验证token是否过期
    const user = jwt.verify(accessToken, JWT_SECRET);
    ctx.state.user = user;

    // 2. 查询 Redis 看用户是否被踢
    const status = await redisClient.get(`user_status:${user.userId}`);
    if (status && status === 'deleted') {
      // 断开ws连接
      await disconnectWs(user.userId, '您已被强制下线');
      throw new Error('userOfflineError');
    }
  } catch (err) {
    // 删除用户强制离线
    if (err.message === 'userOfflineError') {
      return ctx.app.emit('error', userOfflineError, ctx);
    }

    switch (err.name) {
      case 'TokenExpiredError':
        // 1. accessToken过期
        const refreshToken = ctx.cookies.get('refresh_token');
        try {
          // 1.1. 校验 refreshToken 是否有效
          const { userId, username, role, banned, jti } = jwt.verify(refreshToken, JWT_SECRET);

          // 1.2. 确认 refreshToken 是否在 Redis 存活
          const session = await redisClient.get(`refresh_token:user:${userId}`);
          if (!session || jti !== JSON.parse(session).jti) {
            // 断开ws连接
            await disconnectWs(userId);
            return ctx.app.emit('error', tokenExpiredError, ctx);
          }

          // 1.3. 颁发新 Token
          const { accessToken: newAccessToken, refreshToken: newRefreshToken } = await issueTokens({
            userId,
            username,
            role,
            banned,
          });

          // 1.4. 更新 Cookie
          ctx.cookies.set('refresh_token', newRefreshToken, {
            httpOnly: true, // 前端 JS 无法读取
            secure: NODE_ENV === 'production', // 开发环境 http = false；生产 https = true
            sameSite: NODE_ENV === 'production' ? 'None' : 'Lax', // 防 CSRF，生产可用 'None'
            path: '/', // Cookie 对整个域名有效
            maxAge: 1000 * 60 * 60 * 24 * REDIS_TOKEN_CACHE_TTL, // 过期时间
          });

          // 1.5. 返回新的 AccessToken（写到响应头）
          ctx.set('x-access-token', newAccessToken);

          // 1.6. 把用户挂载到 ctx.state
          ctx.state.user = {
            userId,
            username,
            role,
            banned,
          };
          return await next();
        } catch (refreshErr) {
          return ctx.app.emit('error', tokenExpiredError, ctx);
        }
      case 'JsonWebTokenError':
        // 2. accessToken无效
        return ctx.app.emit('error', jsonWebTokenError, ctx);
      default:
        return ctx.app.emit('error', tokenFormatError, ctx);
    }
  }

  await next();
};

/**
 * @description: 校验用户权限
 * @param {*} ctx 上下文对象
 * @param {*} next 下一个中间件
 * @return {*}
 */
const hadAdminPermission = async (ctx, next) => {
  const { role } = ctx.state.user;
  if (role !== 1) {
    return ctx.app.emit('error', hasNotAdminPermission, ctx);
  }
  await next();
};

module.exports = {
  auth,
  hadAdminPermission,
};
