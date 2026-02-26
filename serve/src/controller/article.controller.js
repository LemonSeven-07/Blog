const fs = require('fs'); // 原生路径处理模块（用于安全拼接路径）
const path = require('path'); // 原生路径处理模块（用于安全拼接路径）
const os = require('os'); // 原生操作系统模块（用于获取系统临时目录）
const send = require('koa-send'); // 用于高效发送文件
const archiver = require('archiver'); // 打包 zip
const { randomUUID } = require('crypto'); // 生成UUID

const { sequelize } = require('../model/index');

const {
  transformComments,
  optimizeGroupAndFilter,
  clearCacheFiles,
  uploadImageToGitHub,
  deleteGitHubImage,
  decodeFile,
} = require('../utils/index');

const {
  findArticle,
  findOneArticle,
  updateArticleViewCount,
  findComment,
  removeComment,
  removeArticle,
  updateArticle,
  outputArticle,
  createArticle,
  loadMoreArticle,
  getExistingArticleIds,
  updateArticleFavoriteCount,
  getArticleInfo,
} = require('../service/article.service');

const {
  addArticleFavorite,
  removeArticleFavorite,
  findFavoritesByArticleId,
} = require('../service/favorite.service');

const {
  articleCreateError,
  articleFindError,
  articleDeleteError,
  articleUpdateError,
  articlesOutputError,
  articleUploadError,
  articlePublishError,
  loadMoreError,
  favoriteAddError,
  favoriteRemoveError,
  imagePublishError,
  articleAlreadyExists,
} = require('../constant/err.type');

const { articleMaintenanceSchema } = require('../constant/schema.js');

class articleController {
  /**
   * @description: 创建文章
   * @param {*} ctx 上下文对象
   * @return {*}
   */
  async create(ctx) {
    const { userId } = ctx.state.user;
    const transaction = await sequelize.transaction();
    try {
      const res = await createArticle({ userId, ...ctx.request.body }, transaction);
      if (!res) throw new Error();

      await transaction.commit();
      ctx.body = {
        code: '200',
        data: res,
        message: '文章创建成功',
      };
    } catch (err) {
      await transaction.rollback();
      ctx.app.emit('error', articleCreateError, ctx);
    }
  }

  /**
   * @description: 获取热门文章
   * @param {*} ctx 上下文对象
   * @return {*}
   */
  async findHotArticles(ctx) {
    try {
      const { pageNum } = ctx.query;
      const params = {
        pageNum,
        pageSize: 5,
        sort: 'hot',
      };

      const res = await findArticle(params);

      ctx.body = {
        code: '200',
        data: res,
        message: '获取文章列表成功',
      };
    } catch (err) {
      ctx.app.emit('error', articleFindError, ctx);
    }
  }

  /**
   * @description: 后台按条件分页查询文章列表
   * @param {*} ctx 上下文对象
   * @return {*}
   */
  async findAll(ctx) {
    const {
      keyword,
      categoryId,
      tagId,
      publishTimeRange,
      author,
      sort = 'new',
      pageNum = 1,
      pageSize = 10,
    } = ctx.query;

    try {
      const params = {
        categoryId,
        keyword,
        tagId,
        publishTimeRange,
        pageNum,
        pageSize,
        sort,
      };

      if (ctx.state.user && ctx.state.user.role === 1) {
        params.username = author;
      } else if (ctx.state.user && ctx.state.user.role === 2) {
        params.userId = ctx.state.user.userId;
      }

      const res = await findArticle(params);

      ctx.body = {
        code: '200',
        data: res,
        message: '获取文章列表成功',
      };
    } catch (err) {
      ctx.app.emit('error', articleFindError, ctx);
    }
  }

  /**
   * @description: 按条件滚动查询文章列表
   * @param {*} ctx 上下文对象
   * @return {*}
   */
  async loadMore(ctx) {
    const {
      keyword,
      tagId = '',
      categoryId,
      lastId, // 上次请求的最后一条ID
      lastSortValue, // 上次的排序字段值
      limit = 20, // 每页数量
      sort = 'new', // 排序方式
    } = ctx.query;

    try {
      const res = await loadMoreArticle({
        keyword,
        tagId,
        categoryId,
        lastId,
        lastSortValue,
        limit,
        sort,
      });
      ctx.body = {
        code: '200',
        data: res,
        message: '获取文章列表成功',
      };
    } catch (err) {
      ctx.app.emit('error', loadMoreError, ctx);
    }
  }

