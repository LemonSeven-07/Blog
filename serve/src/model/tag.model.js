const { DataTypes } = require('sequelize');

const seq = require('../db/seq');

const Tag = seq.define('tag', {
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
});

// associate 解决循环依赖问题。当模型 A 关联模型 B，同时模型 B 又关联模型 A 时，associate 可以延迟关联的执行，避免循环引用报错。
Tag.associate = models => {
  // 定义 Tag 与 Article 的多对一关系，外键 articleId 存储在 Tag 表中
  // 查询时：通过 tag.article 访问关联的文章
  Tag.belongsTo(models.article, {
    as: 'article',
    foreignKey: 'articleId',
    constraints: false, // 显式禁用
  });

  // 定义 Tag 与 Category 的多对一关系，外键 categoryId 存储在 Tag 表中
  // 查询时：通过 tag.category 访问关联的文章
  Tag.belongsTo(models.category, {
    as: 'category',
    foreignKey: 'categoryId',
    constraints: false, // 显式禁用
  });
};

module.exports = Tag;
