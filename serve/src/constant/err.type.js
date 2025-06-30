module.exports = {
  registerFormatError: {
    code: '10001',
    message: '注册用户数据不合法',
    data: null,
  },
  userRegisterError: {
    code: '10002',
    message: '用户注册失败',
    data: null,
  },
  userAlreadyExists: {
    code: '10003',
    message: '用户名已存在',
    data: null,
  },
  emailAlreadyExists: {
    code: '10004',
    message: '邮箱已存在',
    data: null,
  },
  passwordFormatError: {
    code: '10005',
    message: '密码不合法',
    data: null,
  },
  invalidPassword: {
    code: '10006',
    message: '密码错误',
    data: null,
  },
  loginFormatError: {
    code: '10007',
    message: '登录数据不合法',
    data: null,
  },
  userLoginError: {
    code: '10008',
    message: '用户登录失败',
    data: null,
  },
  userDoesNotExist: {
    code: '10009',
    message: '用户不存在',
    data: null,
  },
  tokenExpiredError: {
    code: '401',
    message: 'token过期',
    data: null,
  },
  jsonWebTokenError: {
    code: '401',
    message: 'token无效',
    data: null,
  },
  tokenFormatError: {
    code: '401',
    message: 'token验证失败',
    data: null,
  },
  hasNotAdminPermission: {
    code: '10010',
    message: '没有管理员权限',
    data: null,
  },
  userDeleteError: {
    code: '10011',
    message: '用户删除失败',
    data: null,
  },
};
