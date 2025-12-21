const { DataTypes } = require('sequelize');

const sequelize = require('../db/sequelize');

const Comment = sequelize.define('comment', {
  articleId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '文章ID，外键关联文章表',
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '评论者ID，外键关联用户表',
  },
  level: {
    type: DataTypes.TINYINT,
    allowNull: false,
    comment: '评论级别，1表示一级评论，2表示二级评论',
  },
  rootCommentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '所属一级评论ID',
  },
  replyToUserId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '回复的用户ID',
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: '评论内容',
  },
  isTop: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: '是否置顶一级评论，true 表示置顶，false 表示未置顶',
  },
});

Comment.associate = models => {
  // 一条评论属于一篇文章
  Comment.belongsTo(models.article, {
    foreignKey: 'articleId',
    as: 'article',
    onDelete: 'CASCADE', // 删除文章时，删除该文章下的所有评论
  });

  // 一条评论属于一个用户
  Comment.belongsTo(models.user, {
    foreignKey: 'userId',
    as: 'user',
    onDelete: 'SET NULL', // 删除用户时，将评论表的 userId 设置为 null
  });
};

module.exports = Comment;
