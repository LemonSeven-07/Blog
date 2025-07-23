const { Sequelize } = require('sequelize');

const Category = require('../model/category.model');

class categoryService {
  async getCategoryInfo(name) {
    const res = await Category.findOne({
      where: {
        name,
      },
    });

    return res ? res.dataValues : null;
  }

  async createCategory(name) {
    const res = await Category.create({ name });
    return res ? res.dataValues : null;
  }

  async findCategory() {
    // 查询所有标签
    const res = await Category.findAll({
      attributes: ['id', 'name'],
      order: [
        ['id', 'ASC'], // ASC 表示升序，DESC 表示降序
      ],
    });

    // 返回查询结果
    return res;
  }
}

module.exports = new categoryService();
