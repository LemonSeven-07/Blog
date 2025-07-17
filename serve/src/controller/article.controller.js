const { sequelize } = require('../model/index');

const {
  createArticle,
  findArticle,
  findOneArticle,
  updateArticleViewCount,
  removeComment,
  removeArticle,
} = require('../service/article.service');

const {
  createArticleError,
  findArticleError,
  deleteArticleError,
} = require('../constant/err.type');

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
    const { type = 1 } = ctx.query;
    try {
      const res = await findOneArticle({ id });
      if (!res) return ctx.app.emit('error', findArticleError, ctx);
      if (type === 1 && (await !updateArticleViewCount({ id, viewCount: res.viewCount }))) {
        return ctx.app.emit('error', findArticleError, ctx);
      }
      ctx.body = {
        code: '200',
        message: '获取文章详情成功',
        data: res,
      };
    } catch (err) {
      ctx.app.emit('error', findArticleError, ctx);
    }
  }

  async remove(ctx) {
    const { ids } = ctx.request.body;
    const transaction = await sequelize.transaction();
    try {
      await removeComment(ids, transaction);

      const res = await removeArticle(ids, transaction);
      if (!res) {
        await transaction.rollback();
        return ctx.app.emit('error', deleteArticleError, ctx);
      }

      await transaction.commit();
      ctx.body = {
        code: '200',
        message: '删除成功',
        data: null,
      };
    } catch (err) {
      await transaction.rollback();
      ctx.app.emit('error', deleteArticleError, ctx);
    }
  }
}

module.exports = new articleController();
