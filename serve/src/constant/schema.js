const Joi = require('joi');
const moment = require('moment');
const { createTag } = require('../service/tag.service');

module.exports = {
  registerSchema: Joi.object({
    username: Joi.string()
      .pattern(/^[\u4e00-\u9fa5a-zA-Z0-9-_]{4,16}$/)
      .required()
      .messages({
        'string.pattern.base': '用户名由中文、字母、横杠和下划线组成，长度4-16位',
      }),
    email: Joi.string().email().required().messages({
      'string.empty': '邮箱不能为空',
      'string.email': '邮箱格式不正确',
    }),
    code: Joi.string().length(6).required().messages({
      'string.empty': '验证码不能为空',
      'string.length': '验证码错误',
    }),
    password: Joi.string().required().messages({
      'string.empty': '密码不能为空',
    }),
  }),
  emailCodeSchema: Joi.object({
    email: Joi.string().email().required().messages({
      'string.empty': '邮箱不能为空',
      'string.email': '邮箱格式不正确',
    }),
    type: Joi.string().valid('register', 'reset', 'update').required().messages({
      'string.empty': 'type不能为空',
      'any.only': 'type必须是register或reset或update',
    }),
  }),
  resetPasswordSchema: Joi.object({
    email: Joi.string().email().required().messages({
      'string.empty': '邮箱不能为空',
      'string.email': '邮箱格式不正确',
    }),
    code: Joi.string().length(6).required().messages({
      'string.empty': '验证码不能为空',
      'string.length': '验证码错误',
    }),
    password: Joi.string().required().messages({
      'string.empty': '密码不能为空',
    }),
  }),
  loginSchema: Joi.object({
    username: Joi.string()
      .pattern(/^[\u4e00-\u9fa5a-zA-Z0-9-_]{4,16}$/)
      .messages({
        'string.pattern.base': '用户名由中文、字母、横杠和下划线组成，长度4-16位',
      }),
    email: Joi.string().email().messages({
      'string.email': '邮箱格式不正确',
    }),
    password: Joi.string().required().messages({
      'string.empty': '密码不能为空',
    }),
  }).xor('username', 'email'),
  updateUserSchema: Joi.object({
    userId: Joi.number().integer().required().messages({
      'number.empty': 'userId不能为空',
      'number.integer': 'userId必须是整数',
    }),
    username: Joi.string()
      .pattern(/^[\u4e00-\u9fa5a-zA-Z0-9-_]{4,16}$/)
      .messages({
        'string.pattern.base': '用户名由中文、字母、横杠和下划线组成，长度4-16位',
      }),
    role: Joi.number().integer().messages({
      'number.integer': '用户权限必须是整数',
    }),
    banned: Joi.boolean().strict().messages({
      'boolean.base': 'disabledDiscuss必须是布尔值',
    }),
  })
    .or('username', 'role', 'banned')
    .messages({
      'object.missing': '必要字段为空',
    }),
  deleteUserSchema: Joi.object({
    ids: Joi.array()
      .items(Joi.number().integer()) // 数组元素必须是整数
      .required() // 必填字段
      .min(1) // 数组不能为空（至少1个元素）
      .messages({
        'array.base': 'ids必须是数组',
        'array.empty': 'ids数组不能为空',
        'array.min': 'ids数组至少包含一个元素',
        'number.base': 'ids数组元素必须是数字',
        'number.integer': 'ids数组元素必须是整数',
      }),
  }),
  updatePasswordSchema: Joi.object({
    oldPassword: Joi.string().required().messages({
      'string.empty': 'oldPassword不能为空',
    }),
    newPassword: Joi.string().required().messages({
      'string.empty': 'newPassword不能为空',
    }),
  }),
  updateEmialSchema: Joi.object({
    password: Joi.string().required().messages({
      'string.empty': 'oldPassword不能为空',
    }),
    email: Joi.string().email().required().messages({
      'string.empty': '邮箱不能为空',
      'string.email': '邮箱格式不正确',
    }),
    code: Joi.string().length(6).required().messages({
      'string.empty': '验证码不能为空',
      'string.length': '验证码错误',
    }),
  }),
  adminUpdateUserSchema: Joi.object({
    role: Joi.number().integer().messages({
      'number.integer': '用户权限必须是整数',
    }),
    banned: Joi.boolean().strict().messages({
      'boolean.base': 'disabledDiscuss必须是布尔值',
    }),
  })
    .or('role', 'banned')
    .messages({
      'object.missing': '必要字段为空',
    }),
  getUersSchema: Joi.object({
    pageNum: Joi.number().integer().messages({
      'number.integer': 'pageNum必须是整数',
    }),
    pageSize: Joi.number().integer().messages({
      'number.integer': 'pageSize必须是整数',
    }),
    username: Joi.string()
      .allow('')
      .pattern(/^[\u4e00-\u9fa5a-zA-Z0-9-_]{4,16}$/)
      .messages({
        'string.pattern.base': '用户名由中文、字母、横杠和下划线组成，长度4-16位',
      }),
    role: Joi.number().integer().valid(1, 2, 3).messages({
      'number.integer': '用户权限必须是整数',
      'any.only': '用户权限必须是1或2或3',
    }),
    registerDate: Joi.string()
      .pattern(/^\d{4}\d{2}\d{2},\s*\d{4}\d{2}\d{2}$/)
      .custom((value, helpers) => {
        const [startDateStr, endDateStr] = value.split(/\s*,\s*/);

        // 验证是否为有效日期
        if (
          !moment(startDateStr, 'YYYYMMDD', true).isValid() ||
          !moment(endDateStr, 'YYYYMMDD', true).isValid()
        ) {
          return helpers.error('any.invalid');
        }

        // 验证结束日期不小于开始日期
        if (moment(endDateStr).isBefore(moment(startDateStr))) {
          return helpers.error('date.endBeforeStart');
        }

        return value;
      })
      .messages({
        'string.pattern.base': '日期范围格式应为"YYYY-MM-DD, YYYY-MM-DD"',
        'any.invalid': '包含无效的日期',
        'date.endBeforeStart': '结束日期不能早于开始日期',
      }),
    isDeleted: Joi.number().integer().valid(0, 1).messages({
      'number.integer': 'isDeleted必须是整数',
      'any.only': 'isDeleted必须是0或1',
    }),
  }),
  restoreUserSchema: Joi.object({
    ids: Joi.array()
      .items(Joi.number().integer()) // 数组元素必须是整数
      .required() // 必填字段
      .min(1) // 数组不能为空（至少1个元素）
      .messages({
        'array.base': 'ids必须是数组',
        'array.empty': 'ids数组不能为空',
        'array.min': 'ids数组至少包含一个元素',
        'number.base': 'ids数组元素必须是数字',
        'number.integer': 'ids数组元素必须是整数',
      }),
  }),

  createCommentSchema: Joi.object({
    authorId: Joi.number().integer().required().messages({
      'number.empty': 'authorId不能为空',
      'number.integer': 'authorId必须是整数',
    }),
    articleId: Joi.number().integer().required().messages({
      'number.empty': 'articleId不能为空',
      'number.integer': 'articleId必须是整数',
    }),
    content: Joi.string().required().messages({
      'string.empty': '评论内容不能为空',
    }),
    entityId: Joi.number().integer().required().messages({
      'number.empty': '文章id不能为空',
      'number.integer': 'entityId必须是整数',
    }),
  }),
  replyCommentSchema: Joi.object({
    authorId: Joi.number().integer().required().messages({
      'number.empty': 'authorId不能为空',
      'number.integer': 'authorId必须是整数',
    }),
    articleId: Joi.number().integer().required().messages({
      'number.empty': 'articleId不能为空',
      'number.integer': 'articleId必须是整数',
    }),
    content: Joi.string().required().messages({
      'string.empty': '评论内容不能为空',
    }),
    entityId: Joi.number().integer().required().messages({
      'number.empty': '文章id不能为空',
      'number.integer': 'entityId必须是整数',
    }),
    parentId: Joi.number().integer().required().messages({
      'number.empty': '一级评论id不能为空',
      'number.integer': 'parentId必须是整数',
    }),
    replyToUserId: Joi.number().integer().required().messages({
      'number.empty': '回复的用户id不能为空',
      'number.integer': 'replyToUserId必须是整数',
    }),
  }),
  deleteCommentSchema: Joi.object({
    id: Joi.number().integer().required().messages({
      'number.empty': 'id不能为空',
      'number.integer': 'id必须是整数',
    }),
  }),
  getCommentSchema: Joi.object({
    id: Joi.number().integer().messages({
      'number.integer': 'id必须是整数',
    }),
    entityType: Joi.string().valid('post', 'comment').required().messages({
      'string.empty': 'entityType不能为空',
      'any.only': 'entityType必须是post或comment',
    }),
    entityId: Joi.number().integer().required().messages({
      'number.empty': '文章id不能为空',
      'number.integer': 'entityId必须是整数',
    }),
  }),
  updateCommentSchema: Joi.object({
    ids: Joi.array()
      .items(Joi.number().integer()) // 数组元素必须是整数
      .required() // 必填字段
      .min(1) // 数组不能为空（至少1个元素）
      .messages({
        'array.base': 'ids必须是数组',
        'array.empty': 'ids数组不能为空',
        'array.min': 'ids数组至少包含一个元素',
        'number.base': 'ids数组元素必须是数字',
        'number.integer': 'ids数组元素必须是整数',
      }),
    hide: Joi.boolean().strict().messages({
      'boolean.base': 'hide必须是布尔值',
    }),
    notice: Joi.boolean().strict().messages({
      'boolean.base': 'notice必须是布尔值',
    }),
  })
    .and('id') // 强制要求 id 存在（其实上面已经 .required() 了）
    .xor('notice', 'hide'), // notice 和 hide 只能传其中一个,
  getNoticeSchema: Joi.object({
    pageNum: Joi.number().integer().messages({
      'number.integer': 'pageNum必须是整数',
    }),
    pageSize: Joi.number().integer().messages({
      'number.integer': 'pageSize必须是整数',
    }),
    type: Joi.string().valid('all', 'unread', 'read').messages({
      'string.empty': 'type不能为空',
      'any.only': 'type必须是all或unread或read',
    }),
  }),

  createCategorySchema: Joi.object({
    name: Joi.string().required().messages({
      'string.empty': '分类名不能为空',
    }),
    slug: Joi.string().required().messages({
      'string.empty': '路由标识不能为空',
    }),
    icon: Joi.string().allow(''),
  }),
  getCategorySchema: Joi.object({
    name: Joi.string().allow(''),
    createDate: Joi.string()
      .pattern(/^\d{4}\d{2}\d{2},\s*\d{4}\d{2}\d{2}$/)
      .custom((value, helpers) => {
        const [startDateStr, endDateStr] = value.split(/\s*,\s*/);

        // 验证是否为有效日期
        if (
          !moment(startDateStr, 'YYYYMMDD', true).isValid() ||
          !moment(endDateStr, 'YYYYMMDD', true).isValid()
        ) {
          return helpers.error('any.invalid');
        }

        // 验证结束日期不小于开始日期
        if (moment(endDateStr).isBefore(moment(startDateStr))) {
          return helpers.error('date.endBeforeStart');
        }

        return value;
      })
      .messages({
        'string.pattern.base': 'createDate日期范围格式应为"YYYYMMDD, YYYYMMDD"',
        'any.invalid': '包含无效的日期',
        'date.endBeforeStart': '结束日期不能早于开始日期',
      }),
    pageNum: Joi.number().integer().required().messages({
      'number.integer': 'pageNum必须是整数',
      'number.empty': 'pageNum不能为空',
    }),
    pageSize: Joi.number().integer().required().messages({
      'number.integer': 'pageSize必须是整数',
      'number.empty': 'pageNum不能为空',
    }),
  }),
  updateCategorySchema: Joi.object({
    name: Joi.string().required().messages({
      'string.empty': '分类名不能为空',
    }),
    slug: Joi.string().required().messages({
      'string.empty': '路由标识不能为空',
    }),
    icon: Joi.string().allow(''),
  }),
  deleteCategorySchema: Joi.object({
    ids: Joi.array()
      .items(Joi.number().integer()) // 数组元素必须是整数
      .required() // 必填字段
      .min(1) // 数组不能为空（至少1个元素）
      .messages({
        'array.base': 'ids必须是数组',
        'array.empty': 'ids数组不能为空',
        'array.min': 'ids数组至少包含一个元素',
        'number.base': 'ids数组元素必须是数字',
        'number.integer': 'ids数组元素必须是整数',
      }),
  }),

  createTagSchema: Joi.object({
    name: Joi.string().required().messages({
      'string.empty': '标签名不能为空',
    }),
  }),
  getTagsSchema: Joi.object({
    name: Joi.string().allow(''),
    createDate: Joi.string()
      .pattern(/^\d{4}\d{2}\d{2},\s*\d{4}\d{2}\d{2}$/)
      .custom((value, helpers) => {
        const [startDateStr, endDateStr] = value.split(/\s*,\s*/);

        // 验证是否为有效日期
        if (
          !moment(startDateStr, 'YYYYMMDD', true).isValid() ||
          !moment(endDateStr, 'YYYYMMDD', true).isValid()
        ) {
          return helpers.error('any.invalid');
        }

        // 验证结束日期不小于开始日期
        if (moment(endDateStr).isBefore(moment(startDateStr))) {
          return helpers.error('date.endBeforeStart');
        }

        return value;
      })
      .messages({
        'string.pattern.base': 'createDate日期范围格式应为"YYYYMMDD, YYYYMMDD"',
        'any.invalid': '包含无效的日期',
        'date.endBeforeStart': '结束日期不能早于开始日期',
      }),
    isBuiltin: Joi.number().integer().valid(0, 1).messages({
      'number.integer': 'isBuiltin必须是整数',
      'any.only': 'isBuiltin必须是0或1',
    }),
    pageNum: Joi.number().integer().required().messages({
      'number.integer': 'pageNum必须是整数',
      'number.empty': 'pageNum不能为空',
    }),
    pageSize: Joi.number().integer().required().messages({
      'number.integer': 'pageSize必须是整数',
      'number.empty': 'pageNum不能为空',
    }),
  }),
  updateTagSchema: Joi.object({
    name: Joi.string().required().messages({
      'string.empty': 'name不能为空',
    }),
  }),
  deleteTagSchema: Joi.object({
    ids: Joi.array()
      .items(Joi.number().integer()) // 数组元素必须是整数
      .required() // 必填字段
      .min(1) // 数组不能为空（至少1个元素）
      .messages({
        'array.base': 'ids必须是数组',
        'array.empty': 'ids数组不能为空',
        'array.min': 'ids数组至少包含一个元素',
        'number.base': 'ids数组元素必须是数字',
        'number.integer': 'ids数组元素必须是整数',
      }),
  }),

  articleMaintenanceSchema: Joi.object({
    categoryId: Joi.number().integer().required().messages({
      'number.empty': 'categoryId不能为空',
      'number.integer': 'categoryId必须是整数',
    }),
    title: Joi.string()
      .pattern(/^.{4,50}$/)
      .required()
      .messages({
        'string.pattern.base': '文章标题长度应在4-50个字符之间',
      }),
    summary: Joi.string()
      .pattern(/^.{16,150}$/)
      .required()
      .messages({
        'string.pattern.base': '文章摘要长度应在16-150个字符之间',
      }),
    tagIds: Joi.array()
      .items(
        Joi.number().integer().messages({
          'number.base': '每一项必须是数字',
          'number.integer': '每一项必须是整数',
        }),
      )
      .min(1)
      .required()
      .messages({
        'array.base': 'tagIds必须是数组',
        'array.min': 'tagIds至少包含一个元素',
        'any.required': 'tagIds不能为空',
      }),

    content: Joi.string(),
  }),
  getHotArticlesSchema: Joi.object({
    pageNum: Joi.number().integer().messages({
      'number.integer': 'pageNum必须是整数',
    }),
    pageSize: Joi.number().integer().messages({
      'number.integer': 'pageSize必须是整数',
    }),
  }),
  getPaginationArticlesSchema: Joi.object({
    pageNum: Joi.number().integer().messages({
      'number.integer': 'pageNum必须是整数',
    }),
    pageSize: Joi.number().integer().messages({
      'number.integer': 'pageSize必须是整数',
    }),
    keyword: Joi.string().allow('').messages({
      'string.empty': 'keyword不能为空',
    }),
    tagId: Joi.number().integer().messages({
      'number.integer': 'tagId必须是整数',
    }),
    categoryId: Joi.number().integer().messages({
      'number.integer': 'categoryId必须是整数',
    }),
    sort: Joi.string().valid('new', 'hot').messages({
      'any.only': 'sort必须是new或hot',
    }),
    publishTimeRange: Joi.string()
      .pattern(/^\d{4}\d{2}\d{2},\s*\d{4}\d{2}\d{2}$/)
      .custom((value, helpers) => {
        const [startDateStr, endDateStr] = value.split(/\s*,\s*/);

        // 验证是否为有效日期
        if (
          !moment(startDateStr, 'YYYYMMDD', true).isValid() ||
          !moment(endDateStr, 'YYYYMMDD', true).isValid()
        ) {
          return helpers.error('any.invalid');
        }

        // 验证结束日期不小于开始日期
        if (moment(endDateStr).isBefore(moment(startDateStr))) {
          return helpers.error('date.endBeforeStart');
        }

        return value;
      })
      .messages({
        'string.pattern.base': 'publishTimeRange日期范围格式应为"YYYYMMDD, YYYYMMDD"',
        'any.invalid': '包含无效的日期',
        'date.endBeforeStart': '结束日期不能早于开始日期',
      }),
    author: Joi.string().allow('').messages({
      'string.empty': 'author不能为空',
    }),
  }),
  getLoadMoreArticlesSchema: Joi.object({
    keyword: Joi.string().allow('').messages({
      'string.empty': 'keyword不能为空',
    }),
    tagId: Joi.number().integer().messages({
      'number.integer': 'tagId必须是整数',
    }),
    // tagIds: Joi.string()
    //   .allow('')
    //   .pattern(/^(\d+)(,\d+)*$/) // 数字和逗号组合
    //   .optional(),
    categoryId: Joi.number().integer().messages({
      'number.integer': 'categoryId必须是整数',
    }),
    sort: Joi.string().valid('new', 'hot').messages({
      'any.only': 'sort必须是new或hot',
    }),
    lastId: Joi.number().integer().messages({
      'number.empty': 'lastId不能为空',
      'number.integer': 'lastId必须是整数',
    }),
    lastSortValue: Joi.string().allow('').messages({
      'string.empty': 'lastSortValue不能为空',
    }),
    limit: Joi.number().integer().messages({
      'number.integer': 'limit必须是整数',
    }),
  }),
  deleteArticlesSchema: Joi.object({
    ids: Joi.array()
      .items(Joi.number().integer()) // 数组元素必须是整数
      .required() // 必填字段
      .min(1) // 数组不能为空（至少1个元素）
      .messages({
        'array.base': 'ids必须是数组',
        'array.empty': 'ids数组不能为空',
        'array.min': 'ids数组不能为空',
        'number.base': 'ids数组元素必须是数字',
        'number.integer': 'ids数组元素必须是整数',
      }),
  }),
  importArticleSchema: Joi.object({
    title: Joi.string()
      .pattern(/^.{4,50}$/)
      .required()
      .messages({
        'string.pattern.base': '文章标题长度应在4-50个字符之间',
      }),
    summary: Joi.string()
      .pattern(/^.{16,150}$/)
      .required()
      .messages({
        'string.pattern.base': '文章摘要长度应在16-150个字符之间',
      }),
    categoryId: Joi.number().integer().required().messages({
      'number.empty': 'categoryId不能为空',
      'number.integer': 'categoryId必须是整数',
    }),
    tagIds: Joi.array()
      .items(
        Joi.number().integer().messages({
          'number.base': '每一项必须是数字',
          'number.integer': '每一项必须是整数',
        }),
      )
      .min(1)
      .max(3)
      .required()
      .messages({
        'array.base': 'tagIds必须是数组',
        'array.min': 'tagIds至少包含一个元素',
        'array.max': 'tagIds小于等于三个元素',
        'any.required': 'tagIds不能为空',
      }),
  }),
  createArticleSchema: Joi.object({
    title: Joi.string()
      .pattern(/^.{4,50}$/)
      .required()
      .messages({
        'string.pattern.base': '文章标题长度应在4-50个字符之间',
      }),
    summary: Joi.string()
      .pattern(/^.{16,150}$/)
      .required()
      .messages({
        'string.pattern.base': '文章摘要长度应在16-150个字符之间',
      }),
    content: Joi.string().required().messages({
      'string.empty': '文章内容不能为空',
    }),
    categoryId: Joi.number().integer().required().messages({
      'number.empty': 'categoryId不能为空',
      'number.integer': 'categoryId必须是整数',
    }),
    tagIds: Joi.array()
      .items(
        Joi.number().integer().messages({
          'number.base': '每一项必须是数字',
          'number.integer': '每一项必须是整数',
        }),
      )
      .min(1)
      .max(3)
      .required()
      .messages({
        'array.base': 'tagIds必须是数组',
        'array.min': 'tagIds至少包含一个元素',
        'array.max': 'tagIds小于等于三个元素',
        'any.required': 'tagIds不能为空',
      }),
  }),
  outputArticlesSchema: Joi.object({
    ids: Joi.string()
      .pattern(/^\d+(,\d+)*$/) // 数字和逗号组合
      .message('ids必须是逗号分隔的数字字符串'),
  }),
  toggleArticleFavoriteSchema: Joi.object({
    articleIds: Joi.array()
      .items(
        Joi.number().integer().messages({
          'number.base': 'articleIds每一项必须是数字',
          'number.integer': 'articleIds每一项必须是整数',
        }),
      )
      .min(1)
      .required()
      .messages({
        'array.base': 'articleIds必须是数组',
        'array.min': 'articleIds至少包含一个元素',
        'any.required': 'articleIds不能为空',
      }),
    action: Joi.string().valid('add', 'remove').messages({
      'any.only': 'action必须是add或remove',
    }),
  }),

  wsCommentSchema: Joi.object({
    authorId: Joi.number().integer().required().messages({
      'number.empty': 'authorId不能为空',
      'number.integer': 'authorId必须是整数',
    }),
    content: Joi.string().required().messages({
      'string.empty': 'content不能为空',
    }),
    entityId: Joi.number().integer().required().messages({
      'number.empty': 'entityId不能为空',
      'number.integer': 'entityId必须是整数',
    }),
  }),
  wsReplySchema: Joi.object({
    authorId: Joi.number().integer().required().messages({
      'number.empty': 'authorId不能为空',
      'number.integer': 'authorId必须是整数',
    }),
    content: Joi.string().required().messages({
      'string.empty': '评论内容不能为空',
    }),
    entityId: Joi.number().integer().required().messages({
      'number.empty': '文章id不能为空',
      'number.integer': 'entityId必须是整数',
    }),
    parentId: Joi.number().integer().required().messages({
      'number.empty': '一级评论id不能为空',
      'number.integer': 'parentId必须是整数',
    }),
    replyToUserId: Joi.number().integer().required().messages({
      'number.empty': '回复的用户id不能为空',
      'number.integer': 'replyToUserId必须是整数',
    }),
  }),
  wsDelInteractiveSchema: Joi.object({
    id: Joi.number().integer().required().messages({
      'number.empty': 'id不能为空',
      'number.integer': 'id必须是整数',
    }),
    authorId: Joi.number().integer().required().messages({
      'number.empty': 'authorId不能为空',
      'number.integer': 'authorId必须是整数',
    }),
  }),
  wsGetNoticeSchema: Joi.object({
    userId: Joi.number().integer().required().messages({
      'number.empty': 'userId不能为空',
      'number.integer': 'userId必须是整数',
    }),
  }),
  createRouteSchema: Joi.object({
    path: Joi.string().required().messages({
      'string.empty': 'path 不能为空',
    }),
    name: Joi.string().required().messages({
      'string.empty': 'name 不能为空',
    }),
    component: Joi.string().required().messages({
      'string.empty': 'component 不能为空',
    }),
    meta: Joi.object({
      title: Joi.string().required(),
      icon: Joi.string().allow('').optional(),
      type: Joi.string().valid('category', 'header', 'normal', 'admin').required(),
      categoryId: Joi.number().integer().optional(),
    }).required(),
    role: Joi.number().integer().optional(),
  }),
};
