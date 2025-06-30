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
}

module.exports = new UserService();
