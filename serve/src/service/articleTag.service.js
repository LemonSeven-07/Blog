const { articleTag: ArticleTag } = require('../model/index'); // 引入 index.js 中的 db 对象，包含所有模型
const { Op } = require('sequelize');

class ArticleTagService {
  /**
   * @description: 查询是否有标签被使用
   * @param {*} idOrIds 标签的 ID 或 ID数组
   * @return {*}
   */
  async checkTagsUsage(idOrIds) {
    if (Array.isArray(idOrIds)) {
      // 处理多个标签ID
      const usageCount = await ArticleTag.count({
        where: {
          tagId: {
            [Op.in]: idOrIds,
          },
        },
      });

      // 如果 count > 0，说明至少有一个标签被文章使用
      return usageCount > 0;
    } else {
      // 处理单个标签ID
      const res = await ArticleTag.findOne({
        where: { tagId: idOrIds },
      });
      return res ? res.dataValues : null;
    }
  }
}

module.exports = new ArticleTagService();
