const Comment = require('../model/comment.model');
const User = require('../model/user.model');

class CommentService {
  async sendComment({
    content,
    userId,
    entityType,
    entityId,
    commentType,
    parentId,
    replyToUserId,
  }) {
    const commentData = {};
    content && Object.assign(commentData, { content });
    userId && Object.assign(commentData, { userId });
    entityType && Object.assign(commentData, { entityType });
    entityId && Object.assign(commentData, { entityId });
    commentType && Object.assign(commentData, { commentType });
    parentId && Object.assign(commentData, { parentId });
    replyToUserId && Object.assign(commentData, { replyToUserId });
    const res = await Comment.create(commentData);

    return res ? res.dataValues : null;
  }

  async removeComment({ id, url }) {
    if (url === '/comment/reply') {
      // 删除回复评论
      const res = await Comment.destroy({
        where: {
          id,
          commentType: 'reply',
          entityType: 'comment', // 确保是对评论的回复
        },
      });
      return res > 0 ? true : false;
    } else {
      // 验证评论是否存在且是一级评论
      const parentComment = await Comment.findOne({
        where: {
          id,
          commentType: 'comment',
          entityType: 'post', // 确保是文章评论
        },
      });
      if (!parentComment) return false;

      // 删除一级评论
      const res = await parentComment.destroy();
      return res ? res.dataValues : null;
    }
  }

  async findComment({ id, entityId, entityType }) {
    const whereOpt = { entityId, entityType };
    if (id) whereOpt.id = id; // 如果有传入id，则查询特定评论
    // 查询所有一级评论和其回复
    const res = await Comment.findAll({
      where: whereOpt,
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username'], // 只返回需要的用户字段
        },
        {
          model: Comment,
          as: 'replies', // 关联回复
          include: [
            {
              model: User,
              as: 'author',
              attributes: ['id', 'username'], // 只返回需要的用户字段
            },
            {
              model: User,
              as: 'replyToUser',
              attributes: ['id', 'username'],
            },
          ],
          order: [['createdAt', 'ASC']], // 回复按时间正序
        },
      ],
      order: [['createdAt', 'DESC']], // 按创建时间降序排列
    });
    return res;
  }
}
module.exports = new CommentService();
