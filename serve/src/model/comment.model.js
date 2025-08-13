const { DataTypes } = require('sequelize');

const sequelize = require('../db/sequelize');

const Comment = sequelize.define(
  'comment',
  {
    authorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '文章作者的ID',
    },
    articleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '文章ID',
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: '评论/回复的文本内容',
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '发表该评论/回复的用户ID',
    },
    entityType: {
      type: DataTypes.ENUM('post', 'comment'),
      allowNull: false,
      comment: 'post：文章评论，comment：对评论的回复',
    },
    entityId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '文章评论时为文章ID，对评论的回复时为评论ID',
    },
    parentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '一级评论的ID，评论时为null',
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
  },
  {
    indexes: [
      {
        name: 'idx_entityType_entityId',
        fields: ['entityType', 'entityId'],
      },
      {
        name: 'idx_parentId',
        fields: ['parentId'],
      },
    ],
    paranoid: true, // 软删除
  },
);

Comment.associate = models => {
  Comment.belongsTo(models.user, {
    foreignKey: 'userId',
    as: 'author',
    onDelete: 'SET NULL',
  });

  Comment.belongsTo(models.user, {
    foreignKey: 'replyToUserId',
    as: 'replyToUser',
  });

  Comment.belongsTo(models.comment, {
    foreignKey: 'parentId',
    as: 'parentComment',
    foreignKeyConstraint: true,
    onDelete: 'cascade', // 添加级联删除
  });

  Comment.hasMany(models.comment, {
    // 表示在 comments 表中用于存储关联关系的字段
    // 子评论将通过 parentId 字段关联到父评论
    // 对应数据库中的 parentId 列
    foreignKey: 'parentId',
    // 定义从父评论访问子评论时使用的名称
    // 允许通过 getReplies()、setReplies() 等方法操作关联数据
    as: 'replies',
    // 在数据库层面创建真正的外键约束
    // 确保数据完整性（不能插入无效的 parentId）
    // 必须为 true 才能使 onDelete 生效
    foreignKeyConstraint: true,
    // 当父评论被删除时，自动删除所有关联的子评论
    // 这是数据库级别的约束
    onDelete: 'cascade',
  });

  Comment.belongsTo(models.article, {
    foreignKey: 'entityId',
    constraints: false, // 取消外键约束
    scope: {
      entityType: 'post', // 只关联文章评论
    },
    as: 'article', // 设置别名为 article
  });
};

module.exports = Comment;
