const { createCategory, findCategory } = require('../service/category.service');
const {
  findCategoriesError,
  createCategoryError,
  getTagsByCategoryError,
} = require('../constant/err.type');
const { createRoute } = require('../service/route.service');
const { findTagsByCategoryId } = require('../service/tag.service');
const { sequelize } = require('../model/index');

class CategoryController {
  /**
   * @description: 创建文章分类名称
   * @param {*} ctx 上下文对象
   * @return {*}
   */
  async create(ctx) {
    const { name, route } = ctx.request.body;
    // 确保多个数据库操作作为一个原子单元执行，要么全部成功提交，要么全部失败回滚，从而维护数据的一致性。
    const transaction = await sequelize.transaction();
    try {
      const res = await createCategory(name, transaction);
      if (!res) throw new Error();

      route.component = 'ArticleExplorer';
      route.meta.title = name;
      route.meta.type = 'category';
      route.meta.categoryId = res.id;
      route.role = 4;

      const routeInfo = await createRoute(route, transaction);
      if (!routeInfo) throw new Error();

      // 提交事务
      await transaction.commit();
      // 返回查询结果
      ctx.body = {
        code: '200',
        data: null,
        message: '创建成功',
      };
    } catch (err) {
      await transaction.rollback();
      ctx.app.emit('error', createCategoryError, ctx);
    }
  }

  /**
   * @description: 查询文章分类列表
   * @param {*} ctx 上下文对象
   * @return {*}
   */
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

  /**
   * @description: 查询分类下对应的所有文章标签
   * @param {*} ctx 上下文对象
   * @return {*}
   */
  async getTagsByCategory(ctx) {
    const categoryId = ctx.params.id;
    try {
      const tags = await findTagsByCategoryId(categoryId);

      ctx.body = {
        code: '200',
        message: '获取分类下的标签成功',
        data: tags,
      };
    } catch (err) {
      ctx.app.emit('error', getTagsByCategoryError, ctx);
    }
  }
}

module.exports = new CategoryController();
