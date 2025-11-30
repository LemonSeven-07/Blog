const { DataTypes } = require('sequelize');

const sequelize = require('../db/sequelize');

const User = sequelize.define('user', {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    comment: '用户名，唯一，不重复',
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
    comment: '邮箱，唯一，不重复',
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: '密码',
  },
  avatar: {
    type: DataTypes.STRING(255),
    allowNull: true,
    defaultValue: null,
    validate: {
      isUrl: true,
    },
    comment: '用户头像',
  },
  role: {
    type: DataTypes.TINYINT,
    defaultValue: 3,
    comment: '用户权限，1：超级管理员，2：普通管理员，3：普通用户',
  },
  banned: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: '是否禁言，true禁言，false不禁言',
  },
});

module.exports = User;
