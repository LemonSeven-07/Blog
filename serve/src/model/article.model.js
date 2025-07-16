const moment = require('moment');
const { DataTypes } = require('sequelize');

const seq = require('../db/seq');

const Article = seq.define('article', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '创建文章用户ID',
  },
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
  viewCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '浏览量',
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: () => moment().format('YYYY-MM-DD HH:mm:ss'),
    get() {
      const rawValue = this.getDataValue('createdAt');
      return moment(rawValue).format('YYYY-MM-DD HH:mm:ss');
    },
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: () => moment().format('YYYY-MM-DD HH:mm:ss'),
    get() {
      const rawValue = this.getDataValue('updatedAt');
      return moment(rawValue).format('YYYY-MM-DD HH:mm:ss');
    },
  },
});

// associate 解决循环依赖问题。当模型 A 关联模型 B，同时模型 B 又关联模型 A 时，associate 可以延迟关联的执行，避免循环引用报错。
Article.associate = models => {
  // 一篇文章（Article）可以拥有多个标签（Tag）
  // 外键存储在 Tag 表中（默认字段名是 articleId，指向 Article 的主键 id）
  // hasMany(models.tag) 会自动使用 tags 作为别名（全小写复数）
  Article.hasMany(models.tag);
  // 一篇文章（Article）可以属于多个分类（Category）
  // 外键存储在 Category 表中（默认字段名是 articleId，指向 Article.id）
  // hasMany(models.category) 会自动使用 categories 作为别名（全小写复数）
  Article.hasMany(models.category);
  // 一篇文章（Article）可以有多个评论（Comment）
  // hasMany(models.category) 会自动使用 comments 作为别名（全小写复数）
  Article.hasMany(models.comment, {
    foreignKey: 'entityId',
    constraints: false, // 取消外键约束
    scope: {
      entityType: 'post', // 只关联文章评论
    },
    as: 'comments', // 设置别名为 comments
  });
};

module.exports = Article;
