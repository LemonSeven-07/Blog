const Router = require('koa-router');

const {
  registerSchema,
  resetPasswordSchema,
  emailCodeSchema,
  loginSchema,
  updateUserSchema,
  getUersSchema,
  restoreUserSchema,
  updatePasswordSchema,
  updateEmialSchema,
  deleteUserSchema,
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
  restore,
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

// 修改用户头像
router.post(
  '/user/avatar',
  auth,
  uploadMiddleware(
    {
      avatar: { type: ['image/png', 'image/jpeg', 'image/jpg'], require: true },
    },
    2,
  ),
  updateAvatar,
);

// 修改用户基本信息
router.put(
  '/user/profile',
  auth,
  joiValidate(updateUserSchema),
  hadUpdatePermission,
  updateProfile,
);

// 修改用户密码
router.put('/user/password', auth, joiValidate(updatePasswordSchema), updatePassword);

// 更换邮箱
router.put('/user/email', auth, joiValidate(updateEmialSchema), verifyEmailCode, updateEmial);

// 获取用户列表(需要管理员权限)
router.get('/user/list', auth, joiValidate(getUersSchema), hadAdminPermission(1), findAll);

// 退出登录
router.post('/user/logout', auth, logout);

// 恢复被删除的用户
router.put('/user/restore', auth, joiValidate(restoreUserSchema), hadAdminPermission(1), restore);

// 用户删除
router.delete('/user', auth, joiValidate(deleteUserSchema), hadAdminPermission(1), remove);

module.exports = router;
