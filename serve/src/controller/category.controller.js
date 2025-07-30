const { createCategory, findCategory } = require('../service/category.service');
const { findCategoriesError, createCategoryError } = require('../constant/err.type');

class CategoryController {
  async create(ctx) {
    const { name } = ctx.request.body;
    try {
      const res = await createCategory(name);
      if (!res) throw new Error();

      // 返回查询结果
      ctx.body = {
        code: '200',
        data: null,
        message: '操作成功',
      };
    } catch (err) {
      ctx.app.emit('error', createCategoryError, ctx);
    }
  }

  async findAll(ctx) {
    try {
      const res = await findCategory();

      // 返回查询结果
      ctx.body = {
        code: '200',
        data: res,
        message: '操作成功',
      };
    } catch (err) {
      ctx.app.emit('error', findCategoriesError, ctx);
    }
  }
}

module.exports = new CategoryController();
