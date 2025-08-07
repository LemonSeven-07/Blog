const fs = require('fs');
const path = require('path');

const sequelize = require('../db/sequelize');

const db = {};

// 加载所有模型文件
fs.readdirSync(__dirname).forEach(file => {
  if (file !== 'index.js') {
    const model = require(path.join(__dirname, file));
    db[model.name] = model;
  }
});

// 执行关联
Object.values(db).forEach(model => {
  if (model.associate) {
    model.associate(db); // 将包含所有模型的 db 对象传入
  }
});

db.sequelize = sequelize;

// // 同步所有模型到数据库;
// sequelize.sync({ force: false }).then(() => {
//   console.log('✅ 同步所有模型');
// });

module.exports = db;
