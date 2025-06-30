const jwt = require('jsonwebtoken');

const {
  userRegisterError,
  userLoginError,
  userDeleteError,
  userDoesNotExist,
} = require('../constant/err.type.js');

const { createUser, getUserInfo, removeUser } = require('../service/user.service.js');

class UserController {
  async register(ctx) {
    // 1、获取数据
    const { username, password, email } = ctx.request.body;
    try {
      // 2、操作数据库
      const res = await createUser({ username, password, email });
      // 3、返回结果
      ctx.body = {
        code: '200',
        message: '用户注册成功',
        data: null,
      };
    } catch (error) {
      return ctx.app.emit('error', userRegisterError, ctx);
    }
  }

  async login(ctx) {
    // 1、获取数据
    const { username } = ctx.request.body;
    try {
      // 2、操作数据库
      const { password, ...res } = await getUserInfo({ username });
      const { email, notice, role, id: userId } = res;
      const userInfo = {
        userId,
        username,
        email,
        notice,
        role,
      };

      const { JWT_SECRET, EXPIRESIN } = process.env;
      // 3、返回结果
      ctx.body = {
        code: '200',
        message: '登录成功',
        data: {
          ...userInfo,
          token: jwt.sign(userInfo, JWT_SECRET, { expiresIn: EXPIRESIN }),
        },
      };
    } catch (error) {
      return ctx.app.emit('error', userLoginError, ctx);
    }
  }

  async remove(ctx) {
    console.log(900, ctx.request.params);
    const { userId } = ctx.request.params;
    try {
      const res = await removeUser(userId);
      if (!res) {
        return ctx.app.emit('error', userDoesNotExist, ctx);
      }
      ctx.body = {
        code: '200',
        message: '删除成功',
        data: null,
      };
    } catch (err) {
      return ctx.app.emit('error', userDeleteError, ctx);
    }
  }
}

module.exports = new UserController();
