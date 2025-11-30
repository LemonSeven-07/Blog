const Router = require('koa-router');

const { joiValidate } = require('../middleware/validator.middleware.js');
const { createRouteSchema } = require('../constant/schema.js');
const { auth, hadAdminPermission } = require('../middleware/auth.middleware.js');

const { create } = require('../controller/route.controller.js');

const router = new Router();

// 创建路由
router.post('/route', auth, joiValidate(createRouteSchema), hadAdminPermission, create);

module.exports = router;
