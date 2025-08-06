const { DataTypes } = require('sequelize');

const sequelize = require('../db/sequelize');

const Category = sequelize.define('category', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    comment: '分类名称',
  },
});

// associate 解决循环依赖问题。当模型 A 关联模型 B，同时模型 B 又关联模型 A 时，associate 可以延迟关联的执行，避免循环引用报错。
Category.associate = models => {
  // 定义 Category 与 Article 的一对多关系，外键 categoryId 存储在 Article 表中
  // hasMany(models.article) 会自动使用 articles 作为别名（全小写复数）
  Category.hasMany(models.article);

  // 定义 Category 与 Tag 的一对多关系，外键 categoryId 存储在 Tag 表中
  // hasMany(models.tag) 会自动使用 tags 作为别名（全小写复数）
  Category.hasMany(models.tag);
};

module.exports = Category;
