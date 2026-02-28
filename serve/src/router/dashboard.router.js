const Router = require('koa-router');

const { auth, hadAdminPermission } = require('../middleware/auth.middleware.js');

const { stats } = require('../controller/dashboard.controller.js');

const router = new Router({ prefix: '/dashboard' });

// 获取统计数据
router.get('/stats', auth, hadAdminPermission(2), stats);

module.exports = router;
