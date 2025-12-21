const jwt = require('jsonwebtoken');

const {
  userRegisterError,
  resetPasswordError,
  SendError,
  userLoginError,
  userDeleteError,
  userDoesNotExist,
  userUpdateError,
  findUsersError,
  logoutError,
} = require('../constant/err.type');

const {
  createUser,
  getUserInfo,
  removeUser,
  updateUser,
  findUsers,
} = require('../service/user.service.js');

const { getRoutes } = require('../service/route.service.js');

const { issueTokens, sendEmailConfig } = require('../utils/index.js');
const { redisClient } = require('../db/redis.js');
const { disconnectWs } = require('../app/socket');

class UserController {
  /**
   * @description: 注册用户
   * @param {*} ctx 上下文对象
   * @return {*}
   */
  async register(ctx) {
    // 1、获取数据
    const { username, email, password } = ctx.request.body;
    try {
      // 2、操作数据库
      const res = await createUser({ username, password, email });
      if (!res) throw new Error();

      const { role, id: userId, banned, avatar = '' } = res;
      const userInfo = {
        userId,
        username,
        email,
        avatar,
        role,
        banned,
      };
      const { NODE_ENV, REDIS_TOKEN_CACHE_TTL } = process.env;
      const { accessToken, refreshToken } = issueTokens(userInfo);
      ctx.cookies.set('refresh_token', refreshToken, {
        httpOnly: true, // 前端 JS 无法读取
        secure: NODE_ENV === 'production', // 开发环境 http = false；生产 https = true
        sameSite: NODE_ENV === 'production' ? 'None' : 'Lax', // 防 CSRF，生产可用 'None'
        path: '/', // Cookie 对整个域名有效
        maxAge: 1000 * 60 * 60 * 24 * REDIS_TOKEN_CACHE_TTL, // 过期时间
      });
      ctx.set('x-access-token', accessToken);

      // 注册成功，删除该邮箱的验证码，避免影响下次注册
      await redisClient.del(`verify:email:register:${email}`);
      // 注册成功，删除该邮箱的发送记录，避免影响下次发送
      await redisClient.del(`email:send:email:register:${email}`);

      // 3、返回结果
      ctx.body = {
        code: '200',
        data: userInfo,
        message: '用户注册登录成功',
      };
    } catch (error) {
      ctx.app.emit('error', userRegisterError, ctx);
    }
  }

  /**
   * @description: 重置密码
   * @param {*} ctx
   * @return {*}
   */
  async resetPassword(ctx) {
    const { email, password } = ctx.request.body;
    try {
      const res = await updateUser({ email, password }, null);
      if (!res) throw new Error();
      // 重置成功，删除该邮箱的验证码，避免影响下次重置
      await redisClient.del(`verify:email:reset:${email}`);
      // 重置成功，删除该邮箱的发送记录，避免影响下次发送
      await redisClient.del(`email:send:email:reset:${email}`);

      ctx.body = {
        code: '200',
        data: null,
        message: '密码重置成功',
      };
    } catch (error) {
      ctx.app.emit('error', resetPasswordError, ctx);
    }
  }

  /**
   * @description: 用户登录
   * @param {*} ctx 上下文对象
   * @return {*}
   */
  async login(ctx) {
    // 1、获取数据
    const { username, email } = ctx.request.body;
    try {
      // 2、操作数据库
      const res = await getUserInfo({ username, email });
      if (!res) throw new Error();
      const { role, id: userId, banned, avatar = '' } = res;
      const userInfo = {
        userId,
        username: res.username,
        email: res.email,
        avatar,
        role,
        banned,
      };

      const { NODE_ENV, REDIS_TOKEN_CACHE_TTL } = process.env;
      const { accessToken, refreshToken } = issueTokens(userInfo);
      ctx.cookies.set('refresh_token', refreshToken, {
        httpOnly: true, // 前端 JS 无法读取
        secure: NODE_ENV === 'production', // 开发环境 http = false；生产 https = true
        sameSite: NODE_ENV === 'production' ? 'None' : 'Lax', // 防 CSRF，生产可用 'None'
        path: '/', // Cookie 对整个域名有效
        maxAge: 1000 * 60 * 60 * 24 * REDIS_TOKEN_CACHE_TTL, // 过期时间
      });
      ctx.set('x-access-token', accessToken);

      // 3、返回结果
      ctx.body = {
        code: '200',
        data: userInfo,
        message: '登录成功',
      };
    } catch (error) {
      ctx.app.emit('error', userLoginError, ctx);
    }
  }

