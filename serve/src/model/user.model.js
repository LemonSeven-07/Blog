const { DataTypes } = require('sequelize');

const sequelize = require('../db/sequelize');

const User = sequelize.define('user', {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    comment: '用户名，唯一',
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    comment: '邮箱，唯一',
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

// associate 解决循环依赖问题。当模型 A 关联模型 B，同时模型 B 又关联模型 A 时，associate 可以延迟关联的执行，避免循环引用报错。
User.associate = models => {
  // 一篇文章只能有一个作者
  User.hasMany(models.article, {
    foreignKey: 'userId',
    as: 'articles',
  });
};

module.exports = User;
