const fs = require('fs'); // 原生路径处理模块（用于安全拼接路径）
const path = require('path'); // 原生路径处理模块（用于安全拼接路径）
const os = require('os'); // 原生操作系统模块（用于获取系统临时目录）
const send = require('koa-send'); // 用于高效发送文件
const archiver = require('archiver'); // 打包 zip
const { randomUUID } = require('crypto'); // 生成UUID

const { sequelize } = require('../model/index');

const { restructureComments } = require('../utils/index');

const {
  createArticle,
  findArticle,
  findOneArticle,
  updateArticleViewCount,
  removeComment,
  removeArticle,
  updateArticle,
  outputArticle,
  uploadArticle,
  loadMoreArticle,
} = require('../service/article.service');

const {
  createArticleError,
  findArticleError,
  deleteArticleError,
  articleUpdateError,
  outputArticlesError,
  uploadArticlesError,
  loadMoreError,
} = require('../constant/err.type');

class articleController {
  async create(ctx) {
    const { userId } = ctx.state.user;
    try {
      const res = await createArticle({ userId, ...ctx.request.body });
      if (!res) throw new Error();
      ctx.body = {
        code: '200',
        message: '文章创建成功',
        data: res,
      };
    } catch (err) {
      ctx.app.emit('error', createArticleError, ctx);
    }
  }

  async findAll(ctx) {
    const {
      categoryId,
      keyword,
      tag,
      order,
      behavior = 'scroll',
      pageNum = 1,
      pageSize = 10,
    } = ctx.query;
    const { userId } = ctx.state.user;
    try {
      const res = await findArticle({
        categoryId,
        keyword,
        tag,
        userId,
        order,
        pageNum,
        pageSize,
        behavior,
      });
      ctx.body = {
        code: '200',
        message: '获取文章列表成功',
        data: res,
      };
    } catch (err) {
      ctx.app.emit('error', findArticleError, ctx);
    }
  }

  async loadMore(ctx) {
    const {
      keyword,
      tag,
      categoryId,
      lastId, // 上次请求的最后一条ID
      lastSortValue, // 上次的排序字段值
      limit = 20, // 每页数量
      sortBy = 'createdAt', // 排序方式
    } = ctx.query;

    try {
      const res = await loadMoreArticle({
        keyword,
        tag,
        categoryId,
        lastId,
        lastSortValue,
        limit,
        sortBy,
      });
      ctx.body = {
        code: '200',
        message: '获取文章列表成功',
        data: res,
      };
    } catch (err) {
      ctx.app.emit('error', loadMoreError, ctx);
    }
  }

  async findById(ctx) {
    const { id } = ctx.params;
    const { type = 1 } = ctx.query;
    try {
      const res = await findOneArticle(id);
      if (!res) throw new Error();
      if (type === 1 && (await !updateArticleViewCount({ id, viewCount: res.viewCount }))) {
        throw new Error();
      }

      // 重新构建评论树结构（一级评论被删除，子评论提级；评论回复被删除不显示回复xx用户，例如：用户A：回复的评论内容）
      const comments = restructureComments(res.comments);

      ctx.body = {
        code: '200',
        message: '获取文章详情成功',
        data: { ...res, comments },
      };
    } catch (err) {
      ctx.app.emit('error', findArticleError, ctx);
    }
  }

  async remove(ctx) {
    const { ids } = ctx.request.body;
    const transaction = await sequelize.transaction();
    try {
      await removeComment(ids, transaction);

      const res = await removeArticle(ids, transaction);
      if (!res) throw new Error();

      await transaction.commit();
      ctx.body = {
        code: '200',
        message: '删除成功',
        data: null,
      };
    } catch (err) {
      await transaction.rollback();
      ctx.app.emit('error', deleteArticleError, ctx);
    }
  }

