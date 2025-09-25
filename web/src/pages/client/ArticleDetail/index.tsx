/*
 * @Author: yolo
 * @Date: 2025-09-12 10:05:16
 * @LastEditors: yolo
 * @LastEditTime: 2025-09-25 09:26:03
 * @FilePath: /web/src/pages/client/ArticleDetail/index.tsx
 * @Description: 文章查看页面
 */

import { memo, useRef, useEffect, useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import hljs from 'highlight.js';
import { message, Tag } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';
import remarkMath from 'remark-math';
import { remarkMark } from 'remark-mark-highlight';
import rehypeRaw from 'rehype-raw';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import rehypeCallouts from 'rehype-callouts';
import 'rehype-callouts/theme/obsidian';
import rehypeSemanticBlockquotes from 'rehype-semantic-blockquotes';
import 'highlight.js/styles/atom-one-dark.css';
import type { Element } from 'hast';
import '@/assets/styles/markdown.scss';
import authorSvg from '@/assets/svg/author.svg';
import releaseTimeSvg from '@/assets/svg/release-time.svg';
import categorySvg from '@/assets/svg/category.svg';
import tagSvg from '@/assets/svg/tag.svg';
import viewsSvg from '@/assets/svg/views.svg';
import commentsSvg from '@/assets/svg/comments.svg';

interface CodeRendererProps {
  node?: Element & { value?: string };
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}
interface ImgProps {
  src?: string;
  alt?: string;
}

interface Article {
  id: number;
  title: string;
  content: string;
}

const articles: Article[] = [
  {
    id: 1,
    title: 'React 学习笔记',
    content:
      '# Thinking in Microfrontend (微前端的那些事儿)\n\n[English](english.md)\n\n> 微前端是一种类似于微服务的架构，它将微服务的理念应用于浏览器端，即将 Web 应用由单一的单体应用转变为**多个小型前端应用聚合为一的应用**。各个前端应用还可以**独立运行**、**独立开发**、**独立部署**。\n\n同时，它们也可以在**共享组件**的同时进行并行开发——这些组件可以通过 NPM 或者 Git Tag、Git Submodule 来管理。\n\n**注意**：这里的前端应用指的是前后端分离的单页面应用，在这基础才谈论微前端才有意义。\n\n支持作者（纸质版）：\n\n![](https://cdn.jsdelivr.net/gh/LemonSeven-07/cloudImg@master/img/202204052221152.jpeg)\n\n支持作者：\n\n - 京东：《[前端架构：从入门到微前端](https://item.jd.com/12621088.html)》\n\n**目录**\n\n-   [微前端的那些事儿](#微前端的那些事儿)\n-   [实施微前端的六种方式](#实施微前端的六种方式)\n    -   [基础铺垫：应用分发路由 -\\>\n        路由分发应用](#基础铺垫应用分发路由---路由分发应用)\n        -   [后端：函数调用 -\\> 远程调用](#后端函数调用---远程调用)\n        -   [前端：组件调用 -\\> 应用调用](#前端组件调用---应用调用)\n    -   [路由分发式微前端](#路由分发式微前端)\n    -   [使用 iFrame 创建容器](#使用-iframe-创建容器)\n    -   [自制框架兼容应用](#自制框架兼容应用)\n    -   [组合式集成：将应用微件化](#组合式集成将应用微件化)\n    -   [纯 Web Components 技术构建](#纯-web-components-技术构建)\n    -   [结合 Web Components 构建](#结合-web-components-构建)\n        -   [在 Web Components\n            中集成现有框架](#在-web-components-中集成现有框架)\n        -   [集成在现有框架中的 Web\n            Components](#集成在现有框架中的-web-components)\n    -   [复合型](#复合型)\n-   [为什么微前端开始在流行------Web\n    应用的聚合](#为什么微前端开始在流行web-应用的聚合)\n    -   [前端遗留系统迁移](#前端遗留系统迁移)\n    -   [后端解耦，前端聚合](#后端解耦前端聚合)\n    -   [兼容遗留系统](#兼容遗留系统)\n-   [如何解构单体前端应用------前端应用的微服务式拆分](#如何解构单体前端应用前端应用的微服务式拆分)\n    -   [前端微服化](#前端微服化)\n        -   [独立开发](#独立开发)\n        -   [独立部署](#独立部署)\n        -   [我们真的需要技术无关吗？](#我们真的需要技术无关吗)\n        -   [不影响用户体验](#不影响用户体验)\n    -   [微前端的设计理念](#微前端的设计理念)\n        -   [设计理念一：中心化路由](#设计理念一中心化路由)\n        -   [设计理念二：标识化应用](#设计理念二标识化应用)\n        -   [设计理念三：生命周期](#设计理念三生命周期)\n        -   [设计理念四：独立部署与配置自动化](#设计理念四独立部署与配置自动化)\n    -   [实战微前端架构设计](#实战微前端架构设计)\n        -   [独立部署与配置自动化](#独立部署与配置自动化)\n        -   [应用间路由------事件](#应用间路由事件)\n-   [大型 Angular\n    应用微前端的四种拆分策略](#大型-angular-应用微前端的四种拆分策略)\n    -   [前端微服务化：路由懒加载及其变体](#前端微服务化路由懒加载及其变体)\n    -   [微服务化方案：子应用模式](#微服务化方案子应用模式)\n    -   [方案对比](#方案对比)\n        -   [标准 LazyLoad](#标准-lazyload)\n        -   [LazyLoad 变体 1：构建时集成](#lazyload-变体-1构建时集成)\n        -   [LazyLoad 变体 2：构建后集成](#lazyload-变体-2构建后集成)\n        -   [前端微服务化](#前端微服务化)\n    -   [总对比](#总对比)\n-   [前端微服务化：使用微前端框架 Mooa\n    开发微前端应用](#前端微服务化使用微前端框架-mooa-开发微前端应用)\n    -   [Mooa 概念](#mooa-概念)\n    -   [微前端主工程创建](#微前端主工程创建)\n    -   [Mooa 子应用创建](#mooa-子应用创建)\n    -   [导航到特定的子应用](#导航到特定的子应用)\n-   [前端微服务化：使用特制的 iframe 微服务化 Angular\n    应用](#前端微服务化使用特制的-iframe-微服务化-angular-应用)\n    -   [iframe 微服务架构设计](#iframe-微服务架构设计)\n    -   [微前端框架 Mooa 的特制 iframe\n        模式](#微前端框架-mooa-的特制-iframe-模式)\n    -   [微前端框架 Mooa iframe\n        通讯机制](#微前端框架-mooa-iframe-通讯机制)\n        -   [发布主应用事件](#发布主应用事件)\n        -   [监听子应用事件](#监听子应用事件)\n    -   [示例](#示例)\n-   [资源](#资源)\n\n\n为什么微前端开始在流行——Web 应用的聚合\n===\n\n> 采用新技术，更多不是因为先进，而是因为它能解决痛点。\n\n过去，我一直有一个疑惑，人们是否真的需要微服务，是否真的需要微前端。毕竟，没有银弹。当人们考虑是否采用一种新的架构，除了考虑它带来好处之外，仍然也考量着存在的大量的风险和技术挑战。\n\n前端遗留系统迁移\n---\n\n自微前端框架 [Mooa](https://github.com/phodal/mooa) 及对应的《[微前端的那些事儿](https://github.com/phodal/microfrontend)》发布的两个多月以来，我陆陆续续地接收到一些微前端架构的一些咨询。过程中，我发现了一件很有趣的事：**解决遗留系统，才是人们采用微前端方案最重要的原因**。\n\n这些咨询里，开发人员所遇到的情况，与我之前遇到的情形并相似，我的场景是：设计一个新的前端架构。他们开始考虑前端微服务化，是因为遗留系统的存在。\n\n过去那些使用 Backbone.js、Angular.js、Vue.js 1 等等框架所编写的单页面应用，已经在线上稳定地运行着，也没有新的功能。对于这样的应用来说，我们也没有理由浪费时间和精力重写旧的应用。这里的那些使用旧的、不再使用的技术栈编写的应用，可以称为遗留系统。而，这些应用又需要结合到新应用中使用。我遇到的较多的情况是：旧的应用使用的是 Angular.js 编写，而新的应用开始采用 Angular 2+。这对于业务稳定的团队来说，是极为常见的技术栈。\n\n在即不重写原有系统的基础之下，又可以抽出人力来开发新的业务。其不仅仅对于业务人员来说， 是一个相当吸引力的特性；对于技术人员来说，不重写旧的业务，同时还能做一些技术上的挑战，也是一件相当有挑战的事情。\n\n后端解耦，前端聚合\n---\n\n而前端微服务的一个卖点也在这里，去兼容不同类型的前端框架。这让我又联想到微服务的好处，及许多项目落地微服务的原因：\n\n在初期，后台微服务的一个很大的卖点在于，可以使用不同的技术栈来开发后台应用。但是，事实上，采用微服务架构的组织和机构，一般都是中大型规模的。相较于中小型，对于框架和语言的选型要求比较严格，如在内部限定了框架，限制了语言。因此，在充分使用不同的技术栈来发挥微服务的优势这一点上，几乎是很少出现的。在这些大型组织机构里，采用微服务的原因主要还是在于，**使用微服务架构来解耦服务间依赖**。\n\n而在前端微服务化上，则是恰恰与之相反的，人们更想要的结果是**聚合**，尤其是那些 To B（to Bussiness）的应用。\n\n在这两三年里，移动应用出现了一种趋势，用户不想装那么多应用了。而往往一家大的商业公司，会提供一系列的应用。这些应用也从某种程度上，反应了这家公司的组织架构。然而，在用户的眼里他们就是一家公司，他们就只应该有一个产品。相似的，这种趋势也在桌面 Web 出现。**聚合**成为了一个技术趋势，体现在前端的聚合就是微服务化架构。\n\n兼容遗留系统\n---\n\n那么，在这个时候，我们就需要使用新的技术、新的架构，来容纳、兼容这些旧的应用。而前端微服务化，正好是契合人们想要的这个卖点罢了。\n\n实施微前端的六种方式\n===\n\n微前端架构是一种类似于微服务的架构，它将微服务的理念应用于浏览器端，即将 Web 应用由单一的单体应用转变为**多个小型前端应用聚合为一的应用**。\n\n由此带来的变化是，这些前端应用可以**独立运行**、**独立开发**、**独立部署**。以及，它们应该可以在**共享组件**的同时进行并行开发——这些组件可以通过 NPM 或者 Git Tag、Git Submodule 来管理。\n\n**注意**：这里的前端应用指的是前后端分离的单应用页面，在这基础才谈论微前端才有意义。\n\n结合我最近半年在[微前端](https://github.com/phodal/microfrontends)方面的实践和研究来看，微前端架构一般可以由以下几种方式进行：\n\n1. 使用 HTTP 服务器的路由来重定向多个应用\n2. 在不同的框架之上设计通讯、加载机制，诸如 [Mooa](https://github.com/phodal/mooa) 和 [Single-SPA](https://github.com/CanopyTax/single-spa)\n3. 通过组合多个独立应用、组件来构建一个单体应用\n4. iFrame。使用 iFrame 及自定义消息传递机制\n5. 使用纯 Web Components 构建应用\n6. 结合 Web Components 构建\n\n基础铺垫：应用分发路由 -> 路由分发应用\n---\n\n在一个单体前端、单体后端应用中，有一个典型的特征，即路由是由**框架**来分发的，框架将路由指定到对应的组件或者内部服务中。微服务在这个过程中做的事情是，将调用由**函数调用**变成了**远程调用**，诸如远程 HTTP 调用。而微前端呢，也是类似的，它是将**应用内的组件调用**变成了更细粒度的**应用间组件调用**，即原先我们只是将路由分发到应用的组件执行，现在则需要根据路由来找到对应的应用，再由应用分发到对应的组件上。\n\n### 后端：函数调用 -> 远程调用\n\n在大多数的 CRUD 类型的 Web 应用中，也都存在一些极为相似的模式，即：首页 -> 列表 -> 详情：\n\n - 首页，用于面向用户展示特定的数据或页面。这些数据通常是有限个数的，并且是多种模型的。\n - 列表，即数据模型的聚合，其典型特点是某一类数据的集合，可以看到尽可能多的**数据概要**（如 Google 只返回  100 页），典型见 Google、淘宝、京东的搜索结果页。\n - 详情，展示一个数据的尽可能多的内容。\n\n如下是一个 Spring 框架，用于返回首页的示例：\n\n```java\n@RequestMapping(value="/")\npublic ModelAndView homePage(){\n   return new ModelAndView("/WEB-INF/jsp/index.jsp");\n}\n```\n\n对于某个详情页面来说，它可能是这样的：\n\n```java\n@RequestMapping(value="/detail/{detailId}")\npublic ModelAndView detail(HttpServletRequest request, ModelMap model){\n   ....\n   return new ModelAndView("/WEB-INF/jsp/detail.jsp", "detail", detail);\n}\n```\n\n那么，在微服务的情况下，它则会变成这样子：\n\n```\n@RequestMapping("/name")\npublic String name(){\n    String name = restTemplate.getForObject("http://account/name", String.class);\n    return Name" + name;\n}\n```\n\n而后端在这个过程中，多了一个服务发现的服务，来管理不同微服务的关系。\n\n### 前端：组件调用 -> 应用调用\n\n在形式上来说，单体前端框架的路由和单体后端应用，并没有太大的区别：**依据不同的路由，来返回不同页面的模板。**\n\n```javascritp\nconst appRoutes: Routes = [\n  { path: \'index\', component: IndexComponent },\n  { path: \'detail/:id\', component: DetailComponent },\n];\n```\n\n而当我们将之微服务化后，则可能变成应用 A 的路由：\n\n```javascritp\nconst appRoutes: Routes = [\n  { path: \'index\', component: IndexComponent },\n];\n```\n\n外加之应用 B 的路由：\n\n```javascritp\nconst appRoutes: Routes = [\n  { path: \'detail/:id\', component: DetailComponent },\n];\n```\n\n而问题的关键就在于：**怎么将路由分发到这些不同的应用中去**。与此同时，还要负责管理不同的前端应用。\n\n路由分发式微前端\n---\n\n**路由分发式微前端**，即通过路由将不同的业务**分发到不同的、独立前端应用**上。其通常可以通过 HTTP 服务器的反向代理来实现，又或者是应用框架自带的路由来解决。\n\n就当前而言，通过路由分发式的微前端架构应该是采用最多、最易采用的 “微前端” 方案。但是这种方式看上去更像是**多个前端应用的聚合**，即我们只是将这些不同的前端应用拼凑到一起，使他们看起来像是一个完整的整体。但是它们并不是，每次用户从 A 应用到 B 应用的时候，往往需要刷新一下页面。\n\n在几年前的一个项目里，我们当时正在进行**遗留系统重写**。我们制定了一个迁移计划：\n\n1. 首先，使用**静态网站生成**动态生成首页\n2. 其次，使用 React 技术栈重构详情页\n3. 最后，替换搜索结果页\n\n整个系统并不是一次性迁移过去，而是一步步往下进行。因此在完成不同的步骤时，我们就需要上线这个功能，于是就需要使用 Nginx 来进行路由分发。\n\n如下是一个基于路由分发的 Nginx 配置示例：\n\n```\nhttp {\n  server {\n    listen       80;\n    server_name  www.phodal.com;\n    location /api/ {\n      proxy_pass http://http://172.31.25.15:8000/api;\n    }\n    location /web/admin {\n      proxy_pass http://172.31.25.29/web/admin;\n    }\n    location /web/notifications {\n      proxy_pass http://172.31.25.27/web/notifications;\n    }\n    location / {\n      proxy_pass /;\n    }\n  }\n}\n```\n\n在这个示例里，不同的页面的请求被分发到不同的服务器上。\n\n随后，我们在别的项目上也使用了类似的方式，其主要原因是：**跨团队的协作**。当团队达到一定规模的时候，我们不得不面对这个问题。除此，还有 Angluar 跳崖式升级的问题。于是，在这种情况下，用户前台使用 Angular 重写，后台继续使用 Angular.js 等保持再有的技术栈。在不同的场景下，都有一些相似的技术决策。\n\n因此在这种情况下，它适用于以下场景：\n\n - 不同技术栈之间差异比较大，难以兼容、迁移、改造\n - 项目不想花费大量的时间在这个系统的改造上\n - 现有的系统在未来将会被取代\n - 系统功能已经很完善，基本不会有新需求\n\n而在满足上面场景的情况下，如果为了更好的用户体验，还可以采用 iframe 的方式来解决。\n\n使用 iFrame 创建容器\n---\n\niFrame 作为一个非常古老的，人人都觉得普通的技术，却一直很管用。\n\n> **HTML 内联框架元素** ``<iframe>`` 表示嵌套的正在浏览的上下文，能有效地将另一个 HTML 页面嵌入到当前页面中。\n\niframe 可以创建一个全新的独立的宿主环境，这意味着我们的前端应用之间可以相互独立运行。采用 iframe 有几个重要的前提：\n\n - 网站不需要 SEO 支持\n - 拥有相应的**应用管理机制**。\n\n如果我们做的是一个应用平台，会在我们的系统中集成第三方系统，或者多个不同部门团队下的系统，显然这是一个不错的方案。一些典型的场景，如传统的 Desktop 应用迁移到 Web 应用：\n\n![](https://cdn.jsdelivr.net/gh/LemonSeven-07/cloudImg@master/img/202204052221469.png)\n\n如果这一类应用过于复杂，那么它必然是要进行微服务化的拆分。因此，在采用 iframe 的时候，我们需要做这么两件事：\n\n - 设计**管理应用机制**\n - 设计**应用通讯机制**\n\n**加载机制**。在什么情况下，我们会去加载、卸载这些应用；在这个过程中，采用怎样的动画过渡，让用户看起来更加自然。\n\n**通讯机制**。直接在每个应用中创建 ``postMessage`` 事件并监听，并不是一个友好的事情。其本身对于应用的侵入性太强，因此通过 ``iframeEl.contentWindow`` 去获取 iFrame 元素的 Window 对象是一个更简化的做法。随后，就需要**定义一套通讯规范**：事件名采用什么格式、什么时候开始监听事件等等。\n\n有兴趣的读者，可以看看笔者之前写的微前端框架：[Mooa](https://github.com/phodal/mooa)。\n\n不管怎样，iframe 对于我们今年的 KPI 怕是带不来一丝的好处，那么我们就去造个轮子吧。\n\n自制框架兼容应用\n---\n\n不论是基于 Web Components 的 Angular，或者是 VirtualDOM 的 React 等，现有的前端框架都离不开基本的 HTML 元素 DOM。\n\n那么，我们只需要：\n\n1. 在页面合适的地方引入或者创建 DOM\n2. 用户操作时，加载对应的应用（触发应用的启动），并能卸载应用。\n\n第一个问题，创建 DOM 是一个容易解决的问题。而第二个问题，则一点儿不容易，特别是移除 DOM 和相应应用的监听。当我们拥有一个不同的技术栈时，我们就需要有针对性设计出一套这样的逻辑。\n\n尽管 [Single-SPA](https://github.com/CanopyTax/single-spa) 已经拥有了大部分框架（如 React、Angular、Vue 等框架）的启动和卸载处理，但是它仍然不是适合于生产用途。当我基于 Single-SPA 为 Angular 框架设计一个微前端架构的应用时，我最后选择重写一个自己的框架，即 [Mooa](https://github.com/phodal/mooa)。\n\n虽然，这种方式的上手难度相对比较高，但是后期订制及可维护性比较方便。在不考虑每次加载应用带来的用户体验问题，其唯一存在的风险可能是：**第三方库不兼容**。\n\n但是，不论怎样，与 iFrame 相比，其在技术上更具有**可吹牛逼性**，更有看点。同样的，与 iframe 类似，我们仍然面对着一系列的不大不小的问题：\n\n - 需要设计一套管理应用的机制。\n - 对于流量大的 toC 应用来说，会在首次加载的时候，会多出大量的请求\n\n而我们即又要拆分应用，又想 blabla……，我们还能怎么做？\n\n组合式集成：将应用微件化\n---\n\n**组合式集成**，即通过**软件工程**的方式在构建前、构建时、构建后等步骤中，对应用进行一步的拆分，并重新组合。\n\n从这种定义上来看，它可能算不上并不是一种微前端——它可以满足了微前端的三个要素，即：**独立运行**、**独立开发**、**独立部署**。但是，配合上前端框架的组件 Lazyload 功能——即在需要的时候，才加载对应的业务组件或应用，它看上去就是一个微前端应用。\n\n与此同时，由于所有的依赖、Pollyfill 已经尽可能地在首次加载了，CSS 样式也不需要重复加载。\n\n常见的方式有：\n\n - 独立构建组件和应用，生成 chunk 文件，构建后再**归类**生成的 chunk 文件。（这种方式更类似于微服务，但是成本更高）\n - 开发时独立开发组件或应用，集成时合并组件和应用，最后生成单体的应用。\n - 在运行时，加载应用的 Runtime，随后加载对应的应用代码和模板。\n\n应用间的关系如下图所示（其忽略图中的 “前端微服务化”）：\n\n![](https://cdn.jsdelivr.net/gh/LemonSeven-07/cloudImg@master/img/202204052221729.jpeg)\n\n这种方式看上去相当的理想，即能满足多个团队并行开发，又能构建出适合的交付物。\n\n但是，首先它有一个严重的限制：**必须使用同一个框架**。对于多数团队来说，这并不是问题。采用微服务的团队里，也不会因为微服务这一个前端，来使用不同的语言和技术来开发。当然了，如果要使用别的框架，也不是问题，我们只需要结合上一步中的**自制框架兼容应用**就可以满足我们的需求。\n\n其次，采用这种方式还有一个限制，那就是：**规范！****规范！****规范！**。在采用这种方案时，我们需要：\n\n - 统一依赖。统一这些依赖的版本，引入新的依赖时都需要一一加入。\n - 规范应用的组件及路由。避免不同的应用之间，因为这些组件名称发生冲突。\n - 构建复杂。在有些方案里，我们需要修改构建系统，有些方案里则需要复杂的架构脚本。\n - 共享通用代码。这显然是一个要经常面对的问题。\n - 制定代码规范。\n\n因此，这种方式看起来更像是一个软件工程问题。\n\n现在，我们已经有了四种方案，每个方案都有自己的利弊。显然，结合起来会是一种更理想的做法。\n\n考虑到现有及常用的技术的局限性问题，让我们再次将目光放得长远一些。\n\n纯 Web Components 技术构建\n---\n\n在学习 Web Components 开发微前端架构的过程中，我尝试去写了我自己的 Web Components 框架：[oan](https://github.com/phodal/oan)。在添加了一些基本的 Web 前端框架的功能之后，我发现这项技术特别适合于**作为微前端的基石**。\n\n> Web Components 是一套不同的技术，允许您创建可重用的定制元素（它们的功能封装在您的代码之外）并且在您的 Web 应用中使用它们。\n\n它主要由四项技术组件：\n\n - Custom elements，允许开发者创建自定义的元素，诸如 <today-news></today-news>。\n - Shadow DOM，即影子 DOM，通常是将 Shadow DOM 附加到主文档 DOM 中，并可以控制其关联的功能。而这个 Shadow DOM 则是不能直接用其它主文档 DOM 来控制的。\n - HTML templates，即 ``<template>`` 和 ``<slot>`` 元素，用于编写不在页面中显示的标记模板。\n - HTML Imports，用于引入自定义组件。\n\n每个组件由 ``link`` 标签引入：\n\n```\n<link rel="import" href="components/di-li.html">\n<link rel="import" href="components/d-header.html">\n```\n\n随后，在各自的 HTML 文件里，创建相应的组件元素，编写相应的组件逻辑。一个典型的 Web Components 应用架构如下图所示：\n\n![](https://cdn.jsdelivr.net/gh/LemonSeven-07/cloudImg@master/img/202204052222778.png)\n\n可以看到这边方式与我们上面使用 iframe 的方式很相似，组件拥有自己独立的 ``Scripts`` 和 ``Styles``，以及对应的用于单独部署组件的域名。然而它并没有想象中的那么美好，要直接使用**纯** Web Components 来构建前端应用的难度有：\n\n - 重写现有的前端应用。是的，现在我们需要完成使用 Web Components 来完成整个系统的功能。\n - 上下游生态系统不完善。缺乏相应的一些第三方控件支持，这也是为什么 jQuery 相当流行的原因。\n - 系统架构复杂。当应用被拆分为一个又一个的组件时，组件间的通讯就成了一个特别大的麻烦。\n\nWeb Components 中的 ShadowDOM 更像是新一代的前端 DOM 容器。而遗憾的是并不是所有的浏览器，都可以完全支持 Web Components。\n\n结合 Web Components 构建\n---\n\nWeb Components 离现在的我们太远，可是结合 Web Components 来构建前端应用，则更是一种面向未来演进的架构。或者说在未来的时候，我们可以开始采用这种方式来构建我们的应用。好在，已经有框架在打造这种可能性。\n\n就当前而言，有两种方式可以结合 Web Components 来构建微前端应用：\n\n - 使用 Web Components 构建独立于框架的组件，随后在对应的框架中引入这些组件\n - 在 Web Components 中引入现有的框架，类似于 iframe 的形式\n\n前者是一种组件式的方式，或者则像是在迁移未来的 “遗留系统” 到未来的架构上。\n\n### 在 Web Components 中集成现有框架\n\n现有的 Web 框架已经有一些可以支持 Web Components 的形式，诸如 Angular 支持的 createCustomElement，就可以实现一个 Web Components 形式的组件：\n\n```\nplatformBrowser()\n  .bootstrapModuleFactory(MyPopupModuleNgFactory)\n    .then(({injector}) => {\n      const MyPopupElement = createCustomElement(MyPopup, {injector});\n      customElements.define(‘my-popup’, MyPopupElement);\n});\n```\n\n在未来，将有更多的框架可以使用类似这样的形式，集成到 Web Components 应用中。\n\n### 集成在现有框架中的 Web Components\n\n另外一种方式，则是类似于 [Stencil](https://github.com/ionic-team/stencil) 的形式，将组件直接构建成 Web Components 形式的组件，随后在对应的诸如，如 React 或者 Angular 中直接引用。\n\n如下是一个在 React 中引用 Stencil 生成的 Web Components 的例子：\n\n```javascriptA\nimport React from \'react\';\nimport ReactDOM from \'react-dom\';\nimport \'./index.css\';\nimport App from \'./App\';\nimport registerServiceWorker from \'./registerServiceWorker\';\n\nimport \'test-components/testcomponents\';\n\nReactDOM.render(<App />, document.getElementById(\'root\'));\nregisterServiceWorker();\n```\n\n在这种情况之下，我们就可以构建出独立于框架的组件。\n\n同样的 Stencil 仍然也只是支持最近的一些浏览器，比如：Chrome、Safari、Firefox、Edge 和 IE11\n\n复合型\n---\n\n**复合型**，对就是上面的几个类别中，随便挑几种组合到一起。\n\n我就不废话了~~。\n\n微前端架构选型指南\n===\n\n在上一节《实施前端微服务化的六七种方式》中，介绍了在实施微前端的过程中，我们采用的一些不同方案的架构方案。在这篇文章中，我将总结如何依据不同的情况来选择合适的方案。\n\n快速选型指南图\n---\n\n我还是直接先给结论：\n\n![微前端选型指南](https://cdn.jsdelivr.net/gh/LemonSeven-07/cloudImg@master/img/202204052222480.png)\n\n关键点的相关解释如下：\n\n**框架限制**。在后台微服务系统里，人们使用其它语言的库来开发新的服务，如用于人工智能的 Python。但是在前端，几乎不存在这种可能性。所以当我们的前端框架只有一个时，我们在采用微前端的技术时，可选范围就更大了。而遗憾的是，多数组织需要兼容遗留系统。\n\n**IE 问题**。不论是在几年前，还是在今年，我们实施微前端最先考虑的就是对于 IE 的支持。在我遇到的项目上，基本上都需要支持 IE，因此在技术选型上就受限一定的限制。而在我们那些不需要支持 IE 的项目上，他们就可以使用 WebComponents 技术来构建微前端应用。\n\n**依赖独立**。即各个微前端应用的依赖是要统一管理，还是要在各个应该中自己管理。统一管理可以解决重复加载依赖的问题，独立管理会带来额外的流量开销和等待时间。\n\n微前端方案的对比：简要对比\n---\n\n如果你对上述的几个方面，仍然不是很熟悉的话，请阅读《实施前端微服务化的六七种方式》。\n\n方式       | 开发成本 | 维护成本 | 可行性  | 同一框架要求 |  实现难度 | 潜在风险    \n---------|---------|--------|-------|----------|-------|-------\n路由分发   | 低 | 低 | 高 |  否  |  ★ | 这个方案太普通了 \niFrame    | 低 | 低 | 高  |  否  | ★ | 这个方案太普通了 \n应用微服务化 | 高 | 低 | 中 |  否  | ★★★★ | 针对每个框架做定制及 Hook \n微件化   | 高 | 中 | 低 |  是  | ★★★★★ | 针对构建系统，如 webpack 进行 hack\n微应用化   | 中 | 中 | 高 |  是  | ★★★ | 统一不同应用的构建规范\n纯 Web Components | 高 | 低 | 高 |  否  | ★★ | 新技术，浏览器的兼容问题\n结合 Web Components |高 | 低 | 高 |  否  | ★★ | 新技术，浏览器的兼容问题\n\n同样的，一些复杂概念的解释如下：\n\n**应用微服务化**，即每个前端应用一个独立的服务化前端应用，并配套一套统一的应用管理和启动机制，诸如微前端框架 Single-SPA 或者 [mooa](https://github.com/phodal/mooa) 。\n\n**微件化**，即通过对构建系统的 hack，使不同的前端应用可以使用同一套依赖。它在**应用微服务化**的基本上，改进了重复加载依赖文件的问题。\n\n**微应用化**，又可以称之为**组合式集成**，即通过软件工程的方式，在开发环境对单体应用进行拆分，在构建环境将应用组合在一起构建成一个应用。详细的细节，可以期待后面的文章《一个单体前端应用的拆解与微服务化》\n\n微前端方案的对比：复杂方式\n---\n\n之前看到一篇微服务相关的 [文章](https://www.softwarearchitekt.at/post/2017/12/28/a-software-architect-s-approach-towards-using-angular-and-spas-in-general-for-microservices-aka-microfrontends.aspx)，介绍了不同微服务的区别，其采用了一种比较有意思的对比方式特别详细，这里就使用同样的方式来展示：\n\n架构目标           | 描述\n------------------|---------------\na. 独立开发        | 独立开发，而不受影响\nb. 独立部署        | 能作为一个服务来单独部署\nc. 支持不同框架     | 可以同时使用不同的框架，如 Angular、Vue、React\nd. 摇树优化        | 能消除未使用的代码\ne. 环境隔离        | 应用间的上下文不受干扰\nf. 多个应用同时运行 | 不同应用可以同时运行\ng. 共用依赖        | 不同应用是否共用底层依赖库\nh. 依赖冲突        | 依赖的不同版本是否导致冲突\ni. 集成编译        | 应用最后被编译成一个整体，而不是分开构建\n\n那么，对于下表而言，表中的 a~j 分别表示上面的几种不同的架构考虑因素。\n\n（PS：考虑到  Web Components 几个单词的长度，暂时将它简称为 WC~~)\n\n方式        | a | b | c | d | e | f | g | h | i\n-----------|---|---|---|---|---|---|---|---|---\n路由分发    | O | O | O | O | O | O |   |   |   \niFrame     | O | O | O | O | O | O |   |   |   \n应用微服务化 | O | O | O |   |   | O |   |   |\n微件化      | O | O |   |   | - | - | O | - |   \n微应用化    | O | O |   | O | - | - | O | - | O \n纯 WC      | O | O |   | O | O | O | - | - | O \n结合 WC    | O | O | O | O | O | O |   |   | O \n\n图中的 O 表示支持，空白表示不支持，- 表示不受影响。\n\n再结合之前的选型指南：\n\n![微前端选型指南](https://cdn.jsdelivr.net/gh/LemonSeven-07/cloudImg@master/img/202204052225359.png)\n\n（PS：本图采用 Keynote 绘制）\n\n你是否找到你想到的架构了？\n\n如何解构单体前端应用——前端应用的微服务式拆分\n===\n\n> 刷新页面？路由拆分？No，动态加载组件。\n\n本文分为以下四部分：\n\n - 前端微服务化思想介绍\n - 微前端的设计理念\n - 实战微前端架构设计\n - 基于 Mooa 进行前端微服务化\n\n前端微服化\n---\n\n对于前端微服化来说，有这么一些方案：\n\n - Web Component 显然可以一个很优秀的基础架构。然而，我们并不可能去大量地复写已有的应用。\n - iFrame。你是说真的吗？\n - 另外一个微前端框架 Single-SPA，显然是一个更好的方式。然而，它并非 Production Ready。\n - 通过路由来切分应用，而这个跳转会影响用户体验。\n - 等等。\n\n因此，当我们考虑前端微服务化的时候，我们希望：\n\n - 独立部署\n - 独立开发\n - 技术无关\n - 不影响用户体验\n\n### 独立开发\n\n在过去的几星期里，我花费了大量的时间在学习 Single-SPA 的代码。但是，我发现它在开发和部署上真的太麻烦了，完全达不到独立部署地标准。按 Single-SPA 的设计，我需要在入口文件中声名我的应用，然后才能去构建：\n\n```\ndeclareChildApplication(\'inferno\', () => import(\'src/inferno/inferno.app.js\'), pathPrefix(\'/inferno\'));\n```\n\n同时，在我的应用里，我还需要去指定我的生命周期。这就意味着，当我开发了一个新的应用时，必须更新两份代码：主工程和应用。这时我们还极可能在同一个源码里工作。 \n\n当出现多个团队的时候，在同一份源码里工作，显然变得相当的不可靠——比如说，对方团队使用的是 Tab，而我们使用的是 2 个空格，隔壁的老王用的是 4 个空格。\n\n### 独立部署\n\n一个单体的前端应用最大的问题是，构建出来的 js、css 文件相当的巨大。而微前端则意味着，这个文件被独立地拆分成多个文件，它们便可以独立去部署应用。\n\n### 我们真的需要技术无关吗？\n\n等等，我们是否真的需要**技术无关**？如果我们不需要技术无关的话，微前端问题就很容易解决了。\n\n事实上，对于大部分的公司和团队来说，技术无关只是一个无关痛痒的话术。当一家公司的几个创始人使用了 Java，那么极有可能在未来的选型上继续使用 Java。除非，一些额外的服务来使用 Python 来实现人工智能。因此，在大部分的情况下，仍然是技术栈唯一。\n\n对于前端项目来说，更是如此：一个部门里基本上只会选用一个框架。\n\n于是，我们选择了 Angular。\n\n### 不影响用户体验\n\n使用路由跳转来进行前端微服务化，是一种很简单、高效的切分方式。然而，路由跳转地过程中，会有一个白屏的过程。在这个过程中，跳转前的应用和将要跳转的应用，都失去了对页面的控制权。如果这个应用出了问题，那么用户就会一脸懵逼。\n\n理想的情况下，它应该可以被控制。\n\n微前端的设计理念\n---\n\n### 设计理念一：中心化路由\n\n互联网本质是去中心化的吗？不，DNS 决定了它不是。TAB，决定了它不是。\n\n微服务从本质上来说，它应该是去中心化的。但是，它又不能是完全的去中心化。对于一个微服务来说，它需要一个**服务注册中心**：\n\n> 服务提供方要注册通告服务地址，服务的调用方要能发现目标服务。\n\n对于一个前端应用来说，这个东西就是路由。\n\n从页面上来说，只有我们在网页上添加一个菜单链接，用户才能知道某个页面是可以使用的。\n\n而从代码上来说，那就是我们需要有一个地方来管理我们的应用：**发现存在哪些应用，哪个应用使用哪个路由。\n\n**管理好我们的路由，实际上就是管理好我们的应用**。\n\n### 设计理念二：标识化应用\n\n在设计一个微前端框架的时候，为**每个项目取一个名字的**问题纠结了我很久——怎么去规范化这个东西。直到，我再一次想到了康威定律：\n\n> 系统设计(产品结构等同组织形式，每个设计系统的组织，其产生的设计等同于组织之间的沟通结构。\n\n\n换句人话说，就是同一个组织下，不可能有两个项目的名称是一样的。\n\n所以，这个问题很简单就解决了。\n\n### 设计理念三：生命周期\n\nSingle-SPA 设计了一个基本的生命周期（虽然它没有统一管理），它包含了五种状态：\n\n - load，决定加载哪个应用，并绑定生命周期\n - bootstrap，获取静态资源\n - mount，安装应用，如创建 DOM 节点\n - unload，删除应用的生命周期\n - unmount，卸载应用，如删除 DOM 节点\n\n于是，我在设计上基本上沿用了这个生命周期。显然，诸如 load 之类对于我的设计是多余的。\n\n### 设计理念四：独立部署与配置自动化\n\n从某种意义上来说，整个每系统是围绕着应用配置进行的。如果应用的配置能自动化，那么整个系统就自动化。\n\n当我们只开发一个新的组件，那么我们只需要更新我们的组件，并更新配置即可。而这个配置本身也应该是能自动生成的。\n\n实战微前端架构设计\n---\n\n基于以上的前提，系统的工作流程如下所示：\n\n![系统工作流](https://cdn.jsdelivr.net/gh/LemonSeven-07/cloudImg@master/img/202204052223097.jpeg)\n\n整体的工程流程如下所示：\n\n1. 主工程在运行的时候，会去服务器获取最新的应用配置。\n2. 主工程在获取到配置后，将一一创建应用，并为应用绑定生命周期。\n3. 当主工程监测到路由变化的时候，将寻找是否有对应的路由匹配到应用。\n4. 当匹配对对应应用时，则加载相应的应用。\n\n故而，其对应的结构下图所示：\n\n![](https://cdn.jsdelivr.net/gh/LemonSeven-07/cloudImg@master/img/202204052224030.jpeg)\n\n整体的流程如下图所示：\n\n![Workflow](https://cdn.jsdelivr.net/gh/LemonSeven-07/cloudImg@master/img/202204052224129.png)\n\n### 独立部署与配置自动化\n\n我们做的部署策略如下：我们的应用使用的配置文件叫 ``apps.json``，由主工程去获取这个配置。每次部署的时候，我们只需要将 ``apps.json`` 指向最新的配置文件即可。配置的文件类如下所示：\n\n1. 96a7907e5488b6bb.json\n2. 6ff3bfaaa2cd39ea.json\n3. dcd074685c97ab9b.json\n\n一个应用的配置如下所示：\n\n```javascript\n{\n  "name": "help",\n  "selector": "help-root",\n  "baseScriptUrl": "/assets/help",\n  "styles": [\n    "styles.bundle.css"\n  ],\n  "prefix": "help",\n  "scripts": [\n    "inline.bundle.js",\n    "polyfills.bundle.js",\n    "main.bundle.js"\n  ]\n}\n```\n\n这里的 ``selector`` 对应于应用所需要的 DOM 节点，prefix 则是用于 URL 路由上。这些都是自动从 ``index.html`` 文件和 ``package.json`` 中获取生成的。\n\n### 应用间路由——事件\n\n由于现在的应用变成了两部分：主工程和应用部分。就会出现一个问题：**只有一个工程能捕获路由变化**。当由主工程去改变应用的二级路由时，就无法有效地传达到子应用。在这时，只能通过事件的方式去通知子应用，子应用也需要监测是否是当前应用的路由。\n\n```javascript\nif (event.detail.app.name === appName) {\n  let urlPrefix = \'app\'\n  if (urlPrefix) {\n    urlPrefix = `/${window.mooa.option.urlPrefix}/`\n  }\n  router.navigate([event.detail.url.replace(urlPrefix + appName, \'\')])\n}\n```\n\n相似的，当我们需要从应用 A 跳转到应用 B 时，我们也需要这样的一个机制：\n\n```\nwindow.addEventListener(\'mooa.routing.navigate\', function(event: CustomEvent) {\n  const opts = event.detail\n  if (opts) {\n    navigateAppByName(opts)\n  }\n})\n```\n\n剩下的诸如 Loading 动画也是类似的。\n\n\n大型 Angular 应用微前端的四种拆分策略\n===\n\n上一个月，我们花了大量的时间不熂设计方案来拆分一个大型的 Angular 应用。从使用 Angular 的 Lazyload 到前端微服务化，进行了一系列的讨论。最后，我们终于有了结果，采用的是 Lazyload 变体：**构建时集成代码** 的方式。\n\n过去的几周里，作为一个 “专业” 的咨询师，一直忙于在为客户设计一个 Angular 拆分的服务化方案。主要是为了达成以下的设计目标：\n\n - 构建插件化的 Web 开发平台，满足业务快速变化及分布式多团队并行开发的需求\n - 构建服务化的中间件，搭建高可用及高复用的前端微服务平台\n - 支持前端的独立交付及部署\n\n简单地来说，就是要支持**应用插件化开发**，以及**多团队并行开发**。\n\n**应用插件化开发**，其所要解决的主要问题是：臃肿的大型应用的拆分问题。大型前端应用，在开发的时候要面临大量的**遗留代码**、不同业务的代码耦合在一起，在线上的时候还要面临加载速度慢，运行效率低的问题。\n\n最后就落在了两个方案上：路由懒加载及其变体与前端微服务化\n\n前端微服务化：路由懒加载及其变体\n---\n\n路由懒加载，即通过不同的路由来将应用切成不同的代码快，当路由被访问的时候，才加载对应组件。在诸如 Angular、Vue 框架里都可以通过路由 +  Webpack 打包的方式来实现。而，不可避免地就会需要一些问题：\n\n**难以多团队并行开发**，路由拆分就意味着我们仍然是在一个源码库里工作的。也可以尝试拆分成不同的项目，再编译到一起。\n\n**每次发布需要重新编译**，是的，当我们只是更新一个子模块的代码，我们要重新编译整个应用，再重新发布这个应用。而不能独立地去构建它，再发布它。\n\n**统一的 Vendor 版本**，统一第三方依赖是一件好事。可问题的关键在于：每当我们添加一个新的依赖，我们可能就需要开会讨论一下。\n\n然而，标准 Route Lazyload 最大的问题就是**难以多团队并行开发**，这里之所以说的是 “难以” 是因为，还是有办法解决这个问题。在日常的开发中，一个小的团队会一直在一个代码库里开发，而一个大的团队则应该是在不同的代码库里开发。\n\n于是，我们在标准的路由懒加载之上做了一些尝试。\n\n对于一个二三十人规模的团队来说，他们可能在业务上归属于不同的部门，技术上也有一些不一致的规范，如 4 个空格、2 个空格还是使用 Tab 的问题。特别是当它是不同的公司和团队时，他们可能要放弃测试、代码静态检测、代码风格统一等等的一系列问题。\n\n微服务化方案：子应用模式\n---\n\n除了路由懒加载，我们还可以采用子应用模式，即每个应用都是相互独立地。即我们有一个基座工程，当用户点击相应的路由时，我们去加载这个**独立** 的 Angular 应用；如果是同一个应用下的路由，就不需要重复加载了。而且，这些都可以依赖于浏览器缓存来做。\n\n除了路由懒加载，还可以采用的是类似于 Mooa 的应用嵌入方案。如下是基于 Mooa 框架 + Angular 开发而生成的 HTML 示例：\n\n```\n<app-root _nghost-c0="" ng-version="4.2.0">\n  ...\n  <app-home _nghost-c2="">\n    <app-app1 _nghost-c0="" ng-version="5.2.8" style="display: none;"><nav _ngcontent-c0="" class="navbar"></app-app1>\n    <iframe frameborder="" width="100%" height="100%" src="http://localhost:4200/app/help/homeassets/iframe.html" id="help_206547"></iframe>\n  </app-home>\n</app-root>\n```\n\nMooa 提供了两种模式，一种是基于 Single-SPA 的实验做的，在同一页面加载、渲染两个 Angular 应用；一种是基于 iFrame 来提供独立的应用容器。\n\n解决了以下的问题：\n\n - **首页加载速度更快**，因为只需要加载首页所需要的功能，而不是所有的依赖。\n - **多个团队并行开发**，每个团队里可以独立地在自己的项目里开发。\n - **独立地进行模块化更新**，现在我们只需要去单独更新我们的应用，而不需要更新整个完整的应用。\n\n但是，它仍然包含有以下的问题：\n\n - 重复加载依赖项，即我们在 A 应用中使用到的模块，在 B 应用中也会重新使用到。有一部分可以通过浏览器的缓存来自动解决。\n - 第一次打开对应的应用需要时间，当然**预加载**可以解决一部分问题。\n - 在非 iframe 模式下运行，会遇到难以预料的第三方依赖冲突。\n\n于是在总结了一系列的讨论之后，我们形成了一系列的对比方案：\n\n方案对比\n---\n\n在这个过程中，我们做了大量的方案设计与对比，便想写一篇文章对比一下之前的结果。先看一下图：\n\n![Angular 代码拆分对比](https://cdn.jsdelivr.net/gh/LemonSeven-07/cloudImg@master/img/202204052224655.jpeg)\n\n表格对比：\n\nx       | 标准 Lazyload |   构建时集成  | 构建后集成   | 应用独立 \n--------|--------------|------------|-------------|-------------\n开发流程 |  多个团队在同一个代码库里开发 | 多个团队在不同的代码库里开发 | 多个团队在不同的代码库里开发 | 多个团队在不同的代码库里开发 \n构建与发布 | 构建时只需要拿这一份代码去构建、部署 | 将不同代码库的代码整合到一起，再构建应用 | 将直接编译成各个项目模块，运行时通过懒加载合并 |  将直接编译成不同的几个应用，运行时通过主工程加载 \n适用场景 |  单一团队，依赖库少、业务单一 | 多团队，依赖库少、业务单一 | 多团队，依赖库少、业务单一 |  多团队，依赖库多、业务复杂 \n表现方式 | 开发、构建、运行一体  | 开发分离，构建时集成，运行一体| 开发分离，构建分离，运行一体 |  开发、构建、运行分离\n\n详细的介绍如下：\n\n### 标准 LazyLoad\n\n开发流程：多个团队在同一个代码库里开发，构建时只需要拿这一份代码去部署。\n\n行为：开发、构建、运行一体\n\n适用场景：单一团队，依赖库少、业务单一\n\n### LazyLoad 变体 1：构建时集成\n\n开发流程：多个团队在不同的代码库里开发，在构建时将不同代码库的代码整合到一起，再去构建这个应用。\n\n适用场景：多团队，依赖库少、业务单一\n\n变体-构建时集成：开发分离，构建时集成，运行一体\n\n### LazyLoad 变体 2：构建后集成\n\n开发流程：多个团队在不同的代码库里开发，在构建时将编译成不同的几份代码，运行时会通过懒加载合并到一起。\n\n适用场景：多团队，依赖库少、业务单一\n\n变体-构建后集成：开发分离，构建分离，运行一体\n\n### 前端微服务化\n\n开发流程：多个团队在不同的代码库里开发，在构建时将编译成不同的几个应用，运行时通过主工程加载。\n\n适用场景：多团队，依赖库多、业务复杂\n\n前端微服务化：开发、构建、运行分离\n\n总对比\n---\n\n总体的对比如下表所示：\n\nx       | 标准 Lazyload |   构建时集成  | 构建后集成   | 应用独立 \n--------|--------------|------------|-------------|-------------\n依赖管理 |  统一管理     | 统一管理   | 统一管理  | 各应用独立管理\n部署方式 |  统一部署     | 统一部署  | 可单独部署。更新依赖时，需要全量部署 | 可完全独立部署\n首屏加载 |  依赖在同一个文件，加载速度慢 | 依赖在同一个文件，加载速度慢 | 依赖在同一个文件，加载速度慢  | 依赖各自管理，首页加载快\n首次加载应用、模块 | 只加载模块，速度快  | 只加载模块，速度快 | 只加载模块，速度快  | 单独加载，加载略慢 \n前期构建成本 |  低 | 设计构建流程|   设计构建流程 | 设计通讯机制与加载方式\n维护成本    | 一个代码库不好管理 | 多个代码库不好统一 | 后期需要维护组件依赖 | 后期维护成本低\n打包优化  | 可进行摇树优化、AoT 编译、删除无用代码| 可进行摇树优化、AoT 编译、删除无用代码 | 应用依赖的组件无法确定，不能删除无用代码 | 可进行摇树优化、AoT 编译、删除无用代码\n\n前端微服务化：使用微前端框架 Mooa 开发微前端应用\n===\n\nMooa 是一个为 Angular 服务的微前端框架，它是一个基于 [single-spa](https://github.com/CanopyTax/single-spa)，针对 IE 10 及 IFRAME 优化的微前端解决方案。\n\nMooa 概念\n---\n\nMooa 框架与 Single-SPA 不一样的是，Mooa 采用的是 Master-Slave 架构，即主-从式设计。\n\n对于 Web 页面来说，它可以同时存在两个到多个的 Angular 应用：其中的一个 Angular 应用作为主工程存在，剩下的则是子应用模块。\n\n - 主工程，负责加载其它应用，及用户权限管理等核心控制功能。\n - 子应用，负责不同模块的具体业务代码。\n\n在这种模式下，则由主工程来控制整个系统的行为，子应用则做出一些对应的响应。\n\n微前端主工程创建\n---\n\n要创建微前端框架 Mooa 的主工程，并不需要多少修改，只需要使用 ``angular-cli`` 来生成相应的应用：\n\n```\nng new hello-world\n```\n\n然后添加 ``mooa`` 依赖\n\n```\nyarn add mooa\n```\n\n接着创建一个简单的配置文件 ``apps.json``，放在 ``assets`` 目录下：\n\n```\n[{\n    "name": "help",\n    "selector": "app-help",\n    "baseScriptUrl": "/assets/help",\n    "styles": [\n      "styles.bundle.css"\n    ],\n    "prefix": "help",\n    "scripts": [\n      "inline.bundle.js",\n      "polyfills.bundle.js",\n      "main.bundle.js"\n    ]\n  }\n]]\n```\n\n接着，在我们的 ``app.component.ts`` 中编写相应的创建应用逻辑：\n\n```\nmooa = new Mooa({\n  mode: \'iframe\',\n  debug: false,\n  parentElement: \'app-home\',\n  urlPrefix: \'app\',\n  switchMode: \'coexist\',\n  preload: true,\n  includeZone: true\n});\n\nconstructor(private renderer: Renderer2, http: HttpClient, private router: Router) {\n  http.get<IAppOption[]>(\'/assets/apps.json\')\n    .subscribe(\n      data => {\n        this.createApps(data);\n      },\n      err => console.log(err)\n    );\n}\n\nprivate createApps(data: IAppOption[]) {\n  data.map((config) => {\n    this.mooa.registerApplication(config.name, config, mooaRouter.hashPrefix(config.prefix));\n  });\n\n  const that = this;\n  this.router.events.subscribe((event) => {\n    if (event instanceof NavigationEnd) {\n      that.mooa.reRouter(event);\n    }\n  });\n\n  return mooa.start();\n}\n```\n\n再为应用创建一个对应的路由即可：\n\n```\n{\n  path: \'app/:appName/:route\',\n  component: HomeComponent\n}\n```\n\n接着，我们就可以创建 Mooa 子应用。\n\n\nMooa 子应用创建\n---\n\nMooa 官方提供了一个子应用的模块，直接使用该模块即可：\n\n```\ngit clone https://github.com/phodal/mooa-boilerplate\n```\n\n然后执行：\n\n```\nnpm install\n```\n\n在安装完依赖后，会进行项目的初始化设置，如更改包名等操作。在这里，将我们的应用取名为 help。\n\n然后，我们就可以完成子应用的构建。\n\n接着，执行：``yarn build`` 就可以构建出我们的应用。\n\n将 ``dist`` 目录一下的文件拷贝到主工程的 src/assets/help 目录下，再启动主工程即可。\n\n导航到特定的子应用\n---\n\n在 Mooa 中，有一个路由接口 ``mooaPlatform.navigateTo``，具体使用情况如下：\n\n```\nmooaPlatform.navigateTo({\n  appName: \'help\',\n  router: \'home\'\n});\n```\n\n它将触发一个 ``MOOA_EVENT.ROUTING_NAVIGATE`` 事件。而在我们调用 ``mooa.start()`` 方法时，则会开发监听对应的事件：\n\n```\nwindow.addEventListener(MOOA_EVENT.ROUTING_NAVIGATE, function(event: CustomEvent) {\n  if (event.detail) {\n    navigateAppByName(event.detail)\n  }\n})\n```\n\n它将负责将应用导向新的应用。\n\n嗯，就是这么简单。DEMO 视频如下：\n\nDemo 地址见：[http://mooa.phodal.com/](http://mooa.phodal.com/)\n\nGitHub 示例：[https://github.com/phodal/mooa](https://github.com/phodal/mooa)\n\n前端微服务化：使用特制的 iframe 微服务化 Angular 应用\n===\n\nAngular 基于 Component 的思想，可以让其在一个页面上同时运行多个 Angular 应用；可以在一个 DOM 节点下，存在多个 Angular 应用，即类似于下面的形式：\n\n```html\n<app-home _nghost-c3="" ng-version="5.2.8">\n  <app-help _nghost-c0="" ng-version="5.2.2" style="display:block;"><div _ngcontent-c0=""></div></app-help>\n  <app-app1 _nghost-c0="" ng-version="5.2.3" style="display:none;"><nav _ngcontent-c0="" class="navbar"></div></app-app1>\n  <app-app2 _nghost-c0="" ng-version="5.2.2" style="display:none;"><nav _ngcontent-c0="" class="navbar"></div></app-app2>\n</app-home>\n```\n\n可这一样一来，难免需要做以下的一些额外的工作：\n\n - 创建子应用项目模板，以统一 Angular 版本\n - 构建时，删除子应用的依赖\n - 修改第三方模块\n\n而在这其中最麻烦的就是**第三方模块**冲突问题。思来想去，在三月中旬，我在 Mooa 中添加了一个 iframe 模式。\n\niframe 微服务架构设计\n---\n\n在这里，总的设计思想和之前的《[如何解构单体前端应用——前端应用的微服务式拆分](https://www.phodal.com/blog/how-to-build-a-microfrontend-framework-mooa/)》中介绍是一致的：\n\n![Mooa 架构](https://cdn.jsdelivr.net/gh/LemonSeven-07/cloudImg@master/img/202204052224404.jpeg)\n\n主要过程如下：\n\n - 主工程在运行的时候，会去服务器获取最新的应用配置。\n - 主工程在获取到配置后，将一一创建应用，并为应用绑定生命周期。\n - 当主工程监测到路由变化的时候，将寻找是否有对应的路由匹配到应用。\n - 当匹配对对应应用时，则**创建或显示相应应用的 iframe**，并隐藏其它子应用的 iframe。\n\n其加载形式与之前的 Component 模式并没有太大的区别：\n\n![Mooa Component 加载](https://cdn.jsdelivr.net/gh/LemonSeven-07/cloudImg@master/img/202204052224468.jpeg)\n\n而为了控制不同的 iframe 需要做到这么几件事：\n\n 1. 为不同的子应用分配 ID\n 2. 在子应用中进行 hook，以通知主应用：子应用已加载\n 3. 在子应用中创建对应的事件监听，来响应主应用的 URL 变化事件\n 4. 在主应用中监听子程序的路由跳转等需求\n\n因为大部分的代码可以与之前的 [Mooa](https://github.com/phodal/mooa) 复用，于是我便在 Mooa 中实现了相应的功能。\n\n微前端框架 Mooa 的特制 iframe 模式\n---\n\niframe 可以创建一个**全新的独立的宿主环境**，这意味着我们的 Angular 应用之间可以相互独立运行，我们唯一要做的是：**建立一个通讯机制**。\n\n它可以不修改子应用代码的情况下，可以直接使用。与此同时，它在一般的 iframe 模式进行了优化。使用普通的 iframe 模式，意味着：**我们需要加载大量的重复组件**，即使经过 Tree-Shaking 优化，它也将带来大量的重复内容。如果子应用过多，那么它在初始化应用的时候，体验可能就没有那么友好。但是与此相比，在初始化应用的时候，加载所有的依赖在主程序上，也不是一种很友好的体验。\n\n于是，我就在想能不能创建一个更友好地 IFrame 模式，在里面对应用及依赖进行处理。如下，就是最后生成的页面的 iframe 代码：\n\n\n```html\n<app-home _nghost-c2="" ng-version="5.2.8">\n  <iframe frameborder="" width="100%" height="100%" src="http://localhost:4200/assets/iframe.html" id="help_206547" style="display:block;"></iframe>\n  <iframe frameborder="" width="100%" height="100%" src="http://localhost:4200/assets/iframe.html" id="app_235458 style="display:none;"></iframe>\n</app-home>\n```\n\n对，两个 iframe 的 src 是一样的，但是它表现出来的确实是两个不同的 iframe 应用。那个 iframe.html 里面其实是没有内容的：\n\n```html\n<!doctype html>\n<html lang="en">\n<head>\n  <meta charset="utf-8">\n  <title>App1</title>\n  <base href="/">\n  <meta name="viewport" content="width=device-width,initial-scale=1">\n  <link rel="icon" type="image/x-icon" href="favicon.ico">\n</head>\n<body>\n\n</body>\n</html>\n```\n\n（PS：详细的代码可以见 [https://github.com/phodal/mooa](https://github.com/phodal/mooa)）\n\n只是为了创建 iframe 的需要而存在的，对于一个 Angular 应用来说，是不是一个 iframe 的区别并不大。但是，对于我们而言，区别就大了。我们可以使用自己的方式来控制这个 IFrame，以及我们所要加载的内容。如：\n\n - 共同 Style Guide 中的 CSS 样式。如，在使用 iframe 集成时，移除不需要的 <link>\n - 去除不需要重复加载的 JavaScript。如，打包时不需要的 zone.min.js、polyfill.js 等等\n\n``注意``：对于一些共用 UI 组件而言，仍然需要重复加载。这也就是 iframe 模式下的问题。\n\n微前端框架 Mooa iframe 通讯机制\n---\n\n为了在主工程与子工程通讯，我们需要做到这么一些事件策略：\n\n### 发布主应用事件\n\n由于，我们使用 Mooa 来控制 iframe 加载。这就意味着我们可以通过 ``document.getElementById`` 来获取到 iframe，随后通过 ``iframeEl.contentWindow`` 来发布事件，如下：\n\n```typescript\nlet iframeEl: any = document.getElementById(iframeId)\nif (iframeEl && iframeEl.contentWindow) {\n  iframeEl.contentWindow.mooa.option = window.mooa.option\n  iframeEl.contentWindow.dispatchEvent(\n    new CustomEvent(MOOA_EVENT.ROUTING_CHANGE, { detail: eventArgs })\n  )\n}\n```\n\n这样，子应用就不需要修改代码，就可以直接接收对应的事件响应。\n\n\n### 监听子应用事件\n\n由于，我们也希望能直接在主工程中处理子程序的事件，并且不修改原有的代码。因此，我们也使用同样的方式来在子应用中监听主应用的事件：\n\n```\niframeEl.contentWindow.addEventListener(MOOA_EVENT.ROUTING_NAVIGATE, function(event: CustomEvent) {\n  if (event.detail) {\n    navigateAppByName(event.detail)\n  }\n})\n```\n\n示例\n---\n\n同样的我们仍以 Mooa 框架作为示例，我们只需要在创建 mooa 实例时，配置使用 iframe 模式即可：\n\n```typescript\nthis.mooa = new Mooa({\n  mode: \'iframe\',\n  debug: false,\n  parentElement: \'app-home\',\n  urlPrefix: \'app\',\n  switchMode: \'coexist\',\n  preload: true,\n  includeZone: true\n});\n\n...\n\nthat.mooa.registerApplicationByLink(\'help\', \'/assets/help\', mooaRouter.matchRoute(\'help\'));\nthat.mooa.registerApplicationByLink(\'app1\', \'/assets/app1\', mooaRouter.matchRoute(\'app1\'));\nthis.mooa.start();\n\n...\nthis.router.events.subscribe((event: any) => {\n  if (event instanceof NavigationEnd) {\n    that.mooa.reRouter(event);\n  }\n});\n```\n\n子程序则直接使用：[https://github.com/phodal/mooa-boilerplate](https://github.com/phodal/mooa-boilerplate) 就可以了。\n\n\n资源\n===\n\n相关资料：\n\n - [MDN 影子DOM（Shadow DOM）](https://developer.mozilla.org/zh-CN/docs/Web/Web_Components/%E5%BD%B1%E5%AD%90_DOM)\n - [Web Components](https://developer.mozilla.org/zh-CN/docs/Web/Web_Components)\n - [Shadow DOM v1：独立的网络组件](https://developers.google.com/web/fundamentals/web-components/shadowdom?hl=zh-cn)\n'
  },
  {
    id: 2,
    title: 'Node.js 实战',
    content:
      "## 前言\n这是本人的学习的记录，因为最近在准备面试，很多情况下会被提问到：请简述 `mvvm` ?\n一般情况下我可能这么答：`mvvm` 是视图和逻辑的一个分离，是`model view view-model` 的缩写，通过虚拟dom的方式实现双向数据绑定（我随便答得）\n\n那么问题来了，你知道 `mvvm` 是怎么实现的？\n回答: `mvvm` 主要通过 `Object` 的 `defineProperty` 属性，重写 `data` 的 `set` 和`get` 函数来实现。 ok，回答得60分，那么你知道具体实现过程么？想想看，就算他没问到而你答了出来是不是更好？前提下，一定要手撸一下简单的`mvvm`才会对它有印象~\n\n话不多说，接下来是参考自张仁阳老师的教学视频而作，采用的是[ES6](http://es6.ruanyifeng.com/#docs/class)语法，其中也包含了我个人的理解，如果能帮助到您，我将十分高兴。如有错误之处，请各位大佬指正出来，不胜感激~~~\n\n在实现之前，请先了解基本的`mvvm`的编译过程以及使用\n- 编译的流程图\n![](https://user-gold-cdn.xitu.io/2018/7/18/164ac9a02d21c8cb?w=700&h=374&f=jpeg&s=31670)\n\n- 整体分析\n![](https://user-gold-cdn.xitu.io/2018/7/18/164ac90097e68912?w=639&h=388&f=png&s=49631)\n\n可以发现`new MVVM()`后的编译过程主体分为两个部分：\n\n1. 一部分是模板的编译 `Compile`\n    - 编译元素和文本，最终渲染到页面中\n    - 其中标签中有模板指令的标签才执行编译 例如`<div>我很帅</div>` 不执行编译\n2. 一部分是数据劫持 `Observer`\n    - `Dep` 发布订阅，将所有需要通知变化的`data`添加到一个数组中\n    - `Watcher` 如果数据发生改变，在`Object`的`defineProperty`的`set`函数中调用`Watcher`的`update`方法\n\n#### 明确本文需要实现的目标\n1. **实现模板编译的过程 完成`Vue`实例中的属性可以正确绑定在标签中，并且渲染在页面中**\n   -  工作：指令的解析，正则替换双大括号\n   -  将节点的内容`node.textContent`或者`input`的`value`编译出来\n2. **完成数据的双向绑定**\n   - 工作：通过`observe`类劫持数据变化\n   - 添加发布与订阅：`Object.defineProperty` 在`get`钩子中`addSub`,`set`钩子中通知变化`dep.notify()`\n   - `dep.notify()`调用的是`Watcher`的`update`方法，也就是说需要在`input`变化时调用更新\n   \n<!--more-->\n\n##  分解 Vue 实例\n如何入手？首先从怎么使用`Vue`开始。让我们一步步解析`Vue`的使用：\n\n```js\nlet vm = new Vue({\n    el: '#app'\n    data: {\n        message: 'hello world'\n    }\n})\n```\n上面代码可以看出使用`Vue`,我们是先`new` 一个`Vue` 实例，传一个对象参数，包含 `el` 和 `data`。\n\nok，以上得到了信息，接下来让我们实现**目标1**：将`Vue`实例的`data`编译到页面中\n\n## 实现 Complie 编译模板的过程\n先看看页面的使用：`index.html`\n```html\n<div id=\"app\">\n    <input type=\"text\" v-model=\"jsonText.text\">\n    <div>{{message}}</div>\n    {{jsonText.text}}\n</div>\n<script src=\"./watcher.js\"></script>\n<script src=\"./observer.js\"></script>\n<script src=\"./compile.js\"></script>\n<script src=\"./vue.js\"></script>\n<script>\n    let vm = new Vue({\n        el: '#app',\n        data: {\n            message: 'gershonv',\n            jsonText:{\n                text: 'hello Vue'\n            }\n        }\n    })\n</script>\n```\n\n> 第一步当然是添加`Vue`类作为一个入口文件。\n\n### vue 类-入口文件的添加\n新建一个`vue.js`文件，其代码如下\n构造函数中定义`$el`和`$data`，因为后面的编译要使用到\n\n```js\nclass Vue {\n    constructor(options) {\n        this.$el = options.el; // 挂载\n        this.$data = options.data;\n\n        // 如果有要编译的模板就开始编译\n        if (this.$el) {\n            // 用数据和元素进行编译\n            new Compile(this.$el, this)\n        }\n    }\n}\n```\n- 这里暂时未添加数据劫持`obeserve`，实现目标1暂时未用到，后续再添加\n- 编译需要 `el` 和相关数据，上面代码执行后会有编译，所以我们新建一个执行编译的类的文件\n\n> 这里在入口文件`vue.js`中`new`了一个`Compile`实例，所以接下来新建`compile.js`\n\n### Compile 类-模板编译的添加\n`Compile` 需要做什么？\n我们知道页面中操作`dom`会消耗性能，所以可以把`dom`移入内存处理：\n1. 先把真实的 `dom` 移入到内存中 （在内存中操作`dom`速度比较快）\n    - 怎么放在内存中？可以利用文档碎片 `fragment`\n2. 编译 `compile(fragment){}`\n    - 提取想要的元素节点和文本节点 `v-model` 双大括号，然后进行相关操作。\n3. 把编译好的`fragment`塞回页面里去\n```js\nclass Compile {\n    constructor(el, vm) {\n        this.el = this.isElementNode(el) ? el : document.querySelector(el);\n        this.vm = vm;\n        if (this.el) {// 如果这个元素能获取到 我们才开始编译\n            // 1.先把这些真实的DOM移入到内存中 fragment[文档碎片]\n            let fragment = this.node2fragment(this.el)\n            // 2.编译 => 提取想要的元素节点 v-model 和文本节点 {{}}\n            this.compile(fragment)\n            // 3.编译好的fragment在塞回页面里去\n            this.el.appendChild(fragment)\n        }\n    }\n\n    /* 专门写一些辅助的方法 */\n    isElementNode(node) { // 判断是否为元素及节点，用于递归遍历节点条件\n        return node.nodeType === 1;\n    }\n\n    /* 核心方法 */\n    node2fragment(el) { // 将el的内容全部放入内存中\n        // 文档碎片\n        let fragment = document.createDocumentFragment();\n        let firstChild;\n\n        while (firstChild = el.firstChild) { // 移动DOM到文档碎片中\n            fragment.appendChild(firstChild)\n        }\n        return fragment;\n    }\n    \n    compile(fragment) {\n    }\n}\n```\n> 编译的过程就是把我们的数据渲染好，表现在视图中\n\n#### 编译过程 compile(fragment)\n- 第一步：获取元素的节点，提取其中的指令或者模板双大括号\n    - 首先需要遍历节点，用到了**递归方法**，因为有节点嵌套的关系，`isElementNode` 代表是节点元素，也是递归的终止的判断条件。\n- 第二步：分类编译指令的方法`compileElement` 和 编译文本双大括号的方法\n    - `compileElement` 对`v-model`、`v-text`等指令的解析\n    - `compileText` 编译文本节点 双大括号\n```js\nclass Compile{\n    // ...\n    compile(fragment) {\n        // 遍历节点 可能节点套着又一层节点 所以需要递归\n        let childNodes = fragment.childNodes\n        Array.from(childNodes).forEach(node => {\n            if (this.isElementNode(node)) {\n                // 是元素节点 继续递归\n                // 这里需要编译元素\n                this.compileElement(node);\n                this.compile(node)\n            } else {\n                // 文本节点\n                // 这里需要编译文本\n                this.compileText(node)\n            }\n        })\n    }\n}\n```\n\n##### compileElement && compileText\n1. 取出元素的属性 `node.attributes` 先判断是否包含指令\n2. 判断指令类型(`v-html v-text v-model...`) 调用不一样的数据更新方法\n    - 这里提取了编译的工具对象 `CompileUtil`\n    - 调用方法: `CompileUtil[type](node, this.vm, expr)`\n        - `CompileUtil.类型(节点，实例，v-XX 绑定的属性值)`  \n\n```js\nclass Compile{\n    // ...\n    \n    // 判断是否是指令 ==> compileElement 中递归标签属性中使用\n    isDirective(name) {\n        return name.includes('v-')\n    }\n    \n    compileElement(node) {\n        // v-model 编译\n        let attrs = node.attributes; // 取出当前节点的属性\n        Array.from(attrs).forEach(attr => {\n            let attrName = attr.name;\n            // 判断属性名是否包含 v-\n            if (this.isDirective(attrName)) {\n                // 取到对应的值，放到节点中\n                let expr = attr.value;\n                // v-model v-html v-text...\n                let [, type] = attrName.split('-')\n                CompileUtil[type](node, this.vm, expr);\n            }\n        })\n    }\n    compileText(node) {\n        // 编译 {{}}\n        let expr = node.textContent; //取文本中的内容\n        let reg = /\\{\\{([^}]+)\\}\\}/g;\n        if (reg.test(expr)) {\n            CompileUtil['text'](node, this.vm, expr)\n        }\n    }\n    \n    // compile(fragment){...}\n}\nCompileUtil = {\n    getVal(vm, expr) { // 获取实例上对应的数据\n        expr = expr.split('.'); // 处理 jsonText.text 的情况\n        return expr.reduce((prev, next) => { \n            return prev[next] // 譬如 vm.$data.jsonText.text、vm.$data.message\n        }, vm.$data)\n    },\n    getTextVal(vm, expr) { // 获取文本编译后的结果\n        return expr.replace(/\\{\\{([^}]+)\\}\\}/g, (...arguments) => {\n            return this.getVal(vm, arguments[1])\n        })\n    },\n    text(node, vm, expr) { // 文本处理 参数 [节点, vm 实例, 指令的属性值]\n        let updateFn = this.updater['textUpdater'];\n        let value = this.getTextVal(vm, expr)\n        updateFn && updateFn(node, value)\n    },\n    model(node, vm, expr) { // 输入框处理\n        let updateFn = this.updater['modelUpdater'];\n        updateFn && updateFn(node, this.getVal(vm, expr))\n    },\n    updater: {\n        // 文本更新\n        textUpdater(node, value) {\n            node.textContent = value\n        },\n        // 输入框更新\n        modelUpdater(node, value) {\n            node.value = value;\n        }\n    }\n}\n```\n\n到现在为止 就完成了数据的绑定，也就是说`new Vue` 实例中的 `data` 已经可以正确显示在页面中了，现在要解决的就是**如何实现双向绑定**\n\n结合开篇的`vue`编译过程的图可以知道我们还少一个`observe` 数据劫持，`Dep`通知变化,添加`Watcher`监听变化, 以及最终重写`data`属性\n\n\n## 实现双向绑定\n\n### Observer 类-观察者的添加\n1. 在`vue.js` 中劫持数据\n```js\nclass Vue{\n    //...\n    if(this.$el){\n       new Observer(this.$data); // 数据劫持\n       new Compile(this.$el, this); // 用数据和元素进行编译\n    }  \n}\n```\n2. 新建 `observer.js` 文件\n\n代码步骤：\n- 构造器中添加直接进行 `observe`\n  - 判断`data` 是否存在, 是否是个对象（new Vue 时可能不写`data`属性）\n  - 将数据一一劫持，获取`data`中的`key`和`value`\n```js\nclass Observer {\n    constructor(data) {\n        this.observe(data)\n    }\n\n    observe(data) {\n        // 要对这个数据将原有的属性改成 set 和 get 的形式\n        if (!data || typeof data !== 'object') {\n            return\n        }\n        // 将数据一一劫持\n        Object.keys(data).forEach(key => {\n            // 劫持\n            this.defineReactive(data, key, data[key])\n            this.observe(data[key]) //递归深度劫持\n        })\n    }\n\n    defineReactive(obj, key, value) {\n        let that = this\n        Object.defineProperty(obj, key, {\n            enumerable: true,\n            configurable: true,\n            get() { // 取值时调用的方法\n                return value\n            },\n            set(newValue) { // 当给data属性中设置的时候，更改属性的值\n                if (newValue !== value) {\n                    // 这里的this不是实例\n                    that.observe(newValue) // 如果是对象继续劫持\n                    value = newValue\n                }\n            }\n        })\n    }\n}\n```\n> 虽然有了`observer`，但是并未关联,以及通知变化。下面就添加`Watcher`类\n\n### Watcher 类的添加\n新建`watcher.js`文件\n- 观察者的目的就是给需要变化的那个元素增加一个观察者，当数据变化后执行对应的方法\n- \n\n先回忆下`watch`的用法：`this.$watch(vm, 'a', function(){...})`\n我们在添加发布订阅者时需要传入参数有: **vm实例，v-XX绑定的属性, cb回调函数**\n（`getVal` 方法拷贝了之前 `CompileUtil` 的方法，其实可以提取出来的...）\n\n```js\nclass Watcher {\n    // 观察者的目的就是给需要变化的那个元素增加一个观察者，当数据变化后执行对应的方法\n    // this.$watch(vm, 'a', function(){...})\n    constructor(vm, expr, cb) {\n        this.vm = vm;\n        this.expr = expr;\n        this.cb = cb;\n\n        // 先获取下老的值\n        this.value = this.get();\n    }\n\n    getVal(vm, expr) { // 获取实例上对应的数据\n        expr = expr.split('.');\n        return expr.reduce((prev, next) => { //vm.$data.a\n            return prev[next]\n        }, vm.$data)\n    }\n\n    get() {\n        let value = this.getVal(this.vm, this.expr);\n        return value\n    }\n\n    // 对外暴露的方法\n    update(){\n        let newValue = this.getVal(this.vm, this.expr);\n        let oldValue = this.value\n\n        if(newValue !== oldValue){\n            this.cb(newValue); // 对应 watch 的callback\n        }\n    }\n}\n\n```\n`Watcher` 定义了但是还没有调用，模板编译的时候，需要调观察的时候观察一下\n`Compile`\n```js\nclass Compile{\n    //...\n}\nCompileUtil = {\n    //...\n    text(node, vm, expr) { // 文本处理 参数 [节点, vm 实例, 指令的属性值]\n        let updateFn = this.updater['textUpdater'];\n        let value = this.getTextVal(vm, expr)\n        updateFn && updateFn(node, value)\n\n        expr.replace(/\\{\\{([^}]+)\\}\\}/g, (...arguments) => {\n            new Watcher(vm, arguments[1], () => {\n                // 如果数据变化了，文本节点需要重新获取依赖的属性更新文本中的内容\n                updateFn && updateFn(node, this.getTextVal(vm, expr))\n            })\n        })\n    },\n    //...\n    model(node, vm, expr) { // 输入框处理\n        let updateFn = this.updater['modelUpdater'];\n        // 这里应该加一个监控，数据变化了，应该调用watch 的callback\n        new Watcher(vm, expr, (newValue) => {\n            // 当值变化后会调用cb 将newValue传递过来（）\n            updateFn && updateFn(node, this.getVal(vm, expr))\n        });\n\n        node.addEventListener('input', e => {\n            let newValue = e.target.value;\n            this.setVal(vm, expr, newValue)\n        })\n        updateFn && updateFn(node, this.getVal(vm, expr))\n    },\n    \n    //...\n}\n```\n实现了监听后发现变化并没有通知到所有指令绑定的模板或是双大括号，所以我们需要`Dep` 监控、实例的发布订阅属性的一个类，我们可以添加到`observer.js`中\n\n### Dep 类的添加\n注意 第一次编译的时候不会调用`Watcher`，`dep.target`不存在,`new Watcher`的时候`target`才有值 \n有点绕，看下面代码：\n```js\nclass Watcher {\n    constructor(vm, expr, cb) {\n        //...\n        this.value = this.get()\n    }\n    get(){\n        Dep.target = this;\n        let value = this.getVal(this.vm, this.expr);\n        Dep.target = null;\n        return value\n    }\n    //...\n}\n\n// compile.js\nCompileUtil = {\n    model(node, vm, expr) { // 输入框处理\n        //...\n        new Watcher(vm, expr, (newValue) => {\n            // 当值变化后会调用cb 将newValue传递过来（）\n            updateFn && updateFn(node, this.getVal(vm, expr))\n        });\n    }\n}\n```\n\n```js\nclass Observer{\n    //...\n    defineReactive(obj, key, value){\n        let that = this;\n        let dep = new Dep(); // 每个变化的数据 都会对应一个数组，这个数组存放所有更新的操作\n        Object.defineProperty(obj, key, {\n            //...\n            get(){\n                Dep.target && dep.addSub(Dep.target)\n                //...\n            }\n             set(newValue){\n                 if (newValue !== value) {\n                    // 这里的this不是实例\n                    that.observe(newValue) // 如果是对象继续劫持\n                    value = newValue;\n                    dep.notify(); //通知所有人更新了\n                }\n             }\n        })\n    }\n}\nclass Dep {\n    constructor() {\n        // 订阅的数组\n        this.subs = []\n    }\n\n    addSub(watcher) {\n        this.subs.push(watcher)\n    }\n\n    notify() {\n        this.subs.forEach(watcher => watcher.update())\n    }\n}\n```\n\n以上代码 就完成了**发布订阅者**模式,简单的实现。。也就是说双向绑定的目标2已经完成了\n\n---\n## 结语\n板门弄斧了，本人无意哗众取宠，这只是一篇我的学习记录的文章。想分享出来，这样才有进步。\n如果这篇文章帮助到您，我将十分高兴。有问题可以提`issue`，有错误之处也希望大家能提出来，非常感激。\n\n具体源码我放在了我的github了，有需要的自取。\n[源码链接](https://github.com/gershonv/my-code-store)"
  }
];

const ArticleDetail = () => {
  console.log('ArticleDetail 渲染');
  // 代码块组件，带行号、折叠、复制
  const CodeBlock = ({ language, value }: { language: string; value: string }) => {
    const [expanded, setExpanded] = useState(false);
    const isLong = value.split('\n').length > 10;

    const highlightedLines = useMemo(() => {
      try {
        if (hljs.getLanguage(language)) {
          return hljs.highlight(value, { language }).value.split('\n');
        }
      } catch (error) {
        console.error(error);
      }

      return hljs.highlightAuto(value).value.split('\n');
    }, [value, language]);

    const linesToRender = highlightedLines;
    if (linesToRender.length > 1 && linesToRender[linesToRender.length - 1] === '') {
      linesToRender.pop();
    }

    const handleCopy = () => {
      navigator.clipboard.writeText(value).then(
        () => message.success('代码已复制 🎉', 1),
        () => message.error('复制失败 😖', 1)
      );
    };

    return (
      <pre
        className={`mac-style with-line-number ${isLong ? (expanded ? 'expanded' : 'collapsed') : ''}`}
        onClick={() => {
          if (isLong && !expanded) setExpanded(true);
        }}
      >
        <div className="language-label">{language?.toLowerCase()}</div>

        <button
          className="copy-button"
          onClick={(e) => {
            e.stopPropagation();
            handleCopy();
          }}
          type="button"
          aria-label="复制代码"
        >
          <CopyOutlined size={16} />
        </button>

        {/* 新增：带行号的代码渲染 */}
        <code className={`hljs language-${language}`}>
          {linesToRender.map((line, idx) => (
            <div key={idx} className="code-line">
              <span className="line-number">{idx + 1}</span>
              <span
                className="line-content"
                dangerouslySetInnerHTML={{ __html: line || '\u200B' }}
              />
            </div>
          ))}
        </code>

        {isLong && (
          <button
            className="toggle-btn"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            type="button"
          >
            {expanded ? '收起代码' : `展开代码 (${value.split('\n').length - 1} 行)`}
          </button>
        )}
      </pre>
    );
  };

  // 图片渲染支持懒加载和点击大图预览
  const renderers = {
    img: ({ alt, src }: ImgProps) => {
      const imgRef = useRef<HTMLImageElement>(null);

      useEffect(() => {
        const img = imgRef.current;
        if (!img) return;

        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                setTimeout(() => {
                  img.style.filter = 'blur(0px)';
                }, 400);
                observer.unobserve(img);
              }
            });
          },
          { threshold: 0.1 }
        );

        observer.observe(img);

        return () => {
          observer.unobserve(img);
        };
      }, []);

      return (
        <PhotoView src={src || ''}>
          <span className="image-container">
            <img ref={imgRef} alt={alt} src={src} className="image" />
          </span>
        </PhotoView>
      );
    },
    a: ({ href, children }: { href?: string; children?: React.ReactNode }) => {
      if (children === 'douyin-video' && href) {
        const videoId = href.split('/').pop();
        return (
          <div className="video-container">
            <iframe
              src={`https://open.douyin.com/player/video?vid=${videoId}&autoplay=0`}
              referrerPolicy="unsafe-url"
              allowFullScreen
              className="douyin"
            />
          </div>
        );
      }
      return <a href={href}>{children}</a>;
    },
    code: ({ node, inline, className = '', children, ...props }: CodeRendererProps) => {
      const match = /language-(\w+)/.exec(className || '');
      if (inline || !match) {
        return (
          <code className={className} {...props}>
            {children}
          </code>
        );
      }

      const language = match[1].toLowerCase();
      const codeString = node?.value ?? String(children);

      return <CodeBlock language={language} value={codeString} />;
    }
  };

  return (
    <div className="article-main">
      <div className="article-header">
        <div className="article-title">{articles[0].title}</div>
        <div className="article-mate">
          <div className="article-author">
            <img src={authorSvg} title="文章作者" />
            <span>yolo</span>
          </div>

          <div className="release-time">
            <img src={releaseTimeSvg} title="发布时间" />
            <span>2025-09-23</span>
          </div>

          <div className="article-category">
            <img src={categorySvg} title="分类" />
            <Tag color="blue">前端</Tag>
          </div>

          <div className="article-tags">
            <img src={tagSvg} title="标签" />
            <Tag color="geekblue">mvvm</Tag>
            <Tag color="purple">vue</Tag>
          </div>

          <div className="article-views">
            <img src={viewsSvg} title="浏览量" />
            <span>99</span>
          </div>

          <div className="article-coments">
            <img src={commentsSvg} title="评论数量" />
            <span>99</span>
          </div>
        </div>
      </div>

      <article className="article-content">
        <PhotoProvider>
          <div className="content markdown-body">
            <ReactMarkdown
              components={renderers}
              remarkPlugins={[[remarkGfm, { singleTilde: false }], remarkMath, remarkMark]}
              rehypePlugins={[
                rehypeSlug,
                rehypeRaw,
                rehypeKatex,
                rehypeCallouts,
                rehypeSemanticBlockquotes
              ]}
            >
              {articles[0].content}
            </ReactMarkdown>
          </div>
        </PhotoProvider>
      </article>
    </div>
  );
};

export default memo(ArticleDetail);
