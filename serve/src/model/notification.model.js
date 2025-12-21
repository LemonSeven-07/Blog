const { DataTypes } = require('sequelize');

const sequelize = require('../db/sequelize');

const Notification = sequelize.define('notification', {
  fromUserId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '通知的发送者ID，外键关联用户表',
  },
  toUserId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '通知的接收者ID，外键关联用户表',
  },
  commentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '关联的评论 ID，如果是评论相关通知，则必填',
  },
  articleId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '关联的文章 ID',
  },
  type: {
    type: DataTypes.TINYINT,
    allowNull: false,
    comment: '通知类型，1表示评论，2表示回复，3表示收藏，4表示系统消息',
  },
  content: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: '通知内容，描述具体通知的文字内容',
  },
  targetType: {
    type: DataTypes.TINYINT,
    allowNull: false,
    comment: '通知目标类型，1表示文章，2表示评论',
  },
  targetId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '通知目标ID，指向文章或评论ID',
  },
  isRead: {
    type: DataTypes.TINYINT,
    defaultValue: 0,
    comment: '是否已读，0表示未读，1表示已读',
  },
});

// associate 解决循环依赖问题。当模型 A 关联模型 B，同时模型 B 又关联模型 A 时，associate 可以延迟关联的执行，避免循环引用报错。
Notification.associate = models => {
  // 🔵 通知关联的文章（articleId）
  Notification.belongsTo(models.user, {
    foreignKey: 'fromUserId',
    as: 'sender',
    onDelete: 'SET NULL', // 删除用户时，将通知表的 fromUserId 设置为 null，通知记录保留，但显示为“已注销用户”
  });

  // 🔵 通知接收者：用户（toUserId）
  Notification.belongsTo(models.user, {
    foreignKey: 'toUserId',
    as: 'receiver',
    onDelete: 'CASCADE', // 删除用户时，删除所有该用户的通知记录
  });

  // 🔵 通知关联的文章（articleId）
  Notification.belongsTo(models.article, {
    foreignKey: 'articleId',
    as: 'article',
    onDelete: 'SET NULL', // 文章删除时，通知记录仍保留，可以显示为“文章已删除”
  });

  // 🔵 通知关联的评论（commentId）
  Notification.belongsTo(models.comment, {
    foreignKey: 'commentId',
    as: 'comment',
    onDelete: 'SET NULL', // 评论删除时，通知记录仍保留，但显示为“评论已删除”
  });
};

module.exports = Notification;
