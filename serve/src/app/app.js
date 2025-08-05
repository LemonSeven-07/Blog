const path = require('path');

const Koa = require('koa');
const { koaBody } = require('koa-body');
const KoaStatic = require('koa-static');
const parameter = require('koa-parameter');

require('../config/config.default.js');
const errHandler = require('./errHandler.js');
const router = require('../router/index.js');

const app = new Koa();

// 解析 HTTP 请求体数据
app.use(
  koaBody({
    parsedMethods: ['POST', 'PUT', 'PATCH', 'DELETE']
  })
);
// 将指定目录（如 uploads）设置为静态文件服务，使客户端可以直接通过 URL 访问其中的文件。
app.use(KoaStatic(path.join(__dirname, '../uploads')));
// 全局注入参数校验能力 ctx.verifyParams 校验请求体；ctx.verifyQuery 校验查询参数；ctx.verifyHeader 校验请求头
app.use(parameter(app));
// 将 koa-router 定义的所有路由规则挂载到 Koa 应用，使请求能够匹配到对应的处理函数。
app.use(router.routes());
// 处理 HTTP 方法不被允许时的响应
app.use(router.allowedMethods());

// 统一处理异常
app.on('error', errHandler);
module.exports = app;
