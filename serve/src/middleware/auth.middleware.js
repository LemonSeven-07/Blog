/*
 * @Author: yolo
 * @Date: 2025-06-09 00:58:58
 * @LastEditors: yolo
 * @LastEditTime: 2026-01-22 04:17:50
 * @FilePath: /serve/src/middleware/auth.middleware.js
 * @Description: 鉴权中间件
 */
const jwt = require('jsonwebtoken');

const { issueTokens } = require('../utils/index.js');
const { redisClient } = require('../db/redis.js');
const { disconnectWs } = require('../app/socket.js');
const {
  tokenInvalidError,
  userOfflineError,
  userKickedError,
  hasNotAdminPermission,
  tagOperateError,
  tagUsageError,
} = require('../constant/err.type.js');
const { checkTagsUsage } = require('../service/articleTag.service');
const { isSystemTag } = require('../service/tag.service.js');

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

    // 2. 查询 Redis 看用户账号是否已在其他设备登录
    const jtiInRedis = await redisClient.get(`refresh_token:user:${user.userId}`);
    if (!jtiInRedis || jtiInRedis !== user.jti) {
      // 断开ws连接
      await disconnectWs(user.userId, user.seesionId, 'userKicked');
      throw new Error('userKickedError');
    }

    // 3. 查询 Redis 看用户账号是否被删除
    const status = await redisClient.get(`user_status:${user.userId}`);
    if (status && status === 'deleted') {
      // 断开ws连接
      await disconnectWs(user.userId, user.seesionId, 'userDeleted');
      throw new Error('userOfflineError');
    }

    // 4. 检查 jti 是否在黑名单中，若在黑名单禁止非法请求操作
    const value = await redisClient.get(`blacklist:${user.userId}:${user.jti}`);
    if (value && value === 'invalid') throw new Error('tokenInvalidError');
  } catch (err) {
    // 用户退出登录
    if (err.message === 'userOfflineError') {
      return ctx.app.emit('error', userOfflineError, ctx);
    } else if (err.message === 'userKickedError') {
      return ctx.app.emit('error', userKickedError, ctx);
    }

    switch (err.name) {
      case 'TokenExpiredError':
      case 'JsonWebTokenError':
        // 1. accessToken无效或过期
        const refreshToken = ctx.cookies.get('refresh_token');
        try {
          // 1.1. 校验 refreshToken 是否有效
          const { userId, username, email, avatar, role, banned, jti, seesionId } = jwt.verify(
            refreshToken,
            JWT_SECRET,
          );
          // 1.2. 确认 refreshToken 是否在 Redis 存活
          const redisJTI = await redisClient.get(`refresh_token:user:${userId}`);
          if (!redisJTI || jti !== redisJTI) {
            // 断开ws连接
            await disconnectWs(userId, seesionId);
            throw new Error();
          }

          // 1.3. 颁发新 Token
          const { accessToken: newAccessToken, refreshToken: newRefreshToken } = await issueTokens({
            userId,
            username,
            email,
            avatar,
            role,
            banned,
            seesionId,
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
          if (
            !ctx.path.includes('/app/init') &&
            !(ctx.path.includes('/article/list') && !ctx.query.flag)
          )
            return ctx.app.emit('error', tokenInvalidError, ctx);
        }
      default:
        if (
          !ctx.path.includes('/app/init') &&
          !(ctx.path.includes('/article/list') && !ctx.query.flag)
        )
          return ctx.app.emit('error', tokenInvalidError, ctx);
    }
  }
  await next();
};

/**
 * @description: 校验用户权限
 * @param {number} level 权限等级 1 超级管理员 2 普通管理员 3 普通用户 4 游客
 * @return {*}
 */
const hadAdminPermission = level => {
  return async (ctx, next) => {
    const { role } = ctx.state.user;
    if (role > level) {
      return ctx.app.emit('error', hasNotAdminPermission, ctx);
    }
    await next();
  };
};

/**
 * @description: 校验标签操作权限
 * @param {*} ctx
 * @param {*} next
 * @return {*}
 */
const checkTagPermission = async (ctx, next) => {
  const { role } = ctx.state.user;
  const { ids } = ctx.request.body;
  const { id } = ctx.request.params;
  if (role === 1) {
    // 超级管理员拥有所有权限
    await next();
  } else if (role === 2) {
    try {
      // 普通管理员不能操作系统内置标签
      const isBuiltin = await isSystemTag(id || ids);
      if (isBuiltin) return ctx.app.emit('error', hasNotAdminPermission, ctx);

      // 普通管理员必须是修改或删除的标签没有被某篇文章使用才能操作标签
      const result = await checkTagsUsage(id || ids);
      if (result) return ctx.app.emit('error', tagUsageError, ctx);
      await next();
    } catch (err) {
      return ctx.app.emit('error', tagOperateError, ctx);
    }
  } else {
    return ctx.app.emit('error', hasNotAdminPermission, ctx);
  }
};

module.exports = {
  auth,
  hadAdminPermission,
  checkTagPermission,
};
