const { route: Route } = require('../model/index'); // 引入 index.js 中的 db 对象，包含所有模型
const { Op } = require('sequelize');

class RouteService {
  /**
   * @description: 创建路由
   * @param {*} path 路由路径
   * @param {*} name 路由名称
   * @param {*} component 路由组件名称
   * @param {*} meta 路由元信息
   * @param {*} transaction sequelize 事务对象
   * @return {*}
   */
  async createRoute({ path, name, component, meta, role }, transaction) {
    let res = await Route.create(
      {
        path,
        name,
        component,
        meta,
        role,
      },
      { transaction },
    );
    return res ? res.dataValues : null;
  }

  /**
   * @description: 获取路由
   * @param {*} whereOpt 查询条件
   * @return {*}
   */
  async getRoutes({ role }) {
    const whereOpt = {
      role: {
        [Op.gte]: role,
      },
    };
    const res = await Route.findAll({
      attributes: ['id', 'path', 'name', 'component', 'meta', 'parentId'],
      where: whereOpt,
      order: [
        ['parentId', 'ASC'],
        ['id', 'ASC'],
      ],
    });

    // 将每个sequelize实例转换为纯js对象
    const plainRoutes = res.map(route => route.get({ plain: true })) || [];
    return plainRoutes;
  }
}

module.exports = new RouteService();
