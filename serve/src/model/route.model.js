const { DataTypes } = require('sequelize');
const sequelize = require('../db/sequelize');

// 前台路由表设计
const Route = sequelize.define(
  'route',
  {
    path: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      comment: '页面路径，唯一，不重复',
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      comment: '路由名称，唯一，不重复',
    },
    component: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: '路由组件名称',
    },
    meta: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {},
      comment: '路由的元信息（title，icon，type，categotyId等）',
    },
    role: {
      type: DataTypes.TINYINT,
      defaultValue: 4,
      comment: '用户权限，1：超级管理员，2：普通管理员，3：普通用户，4：游客',
    },
    parentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '父路由的 ID，用于支持层级结构',
    },
  },
  {
    paranoid: false, // 🚫 覆盖全局配置，使用硬删除
  },
);

// 路由与子路由的关系（自关联）
Route.associate = models => {
  // 一对多关系：一个父路由可以有多个子路由
  Route.hasMany(models.route, {
    foreignKey: 'parentId',
    as: 'children',
  });
};

module.exports = Route;
