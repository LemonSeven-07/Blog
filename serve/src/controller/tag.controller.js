const { findTags } = require('../service/tag.service');
const { findTagsError } = require('../constant/err.type');

class TagController {
  async findAll(ctx) {
    const { articleId, categoryId } = ctx.query;
    try {
      const res = await findTags({ articleId, categoryId });

      // 返回查询结果
      ctx.body = ctx.body = {
        code: '200',
        data: res,
        message: '操作成功',
      };
    } catch (err) {
      ctx.app.emit('error', findTagsError, ctx);
    }
  }
}

module.exports = new TagController();
