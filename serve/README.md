## 项目运行

- 拉取项目

```
git clon https://github.com/LemonSeven-07/Blog.git
cd serve
```

- 安装依赖

```
npm i
```

- 启动 mysql

```
MacOS 系统
方式 1：使用系统偏好设置（图形化）
打开「系统偏好设置」→ 找到「MySQL」→ 点击「Start MySQL Server」

方式 2：使用终端命令（推荐）
# 启动
brew services start mysql
# 停止（备用）
brew services stop mysql
# 重启（备用）
brew services restart mysql


Windows系统
方式 1：使用服务（图形化）
右键「此电脑」→「管理」→「服务和应用程序」→「服务」→ 找到「MySQL」（名称可能是 MySQL80/MySQL57 等）→ 右键「启动」

方式 2：使用 cmd / 终端命令（管理员权限）
# 启动（需替换为你的 MySQL 服务名，如 MySQL80）
net start MySQL80
# 停止（备用）
net stop MySQL80
```

- 启动 redis

```
MacOS 系统
# 启动
brew services start redis
# 停止（备用）
brew services stop redis
# 重启（备用）
brew services restart redis


Windows 系统
手动启动（解压版 Redis）
进入 Redis 解压目录（如 D:\redis）；
打开 cmd（管理员权限），执行：
# 前台启动
redis-server.exe redis.windows.conf
# 安装为系统服务（一次性操作）
redis-server --service-install redis.windows.conf
# 启动服务（安装后可直接用）
redis-server --service-start
# 停止服务（备用）
redis-server --service-stop


# 连接测试
redis-cli ping
# 正常应返回 "PONG"
# 如果Redis 服务端启用了密码认证，则通过 -a 参数指定密码
redis-cli -a yourpassword ping
# 查看运行进程
ps aux | grep redis-server
# 查看监听端口
lsof -i :6379（默认端口）

若6379端口被占用则使用一下命令
# 查找占用进程
lsof -i :6379
# 终止占用进程
kill -9 <PID>
```

- 启动服务

```
npm run dev
```

## 关于使用这个项目需要的配置

`/serve/.env`
根据自身情况自行配置

```
# 作用: 配置文件
# 注意: 该文件不应该被提交到版本控制系统中

# 启动端口
PORT=8090
# node 环境
NODE_ENV=development


# mySql 数据库配置
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=xxxxxx
MYSQL_DATABASE=yolo_blog



# redis 配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_NAME=yolo_blog
REDIS_PASSWORD=xxxxxx
# 未读消息缓存有效期 默认为2 单位为小时
REDIS_NOTICE_CACHE_TTL=2
# refreshToken缓存有效期 默认为7 单位为天
REDIS_TOKEN_CACHE_TTL=7
# 黑名单缓存有效期 默认 3 单位分钟
BLACK_JTI_CACHE_TTL=3



# Token加密解密密钥
JWT_SECRET=yolo_blog
# JWT过期时间
ACCESS_EXPIRE=3m # 访问token有效时间 3分钟
REFRESH_EXPIRE=7d # 刷新token有效时间 7天



# 邮箱验证码配置
EMAIL_CODE_EXPIRE=3 # 邮箱验证码过期时间 3分钟
EMAIL_LIMIT=3 # 同一邮箱验发送频率限制 3次/小时
IP_LIMIT=10 # IP发送频率限制10次/小时
USER_EMAIL=xxxxxx@qq.com # 发送方邮箱地址
USER_EMAIL_PASS=xxxxxx # 发送方邮箱授权码


# GitHub 配置
GITHUB_OWNER=xxxxxx
GITHUB_TOKEN=xxxxxx
GITHUB_REPO=cloudImg
GITHUB_USER_DIR=blog/userImage
GITHUB_MD_DIR=blog/mdImage
GITHUB_COVER_DIR=blog/coverImage
```

## 项目目录结构

