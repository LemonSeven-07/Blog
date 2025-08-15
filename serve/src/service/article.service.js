const fs = require('fs'); // 原生路径处理模块（用于安全拼接路径）
const path = require('path'); // 原生路径处理模块（用于安全拼接路径）
const { Op } = require('sequelize');

const { decodeFile } = require('../utils/index');

const {
  article: Article,
  tag: Tag,
  category: Category,
  comment: Comment,
  user: User,
} = require('../model/index'); // 引入 index.js 中的 db 对象，包含所有模型

class ArticleService {
  /**
   * @description: 查询文章信息（根据文章标题和当前用户的id查询除当前文章id之外的数据）
   * @param {*} id 文章id
   * @param {*} userId 当前用户id
   * @param {*} title 文章标题
   * @return {*}
   */
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

  /**
   * @description: 创建文章（向articles表中插入一条数据）
   * @param {*} userId 当前用户id
   * @param {*} title 文章标题
   * @param {*} content 文章内容
   * @param {*} categoryId 文章分类id
   * @param {*} tagList 标签名 数组
   * @return {*}
   */
  async createArticle({ userId, title, content, categoryId, tagList }) {
    const tags = tagList.map(t => ({ name: t, categoryId }));
    const res = await Article.create(
      { userId, categoryId, title, content, tags },
      {
        // 关联创建文章标签
        include: [Tag],
      },
    );

    return res ? res.dataValues : null;
  }

