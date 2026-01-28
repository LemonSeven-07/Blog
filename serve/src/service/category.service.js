const { category: Category } = require('../model/index'); // 引入 index.js 中的 db 对象，包含所有模型
const { Op } = require('sequelize');

const { yyyymmddToDateTime } = require('../utils');

class CategoryService {
  /**
   * @description: 查找文章分类
   * @param {*} name 文章分类名
   * @param {*} slug 文章分类路由标识
   * @param {*} isTargetCategory true 查询指定分类，false排除指定分类
   * @return {*}
   */
  async getCategoryInfo({ id, name, slug }, isTargetCategory = true) {
    const whereOpt = {};
    if (isTargetCategory) {
      id && Object.assign(whereOpt, { id });
    } else {
      id && Object.assign(whereOpt, { id: { [Op.ne]: id } });
    }
    name && Object.assign(whereOpt, { name });
    slug && Object.assign(whereOpt, { slug });
    const res = await Category.findOne({
      where: whereOpt,
    });

    return res ? res.dataValues : null;
  }

  /**
   * @description: 创建分类
   * @param {*} name 文章分类名
   * @param {*} slug 文章分类路由标识
   * @param {*} icon 文章分类图标
   * @param {*} transaction sequelize 事务对象
   * @return {*}
   */
  async createCategory({ name, slug, icon }, transaction) {
    const res = await Category.create(
      { name, slug, icon },
      {
        transaction,
      },
    );
    return res ? res.dataValues : null;
  }

  /**
   * @description: 查询分类
   * @param {*} pageNum 页数
   * @param {*} pageSize 每页数据量
   * @param {*} name 分类名称
   * @param {*} createDate 分类创建时间
   * @return {*}
   */
  async findCategories({ pageNum, pageSize, name, createDate }) {
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

    const { count, rows } = await Category.findAndCountAll({
      order: [
        ['createdAt', 'DESC'], // ASC 表示升序，DESC 表示降序
      ],
      limit: pageSize * 1,
      offset: (pageNum - 1) * pageSize,
      where: whereOpt,
      attributes: ['id', 'name', 'slug', 'icon', 'createdAt'],
    });

    return {
      total: count,
      list: rows,
    };
  }

  /**
   * @description: 更新分类
   * @param {*} id 分类id
   * @param {*} name 分类名
   * @param {*} slug 分类路由标识
   * @param {*} icon 分类图标
   * @param {*} transaction sequelize 事务对象
   * @return {*}
   */
  async updateCategory({ id, name, slug, icon }, transaction) {
    const res = await Category.update(
      { name, slug, icon },
      {
        where: { id },
        transaction,
      },
    );
    return res[0] > 0 ? true : false;
  }

  /**
   * @description: 删除分类
   * @param {number[]} ids 分类ids
   * @param {*} transaction sequelize 事务对象
   * @return {*}
   */
  async removeCategory(ids, transaction) {
    const res = await Category.destroy({
      where: {
        id: ids,
      },
      transaction,
    });
    return res > 0 ? true : false;
  }
}

module.exports = new CategoryService();
