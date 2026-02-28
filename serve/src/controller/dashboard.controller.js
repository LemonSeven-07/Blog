const { dashboardStatsError } = require('../constant/err.type');
const { getDashboardStats } = require('../service/dashboard.service');

class DashboardController {
  /**
   * @description: 获取仪表盘统计数据
   * @param {*} ctx
   * @return {*}
   */
  async stats(ctx) {
    const { userId } = ctx.state.user;
    try {
      const res = await getDashboardStats(userId);

      ctx.body = {
        code: '200',
        message: '获取统计数据成功',
        data: res,
      };
    } catch (err) {
      ctx.app.emit('error', dashboardStatsError, ctx);
    }
  }
}

module.exports = new DashboardController();