  /**
   * @description: 分页查询文章列表
   * @param {*} categoryId 文章id
   * @param {*} keyword 查询关键字
   * @param {*} tag 标签名
   * @param {*} userId 当前用户id
   * @param {*} order 排序方式 默认根据文章发布时间降序排列
   * @param {*} pageNum 页数
   * @param {*} pageSize 每页数据量
   * @return {*}
   */
  async findArticle({ categoryId, keyword, tag, userId, order, pageNum, pageSize }) {
    let articleOrder = [['createdAt', 'DESC']];
    // 根据浏览量排序
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

  /**
   * @description: 滚动查询文章列表
   * @param {*} keyword 查询关键字
   * @param {*} tag 标签名
   * @param {*} categoryId 分类id
   * @param {*} lastId 上次查询的最后一条数据的id
   * @param {*} lastSortValue 如果是按发布时间查询，lastSortValue为上次查询最后一条数据的发布时间；如果是按浏览量则是最后一条数据的浏览量
   * @param {*} limit 每次滚动查询数量
   * @param {*} sortBy 排序方式 默认根据发布时间降序
   * @return {*}
   */
  async loadMoreArticle({ keyword, tag, categoryId, lastId, lastSortValue, limit, sortBy }) {
    // 1. 定义排序规则映射表
    const orderMap = {
      createdAt: [
        ['createdAt', 'DESC'],
        ['id', 'DESC'],
      ], // 第一排序规则：按发布时间降序. 第二排序规则：按ID降序
      viewCount: [
        ['viewCount', 'DESC'],
        ['id', 'DESC'],
      ], // 第一排序规则：按文章浏览量降序. 第二排序规则：按ID降序
    };
    // 根据sortBy参数选择排序规则，默认用createdAt
    const order = orderMap[sortBy];

    // 2. 构建查询条件对象
    const whereOpt = {
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
    // 如果有游标值（不是第一页请求）
    if (lastId && lastSortValue) {
      // 确定当前排序字段（createdAt或viewCount）
      const sortField = sortBy === 'createdAt' ? 'createdAt' : 'viewCount';
      const sortValue = sortBy === 'createdAt' ? lastSortValue : parseInt(lastSortValue);

      whereOpt[Op.or] = [
        // 条件1：排序字段值更小的记录
        { [sortField]: { [Op.lt]: sortValue } },

        // 条件2：排序字段值相同但ID更小的记录
        {
          [Op.and]: [{ [sortField]: sortValue }, { id: { [Op.lt]: lastId } }],
        },
      ];
    }

    // 3. 执行数据库查询
    const res = await Article.findAll({
      where: whereOpt, // 上文构建的查询条件
      limit: parseInt(limit), // 转换为数字类型
      attributes: {
        exclude: ['updatedAt'], // 不返回更新时间戳字段
      },
      order, // 排序规则
      include: [
        {
          model: Tag, // 关联 Tag 模型
          as: 'tags',
          attributes: ['id', 'name'], // 只返回 name 字段
          where: tag ? { name: tag } : {}, // 如果有传入 tag，则进行过滤
          required: !!tag, // 有 tag 就 inner join，否则 left join
        },
        {
          model: Category, // 关联 Tag 模型
          attributes: ['id', 'name'], // 只返回 name 字段
          as: 'category',
          where: categoryId ? { id: categoryId } : {}, // 如果有传入 tag，则进行过滤
          required: !!tag, // 有 tag 就 inner join，否则 left join
        },
      ],
    });

    // 4. 计算下一次请求的游标值
    let lastRecord = null;
    if (res.length) {
      lastRecord = res[res.length - 1];
    }
    const nextCursor = lastRecord
      ? {
          lastId: lastRecord.id, // 记录最后一条的ID
          // 根据当前排序方式返回对应的字段值
          lastSortValue:
            sortBy === 'createdAt'
              ? lastRecord.createdAt // 时间字符串
              : lastRecord.viewCount, // 直接返回浏览量
        }
      : null; // 如果没有数据了，返回null

    return {
      list: res,
      nextCursor, // 下一次请求的游标
      hasMore: res.length >= limit, // 是否还有更多数据
    };
  }

  /**
   * @description: 查询文章详情
   * @param {*} id 文章id
   * @return {*}
   */
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
          attributes: [
            'id',
            'authorId',
            'articleId',
            'content',
            'userId',
            'createdAt',
            'deletedAt',
          ], // 只返回必要字段
          separate: true, // 单独查询嵌套数据并排序
          paranoid: false,
          where: {
            entityId: id,
            entityType: 'post', // 确保是一级评论
          },
          include: [
            {
              model: Comment, // 自关联，获取回复评论
              as: 'replies', // 使用在 Comment 模型中定义的关联别名
              attributes: [
                'id',
                'authorId',
                'articleId',
                'content',
                'userId',
                'entityId',
                'createdAt',
                'deletedAt',
              ],
              separate: true, // 单独查询嵌套数据并排序
              paranoid: false,
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

    if (res) {
      // 把 Sequelize 模型实例转换成一个普通的 JavaScript 对象，方便直接拿数据做逻辑处理
      return res.get({ plain: true });
    } else {
      return null;
    }
  }

  /**
   * @description: 更新文章浏览量
   * @param {*} id 文章id
   * @param {*} viewCount 文章浏览量
   * @return {*}
   */
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

  /**
   * @description: 查询文章的评论
   * @param {*} ids 文章id数组
   * @param {*} transaction sequelize 事务对象
   * @return {*}
   */
  async findComment(ids, transaction) {
    const res = await Comment.findAll({
      where: {
        articleId: ids,
        [Op.or]: {
          notice: false, // 只查询未读评论
          hide: false, // 只查询未隐藏的评论
        },
      },
      raw: true, // 返回纯JavaScript对象
      lock: true, // 锁定表，防止其他事务修改
      transaction,
    });

    return res;
  }

  /**
   * @description: 删除文章的评论（支持删除单篇文章和多篇文章的评论）
   * @param {*} ids 文章id数组
   * @param {*} transaction sequelize 事务对象
   * @return {*}
   */
  async removeComment(ids, transaction) {
    const res = await Comment.destroy({
      where: {
        entityId: {
          [Op.in]: ids,
        },
        entityType: 'post',
      },
      force: true, // 彻底删除评论及其回复，跳过软删除
      paranoid: false, // 忽略软删除过滤规则（即使已被软删除也能删除）
      lock: true, // 锁定表，防止其他事务修改
      transaction,
    });
    return res > 0 ? res : false;
  }

  /**
   * @description: 删除文章（支持单篇文章或多篇文章的删除）
   * @param {*} ids 文章id数组
   * @param {*} transaction sequelize 事务对象
   * @return {*}
   */
  async removeArticle(ids, transaction) {
    const res = await Article.destroy({
      where: {
        id: ids,
      },
      lock: true, // 锁定表，防止其他事务修改
      transaction,
    });
    return res > 0 ? true : false;
  }

  /**
   * @description: 更新文章表数据
   * @param {*} id 文章id
   * @param {*} categoryId 分类id
   * @param {*} content 文章内容
   * @param {*} tagList 标签名数组
   * @param {*} title 文章标题
   * @param {*} transaction sequelize 事务对象
   * @return {*}
   */
  async updateArticle({ id, categoryId, content, tagList, title }, transaction) {
    const tags = tagList.map(t => ({ name: t, articleId: id, categoryId }));
    const res = await Article.update(
      { title, content, categoryId },
      {
        where: { id },
        lock: true, // 锁定表，防止其他事务修改
        transaction,
      },
    );

    // 删除原文章标签名
    await Tag.destroy({ where: { articleId: id }, transaction });
    // 批量创建当前文章的标签名
    tags.length &&
      (await Tag.bulkCreate(tags, {
        lock: true, // 锁定表，防止其他事务修改
        transaction,
      }));

    return res[0] > 0 ? true : false;
  }

  /**
   * @description: 查询导出文章列表
   * @param {*} ids 文章id，多篇文章用逗号分隔
   * @return {*}
   */
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

  /**
   * @description: 文章导入（根据导入文件名来判断是否是更新还是创建文章）
   * @param {*} file 文件对象
   * @param {*} userId 当前用户id
   * @param {*} transaction sequelize 事务对象
   * @return {*}
   */
  uploadArticle = async (file, userId, transaction) => {
    let fileData = await fs.promises.readFile(file.filepath, 'utf8');
    // 从md文件中分离出分类、标签、日期、文章主体内容
    let { category, tags = [], content } = decodeFile(fileData);
    // 通过分类查找分类id
    const categoryData = await Category.findOne({
      where: {
        name: category[0],
      },
      lock: true, // 锁定表，防止其他事务修改
      transaction,
    });
    let createData = {
      userId,
      categoryId: 99, // 分类默认其他
      title: path
        .parse(file.originalFilename)
        .name.replace(/[\/\\:*?"<>|]/g, '')
        .replace(/\s+/g, ' ')
        .trim(),
      content,
    };

    if (categoryData) createData.categoryId = categoryData.dataValues.id;

    if (tags.length) {
      let arr = [];
      tags[0].split('、').forEach(tag => {
        if (tag && tag !== '无') {
          arr.push({ name: tag, categoryId: createData.categoryId });
        }
      });
      if (arr.length) createData.tags = arr;
    }

    // 通过文章标题查找是否已存在该文章，如果有就更新表数据，没有就创建表数据
    const articleData = await this.getArticleInfo(
      { userId, title: createData.title },
      {
        lock: true, // 锁定表，防止其他事务修改
        transaction,
      },
    );

    if (articleData) {
      // 更新表数据
      let tagList = [];
      if (tags.length) {
        tagList = tags[0].split('、').filter(tag => tag && tag !== '无');
      }
      return await this.updateArticle(
        {
          id: articleData.id,
          categoryId: createData.categoryId,
          content,
          tagList,
          title: createData.title,
        },
        transaction,
      );
    } else {
      // 创建表数据
      const res = await Article.create(createData, {
        include: [Tag],
        lock: true, // 锁定表，防止其他事务修改
        transaction,
      });

      return res ? res.dataValues : null;
    }
  };
}

module.exports = new ArticleService();
