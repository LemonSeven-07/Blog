const Router = require('koa-router');

const { username, password, email } = require('../constant/validator.js');
const { updateUserSchema, getUersSchema } = require('../constant/schema.js');

const { kpValidate, joiValidate } = require('../middleware/validator.middleware');
const { auth, hadAdminPermission } = require('../middleware/auth.middleware.js');

const {
  verifyUser,
  verifyEmail,
  cryptPassword,
  verifyLogin,
  hadUpdatePermission,
} = require('../middleware/user.middleware.js');
const { register, login, remove, update, findAll } = require('../controller/user.controller.js');

const router = new Router({ prefix: '/users' });

// 注册用户
router.post(
  '/register',
  kpValidate({
    username,
    password,
    email,
  }),
  verifyUser,
  verifyEmail,
  cryptPassword,
  register,
);

// 用户登录
router.post(
  '/login',
  kpValidate({
    username,
    password,
  }),
  verifyLogin,
  login,
);

// 用户删除
router.delete('/:userId', auth, hadAdminPermission, remove);

// 修改用户信息
router.patch('/:userId', auth, joiValidate(updateUserSchema), hadUpdatePermission, update);

router.get('/list', auth, joiValidate(getUersSchema, 'query'), hadAdminPermission, findAll);

module.exports = router;
