const {
  sendComment,
  removeComment,
  findComment,
  updateNotice,
} = require('../service/comment.service');

const {
  commentError,
  deleteCommentError,
  findCommentError,
  updateNoticeError,
} = require('../constant/err.type');

const { restructureComments } = require('../utils/index');

class CommentController {
  async create(ctx) {
    ctx.request.body.entityType = 'post'; // 评论类型为文章一级评论
    ctx.request.body.userId = ctx.state.user.userId; // 获取当前登录用户的ID
    try {
      const res = await sendComment(ctx.request.body);
      if (!res) throw new Error();

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
    ctx.request.body.entityType = 'comment'; // 评论类型为评论回复
    ctx.request.body.userId = ctx.state.user.userId; // 获取当前登录用户的ID
    try {
      const res = await sendComment(ctx.request.body);
      if (!res) throw new Error();

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
      if (!res) throw new Error();

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

      let data = [];
      if (res.length) data = restructureComments(res);

      ctx.body = {
        code: '200',
        data,
        message: '查询成功',
      };
    } catch (error) {
      ctx.app.emit('error', findCommentError, ctx);
    }
  }

  async update(ctx) {
    const { id, notice, hide } = ctx.request.body; // 获取要查看通知消息id
    try {
      const res = await updateNotice({ id, notice, hide });
      if (!res) throw new Error();

      ctx.body = {
        code: '200',
        data: null,
        message: '消息通知修改成功',
      };
    } catch (error) {
      ctx.app.emit('error', updateNoticeError, ctx);
    }
  }
}

module.exports = new CommentController();
