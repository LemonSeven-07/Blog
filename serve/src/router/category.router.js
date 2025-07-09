const Router = require('koa-router');
const { groupFindAll } = require('../controller/category.controller');

const router = new Router({ prefix: '/category' });

// 获取分类列表
router.get('/list', groupFindAll);

module.exports = router;
