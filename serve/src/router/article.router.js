const Router = require('koa-router');

const {
  articleMaintenanceSchema,
  getPaginationArticlesSchema,
  getLoadMoreArticlesSchema,
  deleteArticlesSchema,
  outputArticlesSchema,
} = require('../constant/schema.js');

const { uploadMiddleware } = require('../middleware/upload.middleware');
const { auth, hadAdminPermission } = require('../middleware/auth.middleware.js');
const { joiValidate } = require('../middleware/validator.middleware.js');
const { verifyArticleTitle } = require('../middleware/article.middleware.js');
const {
  create,
  findAll,
  findById,
  remove,
  update,
  output,
  upload,
  loadMore,
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

// 获取文章列表(分页查询)
router.get('/list', auth, hadAdminPermission, joiValidate(getPaginationArticlesSchema), findAll);

// 获取文章列表(滚动加载查询)
router.get('/scroll', joiValidate(getLoadMoreArticlesSchema), loadMore);

// 删除文章（单个删除和批量删除）
router.delete('/', auth, hadAdminPermission, joiValidate(deleteArticlesSchema), remove);

// 文章上传（支持单个上传和批量上传）
router.post('/upload', auth, hadAdminPermission, uploadMiddleware(['text/markdown']), upload);

// 文章导出（单个导出、批量导出和全部导出）
router.get('/output', auth, hadAdminPermission, joiValidate(outputArticlesSchema), output);

// 获取文章详情
router.get('/:id', findById);

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
