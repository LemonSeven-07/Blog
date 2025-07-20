const { createArticleError, articleAlreadyExists } = require('../constant/err.type');

const { getArticleInfo } = require('../service/article.service');

const verifyArticleTitle = async (ctx, next) => {
  const { title } = ctx.request.body;
  const { userId } = ctx.state.user;
  const { id } = ctx.request.params;
  try {
    // 检查文章标题是否已存在
    const res = await getArticleInfo({ id, userId, title });
    if (res) return ctx.app.emit('error', articleAlreadyExists, ctx);
  } catch (err) {
    return ctx.app.emit('error', createArticleError, ctx);
  }

  await next();
};

module.exports = {
  verifyArticleTitle,
};