  /**
   * @description: 获取单篇文章详情包括文章内容、分类、标签、评论、浏览量
   * @param {*} ctx 上下文对象
   * @return {*}
   */
  async findById(ctx) {
    const { id } = ctx.params;
    const { userId } = ctx.query;
    try {
      const res = await findOneArticle(id, userId);
      if (!res) throw new Error();

      // 更新文章浏览量
      if (await !updateArticleViewCount({ id, viewCount: res.viewCount })) {
        throw new Error();
      }

      // 重新构建评论树结构
      // const comments = transformComments(res.comments);

      ctx.body = {
        code: '200',
        // data: { ...res, comments },
        data: res,
        message: '获取文章详情成功',
      };
    } catch (err) {
      ctx.app.emit('error', articleFindError, ctx);
    }
  }

  /**
   * @description: 单个或批量删除文章
   * @param {*} ctx 上下文对象
   * @return {*}
   */
  async remove(ctx) {
    const { ids } = ctx.request.body;
    // 确保多个数据库操作作为一个原子单元执行，要么全部成功提交，要么全部失败回滚，从而维护数据的一致性。
    const transaction = await sequelize.transaction();
    try {
      // 查询文章下的评论
      // const notices = await findComment(ids, transaction);

      // 删除文章下的评论
      // await removeComment(ids, transaction);

      // 删除文章
      const res = await removeArticle(ids, transaction);
      if (!res) throw new Error();
      // 提交事务
      await transaction.commit();

      // 删除文章，通知其他服务更新评论数
      // const datas = optimizeGroupAndFilter(notices);
      // if (datas && Object.keys(datas).length) {
      //   await Object.keys(datas).forEach(async key => {
      //     await ctx.pubClient.publish(
      //       `notify:${key}`,
      //       JSON.stringify({
      //         step: datas[key].length,
      //         articleIds: ids,
      //         type: 'DELETE_ARTICLE_NOTIFY',
      //       }),
      //     );
      //   });
      // }

      ctx.body = {
        code: '200',
        data: null,
        message: '删除成功',
      };
    } catch (err) {
      await transaction.rollback();
      ctx.app.emit('error', articleDeleteError, ctx);
    }
  }

  /**
   * @description: 编辑文章
   * @param {*} ctx 上下文对象
   * @return {*}
   */
  async update(ctx) {
    const { id } = ctx.params;
    let coverImage = '',
      params = {};
    const { image } = ctx.request.files;
    const { userId } = ctx.state.user;
    const transaction = await sequelize.transaction();
    try {
      // 对报文参数进行解析和转换
      if (ctx.request.body) {
        const { image, ...rest } = ctx.request.body;
        params = { ...rest };
        if (ctx.request.body.tagIds) params.tagIds = JSON.parse(ctx.request.body.tagIds);
      }

      // 使用 Joi 进行参数验证
      const { error } = await articleMaintenanceSchema.validate(params);
      if (error) {
        // 如果验证失败，返回错误信息
        const errorMessages = error.details.map(detail => detail.message);

        // 延迟5秒后清理文章封面临时目录
        clearCacheFiles(ctx.state.uploadedFilepaths || [], 5000);

        return ctx.app.emit(
          'error',
          {
            code: '400',
            data: null,
            message: errorMessages.toString(),
          },
          ctx,
        );
      }

      const { categoryId, content, tagIds, title, summary } = params;

      // 校验文章标题唯一性（同一用户下不能有重复标题）
      const articleInfo = await getArticleInfo({ userId, title, id });
      if (articleInfo) return ctx.app.emit('error', articleAlreadyExists, ctx);

      // 如果有新的封面图片，需上传gitHub获取图片url
      if (image) {
        const { cdnUrl } = await uploadImageToGitHub(
          fs.readFileSync(image.filepath),
          image.mimetype,
          'cover',
        );

        if (!cdnUrl) throw new Error();
        coverImage = cdnUrl;
      }

      // 更新文章信息
      const res = await updateArticle(
        { id, categoryId, content, tagIds, title, summary, coverImage },
        transaction,
      );
      if (!res) throw new Error();

      await transaction.commit();
      ctx.body = {
        code: '200',
        data: null,
        message: '修改成功',
      };
    } catch (err) {
      // 删除已上传的封面图片
      deleteGitHubImage(coverImage);
      await transaction.rollback();
      ctx.app.emit('error', articleUpdateError, ctx);
    } finally {
      // 延迟5秒后清理文章封面临时目录
      clearCacheFiles(ctx.state.uploadedFilepaths || [], 5000);
    }
  }

