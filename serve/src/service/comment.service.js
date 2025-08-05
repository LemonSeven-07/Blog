const Comment = require('../model/comment.model');
const User = require('../model/user.model');

class CommentService {
  async sendComment({ authorId, content, userId, entityType, entityId, parentId, replyToUserId }) {
    const commentData = {};
    authorId && Object.assign(commentData, { authorId });
    content && Object.assign(commentData, { content });
    userId && Object.assign(commentData, { userId });
    entityType && Object.assign(commentData, { entityType });
    entityId && Object.assign(commentData, { entityId });
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
          entityType: 'comment', // 确保是对评论的回复
        },
      });
      return res > 0 ? true : false;
    } else {
      // 验证评论是否存在且是一级评论
      const parentComment = await Comment.findOne({
        where: {
          id,
          entityType: 'post', // 确保是文章一级评论
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

  async updateNotice({ id, notice, hide }) {
    const newComment = {};

    notice !== undefined && Object.assign(newComment, { notice });
    hide !== undefined && Object.assign(newComment, { hide });

    const res = await Comment.update(newComment, {
      where: {
        id,
      },
    });
    return res[0] > 0 ? true : false;
  }
}
module.exports = new CommentService();