  async update(ctx) {
    const { id } = ctx.params;
    const { categoryId, content, tagList, title } = ctx.request.body;
    const transaction = await sequelize.transaction();
    try {
      const res = await updateArticle({ id, categoryId, content, tagList, title }, transaction);
      if (!res) throw new Error();

      await transaction.commit();
      ctx.body = {
        code: '200',
        data: null,
        message: '修改成功',
      };
    } catch (err) {
      await transaction.rollback();
      ctx.app.emit('error', articleUpdateError, ctx);
    }
  }

  async output(ctx) {
    const { ids } = ctx.query;
    const { userId } = ctx.state.user;
    let safeFileName = '',
      uuid = randomUUID().replace(/-/g, '_');
    const tempDir = path.join(os.tmpdir(), 'article_exports_' + uuid + '_' + userId); // 使用系统临时目录
    const zipName = 'mdFiles.zip';
    let articleGrouped = {};
    try {
      const res = await outputArticle(ids);
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
        const markdownContent =
          `**category**: ${article.category?.name || '无'}\n\n` +
          `**tags**: ${article.tags?.map(t => t.name).join(', ') || '无'}\n\n` +
          `**date**: ${article.createdAt}\n\n` +
          `---\n\n${article.content}`;

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
            const markdownContent =
              `**分类**: ${article.category?.name || '无'}\n\n` +
              `**标签**: ${article.tags?.map(t => t.name).join(', ') || '无'}\n\n` +
              `**创建时间**: ${article.createdAt}\n\n` +
              `---\n\n${article.content}`;

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
              const markdownContent =
                `**分类**: ${article.category?.name || '无'}\n\n` +
                `**标签**: ${article.tags?.map(t => t.name).join(', ') || '无'}\n\n` +
                `**创建时间**: ${article.createdAt}\n\n` +
                `---\n\n${article.content}`;

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
      ctx.attachment(res.length === 1 ? safeFileName : zipName); // 等效于：
      // ctx.set('Content-Disposition', `attachment; filename="${safeFileName}"`);

      // 使用koa-send发送文件
      await send(ctx, res.length === 1 ? safeFileName : zipName, {
        root: tempDir, // 文件根目录
        maxAge: 0, // 缓存有效期（0表示禁用缓存）
        immutable: false, // 不启用不可变缓存
        setHeaders: res => {
          res.setHeader('Cache-Control', 'no-store'); // 强制不缓存
        },
      });
    } catch (err) {
      ctx.app.emit('error', outputArticlesError, ctx);
    } finally {
      // 延迟5秒后清理临时目录（确保文件已发送完成）
      setTimeout(async () => {
        // 删除目录及其所有内容
        fs.rm(
          tempDir,
          {
            recursive: true, // 递归删除
            force: true, // 忽略不存在的路径
            maxRetries: 3, // 重试次数(针对文件锁定)
            retryDelay: 100, // 重试间隔(ms)
          },
          err => {
            if (err) console.error('导出临时目录删除失败:', err);
          },
        );
      }, 5000);
    }
  }

  async upload(ctx) {
    const { userId } = ctx.state.user;
    let files = ctx.request.files.files; // 获取上传文件
    if (!Array.isArray(files)) files = [files];
    const transaction = await sequelize.transaction();
    try {
      for (let i = 0; i < files.length; i++) {
        let res = await uploadArticle(files[i], userId, transaction);
        if (!res) throw new Error();
      }

      await transaction.commit();

      ctx.body = {
        code: '200',
        data: null,
        message: '导入成功',
      };
    } catch (err) {
      await transaction.rollback();
      ctx.app.emit('error', uploadArticlesError, ctx);
    } finally {
      // 延迟5秒后清理临时目录（确保文件导入完成）
      setTimeout(() => {
        files.forEach(file => {
          // 删除导入临时文件
          fs.rm(
            file.filepath,
            {
              recursive: true, // 递归删除
              force: true, // 忽略不存在的路径
              maxRetries: 3, // 重试次数(针对文件锁定)
              retryDelay: 100, // 重试间隔(ms)
            },
            err => {
              if (err) console.error('导入临时目录删除失败:', err);
            },
          );
        });
      }, 5000);
    }
  }
}

module.exports = new articleController();
