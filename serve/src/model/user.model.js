const { DataTypes } = require('sequelize');

const seq = require('../db/seq');

const User = seq.define('user', {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    comment: '用户名，唯一，不重复',
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: '密码',
  },
  role: {
    type: DataTypes.TINYINT,
    defaultValue: 2,
    comment: '用户权限，1：admin, 2：普通用户',
  },
  github: {
    type: DataTypes.TEXT,
    comment: 'github登录用户',
  },
  disabledDiscuss: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: '是否禁言，true禁言，false不禁言',
  },
});

module.exports = User;
