const fs = require('fs'); // 原生路径处理模块（用于安全拼接路径）
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { sequelize } = require('../model/index');

const {
  userRegisterError,
  passwordResetError,
  SendError,
  userLoginError,
  userDeleteError,
  userDoesNotExist,
  userUpdateError,
  usersFindError,
  logoutError,
  avatarUpdateError,
  passwordUpdateError,
  emailUpdateError,
  userRestoreError,
  userAlreadyExists,
  emailAlreadyExists,
} = require('../constant/err.type');

const {
  createUser,
  getUserInfo,
  removeUser,
  updateUser,
  findUsers,
  findAllWithDeleted,
  restoreUser,
  checkUsername,
  checkEmail,
} = require('../service/user.service.js');

const { getRoutes } = require('../service/route.service.js');

const {
  issueTokens,
  sendEmailConfig,
  uploadImageToGitHub,
  deleteGitHubImage,
  clearCacheFiles,
} = require('../utils/index.js');
const { redisClient } = require('../db/redis.js');
const { disconnectWs } = require('../app/socket');

class UserController {
  /**
   * @description: 注册用户
   * @param {*} ctx 上下文对象
   * @return {*}
   */
  async register(ctx) {
    // 1、获取数据
    const { username, email, password } = ctx.request.body;
    try {
      // 2、操作数据库
      const res = await createUser({ username, password, email });
      if (!res) throw new Error();

      const { role, id: userId, banned, avatar = '' } = res;
      const userInfo = {
        userId,
        username,
        email,
        avatar,
        role,
        banned,
      };
      const { NODE_ENV, REDIS_TOKEN_CACHE_TTL } = process.env;
      const { accessToken, refreshToken } = issueTokens(userInfo);
      ctx.cookies.set('refresh_token', refreshToken, {
        httpOnly: true, // 前端 JS 无法读取
        secure: NODE_ENV === 'production', // 开发环境 http = false；生产 https = true
        sameSite: NODE_ENV === 'production' ? 'None' : 'Lax', // 防 CSRF，生产可用 'None'
        path: '/', // Cookie 对整个域名有效
        maxAge: 1000 * 60 * 60 * 24 * REDIS_TOKEN_CACHE_TTL, // 过期时间
      });
      ctx.set('x-access-token', accessToken);

      // 注册成功，删除该邮箱的验证码，避免影响下次注册
      await redisClient.del(`verify:email:register:${email}`);
      // 注册成功，删除该邮箱的发送记录，避免影响下次发送
      await redisClient.del(`email:send:email:register:${email}`);

      // 3、返回结果
      ctx.body = {
        code: '200',
        data: userInfo,
        message: '用户注册登录成功',
      };
    } catch (error) {
      ctx.app.emit('error', userRegisterError, ctx);
    }
  }

  /**
   * @description: 重置密码
   * @param {*} ctx
   * @return {*}
   */
  async resetPassword(ctx) {
    const { email, password } = ctx.request.body;
    try {
      const res = await updateUser({ email, password }, null);
      if (!res) throw new Error();
      // 重置成功，删除该邮箱的验证码，避免影响下次重置
      await redisClient.del(`verify:email:reset:${email}`);
      // 重置成功，删除该邮箱的发送记录，避免影响下次发送
      await redisClient.del(`email:send:email:reset:${email}`);

      ctx.body = {
        code: '200',
        data: null,
        message: '密码重置成功',
      };
    } catch (error) {
      ctx.app.emit('error', passwordResetError, ctx);
    }
  }

  /**
   * @description: 用户登录
   * @param {*} ctx 上下文对象
   * @return {*}
   */
  async login(ctx) {
    // 1、获取数据
    const { username, email } = ctx.request.body;
    try {
      // 2、操作数据库
      const res = await getUserInfo({ username, email });
      if (!res) throw new Error();
      const { role, id: userId, banned, avatar = '' } = res;
      const userInfo = {
        userId,
        username: res.username,
        email: res.email,
        avatar,
        role,
        banned,
      };

      const { NODE_ENV, REDIS_TOKEN_CACHE_TTL } = process.env;
      const { accessToken, refreshToken } = issueTokens(userInfo);
      ctx.cookies.set('refresh_token', refreshToken, {
        httpOnly: true, // 前端 JS 无法读取
        secure: NODE_ENV === 'production', // 开发环境 http = false；生产 https = true
        sameSite: NODE_ENV === 'production' ? 'None' : 'Lax', // 防 CSRF，生产可用 'None'
        path: '/', // Cookie 对整个域名有效
        maxAge: 1000 * 60 * 60 * 24 * REDIS_TOKEN_CACHE_TTL, // 过期时间
      });
      ctx.set('x-access-token', accessToken);

      // 3、返回结果
      ctx.body = {
        code: '200',
        data: userInfo,
        message: '登录成功',
      };
    } catch (error) {
      ctx.app.emit('error', userLoginError, ctx);
    }
  }

