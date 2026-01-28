const { articleCreateError, articleAlreadyExists } = require('../constant/err.type');

const { getArticleInfo } = require('../service/article.service');

/**
 * @description: 校验文章标题，文章标题唯一
 * @param {*} ctx 上下文对象
 * @param {*} next 下一个中间件
 * @return {*}
 */
const verifyArticle = async (ctx, next) => {
  const { title } = ctx.request.body;
  const { userId } = ctx.state.user;
  const { id } = ctx.request.params;
  try {
    // 检查文章标题是否已存在
    const res = await getArticleInfo({ id, userId, title });
    if (res) return ctx.app.emit('error', articleAlreadyExists, ctx);
  } catch (err) {
    return ctx.app.emit('error', articleCreateError, ctx);
  }

  await next();
};

module.exports = {
  verifyArticle,
};
