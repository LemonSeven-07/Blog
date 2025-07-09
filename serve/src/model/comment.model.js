const { DataTypes } = require('sequelize');
const moment = require('moment');

const seq = require('../db/seq');
const User = require('./user.model');

const Comment = seq.define(
  'comment',
  {
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: '评论/回复的文本内容',
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
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
    commentType: {
      type: DataTypes.ENUM('comment', 'reply'),
      allowNull: false,
      defaultValue: 'comment',
      comment: 'comment：一级评论，reply：对评论的回复',
    },
    parentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '一级评论的ID，回复评论时为null',
    },
    replyToUserId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '回复的用户ID，如果是一级评论则为null',
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      get() {
        return moment(this.getDataValue('createdAt')).format('YYYY-MM-DD HH:mm:ss');
      },
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      get() {
        return moment(this.getDataValue('updatedAt')).format('YYYY-MM-DD HH:mm:ss');
      },
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
  },
);

Comment.belongsTo(User, {
  foreignKey: 'userId',
  as: 'author',
});

Comment.belongsTo(User, {
  foreignKey: 'replyToUserId',
  as: 'replyToUser',
});

Comment.belongsTo(Comment, {
  foreignKey: 'parentId',
  as: 'parentComment',
  foreignKeyConstraint: true,
  onDelete: 'cascade', // 添加级联删除
});

Comment.hasMany(Comment, {
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

// Comment.sync({ force: true })
//   .then(() => {
//     console.log('评论表创建成功');
//   })
//   .catch(err => {
//     console.log('评论表创建失败', err);
//   });
module.exports = Comment;
