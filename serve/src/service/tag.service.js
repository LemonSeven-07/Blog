const { Sequelize, Op } = require('sequelize');

const { tag: Tag, article: Article, category: Category } = require('../model/index'); // 引入 index.js 中的 db 对象，包含所有模型

const { yyyymmddToDateTime } = require('../utils/index');

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
   * @param {*} role 角色权限
   * @return {*}
   */
  async createTag(name, role) {
    const newTag = { name, isBuiltin: false };
    if (role === 1) newTag.isBuiltin = true;
    const res = await Tag.create(newTag);
    return res ? res.dataValues : null;
  }

  /**
   * @description: 查询标签
   * @param {*} pageNum 每页数量
   * @param {*} pageSize 当前页
   * @param {*} name 标签名
   * @param {*} createDate 标签创建时间
   * @param {*} isBuiltin 是否内置标签
   * @return {*}
   */
  async findAllTags({ pageNum, pageSize, name, createDate, isBuiltin }) {
    const whereOpt = {};
    // 标签名称模糊查询
    if (name) Object.assign(whereOpt, { name: { [Op.like]: `%${name}%` } });

    // 标签创建起止时间
    if (createDate) {
      const [start, end] = createDate.split(',') || [];
      if (start && end) {
        Object.assign(whereOpt, {
          createdAt: {
            [Op.between]: [yyyymmddToDateTime(start), yyyymmddToDateTime(end, true)],
          },
        });
      } else if (start) {
        Object.assign(whereOpt, {
          createdAt: {
            [Op.gte]: yyyymmddToDateTime(start), // 大于等于开始时间
          },
        });
      } else if (end) {
        Object.assign(whereOpt, {
          createdAt: {
            [Op.lte]: yyyymmddToDateTime(end, true), // 小于等于结束时间
          },
        });
      }
    }

    // 是否内置标签
    if (isBuiltin !== undefined) Object.assign(whereOpt, { isBuiltin });

    const { count, rows } = await Tag.findAndCountAll({
      order: [
        ['createdAt', 'DESC'], // ASC 表示升序，DESC 表示降序
      ],
      limit: pageSize * 1,
      offset: (pageNum - 1) * pageSize,
      where: whereOpt,
      attributes: ['id', 'name', 'isBuiltin', 'createdAt'],
    });

    return {
      total: count,
      list: rows,
    };
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

  /**
   * @description: 获取标签信息
   * @param {*} name
   * @return {*}
   */
  async getTagInfo({ name }) {
    const res = await Tag.findOne({
      where: { name },
    });
    return res ? res.dataValues : null;
  }

  /**
   * @description: 更新标签
   * @param {*} id 标签id
   * @param {*} name 标签名
   * @return {*}
   */
  async updateTag({ id, name }) {
    const res = await Tag.update(
      { name },
      {
        where: { id },
      },
    );
    return res[0] > 0 ? true : false;
  }

  /**
   * @description: 删除标签
   * @param {number[]} ids 标签ids
   * @return {*}
   */
  async removeTag(ids) {
    const res = await Tag.destroy({
      where: {
        id: ids,
      },
    });
    return res > 0 ? true : false;
  }

  /**
   * @description: 判断标签是否是系统内置标签
   * @param {*} idOrIds 标签 ID 或 标签 ID 数组
   * @return {*}
   */
  async isSystemTag(idOrIds) {
    if (Array.isArray(idOrIds)) {
      // 处理多个标签ID
      const tags = await Tag.findAll({
        where: {
          id: idOrIds,
          is_builtin: true,
        },
      });

      return tags.length ? true : false;
    } else {
      // 处理单个标签ID
      const tag = await Tag.findOne({
        where: { id: idOrIds, is_builtin: true }, // 查询是否为系统内置标签
      });

      return tag ? true : false;
    }
  }
}

module.exports = new TagService();
