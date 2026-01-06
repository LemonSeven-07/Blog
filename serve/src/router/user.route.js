const Router = require('koa-router');

const {
  registerSchema,
  resetPasswordSchema,
  emailCodeSchema,
  loginSchema,
  updateUserSchema,
  getUersSchema,
  updatePasswordSchema,
  updateEmialSchema,
} = require('../constant/schema.js');

const { uploadMiddleware } = require('../middleware/upload.middleware');
const { joiValidate } = require('../middleware/validator.middleware');
const { auth, hadAdminPermission } = require('../middleware/auth.middleware.js');

const {
  verifyUser,
  verifyEmail,
  verifyEmailCode,
  cryptPassword,
  verifyLogin,
  hadUpdatePermission,
} = require('../middleware/user.middleware.js');

const {
  register,
  resetPassword,
  login,
  remove,
  updateProfile,
  appInit,
  findAll,
  sendEmailCode,
  logout,
  updateAvatar,
  updatePassword,
  updateEmial,
} = require('../controller/user.controller.js');

const router = new Router();

// 获取用户信息和页面路由（如果未获取到用户信息表示未登录态返回公共路由，如果获取到了用户信息表示登录态返回角色路由）
router.get('/app/init', auth, appInit);

// 注册用户
router.post(
  '/auth/register',
  joiValidate(registerSchema),
  verifyUser,
  verifyEmail,
  verifyEmailCode,
  cryptPassword,
  register,
);

// 重置密码
router.post(
  '/auth/reset',
  joiValidate(resetPasswordSchema),
  verifyEmail,
  verifyEmailCode,
  cryptPassword,
  resetPassword,
);

// 用户登录
router.post('/auth/login', joiValidate(loginSchema), verifyLogin, login);

// 获取邮箱验证码
router.post('/auth/sendEmailCode', joiValidate(emailCodeSchema), verifyEmail, sendEmailCode);

// 用户删除
router.delete('/user/:userId', auth, hadAdminPermission, remove);

// 修改用户头像
router.post(
  '/user/avatar',
  auth,
  uploadMiddleware({
    avatar: { type: ['image/png', 'image/jpeg', 'image/jpg'], require: true },
  }),
  updateAvatar,
);

// 修改用户基本信息
router.put(
  '/user/profile',
  auth,
  joiValidate(updateUserSchema),
  verifyUser,
  hadUpdatePermission,
  updateProfile,
);

// 修改用户密码
router.put('/user/password', auth, joiValidate(updatePasswordSchema), updatePassword);

// 更换邮箱
router.put(
  '/user/email',
  auth,
  joiValidate(updateEmialSchema),
  verifyEmail,
  verifyEmailCode,
  updateEmial,
);

// 获取用户列表(需要管理员权限)
router.get('/user/list', auth, joiValidate(getUersSchema), hadAdminPermission, findAll);

// 退出登录
router.post('/user/logout', auth, logout);

module.exports = router;
