const Router = require('koa-router');

const { createCategorySchema } = require('../constant/schema.js');

const { auth, hadAdminPermission } = require('../middleware/auth.middleware.js');
const { joiValidate } = require('../middleware/validator.middleware.js');
const { verifyName } = require('../middleware/category.middleware.js');
const { findAll, create } = require('../controller/category.controller');

const router = new Router({ prefix: '/category' });

// 创建分类
router.post('/', auth, hadAdminPermission, joiValidate(createCategorySchema), verifyName, create);

// 获取分类列表
router.get('/list', findAll);

module.exports = router;