```
├── 📁 src                                          # 源代码目录
│ | ├── 📁 app                                      # 应用核心模块：初始化、错误处理、WebSocket
│ │ | | └── 📄 app.js                               # 应用入口文件，初始化 Koa 应用、配置中间件、挂载路由和错误处理。
| | | | └── 📄 errHandler.js                        # 统一错误处理模块，定义 HTTP 状态码映射，捕获并格式化错误响应。
| | | | └── 📄 socket.js                            # WebSocket 实时通信模块，处理评论通知、未读消息、心跳检测、用户连接管理。
│ | ├── 📁 config                                   # 配置文件目录
│ │ | | └── 📄 config.default.js                    # 环境变量配置加载，支持 Docker 注入和多环境配置。
│ | ├── 📁 constant                                 # 常量定义目录
│ │ | | └── 📄 err.type.js                          # 错误类型定义，包含业务错误码和错误消息的统一映射。
| | | | └── 📄 schema.js                            # Joi 参数校验规则定义，用于接口请求参数的格式验证。
│ | ├── 📁 controller                               # 控制器层：处理 HTTP 请求，调用 Service，返回响应
| | | | └── 📄 article.controller.js                # 文章控制器，处理文章的增删改查、导入导出、发布等请求。
| | | | └── 📄 category.controller.js               # 分类控制器，处理文章分类的增删改查请求。
| | | | └── 📄 comment.controller.js                # 评论控制器，处理评论和回复的增删改查请求。
| | | | └── 📄 dashboard.controller.js              # 仪表盘控制器，处理统计数据查询请求。
| | | | └── 📄 favorite.controller.js               # 收藏控制器，处理文章收藏的添加和移除请求。
| | | | └── 📄 route.controller.js                  # 页面路由控制器，处理前端路由配置的增删改查请求。
| | | | └── 📄 tag.controller.js                    # 标签控制器，处理文章标签的增删改查请求。
| | | | └── 📄 user.controller.js                   # 用户控制器，处理用户注册、登录、信息修改、权限管理等请求。
│ | ├── 📁 db                                       # 数据库连接配置目录
│ | | | └── 📄 redis.js                             # Redis 连接配置，初始化主客户端、发布客户端、订阅客户端。
| | | | └── 📄 sequelize.js                         # Sequelize MySQL 连接配置，定义数据库连接参数和全局模型选项。
│ | ├── 📁 middleware                               # 中间件层：请求预处理和校验
| | | | └── 📄 article.middleware.js                # 文章中间件，处理文章相关的业务校验逻辑。
| | | | └── 📄 auth.middleware.js                   # 鉴权中间件，验证 JWT Token、检查用户登录状态和权限。
| | | | └── 📄 category.middleware.js               # 分类中间件，处理分类相关的业务校验逻辑。
| | | | └── 📄 comment.middleware.js                # 评论中间件，处理评论相关的业务校验逻辑。
| | | | └── 📄 tag.middleware.js                    # 标签中间件，处理标签相关的业务校验逻辑。
| | | | └── 📄 upload.middleware.js                 # 文件上传中间件，处理文件类型和大小校验。
| | | | └── 📄 user.middleware.js                   # 用户中间件，处理用户相关的业务校验逻辑（如注册、登录验证）。
| | | | └── 📄 validator.middleware.js              # 参数校验中间件，基于 Joi 进行请求参数格式验证。
│ | ├── 📁 model                                    # 数据模型层：定义数据库表结构和关联关系
| | | | └── 📄 article.model.js                     # 文章模型，定义文章表结构和关联关系。
| | | | └── 📄 articleTag.model.js                  # 文章标签关联模型，定义文章与标签的多对多关系。
| | | | └── 📄 category.model.js                    # 分类模型，定义文章分类表结构和关联关系。
| | | | └── 📄 comment.model.js                     # 评论模型，定义评论表结构和关联关系。
| | | | └── 📄 favorite.model.js                    # 收藏模型，定义用户收藏文章的关联表。
| | | | └── 📄 index.js                             # 模型统一导出，自动加载所有模型并执行关联配置。
| | | | └── 📄 notification.model.js                # 通知模型，定义消息通知表结构和关联关系。
| | | | └── 📄 route.model.js                       # 路由模型，定义前端页面路由配置表结构。
| | | | └── 📄 tag.model.js                         # 标签模型，定义文章标签表结构和关联关系。
| | | | └── 📄 user.model.js                        # 用户模型，定义用户表结构和关联关系。
│ | ├── 📁 router                                   # 路由层：定义 API 路由规则
| | | | └── 📄 article.router.js                    # 文章路由，定义文章相关的 API 路由规则。
| | | | └── 📄 category.router.js                   # 分类路由，定义分类相关的 API 路由规则。
| | | | └── 📄 comment.router.js                    # 评论路由，定义评论相关的 API 路由规则。
| | | | └── 📄 dashboard.router.js                  # 仪表盘路由，定义统计数据相关的 API 路由规则。
| | | | └── 📄 favorite.router.js                   # 收藏路由，定义收藏相关的 API 路由规则。
| | | | └── 📄 index.js                             # 路由统一导出，自动加载并合并所有路由模块。
| | | | └── 📄 route.router.js                      # 页面路由配置，定义前端路由相关的 API 路由规则。
| | | | └── 📄 tag.router.js                        # 标签路由，定义标签相关的 API 路由规则。
| | | | └── 📄 user.router.js                       # 用户路由，定义用户相关的 API 路由规则。
│ | ├── 📁 service                                  # 服务层：封装业务逻辑和数据库操作
| | | | └── 📄 article.service.js                   # 文章服务，封装文章的数据库查询和业务逻辑。
| | | | └── 📄 articleTag.service.js                # 文章标签关联服务，处理文章与标签的关联操作。
| | | | └── 📄 category.service.js                  # 分类服务，封装分类的数据库查询和业务逻辑。
| | | | └── 📄 comment.service.js                   # 评论服务，封装评论的数据库查询和业务逻辑。
| | | | └── 📄 dashboard.service.js                 # 仪表盘服务，封装统计数据的查询逻辑。
| | | | └── 📄 favorite.service.js                  # 收藏服务，封装收藏的数据库查询和业务逻辑。
| | | | └── 📄 route.service.js                     # 路由服务，封装页面路由配置的数据库查询和业务逻辑。
| | | | └── 📄 tag.service.js                       # 标签服务，封装标签的数据库查询和业务逻辑。
| | | | └── 📄 user.service.js                      # 用户服务，封装用户的数据库查询和业务逻辑。
│ | ├── 📁 utils                                    # 工具函数目录
| | | | └── 📄 index.js                             # 工具函数集合：Token 生成、邮件发送、文件处理、GitHub 图片上传等。
├── 📄 main                                         # 应用启动入口文件。
├── 📄 .env                                         # 环境变量配置文件，存储敏感信息和运行配置。
├── 📄 .gitignore                                   # Git 忽略文件配置，指定不纳入版本控制的文件和目录。
├── 📄 .prettierrc                                  # Prettier 代码格式化配置文件。
├── 📄 package.json                                 # 项目依赖管理和脚本配置文件。
├── 📄 README.md                                    # 项目说明文档。
└── 📄 start.sh                                     # 应用启动脚本，用于生产环境部署。
```
