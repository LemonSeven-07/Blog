const { Op, col } = require('sequelize');

const { comment: Comment, user: User } = require('../model/index'); // 引入 index.js 中的 db 对象，包含所有模型

class CommentService {
  async sendComment({
    authorId,
    articleId,
    content,
    userId,
    entityType,
    entityId,
    parentId,
    replyToUserId,
  }) {
    const commentData = {};
    authorId && Object.assign(commentData, { authorId });
    articleId && Object.assign(commentData, { articleId });
    content && Object.assign(commentData, { content });
    userId && Object.assign(commentData, { userId });
    entityType && Object.assign(commentData, { entityType });
    entityId && Object.assign(commentData, { entityId });
    parentId && Object.assign(commentData, { parentId });
    replyToUserId && Object.assign(commentData, { replyToUserId });
    const res = await Comment.create(commentData);

    return res ? res.dataValues : null;
  }

  async removeComment(id) {
    const comment = await Comment.findOne({
      where: {
        id,
      },
    });
    if (!comment) return false;

    const res = await comment.destroy();
    return res ? res.dataValues : null;
  }

  async findComment({ id, entityId, entityType }) {
    const whereOpt = { entityId, entityType };
    if (id) whereOpt.id = id; // 如果有传入id，则查询特定评论
    // 查询所有一级评论和其回复
    const res = await Comment.findAll({
      // 1. 定义查询条件
      where: whereOpt,
      paranoid: false,
      // 2. 定义关联模型和字段
      include: [
        // 2.1 关联评论作者信息
        {
          model: User, // 关联User模型
          as: 'author', // 使用在Comment模型中定义的关联别名
          attributes: ['id', 'username'], // 只返回用户的id和username字段
        },
        // 2.2 关联回复评论
        {
          model: Comment, // 关联Comment模型自身(自关联)
          as: 'replies', // 使用在Comment模型中定义的关联别名
          paranoid: false,
          // 2.2.1 嵌套关联：回复的作者信息
          include: [
            {
              model: User, // 关联User模型
              as: 'author', // 回复的作者
              attributes: ['id', 'username'], // 只返回必要字段
            },
            // 2.2.2 嵌套关联：回复的目标用户
            {
              model: User, // 再次关联User模型
              as: 'replyToUser', // 回复的目标用户
              attributes: ['id', 'username'],
            },
          ],
          // 2.2.3 回复的排序规则
          order: [['createdAt', 'ASC']], // 回复：旧→新（保证对话顺序）
        },
      ],
      // 3. 主查询的排序规则
      order: [['createdAt', 'DESC']], // // 一级评论：新→旧
    });

    // 将每个实例转换为纯对象
    const plainComments = res.map(comment => comment.get({ plain: true })) || [];
    return plainComments;
  }

  async updateNotice({ ids, notice, hide }) {
    const newComment = {};

    notice !== undefined && Object.assign(newComment, { notice });
    hide !== undefined && Object.assign(newComment, { hide });
    // 如果未读消息数据不显示，则自动标记为已读
    if (hide === true) newComment.notice = true;

    // 当数据库里hide或notice字段与传入的值不同时，才更新
    const res = await Comment.update(newComment, {
      where: {
        id: ids,
        [Op.or]: [
          { hide: { [Op.ne]: newComment.hide } },
          { notice: { [Op.ne]: newComment.notice } },
        ],
      },
    });

    return res[0] > 0 ? res[0] : false;
  }

  async findUnreadNotice(userId) {
    const count = await Comment.count({
      where: {
        // 消息通知不显示自己评论自己和自己回复自己的通知
        [Op.and]: [
          { authorId: userId },
          {
            [Op.or]: [
              {
                entityType: 'post',
                authorId: { [Op.ne]: col('userId') },
              },
              {
                entityType: 'comment',
                [Op.and]: [
                  { replyToUserId: userId }, // 回复的目标用户是当前用户
                  { userId: { [Op.ne]: col('replyToUserId') } },
                ],
              },
            ],
          },
        ],
        notice: false, // 未读消息
        hide: false, // 显示状态
      },
    });

    return count ? count : 0;
  }

  async findNotice({ userId, type, pageNum, pageSize }) {
    const whereOpt = {
      authorId: userId,
      userId: {
        [Op.or]: {
          [Op.ne]: userId,
          [Op.is]: null,
        }, // 确保不是自己的评论(包含已删除用户的评论)
      },
      hide: false, // 显示状态
    };
    if (type === 'unread') {
      whereOpt.notice = false; // 未读消息
    } else if (type === 'read') {
      whereOpt.notice = true; // 已读消息
    }

    const { count, rows } = await Comment.findAndCountAll({
      where: whereOpt,
      include: [
        // 关联评论作者信息
        {
          model: User, // 关联User模型
          as: 'author', // 使用在Comment模型中定义的关联别名
          required: false,
          attributes: ['id', 'username'], // 只返回用户的id和username字段
        },
      ],
      order: [['createdAt', 'DESC']], // 一级评论：新→旧
      limit: pageSize * 1, // 每页条数，转换为整数
      offset: (pageNum - 1) * pageSize, // 偏移量，转换为整数
      paranoid: false,
    });

    const safeComments =
      rows.map(comment => {
        const plainComment = comment.get({ plain: true });
        if (plainComment.deletedAt) {
          return {
            ...plainComment,
            content: '该评论已被删除',
          };
        } else {
          return plainComment;
        }
      }) || [];
    return {
      pageNum,
      pageSize,
      total: count,
      list: safeComments,
    };
  }
}
module.exports = new CommentService();
