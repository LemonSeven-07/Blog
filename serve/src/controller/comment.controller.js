const { sendComment, removeComment, findComment } = require('../service/comment.service');

const { commentError, deleteCommentError, findCommentError } = require('../constant/err.type');

class CommentController {
  async create(ctx) {
    ctx.request.body.commentType = 'comment'; // 一级评论
    ctx.request.body.entityType = 'post'; // 评论类型为文章评论
    ctx.request.body.userId = ctx.state.user.userId; // 获取当前登录用户的ID
    try {
      const res = await sendComment(ctx.request.body);
      if (!res) return ctx.app.emit('error', commentError, ctx);

      ctx.body = {
        code: '200',
        data: null,
        message: '操作成功',
      };
    } catch (error) {
      ctx.app.emit('error', commentError, ctx);
    }
  }

  async reply(ctx) {
    ctx.request.body.commentType = 'reply'; // 回复评论
    ctx.request.body.entityType = 'comment'; // 评论类型为评论回复
    ctx.request.body.userId = ctx.state.user.userId; // 获取当前登录用户的ID
    try {
      const res = await sendComment(ctx.request.body);
      if (!res) return ctx.app.emit('error', commentError, ctx);

      ctx.body = {
        code: '200',
        data: null,
        message: '操作成功',
      };
    } catch (error) {
      ctx.app.emit('error', commentError, ctx);
    }
  }

  async remove(ctx) {
    const { id } = ctx.request.body; // 获取要删除的评论ID
    const { url } = ctx.request; // 获取请求的URL
    try {
      const res = await removeComment({ id, url });
      if (!res) return ctx.app.emit('error', deleteCommentError, ctx);

      ctx.body = {
        code: '200',
        data: null,
        message: '删除成功',
      };
    } catch (error) {
      ctx.app.emit('error', deleteCommentError, ctx);
    }
  }

  async findAll(ctx) {
    const { id, entityId, entityType } = ctx.query; // 获取文章ID和评论类型
    try {
      // 查询所有一级评论和其回复
      const res = await findComment({ id, entityId, entityType });

      ctx.body = {
        code: '200',
        data: res,
        message: '查询成功',
      };
    } catch (error) {
      ctx.app.emit('error', findCommentError, ctx);
    }
  }
}

module.exports = new CommentController();
