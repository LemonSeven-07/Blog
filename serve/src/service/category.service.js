const { category: Category } = require('../model/index'); // 引入 index.js 中的 db 对象，包含所有模型

class categoryService {
  /**
   * @description: 查找文章分类
   * @param {*} name 文章分类名
   * @return {*}
   */
  async getCategoryInfo(name) {
    const res = await Category.findOne({
      where: {
        name,
      },
    });

    return res ? res.dataValues : null;
  }

  /**
   * @description: 创建分类
   * @param {*} name 文章分类名
   * @return {*}
   */
  async createCategory(name) {
    const res = await Category.create({ name });
    return res ? res.dataValues : null;
  }

  /**
   * @description: 查找分类列表
   * @return {*}
   */
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