  /**
   * @description: 发送邮箱验证码
   * @param {*} ctx 上下文对象
   * @return {*}
   */
  async sendEmailCode(ctx) {
    try {
      const { email, type } = ctx.request.body;
      const ip = ctx.request.ip || ctx.ip;

      const { EMAIL_CODE_EXPIRE, EMAIL_LIMIT, IP_LIMIT } = process.env;
      const ipKey = `email:send:ip:${type}:${ip}`;
      const emailKey = `email:send:email:${type}:${email}`;
      const lastSendKey = `rate:email:${type}:${email}`;
      const verifyKey = `verify:email:${type}:${email}`;

      const checkLimit = async (key, limit) => {
        const count = parseInt((await redisClient.get(key)) || '0', 10);
        if (count >= limit) throw new Error();

        const newCount = await redisClient.incr(key);
        if (newCount === 1) await redisClient.expire(key, 3600);
      };

      // IP 限制
      await checkLimit(ipKey, IP_LIMIT);
      // 邮箱限制
      await checkLimit(emailKey, EMAIL_LIMIT);
      // 发送频率限制 (60秒内不能重复发送)
      const lastSend = await redisClient.get(lastSendKey);
      if (lastSend) throw new Error();
      await redisClient.set(lastSendKey, 1, { EX: 60 });

      // 生成6位验证码
      const min = Math.pow(10, 5);
      const max = Math.pow(10, 6) - 1;
      const code = (Math.floor(Math.random() * (max - min + 1)) + min).toString();

      // 1️⃣ 获取发送配置
      const { transporter, option } = await sendEmailConfig(email, code, type);
      // 2️⃣ 发送邮件（✅ 使用 Promise 方式，不要回调）
      await transporter.sendMail(option);
      // 3️⃣ 存储到 Redis
      await redisClient.set(verifyKey, code, { EX: 60 * EMAIL_CODE_EXPIRE });
      // 4️⃣ 关闭 SMTP 连接
      transporter.close();
      // 5️⃣ 返回响应
      ctx.body = {
        code: '200',
        data: null,
        message: '验证码已发送，请查收邮件',
      };
    } catch (error) {
      ctx.app.emit('error', SendError, ctx);
    }
  }

  /**
   * @description: 用户删除或恢复
   * @param {*} ctx 上下文对象
   * @return {*}
   */
  async remove(ctx) {
    const { ids } = ctx.request.body;
    try {
      // 查出ids对应的用户（包括软删除）
      const users = await findAllWithDeleted(ids);
      if (users.length === 0) return ctx.app.emit('error', userDoesNotExist, ctx);

      // 只恢复被删除的
      const normalUsers = users.filter(u => !u.deletedAt);
      if (normalUsers.length === 0) {
        ctx.body = {
          code: '400',
          data: null,
          message: '所选用户均被删除',
        };
        return;
      }

      const normalUserIds = normalUsers.map(u => u.id);
      const res = await removeUser(normalUserIds);
      if (!res) throw new Error();

      normalUserIds.forEach(async userId => {
        await redisClient.del(`refresh_token:user:${userId}`);
        await redisClient.set(`user_status:${userId}`, 'deleted');
      });

      ctx.body = {
        code: '200',
        data: null,
        message: '用户删除成功',
      };
    } catch (err) {
      ctx.app.emit('error', userDeleteError, ctx);
    }
  }

  /**
   * @description: 修改用户基本信息
   * @param {*} ctx 上下文对象
   * @return {*}
   */
  async updateProfile(ctx) {
    const { userId, avatar, username, email, role, banned } = ctx.state.user;
    const transaction = await sequelize.transaction();
    try {
      if (ctx.request.body.username) {
        const res = await checkUsername(ctx.request.body.username, userId);
        if (res) return ctx.app.emit('error', userAlreadyExists, ctx);
      }

      const res = await updateUser(
        {
          ...ctx.request.body,
        },
        ctx.request.body.userId,
        transaction,
      );
      if (!res) throw new Error();

      if (userId === ctx.request.body.userId * 1) {
        // 更新 token 和 refreshToken
        const userInfo = {
          userId,
          avatar,
          username,
          email,
          role,
          banned,
          ...ctx.request.body,
        };
        const { NODE_ENV, REDIS_TOKEN_CACHE_TTL } = process.env;
        const { accessToken, refreshToken } = issueTokens(userInfo);
        ctx.cookies.set('refresh_token', refreshToken, {
          httpOnly: true, // 前端 JS 无法读取
          secure: NODE_ENV === 'production', // 开发环境 http = false；生产 https = true
          sameSite: NODE_ENV === 'production' ? 'None' : 'Lax', // 防 CSRF，生产可用 'None'
          path: '/', // Cookie 对整个域名有效
          maxAge: 1000 * 60 * 60 * 24 * REDIS_TOKEN_CACHE_TTL, // 过期时间
        });
        ctx.set('x-access-token', accessToken);
      }

      // 提交事务
      await transaction.commit();

      ctx.body = {
        code: '200',
        data: null,
        message: '修改成功',
      };
    } catch (err) {
      await transaction.rollback();
      ctx.app.emit('error', userUpdateError, ctx);
    }
  }

