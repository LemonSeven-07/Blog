module.exports = {
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
  SendError: {
    code: '10004',
    message: '发送过于频繁，请稍后再试',
    data: null,
  },
  emailAlreadyExists: {
    code: '10005',
    message: '邮箱已被注册',
    data: null,
  },
  emailNotRegistered: {
    code: '10028',
    message: '该邮箱未注册账号',
    data: null,
  },
  invalidEmailCode: {
    code: '10035',
    message: '验证码错误，请重新获取',
    data: null,
  },
  resetPasswordError: {
    code: '10036',
    message: '密码重置失败',
    data: null,
  },
  invalidCredentials: {
    code: '10006',
    message: '账号或密码错误',
    data: null,
  },
  userLoginError: {
    code: '10007',
    message: '用户登录失败',
    data: null,
  },
  userDoesNotExist: {
    code: '10008',
    message: '用户不存在',
    data: null,
  },
  emailDoesNotExist: {
    code: '10038',
    message: '邮箱不存在',
    data: null,
  },
  tokenInvalidError: {
    code: '401',
    message: '登录状态已失效，请重新登录',
    data: null,
  },
  userOfflineError: {
    code: '401',
    message: '账号已被删除，无法继续使用',
    data: null,
  },
  userKickedError: {
    code: '401',
    message: '账号已在其他设备登录，请重新登录',
    data: null,
  },
  hasNotAdminPermission: {
    code: '10009',
    message: '没有操作权限',
    data: null,
  },
  userDeleteError: {
    code: '10010',
    message: '用户删除失败',
    data: null,
  },
  userUpdateError: {
    code: '10011',
    message: '用户信息修改失败',
    data: null,
  },
  findUsersError: {
    code: '10012',
    message: '用户搜索失败',
    data: null,
  },
  findTagsError: {
    code: '10013',
    message: '标签搜索失败',
    data: null,
  },
  findCategoriesError: {
    code: '10014',
    message: '分类搜索失败',
    data: null,
  },
  getTagsByCategoryError: {
    code: '10043',
    message: '获取分类下的标签失败',
    data: null,
  },
  commentError: {
    code: '10015',
    message: '评论失败',
    data: null,
  },
  deleteCommentError: {
    code: '10016',
    message: '评论删除失败',
    data: null,
  },
  findCommentError: {
    code: '10017',
    message: '评论获取失败',
    data: null,
  },
  commentBannedError: {
    code: '10018',
    message: '您已被禁言，请文明留言',
    data: null,
  },
  createArticleError: {
    code: '10019',
    message: '文章创建失败',
    data: null,
  },
  articleAlreadyExists: {
    code: '10020',
    message: '文章标题已存在',
    data: null,
  },
  articleCreateError: {
    code: '10021',
    message: '文章创建失败',
    data: null,
  },
  findArticleError: {
    code: '10022',
    message: '文章获取失败',
    data: null,
  },
  deleteArticleError: {
    code: '10023',
    message: '文章删除失败',
    data: null,
  },
  articleUpdateError: {
    code: '10024',
    message: '文章修改失败',
    data: null,
  },
  uploadFileTypeError: {
    code: '10025',
    message: '文件类型不合法',
    data: null,
  },
  displayStorageWarning: {
    code: '10040',
    message: '请确保文件为有效内容，避免上传不必要的文件',
    data: null,
  },
  uploadArticlesError: {
    code: '10026',
    message: '上传失败',
    data: null,
  },
  outputArticlesError: {
    code: '10027',
    message: '导出失败',
    data: null,
  },
  categoryEnAlreadyExists: {
    code: '10034',
    message: '分类英文名已存在',
    data: null,
  },
  categoryAlreadyExists: {
    code: '10004',
    message: '分类名已存在',
    data: null,
  },
  createCategoryError: {
    code: '10029',
    message: '文章分类创建失败',
    data: null,
  },
  fileSizeExceededError: {
    code: '10030',
    message: '文件大小超过限制',
    data: null,
  },
  updateNoticeError: {
    code: '10031',
    message: '消息通知修改失败',
    data: null,
  },
  loadMoreError: {
    code: '10032',
    message: '加载失败',
    data: null,
  },
  findNoticeError: {
    code: '10033',
    message: '消息通知获取失败',
    data: null,
  },
  createRouteError: {
    code: '10037',
    message: '页面路由创建失败',
    data: null,
  },
  logoutError: {
    code: '10039',
    message: '登出失败',
    data: null,
  },
  tagAlreadyExists: {
    code: '10041',
    message: '标签名已存在',
    data: null,
  },
  tagCreateError: {
    code: '10042',
    message: '标签创建失败',
    data: null,
  },
  addFavoriteError: {
    code: '10044',
    message: '收藏失败',
    data: null,
  },
  removeFavoriteError: {
    code: '10045',
    message: '取消收藏失败',
    data: null,
  },
  updateAvatarError: {
    code: '10046',
    message: '头像修改失败',
    data: null,
  },
  updatePasswordError: {
    code: '10047',
    message: '密码修改失败',
    data: null,
  },
  updateEmailError: {
    code: '10048',
    message: '邮箱修改失败',
    data: null,
  },
  getCategoriesByFavoriteError: {
    code: '10049',
    message: '获取收藏文章对应的分类失败',
    data: null,
  },
};
