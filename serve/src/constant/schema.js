const Joi = require('joi');
const moment = require('moment');

module.exports = {
  registerOrLoginSchema: Joi.object({
    username: Joi.string()
      .pattern(/^[\u4e00-\u9fa5a-zA-Z0-9-_]{4,12}$/)
      .required()
      .messages({
        'string.pattern.base': '用户名由中文、字母、横杠和下划线组成，长度4-12位',
      }),
    // password: Joi.string()
    //   .pattern(/^\$2[aby]\$\d{2}\$[./0-9A-Za-z]{53}$/)
    //   .messages({
    //     'string.pattern.base': '密码由字母、数字和符号组成，长度8-16位',
    //   }),
    password: Joi.string()
      .pattern(/^[a-zA-Z0-9!@#*,]{6,16}$/)
      .required()
      .messages({
        'string.pattern.base': '密码由字母、数字和特殊字符“!@#*,”组成，长度6-16位',
      }),
  }),
  updateUserSchema: Joi.object({
    username: Joi.string()
      .pattern(/^[\u4e00-\u9fa5a-zA-Z0-9-_]{4,12}$/)
      .messages({
        'string.pattern.base': '用户名由中文、字母、横杠和下划线组成，长度4-12位',
      }),
    // password: Joi.string()
    //   .pattern(/^\$2[aby]\$\d{2}\$[./0-9A-Za-z]{53}$/)
    //   .messages({
    //     'string.pattern.base': '密码由字母、数字和符号组成，长度8-16位',
    //   }),
    password: Joi.string()
      .pattern(/^[a-zA-Z0-9!@#*,]{6,16}$/)
      .messages({
        'string.pattern.base': '密码由字母、数字和特殊字符“!@#*,”组成，长度6-16位',
      }),
    role: Joi.number().integer().messages({
      'number.integer': '用户权限必须是整数',
    }),
    disabledDiscuss: Joi.boolean().strict().messages({
      'boolean.base': 'disabledDiscuss必须是布尔值',
    }),
  })
    .or('username', 'password', 'role', 'disabledDiscuss')
    .messages({
      'object.missing': '必要字段为空',
    }),
  adminUpdateUserSchema: Joi.object({
    role: Joi.number().integer().messages({
      'number.integer': '用户权限必须是整数',
    }),
    disabledDiscuss: Joi.boolean().strict().messages({
      'boolean.base': 'disabledDiscuss必须是布尔值',
    }),
  })
    .or('role', 'disabledDiscuss')
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
      .pattern(/^[\u4e00-\u9fa5a-zA-Z0-9-_]{4,12}$/)
      .messages({
        'string.pattern.base': '用户名由中文、字母、横杠和下划线组成，长度4-12位',
      }),
    type: Joi.number().integer().messages({
      'number.integer': 'type必须是整数',
    }), // 检索类型 type = 1 github 用户 type = 2 站内用户 不传则检索所有
    rangeDate: Joi.string()
      .pattern(/^\d{4}-\d{2}-\d{2},\s*\d{4}-\d{2}-\d{2}$/)
      .custom((value, helpers) => {
        const [startDateStr, endDateStr] = value.split(/\s*,\s*/);

        // 验证是否为有效日期
        if (
          !moment(startDateStr, 'YYYY-MM-DD', true).isValid() ||
          !moment(endDateStr, 'YYYY-MM-DD', true).isValid()
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
  }),

  createCommentSchema: Joi.object({
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
  }),
  replyCommentSchema: Joi.object({
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
    id: Joi.number().integer().required().messages({
      'number.integer': 'id必须是整数',
      'string.empty': 'id不能为空',
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

  createCategorySchema: Joi.object({
    name: Joi.string().required().messages({
      'string.empty': '分类名不能为空',
    }),
  }),

  getTagsSchema: Joi.object({
    articleId: Joi.number().integer().messages({
      'number.integer': 'articleId必须是整数',
    }),
    categoryId: Joi.number().integer().messages({
      'number.integer': 'categoryId必须是整数',
    }),
  }),

  articleMaintenanceSchema: Joi.object({
    categoryId: Joi.number().integer().required().messages({
      'number.integer': 'categoryId必须是整数',
      'string.empty': 'categoryId不能为空',
    }),
    content: Joi.string().required().messages({
      'string.empty': '文章内容不能为空',
    }),
    tagList: Joi.array().items(Joi.string()).required().messages({
      'array.base': 'tagList必须是一个数组',
    }),
    title: Joi.string().min(1).max(50).required().messages({
      'string.empty': '文章标题不能为空',
      'string.min': '文章标题长度不能小于1',
      'string.max': '文章标题长度不能大于50',
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
    tag: Joi.string().allow('').messages({
      'string.empty': 'tag不能为空',
    }),
    categoryId: Joi.number().integer().messages({
      'number.integer': 'categoryId必须是整数',
    }),
    order: Joi.string().allow('').messages({
      'string.empty': 'order不能为空',
    }),
  }),
  getLoadMoreArticlesSchema: Joi.object({
    keyword: Joi.string().allow('').messages({
      'string.empty': 'keyword不能为空',
    }),
    tag: Joi.string().allow('').messages({
      'string.empty': 'tag不能为空',
    }),
    categoryId: Joi.number().integer().messages({
      'number.integer': 'categoryId必须是整数',
    }),
    sortBy: Joi.string().valid('createdAt', 'viewCount').required().messages({
      'string.empty': 'sortBy不能为空',
      'any.only': 'sortBy必须是createdAt或viewCount',
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
        'array.base': '参数必须是数组',
        'array.empty': '数组不能为空',
        'array.min': '数组不能为空',
        'number.base': '数组元素必须是数字',
        'number.integer': '数组元素必须是整数',
      }),
  }),
  outputArticlesSchema: Joi.object({
    ids: Joi.string()
      .pattern(/^\d+(,\d+)*$/) // 数字和逗号组合
      .message('必须是逗号分隔的数字字符串'),
  }),

  wsCommentSchema: Joi.object({
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
};
