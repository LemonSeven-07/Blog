const { loadMoreError, getCategoriesByFavoriteError } = require('../constant/err.type');

const {
  loadMoreFavoriteArticle,
  findCategoriesByFavoriteId,
} = require('../service/favorite.service');

class FavoriteController {
  /**
   * @description: 滚动查询收藏文章列表
   * @param {*} ctx 上下文对象
   * @return {*}
   */
  async getFavoriteArticles(ctx) {
    const {
      categoryId, // 文章分类ID
      lastId, // 上次请求的最后一条ID
      lastSortValue, // 上次的排序字段值
      limit = 10, // 单次滚动加载数量
    } = ctx.query;
    const { userId } = ctx.state.user;

    try {
      const res = await loadMoreFavoriteArticle({
        categoryId,
        lastId,
        lastSortValue,
        limit,
        userId,
      });

      ctx.body = {
        code: '200',
        data: res,
        message: '获取文章收藏列表成功',
      };
    } catch (err) {
      ctx.app.emit('error', loadMoreError, ctx);
    }
  }

  /**
   * @description: 查询收藏文章对应的所有分类
   * @param {*} ctx 上下文对象
   * @return {*}
   */
  async getCategoriesByFavorite(ctx) {
    const { userId } = ctx.state.user;
    try {
      const categories = await findCategoriesByFavoriteId(userId);

      ctx.body = {
        code: '200',
        message: '获取收藏文章对应的分类成功',
        data: categories,
      };
    } catch (err) {
      ctx.app.emit('error', getCategoriesByFavoriteError, ctx);
    }
  }
}

module.exports = new FavoriteController();
