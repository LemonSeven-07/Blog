const { route: Route } = require('../model/index'); // 引入 index.js 中的 db 对象，包含所有模型
const { Sequelize, Op } = require('sequelize');

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

  /**
   * @description: 更新路由
   * @param {*} id 路由id
   * @param {*} categoryId meta中分类id，只有分类路由才会有这个id且唯一
   * @param {*} path 页面路径，唯一
   * @param {*} name 路由名称，唯一
   * @param {*} component 路由组件名称
   * @param {*} meta 路由的元信息（title，icon，type，categotyId等）
   * @param {*} role 路由权限等级 1：超级管理员，2：普通管理员，3：普通用户，4：游客
   * @param {*} transaction sequelize 事务对象
   * @return {*}
   */
  async updateRoute({ id, categoryId, path, name, component, meta, role }, transaction) {
    const whereOpt = id
      ? { id }
      : {
          [Op.and]: [
            Sequelize.where(
              Sequelize.fn(
                'JSON_UNQUOTE',
                Sequelize.fn('JSON_EXTRACT', Sequelize.col('meta'), '$.categoryId'),
              ),
              String(categoryId),
            ),
          ],
        };

    const newRoute = {};
    path && Object.assign(newRoute, { path });
    name && Object.assign(newRoute, { name });
    component && Object.assign(newRoute, { component });
    meta && Object.assign(newRoute, { meta });
    role && Object.assign(newRoute, { role });

    const res = await Route.update(newRoute, {
      where: whereOpt,
      transaction,
    });

    return res[0] > 0 ? true : false;
  }

  /**
   * @description: 删除路由
   * @param {*} id 路由id
   * @param {*} categoryId meta数据中的分类id
   * @param {*} transaction sequelize 事务对象
   * @return {*}
   */
  async deleteRoute({ id, categoryIds }, transaction) {
    if (id) {
      // 单个删除
      const res = await Route.destroy({
        where: { id },
        transaction,
      });
      return res > 0;
    }

    if (!categoryIds || categoryIds.length === 0) return false;

    // 批量删除
    const res = await Route.destroy({
      where: Sequelize.literal(
        `JSON_UNQUOTE(JSON_EXTRACT(meta, '$.categoryId')) IN (${categoryIds
          .map(c => `'${c}'`)
          .join(',')})`,
      ),
      transaction,
    });

    return res > 0;
  }
}

module.exports = new RouteService();
