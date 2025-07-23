const Router = require('koa-router');

const { getTagsSchema } = require('../constant/schema.js');

const { joiValidate } = require('../middleware/validator.middleware.js');
const { findAll } = require('../controller/tag.controller');

const router = new Router({ prefix: '/tag' });

// 获取标签列表
router.get('/list', joiValidate(getTagsSchema), findAll);

module.exports = router;
