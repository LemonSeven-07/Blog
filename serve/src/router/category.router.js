const Router = require('koa-router');

const {
  createCategorySchema,
  getCategorySchema,
  updateCategorySchema,
  deleteCategorySchema,
} = require('../constant/schema.js');

const { auth, hadAdminPermission } = require('../middleware/auth.middleware.js');
const { joiValidate } = require('../middleware/validator.middleware.js');
const { verifyName, verifySlug } = require('../middleware/category.middleware.js');
const {
  findAll,
  create,
  getTagsByCategory,
  update,
  remove,
} = require('../controller/category.controller');

const router = new Router({ prefix: '/category' });

// 创建分类
router.post(
  '/create',
  auth,
  hadAdminPermission(2),
  joiValidate(createCategorySchema),
  verifyName,
  verifySlug,
  create,
);

// 查询分类下对应的所有文章标签
router.get('/:id/tags', getTagsByCategory);

// 获取分类列表
router.get('/list', joiValidate(getCategorySchema), findAll);

// 修改文章分类
router.put('/:id', auth, hadAdminPermission(1), joiValidate(updateCategorySchema), update);

// 删除文章分类
router.delete('/', auth, joiValidate(deleteCategorySchema), hadAdminPermission(1), remove);

module.exports = router;
