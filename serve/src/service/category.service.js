const { Sequelize } = require('sequelize');

const Category = require('../model/category.model');

class categoryService {
  async groupFindCategories() {
    // 查询所有标签
    const res = await Category.findAll({
      // 指定查询的字段
      attributes: [
        'name', // 选择 name 分类名字段
        // sequelize.fn('COUNT', sequelize.col('name')) → 定义聚合函数
        // 'count' → 指定返回结果的字段别名
        // sequelize.fn() → 第一个参数 'COUNT' 是 SQL 聚合函数相当于 SQL 中的 COUNT(name)，第二个参数是要计算的列
        [Sequelize.fn('COUNT', Sequelize.col('name')), 'count'], // 计算每个 name 的出现次数，别名设为 count
      ],
      // 按 name 分组（相同的 name 会被合并为一行）
      group: ['name'],
      // 按 count 降序排序（重复次数最多的排在最前面）
      // sequelize.literal() 允许直接插入原始 SQL 片段，不会经过 Sequelize 的转义处理
      // 这里的 'count' 是 SQL 中的列名（或别名），对应前面查询中通过 COUNT 聚合生成的 count 列
      order: [[Sequelize.literal('count'), 'DESC']],
      // 返回纯 JSON 数据（非 Sequelize 模型实例）禁用 Sequelize 实例化，提升性能
      raw: true,
    });

    // 返回查询结果
    return res;
  }
}

module.exports = new categoryService();
