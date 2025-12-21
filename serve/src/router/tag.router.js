const Router = require('koa-router');

const { auth, hadAdminPermission } = require('../middleware/auth.middleware.js');

const { createTagSchema } = require('../constant/schema.js');

const { joiValidate } = require('../middleware/validator.middleware.js');
const { findAll, create } = require('../controller/tag.controller');

const router = new Router({ prefix: '/tag' });

// 创建标签
router.post('/create', auth, hadAdminPermission, joiValidate(createTagSchema), create);

// 获取标签列表
router.get('/list', findAll);

module.exports = router;