  /**
   * @description: 文章导出（支持单个和批量导出）
   * @param {*} ctx 上下文对象
   * @return {*}
   */
  async output(ctx) {
    const { ids } = ctx.query;
    const { userId, role } = ctx.state.user;
    let safeFileName = '',
      uuid = randomUUID().replace(/-/g, '_');
    const tempDir = path.join(os.tmpdir(), 'article_exports_' + uuid + '_' + userId); // 使用系统临时目录
    const zipName = 'mdFiles.zip';
    let articleGrouped = {};
    try {
      const res = await outputArticle(ids, userId, role);
      if (!res.length) throw new Error();

      if (res.length === 1) {
        // 导出单个文章
        const article = res[0];
        // 1. 生成安全的文件名
        safeFileName =
          article.title
            .replace(/[\/\\:*?"<>|]/g, '')
            .replace(/\s+/g, '_')
            .trim() + '.md';

        // 2. 构建 Markdown 内容
        const markdownContent = article.content;

        // 3. 创建临时目录
        if (!fs.existsSync(tempDir)) {
          fs.mkdirSync(tempDir, { recursive: true }); // recursive: true允许创建多级目录
        }

        // 拼接完整文件路径
        const filePath = path.join(tempDir, safeFileName);
        // 4. 写入临时文件（同步写入确保文件准备好）
        fs.writeFileSync(filePath, markdownContent, 'utf8');
      } else {
        if (ids) {
          // 批量导出文章
          res.forEach(article => {
            // 1. 生成安全的文件名
            safeFileName =
              article.title
                .replace(/[\/\\:*?"<>|]/g, '')
                .replace(/\s+/g, '_')
                .trim() + '.md';

            // 2. 构建 Markdown 内容
            const markdownContent = article.content;

            // 3. 创建临时目录
            if (!fs.existsSync(tempDir + '/mdFiles')) {
              fs.mkdirSync(tempDir + '/mdFiles', { recursive: true }); // recursive: true允许创建多级目录
            }

            // 拼接完整文件路径
            const filePath = path.join(tempDir + '/mdFiles', safeFileName);
            // 4. 写入临时文件（同步写入确保文件准备好）
            fs.writeFileSync(filePath, markdownContent, 'utf8');
          });
        } else {
          // 导出全部文章，根据文章分类名分类后以压缩的文件导出
          articleGrouped = res.reduce((acc, item) => {
            (acc[item.categoryId] = acc[item.categoryId] || []).push(item);
            return acc;
          }, {});

          Object.keys(articleGrouped).forEach(key => {
            articleGrouped[key].forEach(article => {
              // 1. 生成安全的文件名
              safeFileName =
                article.title
                  .replace(/[\/\\:*?"<>|]/g, '')
                  .replace(/\s+/g, ' ')
                  .trim() + '.md';

              // 2. 构建 Markdown 内容
              const markdownContent = article.content;

              // 3. 创建临时目录
              if (
                !fs.existsSync(
                  tempDir + '/mdFiles/' + (article.category ? article.category.name : 'default'),
                )
              ) {
                fs.mkdirSync(
                  tempDir + '/mdFiles/' + (article.category ? article.category.name : 'default'),
                  { recursive: true },
                ); // recursive: true允许创建多级目录
              }

              // 拼接完整文件路径
              const filePath = path.join(
                tempDir + '/mdFiles/' + (article.category ? article.category.name : 'default'),
                safeFileName,
              );
              // 4. 写入临时文件（同步写入确保文件准备好）
              fs.writeFileSync(filePath, markdownContent, 'utf8');
            });
          });
        }

        const output = fs.createWriteStream(tempDir + '/' + zipName);
        const archive = archiver('zip', {
          zlib: { level: 9 }, // 最高压缩级别
        });
        // 管道连接输出流
        archive.pipe(output);
        // 关键步骤：递归添加整个目录
        archive.directory(tempDir + '/mdFiles', false); // 第二个参数 `false` 表示不包含根目录名称
        // 完成压缩
        await archive.finalize();
      }

      // 设置Content-Disposition头，触发浏览器下载
      // ctx.attachment(res.length === 1 ? safeFileName : zipName);
      // ctx.set(
      //   'Content-Disposition',
      //   'attachment; filename=' + encodeURIComponent(res.length === 1 ? safeFileName : zipName),
      // );

      const fileName = res.length === 1 ? safeFileName : zipName;
      // 使用koa-send发送文件
      await send(ctx, res.length === 1 ? safeFileName : zipName, {
        root: tempDir, // 文件根目录
        maxAge: 0, // 缓存有效期（0表示禁用缓存）
        immutable: false, // 不启用不可变缓存
        setHeaders: res => {
          res.setHeader('Cache-Control', 'no-store'); // 强制不缓存
          // 设置 Content-Disposition 头部，触发下载
          res.setHeader(
            'Content-Disposition',
            'attachment; filename=' + encodeURIComponent(fileName),
          );
          // 设置 Content-Type 头部，指示文件类型为二进制流
          res.setHeader('Content-Type', 'application/octet-stream');
        },
      });
    } catch (err) {
      ctx.app.emit('error', articlesOutputError, ctx);
    } finally {
      // 延迟5秒后清理临时目录（确保文件已发送完成）
      clearCacheFiles([tempDir], 5000);
    }
  }

  /**
   * @description: 文章导入
   * @param {*} ctx 上下文对象
   * @return {*}
   */
  async createArticleFromFile(ctx) {
    const { userId } = ctx.state.user;
    const { file, image } = ctx.request.files;
    const { title } = ctx.request.body;
    let files = !Array.isArray(file) ? [file] : file;
    const transaction = await sequelize.transaction();
    let coverImage = '';
    try {
      // 检查文章标题是否已存在（同一用户下不能有重复标题）
      const articleInfo = await getArticleInfo({ userId, title });
      if (articleInfo) return ctx.app.emit('error', articleAlreadyExists, ctx);

      if (image) {
        const { cdnUrl } = await uploadImageToGitHub(
          fs.readFileSync(image.filepath),
          image.mimetype,
          'cover',
        );

        if (!cdnUrl) throw new Error();
        coverImage = cdnUrl;
      }

      let fileData = await fs.promises.readFile(files[0].filepath, 'utf8');
      // 从md文件中获取文章主体内容
      let { content } = decodeFile(fileData);
      let res = await createArticle(
        {
          ...ctx.request.body,
          tagIds: JSON.parse(ctx.request.body.tagIds),
          userId,
          content,
          coverImage,
        },
        transaction,
      );

      if (!res) throw new Error();

      await transaction.commit();
      ctx.body = {
        code: '200',
        data: null,
        message: '文章导入成功',
      };
    } catch (err) {
      // 删除已上传的封面图片
      deleteGitHubImage(coverImage);
      await transaction.rollback();
      ctx.app.emit('error', articleUploadError, ctx);
    } finally {
      // 延迟5秒后清理临时目录（确保文件导入完成）
      clearCacheFiles(ctx.state.uploadedFilepaths || [], 5000);
    }
  }

  /**
   * @description: 文章发布
   * @param {*} ctx 上下文对象
   * @return {*}
   */
  async createArticleFromContent(ctx) {
    const { userId } = ctx.state.user;
    const { image } = ctx.request.files;
    const { title } = ctx.request.body;
    const transaction = await sequelize.transaction();
    let coverImage = '';
    try {
      // 检查文章标题是否已存在
      const articleInfo = await getArticleInfo({ userId, title });
      if (articleInfo) return ctx.app.emit('error', articleAlreadyExists, ctx);

      if (image) {
        const { cdnUrl } = await uploadImageToGitHub(
          fs.readFileSync(image.filepath),
          image.mimetype,
          'cover',
        );

        if (!cdnUrl) throw new Error();
        coverImage = cdnUrl;
      }

      let res = await createArticle(
        {
          ...ctx.request.body,
          tagIds: JSON.parse(ctx.request.body.tagIds),
          userId,
          coverImage,
        },
        transaction,
      );

      if (!res) throw new Error();

      await transaction.commit();
      ctx.body = {
        code: '200',
        data: null,
        message: '文章发布成功',
      };
    } catch (err) {
      // 删除已上传的封面图片
      deleteGitHubImage(coverImage);
      await transaction.rollback();
      ctx.app.emit('error', articlePublishError, ctx);
    } finally {
      // 延迟5秒后清理临时目录（确保文件导入完成）
      clearCacheFiles(ctx.state.uploadedFilepaths || [], 5000);
    }
  }

  /**
   * @description: 上传文章图片
   * @param {*} ctx
   * @return {*}
   */
  async uploadImage(ctx) {
    const { images } = ctx.request.files;
    let imageUrls = [];
    try {
      // 多张图片上传
      if (images && Array.isArray(images) && images.length) {
        for (const image of images) {
          const { cdnUrl } = await uploadImageToGitHub(
            fs.readFileSync(image.filepath),
            image.mimetype,
            'md',
          );
          if (!cdnUrl) throw new Error();
          imageUrls.push(cdnUrl);
        }
      }

      // 单张图片上传
      if (images && !Array.isArray(images)) {
        const { cdnUrl } = await uploadImageToGitHub(
          fs.readFileSync(images.filepath),
          images.mimetype,
          'md',
        );
        if (!cdnUrl) throw new Error();
        imageUrls.push(cdnUrl);
      }

      ctx.body = {
        code: '200',
        data: { imageUrls },
        message: '图片上传成功',
      };
    } catch (err) {
      // 删除已上传的封面图片
      imageUrls.forEach(url => deleteGitHubImage(url));
      ctx.app.emit('error', imagePublishError, ctx);
    }
  }

  /**
   * @description: 文章收藏或取消收藏（运行单个或批量操作）
   * @param {*} ctx 上下文对象
   * @return {*}
   */
  async toggleArticleFavorite(ctx) {
    const { articleIds, action } = ctx.request.body;
    const { userId } = ctx.state.user;
    const transaction = await sequelize.transaction();
    try {
      // 获取已存在的文章id
      const validArticles = await getExistingArticleIds(articleIds);
      // 如果批量收藏或批量取消收藏的文章id不存在则抛错
      if (validArticles.length < articleIds.length) throw new Error();

      // 查询已收藏的文章id
      const existing = await findFavoritesByArticleId(articleIds, userId);
      const existingIds = existing.map(item => item.articleId);
      // 过滤掉已收藏的id
      const newIds = articleIds.filter(id => !existingIds.includes(id));

      if (action === 'add') {
        await addArticleFavorite(articleIds, userId, transaction);
        if (newIds.length) {
          const res = await updateArticleFavoriteCount(newIds, action, transaction);
          if (!res) throw new Error();
        }
      } else {
        await removeArticleFavorite(articleIds, userId, transaction);
        if (existingIds.length) {
          const res = await updateArticleFavoriteCount(existingIds, action, transaction);
          if (!res) throw new Error();
        }
      }

      await transaction.commit();
      ctx.body = {
        code: '200',
        data: null,
        message: action === 'add' ? '收藏成功' : '取消收藏成功',
      };
    } catch (err) {
      await transaction.rollback();
      if (action === 'add') {
        ctx.app.emit('error', favoriteAddError, ctx);
      } else {
        ctx.app.emit('error', favoriteRemoveError, ctx);
      }
    }
  }
}

module.exports = new articleController();
