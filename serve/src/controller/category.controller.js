const { groupFindCategories } = require('../service/category.service');
const { findCategoriesError } = require('../constant/err.type');

class CategoryController {
  async groupFindAll(ctx) {
    try {
      const res = await groupFindCategories();

      // 返回查询结果
      ctx.body = {
        code: '200',
        data: res,
        message: '操作成功',
      };
    } catch (err) {
      return ctx.app.emit('error', findCategoriesError, ctx);
    }
  }
}

module.exports = new CategoryController();
