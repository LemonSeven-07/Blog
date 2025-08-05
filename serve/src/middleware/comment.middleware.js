const { getUserInfo } = require('../service/user.service');

const { commentBannedError } = require('../constant/err.type');

const verifyDisabledDiscuss = async (ctx, next) => {
  const { userId } = ctx.state.user;
  try {
    const res = await getUserInfo({ id: userId });
    if (res) {
      if (res.disabledDiscuss) return ctx.app.emit('error', commentBannedError, ctx);
    } else {
      throw new Error();
    }
  } catch (err) {
    return ctx.app.emit('error', createCategoryError, ctx);
  }

  await next();
};

module.exports = {
  verifyDisabledDiscuss,
};
