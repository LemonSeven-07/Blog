const { Sequelize, Op } = require('sequelize');

const {
  article: Article,
  tag: Tag,
  category: Category,
  comment: Comment,
  user: User,
  favorite: Favorite,
} = require('../model/index'); // 引入 index.js 中的 db 对象，包含所有模型

const { deleteGitHubImage, yyyymmddToDateTime } = require('../utils/index');

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
   * @description: 分页查询文章列表
   * @param {*} categoryId 文章id
   * @param {*} keyword 查询关键字
   * @param {*} tag 标签名
   * @param {*} userId 当前用户id
   * @param {*} username 用户名
   * @param {*} publishTimeRange 文章发布时间区间
   * @param {*} sort 返回数据排序规则
   * @param {*} pageNum 页数
   * @param {*} pageSize 每页数据量
   * @return {*}
   */
  async findArticle({
    categoryId,
    keyword,
    tagId,
    publishTimeRange,
    userId,
    username,
    sort,
    pageNum,
    pageSize,
  }) {
    // 1️⃣ 构建查询条件
    let articleOrder = [['createdAt', 'DESC']];
    // 根据浏览量排序
    if (sort === 'hot') articleOrder = [['viewCount', 'DESC']];

    const andConditions = [];
    if (keyword) {
      // 关键字条件（OR）
      andConditions.push({
        [Op.or]: {
          title: {
            [Op.like]: `%${keyword}%`,
          },
          content: {
            [Op.like]: `%${keyword}%`,
          },
        },
      });
    }
    // 分类条件
    if (categoryId) andConditions.push({ categoryId });

    // 文章发布起止时间
    if (publishTimeRange) {
      const [start, end] = publishTimeRange.split(',') || [];
      if (start && end) {
        andConditions.push({
          createdAt: {
            [Op.between]: [yyyymmddToDateTime(start), yyyymmddToDateTime(end, true)],
          },
        });
      } else if (start) {
        andConditions.push({
          createdAt: {
            [Op.gte]: yyyymmddToDateTime(start), // 大于等于开始时间
          },
        });
      } else if (end) {
        andConditions.push({
          createdAt: {
            [Op.lte]: yyyymmddToDateTime(end, true), // 小于等于结束时间
          },
        });
      }
    }

    // 2️⃣ 第一步：查询符合条件的文章 ID（分页）
    const articleIdRows = await Article.findAll({
      attributes: ['id'], // 只查询文章的 id，用于分页
      where: {
        [Op.and]: andConditions, // 上面构建的查询条件
      },
      include: tagId
        ? [
            {
              model: Tag,
              as: 'tags',
              attributes: [],
              through: { attributes: [] }, // 不返回中间表字段
              where: tagId ? { id: tagId } : {}, // 如果有 tagId，进行过滤
              required: true, // INNER JOIN
            },
          ]
        : [],
      limit: pageSize * 1, // 每页数量
      offset: (pageNum - 1) * pageSize, // 分页偏移量
      order: articleOrder, // 排序规则，按发布时间降序
      subQuery: false, // 防止在分页查询时被 JOIN 的行数污染
    });

    // 获取查询到的文章 ID
    const articleIds = articleIdRows.map(a => a.id);

    // 3️⃣ 第二步：根据文章 ID 查询文章详情，并返回标签、分类和作者信息
    const rows = await Article.findAll({
      where: {
        id: articleIds,
      },
      include: [
        {
          model: Tag,
          as: 'tags',
          attributes: ['id', 'name'], // 返回标签的 id 和 name
          through: { attributes: [] }, // 不返回中间表字段
          required: false, // LEFT JOIN
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name'], // 返回分类的 id 和 name
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username'], // 返回作者的 id 和 username
          where: userId ? { id: userId } : username ? { username } : {}, // 如果有 tagId，进行过滤
        },
      ],
      order: articleOrder, // 排序规则，按发布时间降序
    });

    // 4️⃣ 第三步：统计符合条件的文章总数（用于分页）
    const count = await Article.count({
      where: {
        [Op.and]: andConditions,
      },
      include: tagId
        ? [
            {
              model: Tag,
              as: 'tags',
              attributes: [],
              through: { attributes: [] },
              where: { id: tagId },
              required: true, // INNER JOIN
            },
          ]
        : [],
      distinct: true, // 去重，避免重复计数
    });

    return {
      list: rows, // 返回文章列表
      total: count, // 返回总数
    };
  }

  /**
   * @description: 滚动查询文章列表
   * @param {*} keyword 查询关键字
   * @param {*} tagId 标签id字符串
   * @param {*} categoryId 分类id
   * @param {*} lastId 上次查询的最后一条数据的id
   * @param {*} lastSortValue 如果是按发布时间查询，lastSortValue为上次查询最后一条数据的发布时间；如果是按浏览量则是最后一条数据的浏览量
   * @param {*} limit 每次滚动查询数量
   * @param {*} sort 排序方式 默认根据发布时间降序
   * @return {*}
   */
  async loadMoreArticle({ keyword, tagId, categoryId, lastId, lastSortValue, limit, sort }) {
    // 1. 定义排序规则映射表
    const orderMap = {
      new: [
        ['createdAt', 'DESC'],
        ['id', 'DESC'],
      ], // 第一排序规则：按发布时间降序. 第二排序规则：按ID降序
      hot: [
        ['viewCount', 'DESC'],
        ['id', 'DESC'],
      ], // 第一排序规则：按文章浏览量降序. 第二排序规则：按ID降序
    };
    // 根据sort参数选择排序规则，默认用createdAt
    const order = orderMap[sort];

    // 2. 构建查询条件对象
    const andConditions = [];
    if (keyword) {
      // 关键字条件（OR）
      andConditions.push({
        [Op.or]: {
          title: {
            [Op.like]: `%${keyword}%`,
          },
          content: {
            [Op.like]: `%${keyword}%`,
          },
        },
      });
    }
    // 分类条件
    if (categoryId) andConditions.push({ categoryId });
    // 如果有游标值（不是第一页请求）
    if (lastId && lastSortValue) {
      // 确定当前排序字段（createdAt或viewCount）
      const sortField = sort === 'new' ? 'createdAt' : 'viewCount';
      const sortValue = sort === 'new' ? lastSortValue : parseInt(lastSortValue);

      andConditions.push({
        [Op.or]: [
          // 条件1：排序字段值更小的记录
          { [sortField]: { [Op.lt]: sortValue } },
          // 条件2：排序字段值相同但ID更小的记录
          {
            [Op.and]: [{ [sortField]: sortValue }, { id: { [Op.lt]: lastId } }],
          },
        ],
      });
    }
    // 标签条件（存在多个标签id时，查询包含其中任意一个标签的文章）
    if (tagId) {
      andConditions.push({
        [Op.and]: Sequelize.literal(`
          EXISTS (
            SELECT 1
            FROM article_tags at
            WHERE at.article_id = Article.id
              AND at.tag_id IN (${String(tagId)})
          )
        `),
      });
    }

    // 3. 执行数据库查询
    const res = await Article.findAll({
      where: { [Op.and]: andConditions }, // 上文构建的查询条件
      limit: parseInt(limit), // 转换为数字类型
      attributes: {
        exclude: ['updatedAt', 'content'], // 不返回更新时间戳字段
      },
      order, // 排序规则
      include: [
        {
          model: Tag, // 关联 Tag 模型
          as: 'tags',
          attributes: ['id', 'name'], // 只返回 id name 字段
          through: { attributes: [] }, // 不返回中间表字段
        },
        {
          model: Category, // 关联 Tag 模型
          as: 'category',
          attributes: ['id', 'name'], // 只返回 id name 字段
          where: categoryId ? { id: categoryId } : {}, // 如果有传入 categoryId，则进行过滤
          required: !!categoryId, // 有 categoryId 就 inner join，否则 left join
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username'], // 只返回用户名和ID
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
            sort === 'new'
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
   * @param {*} userId 用户id
   * @return {*}
   */
  async findOneArticle(id, userId) {
    const res = await Article.findOne({
      where: {
        id,
      },
      attributes: {
        exclude: ['summary', 'coverImage', 'updatedAt'], // 不返回更新时间戳字段
      },
      include: [
        {
          model: Tag, // 关联 Tag 模型
          as: 'tags',
          attributes: ['id', 'name'], // 只返回 id name 字段
          through: { attributes: [] }, // 不返回中间表字段
        },
        {
          model: Category, // 关联 Category 模型
          as: 'category',
          attributes: ['id', 'name'], // 只返回 id name 字段
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'avatar'], // 只返回用户名和ID
        },
      ].concat(
        // 未登录无需关联查询文章收藏信息
        userId
          ? [
              {
                model: Favorite,
                as: 'favorites',
                where: { userId }, // 只查当前用户的收藏记录
                required: false, // left join，防止没有收藏也能返回文章 即使用户未收藏，也返回文章信息
                attributes: ['id'], // 只返回收藏id
              },
            ]
          : [],
      ),
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
   * @param {*} userId 文章作者id
   * @param {*} categoryId 分类id
   * @param {*} title 文章标题
   * @param {*} summary 文章摘要
   * @param {*} content 文章内容
   * @param {*} tagList 标签名数组
   * @param {*} coverImage 文章封面
   * @param {*} transaction sequelize 事务对象
   * @return {*}
   */
  async updateArticle(
    { id, userId, categoryId, title, summary, content, tagIds, coverImage },
    transaction,
  ) {
    // 1️⃣ 查询旧的文章实例获取旧的封面图片地址
    const article = await Article.findByPk(id, { transaction });

    // 2️⃣ 构造更新数据对象
    const newArticle = {};
    userId && Object.assign(newArticle, { userId });
    categoryId && Object.assign(newArticle, { categoryId });
    title && Object.assign(newArticle, { title });
    summary && Object.assign(newArticle, { summary });
    content && Object.assign(newArticle, { content });
    coverImage && Object.assign(newArticle, { coverImage });

    // 3️⃣ 更新文章基本信息
    const res = await Article.update(newArticle, {
      where: { id },
      lock: true, // 锁定表，防止其他事务修改
      transaction,
    });

    if (res[0] > 0) {
      // 4️⃣ 删除 GitHub 上旧的封面图片
      if (article && article.dataValues && article.dataValues.coverImage)
        deleteGitHubImage(article.dataValues.coverImage);

      // 5️⃣ 替换标签（自动插入 article_tags）
      await article.setTags(tagIds || [], { lock: true, transaction });
      return true;
    } else {
      return false;
    }
  }

  /**
   * @description: 批量更新 favoriteCount
   * @param {*} articleIds 文章 id 数组
   * @param {*} action 操作类型  add 收藏文章  remove 取消文章收藏
   * @param {*} transaction sequelize 事务对象
   * @return {*}
   */
  async updateArticleFavoriteCount(articleIds, action, transaction) {
    const res = await Article.update(
      {
        favoriteCount: Sequelize.literal(
          action === 'add' ? 'favorite_count + 1' : 'favorite_count - 1',
        ),
      },
      { where: { id: articleIds }, transaction },
    );

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
   * @description: 创建文章（向articles表中插入一条数据）
   * @param {*} userId 当前用户id
   * @param {*} summary 文章摘要
   * @param {*} title 文章标题
   * @param {*} content 文章内容
   * @param {*} categoryId 文章分类id
   * @param {*} tagIds 标签名 数组
   * @param {*} transaction sequelize 事务对象
   * @return {*}
   */
  createArticle = async (
    { userId, title, summary, categoryId, tagIds, content, coverImage },
    transaction,
  ) => {
    // 通过文章标题查找是否已存在该文章，如果有就更新表数据，没有就创建表数据
    const articleData = await this.getArticleInfo({ userId, title });

    if (articleData) {
      // 更新表数据
      return await this.updateArticle(
        {
          id: articleData.id,
          userId,
          categoryId,
          title,
          summary,
          content,
          tagIds,
          coverImage,
        },
        transaction,
      );
    } else {
      const createData = {
        userId,
        categoryId,
        title,
        summary,
        content,
        coverImage,
      };

      // 创建表数据
      const res = await Article.create(createData, {
        transaction,
      });

      // 设置标签（自动插入 article_tags）
      await res.setTags(tagIds || [], { transaction });

      return res ? res.dataValues : null;
    }
  };

  /**
   * @description: 获取存在的文章
   * @param {*} articleIds 文章id数组
   * @return {*}
   */
  async getExistingArticleIds(articleIds) {
    const validArticles = await Article.findAll({
      where: {
        id: articleIds,
      },
      attributes: ['id'],
    });

    return validArticles;
  }
}

module.exports = new ArticleService();
