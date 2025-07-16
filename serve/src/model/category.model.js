const moment = require('moment');
const { DataTypes } = require('sequelize');

const seq = require('../db/seq');

const Category = seq.define('category', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: '分类名称',
  },
  articleId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '文章ID',
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
Category.associate = models => {
  // 定义 Category 与 Article 的多对一关系，外键 articleId 存储在 Tag 表中
  // 查询时：通过 category.article 访问关联的文章
  Category.belongsTo(models.article, {
    as: 'article',
    foreignKey: 'articleId',
    constraints: false, // 显式禁用
  });
};

module.exports = Category;
