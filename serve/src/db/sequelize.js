const { Sequelize } = require('sequelize');

require('../config/config.default.js');

const { MYSQL_HOST, MYSQL_PORT, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE, NODE_ENV } =
  process.env;

const sequelize = new Sequelize(MYSQL_DATABASE, MYSQL_USER, MYSQL_PASSWORD, {
  host: MYSQL_HOST,
  port: MYSQL_PORT,
  dialect: 'mysql',
  timezone: '+08:00', // 设置时区为东八区
  dialectOptions: {
    dateStrings: true, // 将日期字段转换为字符串
    typeCast: true, // 允许将日期字段转换为 JavaScript Date 对象
  },
  logging:
    NODE_ENV !== 'development'
      ? false // 生产环境关闭日志
      : msg => {
          console.log(`🚀 [Sequelize] ${msg}`); // 开发环境输出日志
        },
});

// sequelize
//   .authenticate()
//   .then(() => {
//     console.log('✅ 数据库连接成功');
//   })
//   .catch(err => {
//     console.log('❌ 数据库连接失败', err);
//   });

module.exports = sequelize;
