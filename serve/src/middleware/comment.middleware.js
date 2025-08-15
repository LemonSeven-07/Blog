const { getUserInfo } = require('../service/user.service');

const { commentBannedError, commentError } = require('../constant/err.type');

/**
 * @description: 校验用户评论权限
 * @param {*} ctx 上下文对象
 * @param {*} next 下一个中间件
 * @return {*}
 */
const verifyBanned = async (ctx, next) => {
  const { userId } = ctx.state.user;
  try {
    // 获取用户信息
    const res = await getUserInfo({ id: userId });
    if (res) {
      // 如果用户被禁用，则不允许评论
      if (res.banned) return ctx.app.emit('error', commentBannedError, ctx);
    } else {
      throw new Error();
    }
  } catch (err) {
    return ctx.app.emit('error', commentError, ctx);
  }

  await next();
};

module.exports = {
  verifyBanned,
};
