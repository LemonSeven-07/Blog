const { findTags } = require('../service/tag.service');
const { findTagsError } = require('../constant/err.type');

class TagController {
  /**
   * @description: 根据文章id、分类id查找标签列表
   * @param {*} ctx 上下文对象
   * @return {*}
   */
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
