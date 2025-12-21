const fs = require('fs'); // 原生路径处理模块（用于安全拼接路径）
const path = require('path'); // 原生路径处理模块（用于安全拼接路径）

const { koaBody } = require('koa-body');

const {
  uploadFileTypeError,
  fileSizeExceededError,
  displayStorageWarning,
} = require('../constant/err.type');

const { clearCacheFiles } = require('../utils');

/**
 * @description: 文件上传
 * @param {{ [fileName]: {type: string[]; require: boolean} }} fileConfig 上传文件配置（包含文件类型和文件是否必上传）
 * @param {*} options 自定义上传配置
 * @return {*}
 */
const uploadMiddleware = (fileConfig, size = 5, options = {}) => {
  const bodyParser = koaBody({
    multipart: true, // 支持文件上传
    formidable: {
      // 在配置选项option里，不推荐使用相对路径
      // 在option里相对路径不是相对于当前文件， 而是相对process.cwd()
      // uploadDir: path.join(__dirname, '../uploads'), // 设置文件上传目录
      allowEmptyFiles: false,
      keepExtensions: true, // 保留文件扩展名
      maxFileSize: size * 1024 * 1024, // 设置上传文件大小最大限制，默认5M
    },
    ...options,
  });

  return async (ctx, next) => {
    try {
      // 执行 koaBody 中间件
      await bodyParser(ctx, async () => {
        const files = ctx.request.files || {};

        // 检查上传的文件是否是空文件
        const isEmptyFile = file => {
          // 物理大小检查
          if (file.size === 0) return true;

          // 读取文件内容检查（同步方式）
          const content = fs.readFileSync(file.filepath, 'utf-8');
          return content.replace(/[\uFEFF\n\r]/g, '').trim().length === 0;
        };

        // 记录所有上传的临时文件路径，供后续清理
        Object.keys(files).forEach(key => {
          if (Array.isArray(files[key])) {
            files[key].forEach(file => {
              if (!ctx.state.uploadedFilepaths) ctx.state.uploadedFilepaths = [];
              ctx.state.uploadedFilepaths.push(file.filepath);
            });
          } else {
            if (!ctx.state.uploadedFilepaths) ctx.state.uploadedFilepaths = [];
            ctx.state.uploadedFilepaths.push(files[key].filepath);
          }
        });

        // 校验上传文件
        for (let key of Object.keys(files)) {
          // 校验文件字段是否在配置中
          if (fileConfig[key]) {
            let newFiles = [];
            if (Array.isArray(files[key])) {
              files[key].forEach(file => {
                // 多文件上传 -》校验文件类型
                if (!fileConfig[key]['type']?.includes(file.mimetype)) {
                  throw new Error('FILE_TYPE_NOT_ALLOWED');
                }
              });

              newFiles = files[key];
            } else {
              // 单文件上传 -》校验文件类型
              if (!fileConfig[key]['type']?.includes(files[key].mimetype)) {
                throw new Error('FILE_TYPE_NOT_ALLOWED');
              }

              newFiles = [files[key]];
            }

            // 必须上传文件的字段，检查是否有上传文件
            if (fileConfig[key]['require'] && !files[key]) {
              // 清理已上传的临时文件
              clearCacheFiles(ctx.state.uploadedFilepaths || [], 1000);
              ctx.body = {
                code: '400',
                message: `${key} 字段是必传参数`,
                data: null,
              };
              return;
            }

            // 多文件上传检查
            if (!fileConfig[key]['multiple'] && newFiles.length > 1) {
              // 清理已上传的临时文件
              clearCacheFiles(ctx.state.uploadedFilepaths || [], 1000);
              ctx.body = {
                code: '400',
                message: `${key} 字段只允许上传一个文件`,
                data: null,
              };
              return;
            }

            // 检查是否有空文件上传
            const file = newFiles.find(file => file && isEmptyFile(file));
            if (file) {
              // 清理已上传的临时文件
              clearCacheFiles(ctx.state.uploadedFilepaths || [], 1000);
              ctx.body = {
                code: '400',
                message: `${file.originalFilename} 文件内容不能为空`,
                data: null,
              };
              return;
            }
          } else {
            // 不必要的文件，拒绝上传
            throw new Error('DISPLAY_STORAGE_WARNING');
          }
        }

        await next();
      });
    } catch (err) {
      // 清理已上传的临时文件
      clearCacheFiles(ctx.state.uploadedFilepaths || [], 1000);

      // 处理文件上传错误
      if (err.message === 'FILE_TYPE_NOT_ALLOWED') {
        ctx.app.emit('error', uploadFileTypeError, ctx);
      } else if (err.message === 'DISPLAY_STORAGE_WARNING') {
        ctx.app.emit('error', displayStorageWarning, ctx);
      } else if (err.message.includes('maxFileSize')) {
        ctx.app.emit('error', fileSizeExceededError, ctx);
      } else {
        ctx.app.emit('error', err, ctx);
      }
    }
  };
};

module.exports = {
  uploadMiddleware,
};
