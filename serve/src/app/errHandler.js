module.exports = (err, ctx) => {
  let status = 500;
  switch (err.code) {
    case '400':
      status = 400;
      break;
    case '409':
      status = 409;
      break;
    case '404':
      status = 404;
      break;
    case '401':
      status = 401;
      break;
    default:
      status = 500;
  }
  ctx.status = status;
  ctx.body = err;
};
