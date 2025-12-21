const { DataTypes } = require('sequelize');

const sequelize = require('../db/sequelize');

const ArticleTag = sequelize.define(
  'articleTag',
  {
    articleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '文章ID，外键关联文章表',
    },
    tagId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '标签ID，外键关联标签表',
    },
  },
  {
    paranoid: false, // 🚫 覆盖全局配置，使用硬删除
  },
);

// associate 解决循环依赖问题。当模型 A 关联模型 B，同时模型 B 又关联模型 A 时，associate 可以延迟关联的执行，避免循环引用报错。
ArticleTag.associate = models => {
  ArticleTag.belongsTo(models.article, {
    foreignKey: 'articleId',
    as: 'article',
    onDelete: 'CASCADE', // 删除文章时，删除所有关联的文章标签记录
  });

  ArticleTag.belongsTo(models.tag, {
    foreignKey: 'tagId',
    as: 'tag',
    onDelete: 'CASCADE', // 删除标签时，删除所有关联的文章标签记录
  });
};

module.exports = ArticleTag;
