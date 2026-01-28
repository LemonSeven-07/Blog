const Router = require('koa-router');

const {
  createTagSchema,
  getTagsSchema,
  updateTagSchema,
  deleteTagSchema,
} = require('../constant/schema.js');

const {
  auth,
  hadAdminPermission,
  checkTagPermission,
} = require('../middleware/auth.middleware.js');
const { joiValidate } = require('../middleware/validator.middleware.js');
const { findAll, create, update, remove } = require('../controller/tag.controller');
const { verifyTag } = require('../middleware/tag.middleware.js');

const router = new Router({ prefix: '/tag' });

// 创建标签
router.post(
  '/create',
  auth,
  hadAdminPermission(2),
  joiValidate(createTagSchema),
  verifyTag,
  create,
);

// 获取标签列表
router.get('/list', joiValidate(getTagsSchema), findAll);

// 修改文章标签
router.put('/:id', auth, joiValidate(updateTagSchema), verifyTag, checkTagPermission, update);

// 删除文章标签
router.delete('/', auth, joiValidate(deleteTagSchema), checkTagPermission, remove);

module.exports = router;
