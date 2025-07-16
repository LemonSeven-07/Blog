const { createArticle, findArticle, findOneArticle } = require('../service/article.service');
const { createArticleError, findArticleError } = require('../constant/err.type');

class articleController {
  async create(ctx) {
    const { userId } = ctx.state.user;
    try {
      const res = await createArticle({ userId, ...ctx.request.body });
      if (!res) return ctx.app.emit('error', createArticleError, ctx);
      ctx.body = {
        code: '200',
        message: '文章创建成功',
        data: res,
      };
    } catch (err) {
      ctx.app.emit('error', createArticleError, ctx);
    }
  }

  async findAll(ctx) {
    const { pageNum = 1, pageSize = 10, keyword, tag, category } = ctx.query;
    const { userId } = ctx.state.user;
    try {
      const res = await findArticle({ pageNum, pageSize, keyword, tag, category, userId });
      ctx.body = {
        code: '200',
        message: '获取文章列表成功',
        data: res,
      };
    } catch (err) {
      ctx.app.emit('error', findArticleError, ctx);
    }
  }

  async findById(ctx) {
    const { id } = ctx.params;
    try {
      const res = await findOneArticle({ id });
      if (!res) return ctx.app.emit('error', findArticleError, ctx);
      ctx.body = {
        code: '200',
        message: '获取文章详情成功',
        data: res,
      };
    } catch (err) {
      ctx.app.emit('error', findArticleError, ctx);
    }
  }
}

module.exports = new articleController();
