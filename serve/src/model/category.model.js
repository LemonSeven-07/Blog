const { DataTypes } = require('sequelize');

const sequelize = require('../db/sequelize');

const Category = sequelize.define(
  'category',
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      comment: '分类名称',
    },
  },
  {
    paranoid: false, // 🚫 覆盖全局配置，使用硬删除
  },
);

// associate 解决循环依赖问题。当模型 A 关联模型 B，同时模型 B 又关联模型 A 时，associate 可以延迟关联的执行，避免循环引用报错。
Category.associate = models => {
  // 一个分类下可以有多篇文章
  Category.hasMany(models.article, {
    foreignKey: 'categoryId',
    as: 'articles',
  });
};

module.exports = Category;
