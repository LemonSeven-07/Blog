const { favorite: Favorite } = require('../model/index'); // 引入 index.js 中的 db 对象，包含所有模型
const { Op } = require('sequelize');

class FavoriteService {
  /**
   * @description: 收藏文章
   * @param {*} articleIds 文章id数组
   * @param {*} userId 操作用户id
   * @param {*} transaction sequelize 事务对象
   * @return {*}
   */
  async addArticleFavorite(articleIds, userId, transaction) {
    await Favorite.bulkCreate(
      articleIds.map(articleId => ({
        userId,
        articleId,
      })),
      {
        ignoreDuplicates: true, // 在批量插入数据时，如果遇到已存在（唯一键冲突）的记录，就自动跳过，不报错、不影响其他数据插入。
        transaction,
      },
    );
  }

  /**
   * @description: 取消收藏文章
   * @param {*} articleIds 文章id数组
   * @param {*} userId 操作用户id
   * @param {*} transaction sequelize 事务对象
   * @return {*}
   */
  async removeArticleFavorite(articleIds, userId, transaction) {
    await Favorite.destroy(
      {
        where: {
          userId,
          articleId: {
            [Op.in]: articleIds,
          },
        },
      },
      {
        transaction,
      },
    );
  }

  /**
   * @description: 查询已收藏文章
   * @param {*} articleIds 文章id数组
   * @param {*} userId 用户id
   * @return {*}
   */
  async findFavoritesByArticleId(articleIds, userId) {
    const existing = await Favorite.findAll({
      where: { userId, articleId: articleIds },
      attributes: ['articleId'],
    });

    return existing;
  }
}

module.exports = new FavoriteService();
