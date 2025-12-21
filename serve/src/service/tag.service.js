const { Sequelize } = require('sequelize');

const { tag: Tag, article: Article, category: Category } = require('../model/index'); // 引入 index.js 中的 db 对象，包含所有模型

class TagService {
  /**
   * @description: 查找标签
   * @param {*} name 标签名
   * @return {*}
   */
  async getTagByName(name) {
    const res = await Tag.findOne({
      where: { name },
    });
    return res ? res.dataValues : null;
  }

  /**
   * @description: 创建标签
   * @param {*} name 标签名
   * @return {*}
   */
  async createTag(name) {
    const res = await Tag.create({ name });
    return res ? res.dataValues : null;
  }

  /**
   * @description: 查询所有标签
   * @return {*}
   */
  async findAllTags() {
    const res = await Tag.findAll({
      order: [['createdAt', 'DESC']],
    });

    return res;
  }

  /**
   * @description: 通过文章分类获取对应的文章标签列表
   * @param {*} categoryId 分类ID
   * @return {*}
   */
  async findTagsByCategoryId(categoryId) {
    // 查出指定分类下的所有标签，每个标签只出现一次，同时统计这个标签关联的文章数量；只统计，不返回文章或中间表字段。
    const tags = await Tag.findAll({
      include: [
        {
          // 查询每个标签时，把关联的文章也查出来
          model: Article,
          as: 'articles',
          required: true, // 只有关联了文章的标签才会被查询出来
          attributes: [], // 不查询文章字段
          through: { attributes: [] }, // 不查询中间表字段
          include: [
            {
              // 查询关联文章的分类表
              model: Category,
              as: 'category',
              required: true, // 只有关联了分类的文章才会被查询出来
              attributes: [], // 不查询分类字段
              where: { id: categoryId },
            },
          ],
        },
      ],
      group: ['Tag.id'], // 标签去重
      attributes: [
        'id',
        'name',
        [Sequelize.fn('COUNT', Sequelize.col('articles.id')), 'articleCount'],
      ], // 只查询标签字段
    });

    return tags;
  }
}

module.exports = new TagService();
