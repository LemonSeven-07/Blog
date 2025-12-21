const { DataTypes } = require('sequelize');

const sequelize = require('../db/sequelize');

const Favorite = sequelize.define(
  'favorite',
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '收藏的用户ID',
    },
    articleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '收藏的文章ID',
    },
  },
  {
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'article_id'],
      },
    ],
    paranoid: false, // 🚫 覆盖全局配置，使用硬删除
  },
);

// associate 解决循环依赖问题。当模型 A 关联模型 B，同时模型 B 又关联模型 A 时，associate 可以延迟关联的执行，避免循环引用报错。
Favorite.associate = models => {
  Favorite.belongsTo(models.article, {
    foreignKey: 'articleId',
    as: 'article',
    onDelete: 'CASCADE', // 删除文章时，删除该文章下的所有收藏记录
  });

  Favorite.belongsTo(models.user, {
    foreignKey: 'userId',
    as: 'user',
    onDelete: 'CASCADE', // 删除用户时，删除该用户的所有收藏记录
  });
};

module.exports = Favorite;
