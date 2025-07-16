const Router = require('koa-router');

const { createArticleSchema, getArticlesSchema } = require('../constant/schema.js');

const { auth, hadAdminPermission } = require('../middleware/auth.middleware.js');
const { joiValidate } = require('../middleware/validator.middleware.js');
const { verifyArticleTitle } = require('../middleware/article.middleware.js');
const { create, findAll, findById } = require('../controller/article.controller.js');

const router = new Router({ prefix: '/article' });

// 创建文章
router.post(
  '/',
  auth,
  hadAdminPermission,
  joiValidate(createArticleSchema),
  verifyArticleTitle,
  create,
);

// 获取文章列表
router.get('/list', auth, hadAdminPermission, joiValidate(getArticlesSchema), findAll);

// 获取文章详情
router.get('/:id', findById);

module.exports = router;
