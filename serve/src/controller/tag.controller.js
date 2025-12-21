const { createTag, getTagByName, findAllTags } = require('../service/tag.service');
const { findTagsError, tagAlreadyExists, tagCreateError } = require('../constant/err.type');

class TagController {
  /**
   * @description: 创建标签
   * @param {*} ctx 上下文对象
   * @return {*}
   */
  async create(ctx) {
    const { name } = ctx.request.body;

    try {
      // 创建标签
      const res = await getTagByName(name);
      if (res) return ctx.app.emit('error', tagAlreadyExists, ctx);

      const newTag = await createTag(name);
      if (!newTag) throw new Error();

      // 返回创建结果
      ctx.body = {
        code: '200',
        data: null,
        message: '操作成功',
      };
    } catch (err) {
      ctx.app.emit('error', tagCreateError, ctx);
    }
  }

  /**
   * @description: 根据文章id、分类id查找标签列表
   * @param {*} ctx 上下文对象
   * @return {*}
   */
  async findAll(ctx) {
    try {
      const res = await findAllTags();

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
