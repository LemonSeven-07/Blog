const { DataTypes } = require('sequelize');

const sequelize = require('../db/sequelize');

const Comment = sequelize.define(
  'comment',
  {
    articleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '文章ID',
    },
    authorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '文章作者的ID',
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '发表该评论/回复的用户ID',
    },
    parentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '一级评论此字段为null，二级评论，则指向其父评论的ID',
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: '评论/回复的文本内容',
    },
    replyToUserId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '回复的用户ID，如果是一级评论则为null',
    },
    notice: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: '未读消息, true已读，false未读',
    },
    hide: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: '消息显示状态，true隐藏，false显示',
    },
    isTop: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: '是否为置顶评论，true 表示置顶，false 表示未置顶',
    },
  },
  {
    indexes: [
      {
        name: 'idx_parentId',
        fields: ['parent_id'],
      },
    ],
  },
);

Comment.associate = models => {
  // 关联评论与文章
  Comment.belongsTo(models.article, {
    // 评论属于文章
    foreignKey: 'article_id', // 使用 articleId 作为外键
    as: 'article', // 设置关联别名为 'article'
    onDelete: 'CASCADE', // 删除文章时，删除所有关联的评论
  });

  // 关联评论与用户（评论者）
  Comment.belongsTo(models.user, {
    foreignKey: 'user_id',
    as: 'commenter',
    onDelete: 'SET NULL',
  });

  // 关联评论的回复用户（如果是回复）
  Comment.belongsTo(models.user, {
    foreignKey: 'reply_to_user_id',
    as: 'replyToUser',
  });

  // 关联评论的父评论（一级评论没有父评论，二级评论会有父评论）
  Comment.belongsTo(models.comment, {
    foreignKey: 'parent_id',
    as: 'parentComment',
    foreignKeyConstraint: true,
    onDelete: 'cascade', // 删除父评论时，自动删除子评论
  });

  // 关联父评论到子评论（一级评论关联子评论）
  Comment.hasMany(models.comment, {
    foreignKey: 'parent_id',
    as: 'replies',
    foreignKeyConstraint: true,
    onDelete: 'cascade',
  });
};

module.exports = Comment;
