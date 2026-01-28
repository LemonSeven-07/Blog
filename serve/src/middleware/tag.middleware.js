const { tagCreateError, tagAlreadyExists } = require('../constant/err.type');

const { getTagInfo } = require('../service/tag.service');

/**
 * @description: 校验文章标签名，文章标签名唯一
 * @param {*} ctx 上下文对象
 * @param {*} next 下一个中间件
 * @return {*}
 */
const verifyTag = async (ctx, next) => {
  const { name } = ctx.request.body;
  try {
    // 检查文章标签是否已存在
    const res = await getTagInfo({ name });
    if (res) return ctx.app.emit('error', tagAlreadyExists, ctx);
  } catch (err) {
    return ctx.app.emit('error', tagCreateError, ctx);
  }

  await next();
};

module.exports = {
  verifyTag,
};
