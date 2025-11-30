const { DataTypes } = require('sequelize');

const sequelize = require('../db/sequelize');

const Article = sequelize.define(
  'article',
  {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: '文章标题',
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: '文章内容',
    },
    summary: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: '文章摘要',
    },
    coverImage: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: '文章封面',
    },
    authorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '文章作者ID',
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '文章分类ID',
    },
    viewCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '浏览量',
    },
    favorite_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '收藏量',
    },
  },
  {
    paranoid: false, // 🚫 覆盖全局配置，使用硬删除
  },
);

// associate 解决循环依赖问题。当模型 A 关联模型 B，同时模型 B 又关联模型 A 时，associate 可以延迟关联的执行，避免循环引用报错。
Article.associate = models => {
  // 文章可以有多个评论
  Article.hasMany(models.comment, {
    foreignKey: 'article_id', // 评论表的外键字段
    as: 'comments', // 设置别名，便于访问
    onDelete: 'CASCADE', // 删除文章时，自动删除相关的评论
  });

  // 文章可以有多个标签
  Article.hasMany(models.tag, {
    foreignKey: 'article_id',
    onDelete: 'CASCADE',
  });

  // 文章属于一个分类
  Article.belongsTo(models.category, {
    as: 'category',
    foreignKey: 'category_id',
    onDelete: 'SET NULL', // 删除分类时，将文章的 categoryId 设置为 null
    comment: '文章分类ID',
  });
};

module.exports = Article;
