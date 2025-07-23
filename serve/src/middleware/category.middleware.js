const { getCategoryInfo } = require('../service/category.service');

const { categoryAlreadyExists, createCategoryError } = require('../constant/err.type');

const verifyName = async (ctx, next) => {
  const { name } = ctx.request.body;
  try {
    const res = await getCategoryInfo(name);
    if (res) {
      // 分类名已存在
      return ctx.app.emit('error', categoryAlreadyExists, ctx);
    }
  } catch (err) {
    return ctx.app.emit('error', createCategoryError, ctx);
  }

  await next();
};

module.exports = {
  verifyName,
};
