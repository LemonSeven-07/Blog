const kpValidate = rules => {
  return async (ctx, next) => {
    try {
      ctx.verifyParams(rules);
    } catch (error) {
      const errorMessages = error.errors.map(err => err.field + ':' + err.message);
      return ctx.app.emit(
        'error',
        {
          code: '40001',
          data: null,
          message: errorMessages.toString(),
        },
        ctx,
      );
    }

    await next();
  };
};

const joiValidate = (rules, source = 'body') => {
  return async (ctx, next) => {
    let verifyData = {};
    if (source === 'query') {
      verifyData = ctx.query;
    } else if (source === 'body') {
      verifyData = ctx.request.body;
    }

    const { error } = await rules.validate(verifyData);
    if (error) {
      const errorMessages = error.details.map(detail => detail.message);
      return ctx.app.emit(
        'error',
        {
          code: '40001',
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
