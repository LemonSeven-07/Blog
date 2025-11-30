const { Sequelize, Op } = require('sequelize');

const { user: User } = require('../model/index'); // 引入 index.js 中的 db 对象，包含所有模型

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
   * @param {*} userId 用户id
   * @return {*}
   */
  async removeUser(userId) {
    const res = await User.destroy({
      where: {
        id: userId,
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
  async updateUer({ username, email, password, avatar, banned, role }, userId) {
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
   * @return {*}
   */
  async findUsers({ pageNum, pageSize, username, type, rangeDate }, userId) {
    const whereOpt = {
      // 查询id不为登录用户id的用户数据
      id: {
        [Op.ne]: userId,
      },
    };
    username && Object.assign(whereOpt, { username });
    // 检索类型 type = 1 github 用户 type = 2 站内用户 不传则检索所有
    if (type == 1) {
      // github用户需要github字段有值且password字段为空
      whereOpt[Op.and] = [
        {
          gitHub: {
            [Op.and]: [{ [Op.not]: null }, { [Op.not]: '' }],
          },
        },
        {
          password: {
            [Op.or]: [{ [Op.eq]: null }, { [Op.eq]: '' }],
          },
        },
      ];
    } else if (type == 2) {
      // 站内用户需要password字段有值且github字段为空
      whereOpt[Op.and] = [
        {
          gitHub: {
            [Op.or]: [{ [Op.eq]: null }, { [Op.eq]: '' }],
          },
        },
        {
          password: {
            [Op.and]: [{ [Op.not]: null }, { [Op.not]: '' }],
          },
        },
      ];
    }

    if (rangeDate) {
      // 查询createdAt在日期[new Date(interval[0]), new Date(interval[1])]范围内的用户
      const interval = rangeDate.split(',');
      whereOpt.createdAt = {
        [Op.between]: [new Date(interval[0]), new Date(interval[1])],
      };
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
        // 判断是否是github用户和站内用户，并根据判断结果生成虚拟字段type，type = 1 github 用户 type = 2 站内用户，默认站内用户
        [
          Sequelize.literal(`
      CASE 
        WHEN gitHub IS NOT NULL AND gitHub != '' AND (password IS NULL OR password = '') THEN 1
        WHEN password IS NOT NULL AND password != '' AND (gitHub IS NULL OR gitHub = '') THEN 2
        ELSE 2
      END
    `),
          'type',
        ],
      ],
    });

    return {
      pageNum,
      pageSize,
      total: count,
      list: rows,
    };
  }
}

module.exports = new UserService();
