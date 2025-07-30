const fs = require('fs'); // 原生路径处理模块（用于安全拼接路径）
const path = require('path'); // 原生路径处理模块（用于安全拼接路径）

const { koaBody } = require('koa-body');

const { uploadFileTypeError, fileSizeExceededError } = require('../constant/err.type');

const uploadMiddleware = (allowedTypes, options = {}) => {
  const bodyParser = koaBody({
    multipart: true, // 支持文件上传
    formidable: {
      // 在配置选项option里，不推荐使用相对路径
      // 在option里相对路径不是相对于当前文件， 而是相对process.cwd()
      // uploadDir: path.join(__dirname, '../uploads'), // 设置文件上传目录
      allowEmptyFiles: false,
      keepExtensions: true, // 保留文件扩展名
      maxFileSize: 10 * 1024 * 1024, // 设置上传文件大小最大限制，默认10M
      onFileBegin: (name, file) => {
        if (!allowedTypes.includes(file.mimetype)) {
          throw new Error('FILE_TYPE_NOT_ALLOWED');
        }
      },
    },
    ...options,
  });

  return async (ctx, next) => {
    try {
      await bodyParser(ctx, async () => {
        // 检查是否有 files 字段
        if (!ctx.request.files || !ctx.request.files.files) {
          ctx.body = {
            code: '400',
            message: 'files 字段是必传参数',
            data: null,
          };
          return;
        }

        const isEmptyFile = file => {
          // 物理大小检查
          if (file.size === 0) return true;

          // 读取文件内容检查（同步方式示例）
          const content = fs.readFileSync(file.filepath, 'utf-8');
          return content.replace(/[\uFEFF\n\r]/g, '').trim().length === 0;
        };

        // 检查 files 是否为空
        const files = Array.isArray(ctx.request.files.files)
          ? ctx.request.files.files
          : [ctx.request.files.files];

        if (files.length === 0 || files.some(file => !file || isEmptyFile(file))) {
          ctx.body = {
            code: '400',
            message: '文件内容不能为空',
            data: null,
          };
          return;
        }

        await next();
      }); // 正确执行 koaBody 中间件
    } catch (err) {
      if (err.message === 'FILE_TYPE_NOT_ALLOWED') {
        ctx.app.emit('error', uploadFileTypeError, ctx);
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
