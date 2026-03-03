## 项目运行

- 拉取项目

```
git clon https://github.com/LemonSeven-07/Blog.git
cd web
```

- 安装依赖

```
npm i
```
- 启动服务

```
npm run dev
```

## 关于使用这个项目需要的配置
`/web/src/config/index.ts`
根据自身情况自行配置
```
CLIENT_SYSTEM_NAME: 'yolo的个人博客',
ADMIN_SYSTEM_NAME: 'yolo的博客管理后台',
GITHUB_URL: 'https://github.com/LemonSeven-07',
GITEE_URL: 'https://gitee.com/LemonSeven_07',
AXIOS_BASE_URL: '/yolo',
AXIOS_TIMEOUT: 5000,
WEBSOCKET_URL: 'ws://localhost:8091',
SIGNATURE: '生活本身就是一种无法逃避的孤独。',
AUTHOR: 'yolo'
```

## 项目目录结构

```
├── 📁 public                                      # 静态资源目录（不经过 webpack 处理）
| | └── 📄 favicon.ico                             # 网站图标
├── 📁 src                                         # 源代码目录
│ | ├── 📁 api                                     # API 接口层
│ │ │ | ├── 📁 http                                # HTTP 请求封装模块
| | | | | | └── 📄 cache.ts                        # 请求缓存处理，支持内存/本地存储/HTTP 协商缓存。
| | | | | | └── 📄 cacheRules.ts                   # 接口缓存规则配置，定义各接口的缓存策略。
| | | | | | └── 📄 cancel.ts                       # 请求取消处理，支持重复请求取消和路由切换取消。
| | | | | | └── 📄 index.ts                        # axios 实例创建、请求/响应拦截器、统一错误处理。
| | | | | | └── 📄 request.ts                      # HTTP 请求核心封装，支持缓存、取消、loading 等。
| | | | | | └── 📄 types.ts                        # HTTP 模块相关类型定义。
| | | | | | └── 📄 useAutoCancelRequests.ts        # 路由切换自动取消请求 Hook。
│ │ │ ├── 📁 services                              # API 服务层：按业务模块划分接口
| | | | | ├── 📁 article                           # 文章相关 API：文章增删改查、导入导出、发布等。
| | | | | ├── 📁 category                          # 分类相关 API：分类增删改查。
| | | | | ├── 📁 comment                           # 评论相关 API：评论增删改查、通知等。
| | | | | ├── 📁 dashboard                         # 仪表盘相关 API：统计数据查询。
| | | | | ├── 📁 favorite                          # 收藏相关 API：收藏添加、移除、查询。
| | | | | ├── 📁 tag                               # 标签相关 API：标签增删改查。
| | | | | ├── 📁 user                              # 用户相关 API：登录注册、信息修改、权限管理。
│ │ │ ├── 📁 websocket                             # WebSocket 实时通信模块
| | | | | └── 📄 index.ts                          # WebSocket 模块统一导出。
| | | | | └── 📄 manager.ts                        # WebSocket 管理器：连接管理、消息分发、重连机制。
| | | | | └── 📄 singleton.ts                      # WebSocket 单例模式实现。
| | | | | └── 📄 strategies.ts                     # WebSocket 策略：心跳检测、断线重连。
| | | | | └── 📄 subscription.ts                   # WebSocket 订阅管理：消息订阅与分发。
| | | | | └── 📄 types.ts                          # WebSocket 相关类型定义。
| | | | | └── 📄 useWebSocket.ts                   # WebSocket React Hook，管理连接生命周期。
| | | └── 📄 index.ts                              # API 模块统一导出。
│ | ├── 📁 assets                                  # 静态资源目录（经过 webpack 处理）
│ │ | | ├── 📁 fonts                               # 字体文件目录
│ │ | | ├── 📁 iconfont                            # 图标字体目录
│ │ | | ├── 📁 icons                               # 图标资源目录
│ │ | | ├── 📁 images                              # 图片资源目录
│ │ | | ├── 📁 styles                              # 全局样式目录
│ │ | | ├── 📁 svg                                 # SVG 图标目录
│ | ├── 📁 components                              # 公共组件目录
│ │ | | └── 📁 ArticleDirectory                    # 文章目录组件，展示文章大纲导航。
│ │ | | └── 📁 ArticleRankingList                  # 文章排行榜组件，展示热门文章列表。
│ │ | | └── 📁 AuthModal                           # 认证弹窗组件，处理登录注册表单。
│ │ | | └── 📁 AuthorCard                          # 作者卡片组件，展示作者信息。
│ │ | | └── 📁 CategoryNav                         # 分类导航组件，文章分类切换。
│ │ | | └── 📁 DynamicForm                         # 动态表单组件，根据配置生成表单。
│ │ | | └── 📁 ErrorPage                           # 错误页面组件，404/500 等错误展示。
│ │ | | └── 📁 FloatingBlock                       # 浮动块组件，悬浮操作按钮。
│ │ | | └── 📁 Header                              # 头部组件，网站导航栏。
│ │ | | └── 📁 MarkdownEditor                      # Markdown 编辑器组件，文章编写。
│ │ | | └── 📁 PreviewArticle                      # 文章预览组件，Markdown 渲染展示。
│ │ | | └── 📁 RouterContainer                     # 路由容器组件，动态路由渲染。
│ │ | | └── 📁 SearchModal                         # 搜索弹窗组件，全局文章搜索。
│ │ | | └── 📁 SidebarDrawer                       # 侧边栏抽屉组件，移动端导航。
│ | ├── 📁 config                                  # 配置文件目录
│ │ | | └── 📄 index.ts                            # 全局配置：系统名称、API 地址、超时时间等。
│ | ├── 📁 hooks                                   # 自定义 React Hooks 目录
│ │ | | └── 📄 useArticleInfiniteList.ts           # 无限滚动文章列表 Hook，支持游标分页。
│ │ | | └── 📄 useHeaderScroll.ts                  # 头部滚动效果 Hook，处理滚动吸顶。
│ │ | | └── 📄 useIntersectionObserver.ts          # 交叉观察器 Hook，元素可见性检测。
│ │ | | └── 📄 useLocalLoading.ts                  # 局部加载状态 Hook，组件级 loading。
│ │ | | └── 📄 useTheme.ts                         # 主题切换 Hook，暗色/亮色模式切换。
│ | ├── 📁 layout                                  # 布局组件目录
│ | | | ├── 📁 admin                               # 后台管理布局：侧边栏 + 头部 + 内容区。
│ | | | ├── 📁 client                              # 前台展示布局：头部 + 内容区 + 底部。
│ | ├── 📁 pages                                   # 页面组件目录
│ | | | ├── 📁 admin                               # 后台管理页面
│ | | | | | ├── 📁 Articles                        # 文章管理页面：文章列表、编辑、发布。
│ | | | | | | | ├── 📁 ArticleBuilder              # 文章构建器：文章编辑表单组件。
│ | | | | | | | | | └── 📄 index.ts                # 文章构建器组件导出。
| | | | | | | | └── 📄 index.ts                    # 文章管理页面组件导出。
| | | | | | | | └── 📄 types.ts                    # 文章管理页面类型定义。
│ | | | | | ├── 📁 Categories                      # 分类管理页面：分类增删改查。
│ | | | | | ├── 📁 Dashboard                       # 仪表盘页面：统计数据展示。
│ | | | | | ├── 📁 Tags                            # 标签管理页面：标签增删改查。
│ | | | | | ├── 📁 Users                           # 用户管理页面：用户列表、权限管理。
│ | | | ├── 📁 client                              # 前台展示页面
│ | | | | | ├── 📁 ArticleDetail                   # 文章详情页面：文章内容、评论、目录。
│ | | | | | ├── 📁 ArticleExplorer                 # 文章浏览页面：文章列表、筛选、搜索。
│ | | | | | | | | | └── 📄 FilterBar.tsx           # 筛选栏组件：分类、标签、排序筛选。
│ | | | | | | | | | └── 📄 index.ts                # 文章浏览页面组件导出。
│ | | | | | | | | | └── 📄 PreviewList.tsx         # 文章预览列表组件：文章卡片列表。
│ | | | | | ├── 📁 Favorites                       # 收藏页面：用户收藏的文章列表。
│ | | | | | ├── 📁 LifeNotes                       # 生活笔记页面：随笔记录。
│ | | | | | ├── 📁 Notify                          # 通知页面：消息通知列表。
│ | | | | | ├── 📁 Profile                         # 个人中心页面：用户信息管理。
│ | | | | | | | ├── 📁 ProfileContent              # 个人中心内容区
│ | | | | | | | | | └── 📄 BaseInfo.tsx            # 基本信息组件：用户名、头像修改。
│ | | | | | | | | | └── 📄 ChangeEmail.tsx         # 修改邮箱组件：邮箱绑定更换。
│ | | | | | | | | | └── 📄 ChangePassword.tsx      # 修改密码组件：密码修改。
│ | | | | | | | | | └── 📄 index.ts                # 个人中心内容组件导出。
│ | | | | | | | ├── 📁 ProfileSidebar              # 个人中心侧边栏：功能导航。
│ | | | | | | | └── 📄 index.ts                    # 个人中心页面组件导出。
│ | | | | | | | └── 📄 types.ts                    # 个人中心页面类型定义。
│ | ├── 📁 router                                  # 路由配置目录：路由定义、权限校验、懒加载。
│ | ├── 📁 store                                   # Redux 状态管理目录
│ | | | ├── 📁 modules                             # Redux 模块目录
│ | | | | | ├── 📁 draft                           # 草稿状态模块：文章草稿自动保存。
│ | | | | | ├── 📁 loading                         # 加载状态模块：全局 loading 控制。
│ | | | | | ├── 📁 navigation                      # 导航状态模块：菜单激活状态。
│ | | | | | ├── 📁 theme                           # 主题状态模块：暗色/亮色模式。
│ | | | | | ├── 📁 user                            # 用户状态模块：用户信息、登录状态。
| | | | └── 📄 hooks.ts                            # Redux Typed Hooks：类型化的 useDispatch/useSelector。
| | | | └── 📄 index.ts                            # Redux Store 配置：合并所有 Reducer。
│ | ├── 📁 types                                   # TypeScript 类型定义目录
│ | | | ├── 📁 app                                 # 应用类型定义目录
| | | | | | └── 📄 common.d.ts                     # 公共类型定义：接口响应、路由配置等。
| | | | └── 📄 global.d.ts                         # 全局类型声明：扩展 Window 等。
│ | ├── 📁 utils                                   # 工具函数目录：防抖、节流、文件下载等。
│ | └── 📄 main.tsx                                # 应用入口文件：ReactDOM 渲染、Provider 注入。
│ | └── 📄 vite-env.d.ts                           # Vite 环境类型声明。
├── 📄 .editorconfig                               # 编辑器配置文件：统一代码风格。
├── 📄 .gitignore                                  # Git 忽略文件配置。
├── 📄 .prettierignore                             # Prettier 忽略文件配置。
├── 📄 .prettierrc                                 # Prettier 代码格式化配置。
├── 📄 eslint.config.js                            # ESLint 代码检查配置。
├── 📄 index.html                                  # HTML 入口文件。
├── 📄 package.json                                # 项目依赖管理和脚本配置。
├── 📄 README.md                                   # 项目说明文档。
├── 📄 stylelint.config.js                         # Stylelint 样式检查配置。
├── 📄 tsconfig.app.json                           # TypeScript 应用配置。
├── 📄 tsconfig.json                               # TypeScript 基础配置。
├── 📄 tsconfig.node.json                          # TypeScript Node 环境配置。
├── 📄 vite.config.ts                              # Vite 构建工具配置。
```
