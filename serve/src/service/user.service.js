const { Sequelize, Op } = require('sequelize');

const { user: User } = require('../model/index'); // 引入 index.js 中的 db 对象，包含所有模型

const { yyyymmddToDateTime } = require('../utils/index');

class UserService {
  /**
   * @description: 查询用户信息
   * @param {*} id 用户id
   * @param {*} username 用户名
   * @param {*} password 用户密码
   * @param {*} banned 是否禁言，true禁言，false不禁言
   * @param {*} role 用户权限，1：超级管理员, 2：普通管理员, 3：普通用户
   * @param {*} paranoid true 查询操作会自动忽略已被软删除的用户记录；false 已被软删除的用户记录也会被查出来
   * @return {*}
   */
  async getUserInfo({ id, username, email, paranoid = true }) {
    const whereOpt = {};
    id && Object.assign(whereOpt, { id });
    username && Object.assign(whereOpt, { username });
    email && Object.assign(whereOpt, { email });

    // findOne 方法查询单条数据
    const res = await User.findOne({
      attributes: ['id', 'username', 'email', 'password', 'avatar', 'banned', 'role', 'createdAt'],
      where: whereOpt,
      paranoid,
    });
    return res ? res.dataValues : null;
  }

  /**
   * @description: 创建用户
   * @param {*} username 用户名
   * @param {*} email 邮箱
   * @param {*} password 用户密码
   * @return {*}
   */
  async createUser({ username, email, password }) {
    // 创建用户
    let res = await User.create({
      username,
      password,
      email,
    });
    return res ? res.dataValues : null;
  }

  /**
   * @description: 删除用户
   * @param {number[]} ids 用户id数组
   * @return {*}
   */
  async removeUser(ids) {
    const res = await User.destroy({
      where: {
        id: ids,
      },
    });
    return res > 0 ? true : false;
  }

  /**
   * @description: 修改用户信息
   * @param {*} username 用户名
   * @param {*} email 邮箱
   * @param {*} password 用户密码
   * @param {*} avatar 头像
   * @param {*} banned 是否禁言，true禁言，false不禁言
   * @param {*} role 用户权限，1：admin, 2：普通用户
   * @param {*} userId 用户id
   * @return {*}
   */
  async updateUser({ username, email, password, avatar, banned, role }, userId, transaction) {
    let whereOpt = {};
    if (userId) {
      Object.assign(whereOpt, { id: userId });
    } else {
      Object.assign(whereOpt, { email });
    }

    const newUser = {};
    username && Object.assign(newUser, { username });
    email && Object.assign(newUser, { email });
    password && Object.assign(newUser, { password });
    avatar && Object.assign(newUser, { avatar });
    role && Object.assign(newUser, { role });
    banned !== undefined && Object.assign(newUser, { banned });

    const res = await User.update(newUser, {
      where: whereOpt,
      ...(transaction ? { transaction, paranoid: false } : { paranoid: false }),
    });

    return res[0] > 0 ? true : false;
  }

  /**
   * @description: 按条件分页查询用户列表
   * @param {*} pageNum 页数
   * @param {*} pageSize 每页数据量
   * @param {*} username 用户名
   * @param {*} type 1 github用户；2 站内用户
   * @param {*} rangeDate 用户注册日期范围，起止日期以逗号分隔
   * @param {*} userId 用户id
   * @param {*} isDeleted 是否软删除过滤 0：未删除 1：已删除
   * @return {*}
   */
  async findUsers({ pageNum, pageSize, username, role, registerDate, isDeleted }, userId) {
    const whereOpt = {
      // 查询id不为登录用户id的用户数据
      id: {
        [Op.ne]: userId,
      },
    };

    username &&
      Object.assign(whereOpt, {
        username: {
          [Op.like]: `%${username}%`,
        },
      });
    role && Object.assign(whereOpt, { role });

    // 是否软删除过滤
    if (isDeleted * 1 === 0) {
      // 只查询未被软删除用户
      Object.assign(whereOpt, {
        deletedAt: null,
      });
    } else if (isDeleted * 1 === 1) {
      // 只查询被软删除用户
      Object.assign(whereOpt, {
        deletedAt: {
          [Op.ne]: null,
        },
      });
    }

    // 文章发布起止时间
    if (registerDate) {
      const [start, end] = registerDate.split(',') || [];
      if (start && end) {
        Object.assign(whereOpt, {
          createdAt: {
            [Op.between]: [yyyymmddToDateTime(start), yyyymmddToDateTime(end, true)],
          },
        });
      } else if (start) {
        Object.assign(whereOpt, {
          createdAt: {
            [Op.gte]: yyyymmddToDateTime(start), // 大于等于开始时间
          },
        });
      } else if (end) {
        Object.assign(whereOpt, {
          createdAt: {
            [Op.lte]: yyyymmddToDateTime(end, true), // 小于等于结束时间
          },
        });
      }
    }

    const { count, rows } = await User.findAndCountAll({
      order: [
        ['createdAt', 'DESC'], // ASC 表示升序，DESC 表示降序
      ],
      limit: pageSize * 1,
      offset: (pageNum - 1) * pageSize,
      where: whereOpt,
      attributes: [
        'id',
        'username',
        'banned',
        'createdAt',
        'email',
        'role',
        'avatar',
        'createdAt',
        'deletedAt',
      ],
      paranoid: false, // 查出被软删除用户
    });

    return {
      total: count,
      list: rows,
    };
  }

  /**
   * @description: 查出所有（包括软删除）
   * @param {number[]} ids 用户id数组
   * @return {*}
   */
  async findAllWithDeleted(ids) {
    const users = await User.findAll({
      where: { id: ids },
      paranoid: false,
    });

    return users;
  }

  /**
   * @description: 恢复用户
   * @param {number[]} ids 恢复被删除用户的id数组
   * @return {*}
   */
  async restoreUser(ids) {
    const res = await User.restore({
      where: {
        id: ids,
      },
    });

    return res;
  }

  /**
   * @description: 修改用户名时检查用户名是否已存在
   * @param {*} username 用户名
   * @param {*} userId 用户id
   * @return {*}
   */
  async checkUsername(username, userId) {
    const whereOpt = {
      // 查询id不为登录用户id的用户数据
      id: {
        [Op.ne]: userId,
      },
      username,
    };

    const res = await User.findOne({
      where: whereOpt,
      paranoid: false, // 查出被软删除用户
    });

    return res ? res.dataValues : null;
  }

  /**
   * @description: 修改邮箱名时检查邮箱是否已存在
   * @param {*} email 用户名
   * @param {*} userId 用户id
   * @return {*}
   */
  async checkEmail(email, userId) {
    const whereOpt = {
      // 查询id不为登录用户id的用户数据
      id: {
        [Op.ne]: userId,
      },
      email,
    };

    const res = await User.findOne({
      where: whereOpt,
      paranoid: false, // 查出被软删除用户
    });

    return res ? res.dataValues : null;
  }
}

module.exports = new UserService();
