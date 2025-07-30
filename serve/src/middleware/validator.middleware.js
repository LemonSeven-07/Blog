const kpValidate = rules => {
  return async (ctx, next) => {
    try {
      ctx.verifyParams(rules);
    } catch (error) {
      const errorMessages = error.errors.map(err => err.field + ':' + err.message);
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

const joiValidate = rules => {
  return async (ctx, next) => {
    let verifyData = {},
      method = ctx.request.method;
    if (method === 'GET') {
      verifyData = ctx.query;
    } else {
      verifyData = ctx.request.body;
    }

    const { error } = await rules.validate(verifyData);
    if (error) {
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
  kpValidate,
  joiValidate,
};
