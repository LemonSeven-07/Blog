const jwt = require('jsonwebtoken');

const {
  userRegisterError,
  userLoginError,
  userDeleteError,
  userDoesNotExist,
  userUpdateError,
  findUsersError,
} = require('../constant/err.type.js');

const {
  createUser,
  getUserInfo,
  removeUser,
  updateUer,
  findUsers,
} = require('../service/user.service.js');

class UserController {
  async register(ctx) {
    // 1、获取数据
    const { username, password } = ctx.request.body;
    try {
      // 2、操作数据库
      const res = await createUser({ username, password });
      if (!res) throw new Error();

      // 3、返回结果
      ctx.body = {
        code: '200',
        data: null,
        message: '用户注册成功',
      };
    } catch (error) {
      ctx.app.emit('error', userRegisterError, ctx);
    }
  }

  async login(ctx) {
    // 1、获取数据
    const { username } = ctx.request.body;
    try {
      // 2、操作数据库
      const { password, ...res } = await getUserInfo({ username });
      const { role, id: userId } = res;
      const userInfo = {
        userId,
        username,
        role,
      };

      const { JWT_SECRET, EXPIRESIN } = process.env;
      // 3、返回结果
      ctx.body = {
        code: '200',
        data: {
          ...userInfo,
          token: jwt.sign(userInfo, JWT_SECRET, { expiresIn: EXPIRESIN }),
        },
        message: '登录成功',
      };
    } catch (error) {
      ctx.app.emit('error', userLoginError, ctx);
    }
  }

  async remove(ctx) {
    const { userId } = ctx.request.params;
    try {
      const res = await removeUser(userId);
      if (!res) {
        return ctx.app.emit('error', userDoesNotExist, ctx);
      }
      ctx.body = {
        code: '200',
        data: null,
        message: '删除成功',
      };
    } catch (err) {
      ctx.app.emit('error', userDeleteError, ctx);
    }
  }

  async update(ctx) {
    const { userId } = ctx.request.params;
    try {
      const res = await updateUer(ctx.request.body, userId);
      if (!res) throw new Error();

      ctx.body = {
        code: '200',
        data: null,
        message: '修改成功',
      };
    } catch (err) {
      ctx.app.emit('error', userUpdateError, ctx);
    }
  }

  async findAll(ctx) {
    const { pageNum = 1, pageSize = 10, username, type, rangeDate } = ctx.query;
    const { userId } = ctx.state.user;
    try {
      const res = await findUsers({ pageNum, pageSize, username, type, rangeDate }, userId);
      ctx.body = {
        code: '200',
        data: res,
        message: '操作成功',
      };
    } catch (err) {
      ctx.app.emit('error', findUsersError, ctx);
    }
  }
}

module.exports = new UserController();
