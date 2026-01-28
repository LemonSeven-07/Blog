const {
  createCategory,
  findCategories,
  updateCategory,
  removeCategory,
  getCategoryInfo,
} = require('../service/category.service');
const {
  categoriesFindError,
  categoryCreateError,
  getTagsByCategoryError,
  categoryUpdateError,
  categoryDoesNotExist,
  categoryDeleteError,
  categoryNameAlreadyExists,
  categorySlugAlreadyExists,
} = require('../constant/err.type');
const { createRoute, updateRoute, deleteRoute } = require('../service/route.service');
const { findTagsByCategoryId } = require('../service/tag.service');
const { sequelize } = require('../model/index');

class CategoryController {
  /**
   * @description: 创建文章分类名称
   * @param {*} ctx 上下文对象
   * @return {*}
   */
  async create(ctx) {
    let { name, slug, icon } = ctx.request.body;
    if (!icon) icon = slug;
    const transaction = await sequelize.transaction();
    try {
      const res = await createCategory({ name, slug, icon }, transaction);
      if (!res) throw new Error();

      const route = await createRoute(
        {
          path: slug,
          name: slug
            .replace(/[_-](\w)/g, (_, letter) => letter.toUpperCase())
            .replace(/^./, match => match.toLowerCase()), // 将路径转为小驼峰名称
          component: 'ArticleExplorer',
          meta: {
            title: name,
            type: 'category',
            categoryId: res.id,
            icon: 'icon-' + icon,
          },
          role: 4,
        },
        transaction,
      );
      if (!route) throw new Error();

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
      ctx.app.emit('error', categoryCreateError, ctx);
    }
  }

  /**
   * @description: 查询文章分类列表
   * @param {*} ctx 上下文对象
   * @return {*}
   */
  async findAll(ctx) {
    const { pageNum = 1, pageSize = 10, name, createDate } = ctx.query;
    try {
      const res = await findCategories({
        pageNum,
        pageSize,
        name,
        createDate,
      });

      // 返回查询结果
      ctx.body = {
        code: '200',
        data: res,
        message: '操作成功',
      };
    } catch (err) {
      ctx.app.emit('error', categoriesFindError, ctx);
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

  /**
   * @description: 更新分类
   * @param {*} ctx 上下文对象
   * @return {*}
   */
  async update(ctx) {
    const { id } = ctx.request.params;
    let { name, slug, icon } = ctx.request.body;
    if (!icon) icon = slug;
    const transaction = await sequelize.transaction();
    try {
      // 查询除指定分类id之外的表数据
      const categoryByNameData = await getCategoryInfo({ id, name }, false);
      if (categoryByNameData) return ctx.app.emit('error', categoryNameAlreadyExists, ctx);

      // 查询除指定分类id之外的表数据
      const categoryBySlugData = await getCategoryInfo({ id, slug }, false);
      if (categoryBySlugData) return ctx.app.emit('error', categorySlugAlreadyExists, ctx);

      const res = await updateCategory({ id, name, slug, icon }, transaction);
      if (!res) throw new Error();

      const route = await updateRoute(
        {
          categoryId: id,
          path: slug,
          name: slug
            .replace(/[_-](\w)/g, (_, letter) => letter.toUpperCase())
            .replace(/^./, match => match.toLowerCase()), // 将路径转为小驼峰名称
          meta: {
            title: name,
            type: 'category',
            categoryId: id,
            icon: 'icon-' + icon,
          },
        },
        transaction,
      );
      if (!route) throw new Error();

      // 提交事务
      await transaction.commit();

      ctx.body = {
        code: '200',
        data: null,
        message: '修改成功',
      };
    } catch (err) {
      await transaction.rollback();
      ctx.app.emit('error', categoryUpdateError, ctx);
    }
  }

  /**
   * @description: 删除分类
   * @param {*} ctx 上下文对象
   * @return {*}
   */
  async remove(ctx) {
    const { ids } = ctx.request.body;
    const transaction = await sequelize.transaction();
    try {
      // 删除分类数据
      const res = await removeCategory(ids, transaction);
      if (!res) return ctx.app.emit('error', categoryDoesNotExist, ctx);

      // 删除分类对应的分类路由数据
      const route = await deleteRoute({ categoryIds: ids }, transaction);
      if (!route) throw new Error();

      // 提交事务
      await transaction.commit();
      ctx.body = {
        code: '200',
        data: null,
        message: '删除成功',
      };
    } catch (err) {
      await transaction.rollback();
      ctx.app.emit('error', categoryDeleteError, ctx);
    }
  }
}

module.exports = new CategoryController();
