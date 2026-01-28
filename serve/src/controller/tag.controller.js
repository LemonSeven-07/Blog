const {
  createTag,
  getTagByName,
  findAllTags,
  updateTag,
  removeTag,
} = require('../service/tag.service');
const {
  tagsFindError,
  tagAlreadyExists,
  tagCreateError,
  tagUpdateError,
  tagDeleteError,
  tagDoesNotExist,
} = require('../constant/err.type');

class TagController {
  /**
   * @description: 创建标签
   * @param {*} ctx 上下文对象
   * @return {*}
   */
  async create(ctx) {
    const { name } = ctx.request.body;
    const { role } = ctx.state.user;

    try {
      // 创建标签
      const res = await getTagByName(name);
      if (res) {
        return ctx.app.emit('error', tagAlreadyExists, ctx);
      }

      const newTag = await createTag(name, role);
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
    const { pageNum = 1, pageSize = 10, name, createDate, isBuiltin } = ctx.query;
    try {
      const res = await findAllTags({
        pageNum,
        pageSize,
        name,
        createDate,
        isBuiltin: isBuiltin ? (isBuiltin * 1 === 1 ? true : false) : undefined,
      });

      // 返回查询结果
      ctx.body = ctx.body = {
        code: '200',
        data: res,
        message: '操作成功',
      };
    } catch (err) {
      ctx.app.emit('error', tagsFindError, ctx);
    }
  }

  /**
   * @description: 更新标签
   * @param {*} ctx 上下文对象
   * @return {*}
   */
  async update(ctx) {
    const { name } = ctx.request.body;
    const { id } = ctx.request.params;
    try {
      const res = await updateTag({ id, name });
      if (!res) throw new Error();

      ctx.body = {
        code: '200',
        data: null,
        message: '修改成功',
      };
    } catch (err) {
      ctx.app.emit('error', tagUpdateError, ctx);
    }
  }

  /**
   * @description: 删除标签
   * @param {*} ctx 上下文对象
   * @return {*}
   */
  async remove(ctx) {
    const { ids } = ctx.request.body;
    try {
      const res = await removeTag(ids);
      if (!res) {
        return ctx.app.emit('error', tagDoesNotExist, ctx);
      }

      ctx.body = {
        code: '200',
        data: null,
        message: '删除成功',
      };
    } catch (err) {
      ctx.app.emit('error', tagDeleteError, ctx);
    }
  }
}

module.exports = new TagController();
