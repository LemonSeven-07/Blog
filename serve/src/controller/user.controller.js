const jwt = require('jsonwebtoken');

const {
  userRegisterError,
  userLoginError,
  userDeleteError,
  userDoesNotExist,
  userUpdateError,
  findUsersError,
} = require('../constant/err.type.js');

const {
  createUser,
  getUserInfo,
  removeUser,
  updateUer,
  findUsers,
} = require('../service/user.service.js');

const { issueTokens } = require('../utils/index.js');

class UserController {
  /**
   * @description: 注册用户
   * @param {*} ctx 上下文对象
   * @return {*}
   */
  async register(ctx) {
    // 1、获取数据
    const { username, password } = ctx.request.body;
    try {
      // 2、操作数据库
      const res = await createUser({ username, password });
      if (!res) throw new Error();

      // 3、返回结果
      ctx.body = {
        code: '200',
        data: null,
        message: '用户注册成功',
      };
    } catch (error) {
      ctx.app.emit('error', userRegisterError, ctx);
    }
  }

  /**
   * @description: 用户登录
   * @param {*} ctx 上下文对象
   * @return {*}
   */
  async login(ctx) {
    // 1、获取数据
    const { username } = ctx.request.body;
    try {
      // 2、操作数据库
      const { password, ...res } = await getUserInfo({ username });
      const { role, id: userId, banned } = res;
      const userInfo = {
        userId,
        username,
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
        data: null,
        message: '登录成功',
      };
    } catch (error) {
      ctx.app.emit('error', userLoginError, ctx);
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
      const res = await updateUer(ctx.request.body, userId);
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
}

module.exports = new UserController();
