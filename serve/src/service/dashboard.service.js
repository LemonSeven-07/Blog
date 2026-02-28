const { Sequelize } = require('sequelize');

const { article: Article, tag: Tag, category: Category } = require('../model/index'); // 引入 index.js 中的 db 对象，包含所有模型

class DashboardService {
  /**
   * @description: 获取仪表盘统计数据
   * @param {*} userId
   * @return {*}
   */
  async getDashboardStats(userId) {
    // 根据 当前用户发布的文章的分类 进行分组查询，并统计每个分类的 总浏览量、总收藏量和文章数量
    const articleGroupInfo = await Article.findAll({
      attributes: [
        [Sequelize.fn('COUNT', Sequelize.col('article.id')), 'articleCount'], // 文章数量
        [Sequelize.literal('CAST(SUM(COALESCE(view_count, 0)) AS UNSIGNED)'), 'totalViews'], // 总浏览量，转换为数字
        [Sequelize.literal('CAST(SUM(COALESCE(favorite_count, 0)) AS UNSIGNED)'), 'totalFavorites'], // 总收藏量，转换为数字
      ],
      where: {
        userId, // 筛选出当前用户发布的文章
      },
      group: ['category_id'], // 按分类 ID 分组
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name'], // 获取分类的名称
          required: true, // 确保只返回有分类的文章
        },
      ],
    });

    // 根据当前用户发布的文章，使用 文章标签 来分组统计每个标签有多少文章
    const tagGroupInfo = await Tag.findAll({
      attributes: [
        'id',
        'name', // 标签名称
        [Sequelize.fn('COUNT', Sequelize.col('articles.id')), 'articleCount'], // 计算每个标签的文章数量
      ],
      include: [
        {
          model: Article,
          as: 'articles', // 关联到 'articles' 别名
          attributes: [], // 不需要返回文章的其他字段
          where: { userId }, // 过滤出当前用户发布的文章
          through: {
            attributes: [], // 不需要返回中间表的字段（articleId 和 tagId）
          },
        },
      ],
      group: ['tag.id'], // 按标签 ID 分组
      raw: true, // 返回原始结果
    });

    // 查询分类数量
    const categoryCount = await Category.count();

    // 查询标签数量
    const tagCount = await Tag.count();

    return {
      articleGroupInfo,
      tagGroupInfo,
      categoryCount,
      tagCount,
    }; // 返回统计数据
  }
}

module.exports = new DashboardService();