  async sendEmailCode(ctx) {
    try {
      const { email, type } = ctx.request.body;
      const ip = ctx.request.ip || ctx.ip;

      const { EMAIL_CODE_EXPIRE, EMAIL_LIMIT, IP_LIMIT } = process.env;
      const ipKey = `email:send:ip:${type}:${ip}`;
      const emailKey = `email:send:email:${type}:${email}`;
      const lastSendKey = `rate:email:${type}:${email}`;
      const verifyKey = `verify:email:${type}:${email}`;

      const checkLimit = async (key, limit) => {
        const count = parseInt((await redisClient.get(key)) || '0', 10);
        if (count >= limit) throw new Error();

        const newCount = await redisClient.incr(key);
        if (newCount === 1) await redisClient.expire(key, 3600);
      };

      // IP 限制
      await checkLimit(ipKey, IP_LIMIT);
      // 邮箱限制
      await checkLimit(emailKey, EMAIL_LIMIT);
      // 发送频率限制 (60秒内不能重复发送)
      const lastSend = await redisClient.get(lastSendKey);
      if (lastSend) throw new Error();
      await redisClient.set(lastSendKey, 1, { EX: 60 });

      // 生成6位验证码
      const min = Math.pow(10, 5);
      const max = Math.pow(10, 6) - 1;
      const code = (Math.floor(Math.random() * (max - min + 1)) + min).toString();

      // 1️⃣ 获取发送配置
      const { transporter, option } = await sendEmailConfig(email, code, type);
      // 2️⃣ 发送邮件（✅ 使用 Promise 方式，不要回调）
      await transporter.sendMail(option);
      // 3️⃣ 存储到 Redis
      await redisClient.set(verifyKey, code, { EX: 60 * EMAIL_CODE_EXPIRE });
      // 4️⃣ 关闭 SMTP 连接
      transporter.close();
      // 5️⃣ 返回响应
      ctx.body = {
        code: '200',
        data: null,
        message: '验证码已发送，请查收邮件',
      };
    } catch (error) {
      ctx.app.emit('error', SendError, ctx);
    }
  }

  /**
   * @description: 用户注销
   * @param {*} ctx 上下文对象
   * @return {*}
   */
  async remove(ctx) {
    const { userId } = ctx.request.params;
    try {
      const res = await removeUser(userId);
      if (!res) {
        return ctx.app.emit('error', userDoesNotExist, ctx);
      }

      await redisClient.del(`refresh_token:user:${userId}`);
      await redisClient.set(`user_status:${userId}`, 'deleted');

      ctx.body = {
        code: '200',
        data: null,
        message: '删除成功',
      };
    } catch (err) {
      ctx.app.emit('error', userDeleteError, ctx);
    }
  }

  /**
   * @description: 修改用户信息
   * @param {*} ctx 上下文对象
   * @return {*}
   */
  async update(ctx) {
    const { userId } = ctx.request.params;
    try {
      const res = await updateUser(ctx.request.body, userId);
      if (!res) throw new Error();

      ctx.body = {
        code: '200',
        data: null,
        message: '修改成功',
      };
    } catch (err) {
      ctx.app.emit('error', userUpdateError, ctx);
    }
  }

  /**
   * @description: 获取用户信息、前端页面路由和导航页面路由
   * @param {*} ctx
   * @return {*}
   */
  async appInit(ctx) {
    let userId = null;
    if (ctx.state.user) userId = ctx.state.user.userId;
    try {
      if (userId) {
        const res = await getUserInfo({ id: userId });
        if (!res) {
          return ctx.app.emit('error', userDoesNotExist, ctx);
        }

        const routes = await getRoutes({ role: ctx.state.user.role });

        const { username, email, role, banned, avatar = '' } = res;
        ctx.body = {
          code: '200',
          data: {
            user: {
              userId,
              username,
              email,
              role,
              banned,
              avatar,
            },
            routes,
          },
          message: '操作成功',
        };
      } else {
        const routes = await getRoutes({ role: 4 });

        ctx.body = {
          code: '200',
          data: {
            user: null,
            routes,
          },
          message: '操作成功',
        };
      }
    } catch (err) {
      ctx.app.emit('error', userDoesNotExist, ctx);
    }
  }

  /**
   * @description: 查询用户列表（不显示当前用户）
   * @param {*} ctx 上下文对象
   * @return {*}
   */
  async findAll(ctx) {
    const { pageNum = 1, pageSize = 10, username, type, rangeDate } = ctx.query;
    const { userId } = ctx.state.user;
    try {
      const res = await findUsers({ pageNum, pageSize, username, type, rangeDate }, userId);
      ctx.body = {
        code: '200',
        data: res,
        message: '操作成功',
      };
    } catch (err) {
      ctx.app.emit('error', findUsersError, ctx);
    }
  }

  async logout(ctx) {
    const { userId, email, jti, seesionId } = ctx.state.user;
    const { NODE_ENV, BLACK_JTI_CACHE_TTL } = process.env;
    try {
      // 断开ws连接
      await disconnectWs(userId, seesionId, 'userLogout');

      // 添加邮箱验证发送频率重置保护机制
      await redisClient.del(`verify:email:register:${email}`);
      await redisClient.del(`email:send:email:register:${email}`);

      // 清除 cookies
      ctx.cookies.set('refresh_token', null, {
        httpOnly: true, // 确保前端无法读取
        secure: NODE_ENV === 'production', // 生产环境设置为 true
        sameSite: NODE_ENV === 'production' ? 'None' : 'Lax', // 防止 CSRF 攻击
        path: '/', // Cookie 对整个域名有效
        maxAge: 0, // 设置 maxAge 为 0 来使 cookie 立刻过期
      });
      // 清除响应头
      ctx.set('x-access-token', '');

      // 退出登录 token 在短时间内还有效需要加入黑名单，避免用旧的 token 非法操作
      await redisClient.set(`blacklist:${userId}:${jti}`, 'invalid', {
        EX: 60 * BLACK_JTI_CACHE_TTL,
      });

      // 清除 refresh_token
      await redisClient.del(`refresh_token:user:${userId}`);

      ctx.body = {
        code: '200',
        data: null,
        message: '退出成功',
      };
    } catch (err) {
      ctx.app.emit('error', logoutError, ctx);
    }
  }
}

module.exports = new UserController();
