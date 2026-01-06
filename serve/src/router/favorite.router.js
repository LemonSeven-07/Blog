const Router = require('koa-router');

const { auth } = require('../middleware/auth.middleware.js');

const { joiValidate } = require('../middleware/validator.middleware.js');

const { getLoadMoreArticlesSchema } = require('../constant/schema.js');

const {
  getFavoriteArticles,
  getCategoriesByFavorite,
} = require('../controller/favorite.controller.js');

const router = new Router({ prefix: '/favorite' });

// 查询用户文章收藏列表（滚动查询）
router.get('/articles', auth, joiValidate(getLoadMoreArticlesSchema), getFavoriteArticles);

// 查询收藏文章对应的所有分类
router.get('/categories', auth, getCategoriesByFavorite);

module.exports = router;
