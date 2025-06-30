const Router = require('koa-router');

const { registerFormatError, loginFormatError } = require('../constant/err.type');
const { username, password, email } = require('../constant/validator.js');
const {
  validator,
  verifyUser,
  verifyEmail,
  cryptPassword,
  verifyLogin,
} = require('../middleware/user.middleware.js');
const { auth, hadAdminPermission } = require('../middleware/auth.middleware.js');
const { register, login, remove } = require('../controller/user.controller.js');

const router = new Router({ prefix: '/users' });

// 注册用户
router.post(
  '/register',
  validator(
    {
      username,
      password,
      email,
    },
    registerFormatError,
  ),
  verifyUser,
  verifyEmail,
  cryptPassword,
  register,
);

// 用户登录
router.post(
  '/login',
  validator(
    {
      username,
      password,
    },
    loginFormatError,
  ),
  verifyLogin,
  login,
);

// 用户删除
router.delete('/:userId', auth, hadAdminPermission, remove);

module.exports = router;
