const {
  article: Article,
  tag: Tag,
  category: Category,
  user: User,
  favorite: Favorite,
} = require('../model/index'); // 引入 index.js 中的 db 对象，包含所有模型

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

  /**
   * @description: 滚动查询收藏文章列表
   * @param {*} categoryId 文章分类ID
   * @param {*} lastId 上次请求的最后一条ID
   * @param {*} lastSortValue 上次的排序字段值
   * @param {*} limit 单次滚动加载数量
   * @param {*} userId 用户ID
   * @return {*}
   */
  async loadMoreFavoriteArticle({ categoryId, lastId, lastSortValue, limit, userId }) {
    // 1. 构建查询条件对象
    const whereFavorite = { userId };
    // 如果有游标值（不是第一页请求）
    if (lastId && lastSortValue) {
      whereFavorite[Op.or] = [
        {
          createdAt: {
            [Op.lt]: lastSortValue, // 收藏时间小于游标时间
          },
        },
        {
          createdAt: lastSortValue, // 如果时间相同
          id: {
            [Op.lt]: lastId, // id 小于游标 id
          },
        },
      ];
    }

    // 2. 执行数据库查询
    const res = await Favorite.findAll({
      where: whereFavorite,
      limit: parseInt(limit), // 转换为数字类型
      include: [
        {
          model: Article,
          where: categoryId ? { categoryId } : {}, // 如果有分类条件，添加分类过滤
          as: 'article',
          attributes: {
            exclude: ['updatedAt', 'content'], // 不返回更新时间戳字段
          },
          include: [
            {
              model: Tag, // 关联 Tag 模型
              as: 'tags',
              attributes: ['id', 'name'], // 只返回 id name 字段
              through: { attributes: [] }, // 不返回中间表字段
            },
            {
              model: Category, // 关联 Tag 模型
              as: 'category',
              attributes: ['id', 'name'], // 只返回 id name 字段
              where: categoryId ? { id: categoryId } : {}, // 如果有传入 categoryId，则进行过滤
              required: !!categoryId, // 有 categoryId 就 inner join，否则 left join
            },
            {
              model: User,
              as: 'user',
              attributes: ['id', 'username'], // 只返回用户名和ID
            },
          ],
        },
      ],
      order: [
        ['createdAt', 'DESC'], // 按收藏时间倒序
        ['id', 'DESC'], // 如果时间相同，按 id 倒序
      ],
    });

    // 3. 计算下一次请求的游标值
    let lastRecord = null;
    if (res.length) {
      lastRecord = res[res.length - 1];
    }
    const nextCursor = lastRecord
      ? {
          lastId: lastRecord.id, // 记录最后一条的ID
          lastSortValue: lastRecord.createdAt, // 时间字符串
        }
      : null; // 如果没有数据了，返回null

    return {
      list: res,
      nextCursor, // 下一次请求的游标
      hasMore: res.length >= limit, // 是否还有更多数据
    };
  }

  /**
   * @description: 查询收藏文章对应的所有分类
   * @param {*} userId 用户id
   * @return {*}
   */
  async findCategoriesByFavoriteId(userId) {
    const categories = await Category.findAll({
      attributes: ['id', 'name'],
      include: [
        {
          model: Article,
          as: 'articles',
          required: true, // INNER JOIN 只有同时满足关联条件的数据，才会被返回
          attributes: [],
          include: [
            {
              model: Favorite,
              as: 'favorites',
              required: true, // INNER JOIN 只有同时满足关联条件的数据，才会被返回
              where: { userId },
              attributes: [],
            },
          ],
        },
      ],
      group: ['Category.id'],
    });

    return categories;
  }
}

module.exports = new FavoriteService();
