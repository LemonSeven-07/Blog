const { createRoute } = require('../service/route.service');
const { routeCreateError } = require('../constant/err.type');
const { sequelize } = require('../model/index');

class RouteController {
  async create(ctx) {
    const { path, name, component, meta, role = 4 } = ctx.request.body;
    try {
      const res = await createRoute({ path, name, component, meta, role });
      if (!res) throw new Error();

      ctx.body = {
        code: '200',
        data: null,
        message: '页面路由创建成功',
      };
    } catch (err) {
      ctx.app.emit('error', routeCreateError, ctx);
    }
  }

  async findRoutes(ctx) {
    try {
    } catch (err) {}
  }
}

module.exports = new RouteController();
