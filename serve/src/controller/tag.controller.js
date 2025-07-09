const { groupFindTags } = require('../service/tag.service');
const { findTagsError } = require('../constant/err.type');

class TagController {
  async groupFindAll(ctx) {
    try {
      const res = await groupFindTags();
      if (!res) return ctx.app.emit('error', findTagsError, ctx);
      // 返回查询结果
      ctx.body = ctx.body = {
        code: '200',
        data: res,
        message: '操作成功',
      };
    } catch (err) {
      return ctx.app.emit('error', findTagsError, ctx);
    }
  }
}

module.exports = new TagController();
