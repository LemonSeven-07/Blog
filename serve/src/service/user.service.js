const { Sequelize, Op } = require('sequelize');

const { user: User } = require('../model/index'); // 引入 index.js 中的 db 对象，包含所有模型

class UserService {
  async getUserInfo({ id, username, password, disabledDiscuss, role }) {
    const whereOpt = {};
    id && Object.assign(whereOpt, { id });
    username && Object.assign(whereOpt, { username });
    password && Object.assign(whereOpt, { password });
    disabledDiscuss && Object.assign(whereOpt, { disabledDiscuss });
    role && Object.assign(whereOpt, { role });

    // findOne 方法查询单条数据
    const res = await User.findOne({
      attributes: ['id', 'username', 'password', 'disabledDiscuss', 'role'],
      where: whereOpt,
    });
    return res ? res.dataValues : null;
  }

  async createUser({ username, password }) {
    // 创建用户
    let res = await User.create({
      username,
      password,
    });
    return res ? res.dataValues : null;
  }

  async removeUser(userId) {
    const res = await User.destroy({
      where: {
        id: userId,
      },
    });
    return res > 0 ? true : false;
  }

  async updateUer({ username, password, disabledDiscuss, role }, userId) {
    const whereOpt = { id: userId };
    const newUser = {};

    username && Object.assign(newUser, { username });
    password && Object.assign(newUser, { password });
    role && Object.assign(newUser, { role });
    disabledDiscuss !== undefined && Object.assign(newUser, { disabledDiscuss });
    const res = await User.update(newUser, {
      where: whereOpt,
    });
    return res[0] > 0 ? true : false;
  }

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
        'disabledDiscuss',
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
