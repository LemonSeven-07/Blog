const { sequelize } = require('../model/index');

const {
  createArticle,
  findArticle,
  findOneArticle,
  updateArticleViewCount,
  removeComment,
  removeArticle,
  updateArticle,
  outputArticle,
} = require('../service/article.service');

const {
  createArticleError,
  findArticleError,
  deleteArticleError,
  articleUpdateError,
  outputArticlesError,
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
    const { categoryId, keyword, tag, order, pageNum = 1, pageSize = 10 } = ctx.query;
    const { userId } = ctx.state.user;
    try {
      const res = await findArticle({
        categoryId,
        keyword,
        tag,
        userId,
        order,
        pageNum,
        pageSize,
      });
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
      const res = await findOneArticle(id);
      if (!res) {
        return ctx.app.emit('error', findArticleError, ctx);
      }
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

  async update(ctx) {
    const { id } = ctx.params;
    const { categoryId, content, tagList, title } = ctx.request.body;
    const transaction = await sequelize.transaction();
    try {
      const res = await updateArticle({ id, categoryId, content, tagList, title }, transaction);
      if (!res) {
        await transaction.rollback();
        return ctx.app.emit('error', articleUpdateError, ctx);
      }

      await transaction.commit();
      ctx.body = {
        code: '200',
        data: null,
        message: '修改成功',
      };
    } catch (err) {
      await transaction.rollback();
      ctx.app.emit('error', articleUpdateError, ctx);
    }
  }

  async output(ctx) {
    const { ids } = ctx.query;
    try {
      const res = await outputArticle(ids);
      if (!res.length) return ctx.app.emit('error', outputArticlesError, ctx);

      ctx.body = {
        code: '200',
        data: res,
        message: '导出成功',
      };
    } catch (err) {
      ctx.app.emit('error', outputArticlesError, ctx);
    }
  }

  async upload(ctx) {
    ctx.body = {
      code: '200',
      data: null,
      message: '导入成功',
    };
  }
}

module.exports = new articleController();
