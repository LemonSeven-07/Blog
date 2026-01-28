const bcrypt = require('bcryptjs');

const { getUserInfo } = require('../service/user.service');
const { redisClient } = require('../db/redis');

const {
  userRegisterError,
  userAlreadyExists,
  emailAlreadyExists,
  emailNotRegistered,
  invalidCredentials,
  hasNotAdminPermission,
  invalidEmailCode,
} = require('../constant/err.type');

/**
 * @description: 校验用户名，用户名唯一
 * @param {*} ctx 上下文对象
 * @param {*} next 下一个中间件
 * @return {*}
 */
const verifyUser = async (ctx, next) => {
  const { username } = ctx.request.body;
  if (username) {
    try {
      const res = await getUserInfo({ username, paranoid: false });
      if (res) {
        // 用户名已存在
        return ctx.app.emit('error', userAlreadyExists, ctx);
      }
    } catch (err) {
      return ctx.app.emit('error', userRegisterError, ctx);
    }
  }

  await next();
};

/**
 * @description: 校验邮箱，邮箱唯一
 * @param {*} ctx 上下文对象
 * @param {*} next 下一个中间件
 * @return {*}
 */
const verifyEmail = async (ctx, next) => {
  const { email, type } = ctx.request.body;
  try {
    const res = await getUserInfo({ email, paranoid: false });

    // 账号注册校验邮箱是否存在
    if ((ctx.path.includes('/register') || type === 'register') && res)
      return ctx.app.emit('error', emailAlreadyExists, ctx);

    // 重置密码校验邮箱是否不存在
    if ((ctx.path.includes('/reset') || type === 'reset') && !res)
      return ctx.app.emit('error', emailNotRegistered, ctx);
  } catch (err) {
    return ctx.app.emit('error', userRegisterError, ctx);
  }

  await next();
};

/**
 * @description: 校验邮箱验证码
 * @param {*} ctx
 * @param {*} next
 * @return {*}
 */
const verifyEmailCode = async (ctx, next) => {
  const { email, code } = ctx.request.body;
  let type = '';
  if (ctx.path.includes('/register')) type = 'register';
  if (ctx.path.includes('/reset')) type = 'reset';
  if (ctx.path.includes('/user/email')) type = 'update';

  const savedCode = await redisClient.get(`verify:email:${type}:${email}`);
  if (!savedCode || savedCode !== code) {
    return ctx.app.emit('error', invalidEmailCode, ctx);
  }

  await next();
};

/**
 * @description: 密码加密处理
 * @param {*} ctx 上下文对象
 * @param {*} next 下一个中间件
 * @return {*}
 */
const cryptPassword = async (ctx, next) => {
  const { password } = ctx.request.body;
  const salt = bcrypt.genSaltSync(10);
  ctx.request.body.password = bcrypt.hashSync(password, salt);
  await next();
};

/**
 * @description: 校验用户登录信息
 * @param {*} ctx 上下文对象
 * @param {*} next 下一个中间件
 * @return {*}
 */
const verifyLogin = async (ctx, next) => {
  const { username, email, password } = ctx.request.body;
  try {
    let res = null;
    if (username) {
      // 1. 判断用户是否存在
      res = await getUserInfo({ username });
    } else {
      // 2. 判断邮箱是否存在
      res = await getUserInfo({ email });
    }
    if (!res) {
      // 用户名或邮箱不存在
      return ctx.app.emit('error', invalidCredentials, ctx);
    }

    // 3. 验证密码
    if (!bcrypt.compareSync(password, res.password)) {
      return ctx.app.emit('error', invalidCredentials, ctx);
    }
  } catch (err) {
    return ctx.app.emit('error', invalidCredentials, ctx);
  }

  await next();
};

/**
 * @description: 校验用户权限
 * @param {*} ctx 上下文对象
 * @param {*} next 下一个中间件
 * @return {*}
 */
const hadUpdatePermission = async (ctx, next) => {
  const { role } = ctx.state.user;
  const { role: newRole, banned } = ctx.request.body;
  if (role !== 1 && (banned !== undefined || newRole !== undefined)) {
    return ctx.app.emit('error', hasNotAdminPermission, ctx);
  }

  await next();
};

module.exports = {
  verifyUser,
  verifyEmail,
  verifyEmailCode,
  cryptPassword,
  verifyLogin,
  hadUpdatePermission,
};
