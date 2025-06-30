const bcrypt = require('bcryptjs');

const { getUserInfo } = require('../service/user.service');

const {
  userRegisterError,
  userAlreadyExists,
  emailAlreadyExists,
  passwordFormatError,
  userLoginError,
  userDoesNotExist,
  invalidPassword,
} = require('../constant/err.type');

const validator = (rules, error) => {
  return async (ctx, next) => {
    try {
      ctx.verifyParams(rules);
    } catch (error) {
      return ctx.app.emit('error', error, ctx);
    }

    await next();
  };
};

const verifyUser = async (ctx, next) => {
  const { username } = ctx.request.body;
  try {
    const res = await getUserInfo({ username });
    if (res) {
      // 用户名已存在
      return ctx.app.emit('error', userAlreadyExists, ctx);
    }
  } catch (err) {
    return ctx.app.emit('error', userRegisterError, ctx);
  }

  await next();
};

const verifyEmail = async (ctx, next) => {
  const { email } = ctx.request.body;
  try {
    const res = await getUserInfo({ email });
    if (res) {
      // 邮箱已存在
      return ctx.app.emit('error', emailAlreadyExists, ctx);
    }
  } catch (err) {
    return ctx.app.emit('error', userRegisterError, ctx);
  }

  await next();
};

const cryptPassword = async (ctx, next) => {
  const { password } = ctx.request.body;
  const regex = /^\$2[aby]\$\d{2}\$[./0-9A-Za-z]{53}$/;
  if (regex.test(password)) {
    // 使用 bcryptjs 加密密码
    const salt = bcrypt.genSaltSync(10);
    ctx.request.body.password = bcrypt.hashSync(password, salt);
    await next();
  } else {
    return ctx.app.emit('error', passwordFormatError, ctx);
  }
};

const verifyLogin = async (ctx, next) => {
  const { username, password } = ctx.request.body;
  try {
    // 1. 判断用户是否存在
    const res = await getUserInfo({ username });
    if (!res) {
      // 用户名不存在
      return ctx.app.emit('error', userDoesNotExist, ctx);
    }
    // 2. 验证密码
    if (!bcrypt.compareSync(password, res.password)) {
      return ctx.app.emit('error', invalidPassword, ctx);
    }
  } catch (err) {
    return ctx.app.emit('error', userLoginError, ctx);
  }

  await next();
};

module.exports = {
  validator,
  verifyUser,
  verifyEmail,
  cryptPassword,
  verifyLogin,
};
