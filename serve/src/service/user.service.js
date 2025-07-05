const { Sequelize, Op } = require('sequelize');

const User = require('../model/user.model.js');

class UserService {
  async getUserInfo({ id, username, password, email, notice, disabledDiscuss, role }) {
    const whereOpt = {};
    id && Object.assign(whereOpt, { id });
    username && Object.assign(whereOpt, { username });
    password && Object.assign(whereOpt, { password });
    email && Object.assign(whereOpt, { email });
    notice && Object.assign(whereOpt, { notice });
    disabledDiscuss && Object.assign(whereOpt, { disabledDiscuss });
    role && Object.assign(whereOpt, { role });

    // findOne 方法查询单条数据
    const res = await User.findOne({
      attributes: ['id', 'username', 'password', 'email', 'notice', 'disabledDiscuss', 'role'],
      where: whereOpt,
    });
    return res ? res.dataValues : null;
  }

  async createUser({ username, password, email }) {
    // 创建用户
    let res = await User.create({
      username,
      password,
      email,
    });
    return res.dataValues;
  }

  async removeUser(userId) {
    const res = await User.destroy({
      where: {
        id: userId,
      },
    });
    return res > 0 ? true : false;
  }

  async updateUer({ username, password, email, notice, disabledDiscuss, role }, userId) {
    const whereOpt = { id: userId };
    const newUser = {};

    username && Object.assign(newUser, { username });
    password && Object.assign(newUser, { password });
    email && Object.assign(newUser, { email });
    role && Object.assign(newUser, { role });
    notice !== undefined && Object.assign(newUser, { notice });
    disabledDiscuss !== undefined && Object.assign(newUser, { disabledDiscuss });
    const res = await User.update(newUser, {
      where: whereOpt,
    });

    return res[0] > 0 ? true : false;
  }

  async findUsers({ pageNum, pageSize, username, type, rangeDate }, userId) {
    const whereOpt = {
      id: {
        [Op.ne]: userId,
      },
    };
    username && Object.assign(whereOpt, { username });
    // 检索类型 type = 1 github 用户 type = 2 站内用户 不传则检索所有
    if (type == 1) {
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
      const interval = rangeDate.split(',');
      whereOpt.createdAt = {
        [Op.between]: [new Date(interval[0]), new Date(interval[1])],
      };
    }

    const { count, rows } = await User.findAndCountAll({
      limit: pageSize * 1,
      offset: (pageNum - 1) * pageSize,
      where: whereOpt,
      attributes: [
        'id',
        'username',
        'email',
        'notice',
        'disabledDiscuss',
        'createdAt',
        [
          Sequelize.literal(`
      CASE 
        WHEN gitHub IS NOT NULL AND gitHub != '' AND (password IS NULL OR password = '') THEN 1
        WHEN password IS NOT NULL AND password != '' AND (gitHub IS NULL OR gitHub = '') THEN 2
        ELSE 0
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
