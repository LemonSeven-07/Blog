const { DataTypes } = require('sequelize');

const sequelize = require('../db/sequelize');

const Article = sequelize.define(
  'article',
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '文章作者ID，外键关联用户表',
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '文章分类ID，外键关联分类表',
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: '文章标题',
    },
    summary: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: '文章摘要',
    },
    content: {
      type: DataTypes.TEXT('medium'),
      allowNull: false,
      comment: '文章内容',
    },
    coverImage: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: '文章封面',
    },
    viewCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '浏览量',
    },
    favoriteCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '收藏量',
    },
    commentCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '评论量',
    },
  },
  {
    paranoid: false, // 🚫 覆盖全局配置，使用硬删除
  },
);

// associate 解决循环依赖问题。当模型 A 关联模型 B，同时模型 B 又关联模型 A 时，associate 可以延迟关联的执行，避免循环引用报错。
Article.associate = models => {
  // 文章属于一个用户
  Article.belongsTo(models.user, {
    foreignKey: 'userId',
    as: 'user',
    onDelete: 'SET NULL', // 删除用户时，将文章的 userId 设置为 null
  });

  // 文章属于一个分类
  Article.belongsTo(models.category, {
    foreignKey: 'categoryId',
    as: 'category',
    onDelete: 'SET NULL', // 删除分类时，将文章的 categoryId 设置为 null
  });

  // 一篇文章可以有多个标签，一个标签也可以关联多篇文章。两者之间的关系由 ArticleTag 表维护
  Article.belongsToMany(models.tag, {
    through: models.articleTag,
    foreignKey: 'articleId',
    as: 'tags',
    onDelete: 'CASCADE', // 删除文章时，同时删除关联的文章标签记录
  });

  Article.hasMany(models.favorite, {
    foreignKey: 'articleId',
    as: 'favorites',
  });
};

module.exports = Article;
