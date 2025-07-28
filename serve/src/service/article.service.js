const { Op } = require('sequelize');

const {
  article: Article,
  tag: Tag,
  category: Category,
  comment: Comment,
  user: User,
} = require('../model/index'); // 引入 index.js 中的 db 对象，包含所有模型

class ArticleService {
  async getArticleInfo({ id, userId, title }) {
    const whereOpt = {
      title,
      userId,
    };
    if (id) whereOpt.id = { [Op.ne]: id };
    const res = await Article.findOne({
      attributes: ['id', 'title'],
      where: whereOpt,
    });
    return res ? res.dataValues : null;
  }

  async createArticle({ userId, title, content, categoryId, tagList }, transaction) {
    const tags = tagList.map(t => ({ name: t, categoryId }));
    const res = await Article.create(
      { userId, categoryId, title, content, tags },
      {
        include: [Tag],
      },
    );

    return res ? res.dataValues : null;
  }

  async findArticle({ categoryId, keyword, tag, userId, order, pageNum, pageSize }) {
    let articleOrder = [['createdAt', 'DESC']];
    if (order === 'viewCount') articleOrder = [['viewCount', 'DESC']];

    const whereOpt = {
      // userId,
      [Op.or]: {
        title: {
          [Op.like]: `%${keyword || ''}%`,
        },
        content: {
          [Op.like]: `%${keyword || ''}%`,
        },
      },
    };
    categoryId && Object.assign(whereOpt, { categoryId });

    const { count, rows } = await Article.findAndCountAll({
      limit: pageSize * 1,
      offset: (pageNum - 1) * pageSize,
      where: whereOpt,
      attributes: {
        exclude: ['updatedAt'], // 不返回更新时间戳字段
      },
      include: [
        {
          model: Tag, // 关联 Tag 模型
          attributes: ['name'], // 只返回 name 字段
          where: tag ? { name: tag } : {}, // 如果有传入 tag，则进行过滤
        },
        {
          model: Category, // 关联 Tag 模型
          attributes: ['id', 'name'], // 只返回 name 字段
          as: 'category',
          where: categoryId ? { id: categoryId } : {}, // 如果有传入 tag，则进行过滤
        },
      ],
      distinct: true, // 关键点：去重计数
      order: articleOrder,
    });

    return {
      pageNum,
      pageSize,
      total: count,
      list: rows,
    };
  }

  async findOneArticle(id) {
    const res = await Article.findOne({
      where: {
        id,
      },
      attributes: {
        exclude: ['updatedAt'], // 不返回更新时间戳字段
      },
      include: [
        {
          model: Tag, // 关联 Tag 模型
          attributes: ['name'], // 只返回 name 字段
        },
        {
          model: Category, // 关联 Category 模型
          as: 'category',
          attributes: ['id', 'name'], // 只返回 name 字段
        },
        {
          model: Comment, // 关联 Comment 模型
          as: 'comments', // 使用在 Article 模型中定义的关联别名
          attributes: ['id', 'content', 'createdAt'], // 只返回必要字段
          separate: true, // 单独查询嵌套数据并排序
          where: {
            entityId: id,
            entityType: 'post', // 确保是一级评论
          },
          include: [
            {
              model: Comment, // 自关联，获取回复评论
              as: 'replies', // 使用在 Comment 模型中定义的关联别名
              attributes: ['id', 'content', 'createdAt'],
              separate: true, // 单独查询嵌套数据并排序
              include: [
                {
                  model: User, // 回复评论的作者信息
                  as: 'author',
                  attributes: ['id', 'username'],
                },
                {
                  model: User, // 回复评论的目标用户信息
                  as: 'replyToUser',
                  attributes: ['id', 'username'],
                },
              ],
              order: [['createdAt', 'ASC']], // 回复按创建时间升序排列(从早到晚)
            },
            {
              model: User, // 评论作者信息
              as: 'author',
              attributes: ['id', 'username'],
            },
          ],
          order: [['createdAt', 'DESC']], // 一级评论按创建时间升序排列(从早到晚)
        },
      ],
    });

    return res ? res.dataValues : null;
  }

  async updateArticleViewCount({ id, viewCount }) {
    const res = await Article.update(
      {
        viewCount: ++viewCount, // 浏览量加一
      },
      {
        where: { id },
      },
    );
    return res[0] > 0 ? true : false;
  }

  async removeComment(ids, transaction) {
    const res = await Comment.destroy({
      where: {
        entityId: {
          [Op.in]: ids,
        },
        entityType: 'post',
      },
      transaction,
    });
    return res > 0 ? true : false;
  }

  async removeArticle(ids, transaction) {
    const res = await Article.destroy({
      where: {
        id: ids,
      },
      transaction,
    });
    return res > 0 ? true : false;
  }

  async updateArticle({ id, categoryId, content, tagList, title }, transaction) {
    const tags = tagList.map(t => ({ name: t, articleId: id, categoryId }));
    const res = await Article.update(
      { title, content, categoryId },
      {
        where: { id },
        transaction,
      },
    );

    await Tag.destroy({ where: { articleId: id }, transaction });
    await Tag.bulkCreate(tags, {
      transaction,
    });

    return res[0] > 0 ? true : false;
  }

  async outputArticle(ids) {
    const whereOpt = {};
    let distinctCategories = [];
    if (ids) {
      const articleList = ids.split(',');
      whereOpt.id = articleList;
    } else {
      // 导出全部文章，根据分类名称生成目录结构
      distinctCategories = await Article.findAll({
        attributes: ['categoryId'],
        group: ['categoryId'],
        raw: true,
      });

      if (distinctCategories.length)
        whereOpt.categoryId = distinctCategories.map(item => item.categoryId);
    }

    const res = await Article.findAll({
      where: whereOpt,
      include: [
        {
          model: Tag,
          attributes: ['name'],
        },
        {
          model: Category,
          as: 'category',
          attributes: ['name'],
        },
      ],
    });

    return res ? res : [];
  }
}

module.exports = new ArticleService();