  /**
   * @description: 获取用户信息、前端页面路由和导航页面路由
   * @param {*} ctx
   * @return {*}
   */
  async appInit(ctx) {
    let userId = null;
    if (ctx.state.user) userId = ctx.state.user.userId;
    try {
      if (userId) {
        const res = await getUserInfo({ id: userId });
        if (!res) return ctx.app.emit('error', userDoesNotExist, ctx);

        const routes = await getRoutes({ role: ctx.state.user.role });

        const { username, email, role, banned, avatar = '', createdAt } = res;
        ctx.body = {
          code: '200',
          data: {
            user: {
              userId,
              username,
              email,
              role,
              banned,
              avatar,
              createdAt,
            },
            routes,
          },
          message: '操作成功',
        };
      } else {
        const routes = await getRoutes({ role: 4 });

        ctx.body = {
          code: '200',
          data: {
            user: null,
            routes,
          },
          message: '操作成功',
        };
      }
    } catch (err) {
      ctx.app.emit('error', userDoesNotExist, ctx);
    }
  }

  /**
   * @description: 查询用户列表（不显示当前用户）
   * @param {*} ctx 上下文对象
   * @return {*}
   */
  async findAll(ctx) {
    const { pageNum = 1, pageSize = 10, username, role, registerDate, isDeleted } = ctx.query;
    const { userId } = ctx.state.user;
    try {
      const res = await findUsers(
        { pageNum, pageSize, username, role, registerDate, isDeleted },
        userId,
      );

      ctx.body = {
        code: '200',
        data: res,
        message: '操作成功',
      };
    } catch (err) {
      ctx.app.emit('error', usersFindError, ctx);
    }
  }

  /**
   * @description: 退出登录
   * @param {*} ctx 上下文对象
   * @return {*}
   */
  async logout(ctx) {
    const { userId, email, jti, seesionId } = ctx.state.user;
    const { NODE_ENV, BLACK_JTI_CACHE_TTL } = process.env;
    try {
      // 断开ws连接
      await disconnectWs(userId, seesionId, 'userLogout');

      // 添加邮箱验证发送频率重置保护机制
      await redisClient.del(`verify:email:register:${email}`);
      await redisClient.del(`email:send:email:register:${email}`);

      // 清除 cookies
      ctx.cookies.set('refresh_token', null, {
        httpOnly: true, // 确保前端无法读取
        secure: NODE_ENV === 'production', // 生产环境设置为 true
        sameSite: NODE_ENV === 'production' ? 'None' : 'Lax', // 防止 CSRF 攻击
        path: '/', // Cookie 对整个域名有效
        maxAge: 0, // 设置 maxAge 为 0 来使 cookie 立刻过期
      });
      // 清除响应头
      ctx.set('x-access-token', '');

      // 退出登录 token 在短时间内还有效需要加入黑名单，避免用旧的 token 非法操作
      await redisClient.set(`blacklist:${userId}:${jti}`, 'invalid', {
        EX: 60 * BLACK_JTI_CACHE_TTL,
      });

      // 清除 refresh_token
      await redisClient.del(`refresh_token:user:${userId}`);

      ctx.body = {
        code: '200',
        data: null,
        message: '退出成功',
      };
    } catch (err) {
      ctx.app.emit('error', logoutError, ctx);
    }
  }

