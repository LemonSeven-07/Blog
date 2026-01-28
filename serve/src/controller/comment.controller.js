const { redisClient } = require('../db/redis.js');

const {
  sendComment,
  removeComment,
  findComment,
  updateNotice,
  findUnreadNotice,
  findNotice,
} = require('../service/comment.service');

const {
  commentError,
  commentDeleteError,
  commentFindError,
  noticeUpdateError,
  findNoticeError,
} = require('../constant/err.type');

const { transformComments } = require('../utils/index');

class CommentController {
  /**
   * @description: 创建一级评论
   * @param {*} ctx 上下文对象
   * @return {*}
   */
  async create(ctx) {
    ctx.request.body.entityType = 'post'; // 评论类型为文章一级评论
    ctx.request.body.userId = ctx.state.user.userId; // 获取当前登录用户的ID
    try {
      const res = await sendComment(ctx.request.body);
      if (!res) throw new Error();

      // 发布评论，通知其他服务更新评论区
      await ctx.pubClient.publish(
        `comment:${res.articleId}`, // 发布到对应用户的频道
        JSON.stringify({
          ...res,
          type: 'ADD_COMMENT',
        }),
      );
      // 自己评论自己发布的文章或自己回复自己的评论无需消息通知
      if (res.authorId !== res.userId && !res.notice && !res.hide) {
        // 发布评论新增消息，通知其他服务更新评论数
        await ctx.pubClient.publish(
          `notify:${res.authorId}`, // 发布到对应用户的频道
          JSON.stringify({
            ...res,
            type: 'ADD_COMMENT_NOTIFY',
          }),
        );
      }

      ctx.body = {
        code: '200',
        data: null,
        message: '操作成功',
      };
    } catch (error) {
      ctx.app.emit('error', commentError, ctx);
    }
  }

  /**
   * @description: 创建二级评论
   * @param {*} ctx 上下文对象
   * @return {*}
   */
  async reply(ctx) {
    ctx.request.body.entityType = 'comment'; // 评论类型为评论回复
    ctx.request.body.userId = ctx.state.user.userId; // 获取当前登录用户的ID
    try {
      const res = await sendComment(ctx.request.body);
      if (!res) throw new Error();

      // 评论回复，通知其他服务更新评论区
      await ctx.pubClient.publish(
        `comment:${res.articleId}`, // 发布到对应用户的频道
        JSON.stringify({
          ...res,
          type: 'ADD_COMMENT',
        }),
      );
      // 自己评论自己发布的文章或自己回复自己的评论无需消息通知
      if (res.userId !== res.replyToUserId && !res.notice && !res.hide) {
        // 评论回复新增消息，通知其他服务更新评论数
        await ctx.pubClient.publish(
          `notify:${res.replyToUserId}`, // 发布到对应用户的频道
          JSON.stringify({
            ...res,
            type: 'ADD_COMMENT_NOTIFY',
          }),
        );
      }

      ctx.body = {
        code: '200',
        data: null,
        message: '操作成功',
      };
    } catch (error) {
      ctx.app.emit('error', commentError, ctx);
    }
  }

  /**
   * @description: 删除一级评论或二级评论
   * @param {*} ctx 上下文对象
   * @return {*}
   */
  async remove(ctx) {
    const { id } = ctx.request.body; // 获取要删除的评论ID
    try {
      const res = await removeComment(id);
      if (!res) throw new Error();

      // 删除评论，通知其他服务更新评论区
      await ctx.pubClient.publish(
        `comment:${res.articleId}`,
        JSON.stringify({
          ...res,
          type: 'DELETE_COMMENT',
        }),
      );
      // 自己评论自己发布的文章或自己回复自己的评论无需消息通知
      if (
        ((res.authorId !== res.userId && res.entityType === 'post') ||
          (res.userId !== res.replyToUserId && res.entityType === 'comment')) &&
        !res.notice &&
        !res.hide
      ) {
        // 发布评论删除消息，通知其他服务更新评论数
        await ctx.pubClient.publish(
          `notify:${res.replyToUserId ? res.replyToUserId : res.authorId}`,
          JSON.stringify({
            ...res,
            type: 'DELETE_COMMENT_NOTIFY',
          }),
        );
      }

      ctx.body = {
        code: '200',
        data: null,
        message: '删除成功',
      };
    } catch (error) {
      ctx.app.emit('error', commentDeleteError, ctx);
    }
  }

  /**
   * @description: 查询评论
   * @param {*} ctx 上下文对象
   * @return {*}
   */
  async findAll(ctx) {
    const { id, entityId, entityType } = ctx.query; // 获取文章ID和评论类型
    try {
      // 查询所有一级评论和其回复
      const res = await findComment({ id, entityId, entityType });

      let data = [];
      if (res.length) data = transformComments(res);

      ctx.body = {
        code: '200',
        data,
        message: '查询成功',
      };
    } catch (error) {
      ctx.app.emit('error', commentFindError, ctx);
    }
  }

  /**
   * @description: 修改未读消息通知状态/消息通知显示状态
   * @param {*} ctx 上下文对象
   * @return {*}
   */
  async update(ctx) {
    const { ids, notice, hide } = ctx.request.body; // 获取要查看通知消息id
    const { userId } = ctx.state.user; // 获取当前登录用户的ID
    try {
      const res = await updateNotice({ ids, notice, hide });
      if (!res) throw new Error();

      // 发布消息通知修改，通知当前用户更新未读消息数
      if (hide === true || notice === true) {
        // 未读 --》已读
        await ctx.pubClient.publish(
          `notify:${userId}`,
          JSON.stringify({
            step: res * -1,
            type: 'UPDATE_STATUS_NOTIFY',
          }),
        );
      } else if (hide === false && notice === false) {
        // 已读 --》未读
        await ctx.pubClient.publish(
          `notify:${userId}`,
          JSON.stringify({
            step: res,
            type: 'UPDATE_STATUS_NOTIFY',
          }),
        );
      }

      ctx.body = {
        code: '200',
        data: null,
        message: '消息通知修改成功',
      };
    } catch (error) {
      ctx.app.emit('error', noticeUpdateError, ctx);
    }
  }

  /**
   * @description: 获取未读消息数量
   * @param {*} ctx 上下文对象
   * @return {*}
   */
  async findUnreadCount(ctx) {
    const { userId } = ctx.state.user; // 获取当前登录用户的ID
    try {
      const res = await findUnreadNotice(userId);

      ctx.body = {
        code: '200',
        data: {
          count: res,
        },
        message: '查询成功',
      };
    } catch (error) {
      ctx.app.emit('error', findNoticeError, ctx);
    }
  }

  /**
   * @description: 查询站内消息列表
   * @param {*} ctx 上下文对象
   * @return {*}
   */
  async findMessageList(ctx) {
    const { userId } = ctx.state.user; // 获取当前登录用户的ID
    const { type = 'all', pageNum = 1, pageSize = 10 } = ctx.query; // 获取分页参数
    try {
      const res = await findNotice({ userId, type, pageNum, pageSize });

      ctx.body = {
        code: '200',
        data: res,
        message: '查询成功',
      };
    } catch (error) {
      ctx.app.emit('error', findNoticeError, ctx);
    }
  }
}

module.exports = new CommentController();
