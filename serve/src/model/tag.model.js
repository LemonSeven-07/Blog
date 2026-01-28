const { DataTypes } = require('sequelize');

const sequelize = require('../db/sequelize');

const Tag = sequelize.define(
  'tag',
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      comment: '标签名称，唯一',
    },
    isBuiltin: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: '是否系统内置标签',
    },
  },
  {
    paranoid: false, // 🚫 覆盖全局配置，使用硬删除
  },
);

// associate 解决循环依赖问题。当模型 A 关联模型 B，同时模型 B 又关联模型 A 时，associate 可以延迟关联的执行，避免循环引用报错。
Tag.associate = models => {
  // 一个标签可以属于多篇文章，一篇文章可以有多个标签，两者之间的关系由 ArticleTag 表维护
  Tag.belongsToMany(models.article, {
    through: models.articleTag,
    foreignKey: 'tagId',
    as: 'articles',
    onDelete: 'CASCADE', // 删除标签时，同时删除关联的文章标签记录
  });
};

module.exports = Tag;