  /**
   * @description: 更新用户头像
   * @param {*} ctx 上下文对象
   * @return {*}
   */
  async updateAvatar(ctx) {
    const { avatar } = ctx.request.files;
    const { userId, avatar: oldAvatar, username, email, role, banned } = ctx.state.user;
    const transaction = await sequelize.transaction();
    let avatarUrl = '';
    try {
      const { cdnUrl } = await uploadImageToGitHub(
        fs.readFileSync(avatar.filepath),
        avatar.mimetype,
        'user',
      );
      if (!cdnUrl) throw new Error();
      avatarUrl = cdnUrl;

      const res = await updateUser(
        {
          avatar: avatarUrl,
        },
        userId,
        transaction,
      );
      if (!res) throw new Error();

      if (oldAvatar) deleteGitHubImage(oldAvatar);

      // 更新 token 和 refreshToken
      const userInfo = {
        userId,
        avatar: avatarUrl,
        username,
        email,
        role,
        banned,
      };
      const { NODE_ENV, REDIS_TOKEN_CACHE_TTL } = process.env;
      const { accessToken, refreshToken } = issueTokens(userInfo);
      ctx.cookies.set('refresh_token', refreshToken, {
        httpOnly: true, // 前端 JS 无法读取
        secure: NODE_ENV === 'production', // 开发环境 http = false；生产 https = true
        sameSite: NODE_ENV === 'production' ? 'None' : 'Lax', // 防 CSRF，生产可用 'None'
        path: '/', // Cookie 对整个域名有效
        maxAge: 1000 * 60 * 60 * 24 * REDIS_TOKEN_CACHE_TTL, // 过期时间
      });
      ctx.set('x-access-token', accessToken);

      // 提交事务
      await transaction.commit();

      ctx.body = {
        code: '200',
        data: null,
        message: '修改成功',
      };
    } catch (err) {
      deleteGitHubImage(avatarUrl);
      await transaction.rollback();
      ctx.app.emit('error', avatarUpdateError, ctx);
    } finally {
      // 延迟5秒后清理临时目录（确保文件导入完成）
      clearCacheFiles(ctx.state.uploadedFilepaths || [], 5000);
    }
  }

  /**
   * @description: 修改用户密码
   * @param {*} ctx 上下文对象
   * @return {*}
   */
  async updatePassword(ctx) {
    const { oldPassword, newPassword } = ctx.request.body;
    const { userId } = ctx.state.user;
    try {
      const user = await getUserInfo({ id: userId });
      if (!user) throw new Error();

      const match = await bcrypt.compare(oldPassword, user.password);
      if (!match) throw new Error();

      const salt = bcrypt.genSaltSync(10);
      const res = await updateUser(
        {
          password: bcrypt.hashSync(newPassword, salt),
        },
        userId,
      );
      if (!res) throw new Error();

      ctx.body = {
        code: '200',
        data: null,
        message: '修改成功',
      };
    } catch (err) {
      ctx.app.emit('error', passwordUpdateError, ctx);
    }
  }

  /**
   * @description: 更换邮箱
   * @param {*} ctx 上下文对象
   * @return {*}
   */
  async updateEmial(ctx) {
    const { email, password } = ctx.request.body;
    const { userId } = ctx.state.user;
    try {
      // 判断用户是否存在
      const user = await getUserInfo({ id: userId });
      if (!user) return ctx.app.emit('error', userDoesNotExist, ctx);

      // 检查邮箱是否已被注册
      const userByEmail = await checkEmail(email, userId);
      if (userByEmail) return ctx.app.emit('error', emailAlreadyExists, ctx);

      // 校验密码
      const match = await bcrypt.compare(password, user.password);
      if (!match) throw new Error();

      const res = await updateUser(
        {
          email,
        },
        userId,
      );
      if (!res) throw new Error();

      // 邮箱更改成功，删除该邮箱的验证码，避免影响下次注册
      await redisClient.del(`verify:email:update:${email}`);
      // 邮箱更改成功，删除该邮箱的发送记录，避免影响下次发送
      await redisClient.del(`email:send:email:update:${email}`);

      ctx.body = {
        code: '200',
        data: null,
        message: '修改成功',
      };
    } catch (err) {
      ctx.app.emit('error', emailUpdateError, ctx);
    }
  }

  /**
   * @description: 恢复被删除的用户
   * @param {*} ctx 上下文对象
   * @return {*}
   */
  async restore(ctx) {
    const { ids } = ctx.request.body;
    try {
      // 查出ids对应的用户（包括软删除）
      const users = await findAllWithDeleted(ids);
      if (users.length === 0) return ctx.app.emit('error', userDoesNotExist, ctx);

      // 只恢复被删除的
      const deletedUsers = users.filter(u => u.deletedAt);
      if (deletedUsers.length === 0) {
        ctx.body = {
          code: '400',
          data: null,
          message: '所选用户均未被删除',
        };
        return;
      }

      const delUserIds = deletedUsers.map(u => u.id);
      const res = await restoreUser(delUserIds);
      if (res !== delUserIds.length) throw new Error();

      delUserIds.forEach(async userId => {
        await redisClient.del(`user_status:${userId}`);
      });

      ctx.body = {
        code: '200',
        data: null,
        message: '用户恢复成功',
      };
    } catch (err) {
      ctx.app.emit('error', userRestoreError, ctx);
    }
  }
}

module.exports = new UserController();
