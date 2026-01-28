const { getCategoryInfo } = require('../service/category.service');

const {
  categoryNameAlreadyExists,
  categorySlugAlreadyExists,
  categoryCreateError,
} = require('../constant/err.type');

/**
 * @description: 校验分类名，文章分类名唯一
 * @param {*} ctx 上下文对象
 * @param {*} next 下一个中间件
 * @return {*}
 */
const verifyName = async (ctx, next) => {
  const { name } = ctx.request.body;
  try {
    const res = await getCategoryInfo({ name });
    if (res) {
      // 分类名已存在
      return ctx.app.emit('error', categoryNameAlreadyExists, ctx);
    }
  } catch (err) {
    return ctx.app.emit('error', categoryCreateError, ctx);
  }

  await next();
};

/**
 * @description: 校验分类路由标识，路由标识唯一
 * @param {*} ctx 上下文对象
 * @param {*} next 下一个中间件
 * @return {*}
 */
const verifySlug = async (ctx, next) => {
  const { slug } = ctx.request.body;
  try {
    const res = await getCategoryInfo({ slug });
    if (res) {
      // 分类路由标识已存在
      return ctx.app.emit('error', categorySlugAlreadyExists, ctx);
    }
  } catch (err) {
    return ctx.app.emit('error', categoryCreateError, ctx);
  }

  await next();
};

module.exports = { verifyName, verifySlug };
