const Router = require('koa-router');

const {
  articleMaintenanceSchema,
  getArticlesSchema,
  deleteArticlesSchema,
} = require('../constant/schema.js');

const { auth, hadAdminPermission } = require('../middleware/auth.middleware.js');
const { joiValidate } = require('../middleware/validator.middleware.js');
const { verifyArticleTitle } = require('../middleware/article.middleware.js');
const {
  create,
  findAll,
  findById,
  remove,
  update,
} = require('../controller/article.controller.js');

const router = new Router({ prefix: '/article' });

// 创建文章
router.post(
  '/',
  auth,
  hadAdminPermission,
  joiValidate(articleMaintenanceSchema),
  verifyArticleTitle,
  create,
);

// 获取文章列表
router.get('/list', auth, hadAdminPermission, joiValidate(getArticlesSchema), findAll);

// 获取文章详情
router.get('/:id', findById);

// 删除文章
router.delete('/', auth, hadAdminPermission, joiValidate(deleteArticlesSchema), remove);

// 文章编辑
router.put(
  '/:id',
  auth,
  hadAdminPermission,
  joiValidate(articleMaintenanceSchema),
  verifyArticleTitle,
  update,
);

module.exports = router;
