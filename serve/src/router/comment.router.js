const Router = require('koa-router');

const {
  createCommentSchema,
  replyCommentSchema,
  deleteCommentSchema,
  getCommentSchema,
  updateCommentSchema,
  getNoticeSchema,
} = require('../constant/schema.js');

const { auth, hadAdminPermission } = require('../middleware/auth.middleware.js');
const { joiValidate } = require('../middleware/validator.middleware.js');
const { verifyBanned } = require('../middleware/comment.middleware.js');
const {
  create,
  reply,
  remove,
  findAll,
  update,
  findUnreadCount,
  findMessageList,
} = require('../controller/comment.controller.js');

const router = new Router({ prefix: '/comment' });

// 添加评论
router.post('/create', auth, joiValidate(createCommentSchema), verifyBanned, create);

// 回复评论
router.post('/reply', auth, joiValidate(replyCommentSchema), verifyBanned, reply);

// 获取当前文章的所有评论和回复或者一级评论下的回复
router.get('/list', auth, joiValidate(getCommentSchema), findAll);

// 修改评论通知状态/消息通知显示状态
router.patch('/notice', auth, joiValidate(updateCommentSchema), update);

// 获取当前用户未读消息数量（文章评论和评论回复）
router.get('/unread/count', auth, findUnreadCount);

// 获取当前用户消息通知列表（包含已读和未读）
router.get('/notice/list', auth, joiValidate(getNoticeSchema), findMessageList);

// 删除评论或回复
router.delete('/', auth, hadAdminPermission, joiValidate(deleteCommentSchema), remove);

module.exports = router;
