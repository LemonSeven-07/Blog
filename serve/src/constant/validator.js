module.exports = {
  username: {
    type: 'string',
    required: true,
    min: 4,
    max: 12,
    format: /^[\u4e00-\u9fa5a-zA-Z0-9-_]{4,12}$/,
    message: '用户名由中文、字母、横杠和下划线组成，长度4-32位',
  },
  password: {
    type: 'string',
    required: true,
  },
  email: {
    type: 'string',
    required: true,
    format:
      /^[a-zA-Z0-9\u0080-\uFFFF._%+-]+@[a-zA-Z0-9\u0080-\uFFFF.-]+\.[a-zA-Z\u0080-\uFFFF]{2,}$/,
    message: '邮箱格式不正确',
  },
};
