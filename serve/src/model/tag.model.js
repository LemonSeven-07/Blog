const { DataTypes } = require('sequelize');

const sequelize = require('../db/sequelize');

const Tag = sequelize.define(
  'tag',
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: '标签名称',
    },
    articleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '文章ID',
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '文章分类ID',
    },
  },
  {
    paranoid: false, // 🚫 覆盖全局配置，使用硬删除
  },
);

// associate 解决循环依赖问题。当模型 A 关联模型 B，同时模型 B 又关联模型 A 时，associate 可以延迟关联的执行，避免循环引用报错。
Tag.associate = models => {
  // 关联 Tag 与 Article（多对一关系）
  Tag.belongsTo(models.article, {
    as: 'article',
    foreignKey: 'article_id', // 与模型中定义的一致
    onDelete: 'CASCADE', // 删除标签时，删除文章的标签
  });

  // 关联 Tag 与 Category（多对一关系）
  Tag.belongsTo(models.category, {
    as: 'category',
    foreignKey: 'category_id', // 与模型中定义的一致
    onDelete: 'SET NULL', // 删除分类时，设置标签的 categoryId 为 NULL
  });
};

module.exports = Tag;
