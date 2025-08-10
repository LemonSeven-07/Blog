const Router = require('koa-router');

const { registerOrLoginSchema, updateUserSchema, getUersSchema } = require('../constant/schema.js');

const { joiValidate } = require('../middleware/validator.middleware');
const { auth, hadAdminPermission } = require('../middleware/auth.middleware.js');

const {
  verifyUser,
  cryptPassword,
  verifyLogin,
  hadUpdatePermission,
} = require('../middleware/user.middleware.js');

const { register, login, remove, update, findAll } = require('../controller/user.controller.js');

const router = new Router({ prefix: '/user' });

// 注册用户
router.post('/register', joiValidate(registerOrLoginSchema), verifyUser, cryptPassword, register);

// 用户登录
router.post('/login', joiValidate(registerOrLoginSchema), verifyLogin, login);

// 用户删除
router.delete('/:userId', auth, hadAdminPermission, remove);

// 修改用户信息
router.patch('/:userId', auth, joiValidate(updateUserSchema), hadUpdatePermission, update);

// 获取用户列表(需要管理员权限)
router.get('/list', auth, joiValidate(getUersSchema), hadAdminPermission, findAll);

module.exports = router;
