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
  // 定义 Category 与 Article 的一对多关系，外键 categoryId 存储在 Article 表中
  // 文章属于分类
  Category.hasMany(models.article, {
    foreignKey: 'category_id', // 显式指定外键字段
    onDelete: 'SET NULL', // 删除分类时，将文章的 categoryId 设置为 null
  });

  // 定义 Category 与 Tag 的一对多关系，外键 categoryId 存储在 Tag 表中
  // 标签属于分类
  Category.hasMany(models.tag, {
    foreignKey: 'category_id', // 显式指定外键字段
    onDelete: 'SET NULL', // 删除分类时，将标签的 categoryId 设置为 null
  });
};

module.exports = Category;
