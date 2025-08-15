/**
 * @description: 校验接口报文参数
 * @param {*} rules 校验规则
 * @return {*}
 */
const joiValidate = rules => {
  return async (ctx, next) => {
    let verifyData = {},
      method = ctx.request.method;
    if (method === 'GET') {
      verifyData = ctx.query;
    } else {
      verifyData = ctx.request.body;
    }

    // 使用 Joi 进行参数验证
    const { error } = await rules.validate(verifyData);
    if (error) {
      // 如果验证失败，返回错误信息
      const errorMessages = error.details.map(detail => detail.message);
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
    await next();
  };
};

module.exports = {
  joiValidate,
};
