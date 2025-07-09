const Router = require('koa-router');
const { groupFindAll } = require('../controller/tag.controller');

const router = new Router({ prefix: '/tag' });

// 获取标签列表
router.get('/list', groupFindAll);

module.exports = router;
