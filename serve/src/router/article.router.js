const Router = require('koa-router');

const {
  articleMaintenanceSchema,
  getPaginationArticlesSchema,
  getLoadMoreArticlesSchema,
  deleteArticlesSchema,
  importArticleSchema,
  outputArticlesSchema,
  toggleArticleFavoriteSchema,
} = require('../constant/schema.js');

const { uploadMiddleware } = require('../middleware/upload.middleware');
const { auth, hadAdminPermission } = require('../middleware/auth.middleware.js');
const { joiValidate } = require('../middleware/validator.middleware.js');
const { verifyArticle } = require('../middleware/article.middleware.js');
const {
  create,
  findAll,
  findById,
  remove,
  update,
  output,
  loadMore,
  createArticleFromFile,
  toggleArticleFavorite,
} = require('../controller/article.controller.js');

const router = new Router({ prefix: '/article' });

// 获取文章列表(分页查询)
router.get('/list', auth, joiValidate(getPaginationArticlesSchema), findAll);

// 获取文章列表(滚动加载查询)
router.get('/scroll', joiValidate(getLoadMoreArticlesSchema), loadMore);

// 删除文章（单个删除和批量删除）
router.delete('/', auth, hadAdminPermission, joiValidate(deleteArticlesSchema), remove);

// 导入 Markdown 文件创建文章
router.post(
  '/import/file',
  auth,
  hadAdminPermission,
  joiValidate(importArticleSchema),
  uploadMiddleware(
    {
      file: { type: ['text/markdown'], require: true, multiple: false },
      image: { type: ['image/png', 'image/jpeg', 'image/jpg'], require: false, multiple: false },
    },
    2,
  ),
  createArticleFromFile,
);

// // 通过 Markdown 内容创建文章
// router.post(
//   '/create/content',
//   auth,
//   hadAdminPermission,
//   createArticleFromContent
// );

// 文章导出（单个导出、批量导出和全部导出）
router.get('/output', auth, hadAdminPermission, joiValidate(outputArticlesSchema), output);

// 单个或批量收藏文章和取消收藏文章
router.post('/favorites', auth, joiValidate(toggleArticleFavoriteSchema), toggleArticleFavorite);

// 获取文章详情
router.get('/:id', findById);

// 文章编辑
router.put(
  '/:id',
  auth,
  hadAdminPermission,
  joiValidate(articleMaintenanceSchema),
  verifyArticle,
  update,
);

module.exports = router;
