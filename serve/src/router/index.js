const fs = require('fs');

const Router = require('koa-router');
const router = new Router();

// 读取当前目录下的所有文件
fs.readdirSync(__dirname).forEach(file => {
  if (file !== 'index.js') {
    const filePath = require('./' + file);
    // 指定路由模块（filePath）中定义的所有路由规则，挂载到当前的路由器实例（router）上
    // filePath.routes() 生成一个 Koa 中间件，包含 filePath 模块中定义的所有路由（如 get/post 等）。
    // router.use() 将这些路由规则合并到当前 router 实例中，使它们生效。
    router.use(filePath.routes());
  }
});

module.exports = router;
