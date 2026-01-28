/*
 * @Author: yolo
 * @Date: 2025-09-12 10:05:16
 * @LastEditors: yolo
 * @LastEditTime: 2026-01-27 05:08:29
 * @FilePath: /web/src/pages/client/ArticleDetail/index.tsx
 * @Description: 文章查看页面
 */

import { memo, useRef, useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import dayjs from 'dayjs';
import remarkGfm from 'remark-gfm';
import { visit } from 'unist-util-visit';
import hljs from 'highlight.js';
import { message, Tag, Button, Anchor, Input, Badge, Avatar } from 'antd';
import { CopyOutlined, UserOutlined } from '@ant-design/icons';
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
import type { Root, Element, Properties } from 'hast';
import '@/assets/styles/markdown.scss';
import authorSvg from '@/assets/svg/author.svg';
import releaseTimeSvg from '@/assets/svg/release-time.svg';
import categorySvg from '@/assets/svg/category.svg';
import tagSvg from '@/assets/svg/tag.svg';
import viewsSvg from '@/assets/svg/views.svg';
import SidebarDrawer from '@/components/SidebarDrawer';
import api from '@/api';
import type { ViewArticleDetailResult } from '@/types/app/common';
import { useAppSelector } from '@/store/hooks';
import { Utils } from '@/utils';

const { TextArea } = Input;

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

interface TocItem {
  key: string;
  href: string;
  title: string;
  depth: number;
  children: TocItem[];
}

// 文章标签显示颜色
const tagColor = ['green', 'cyan', 'purple'];

const ArticleDetail = () => {
  console.log('ArticleDetail 渲染');
  const { userId } = useAppSelector((state) => state.userInfo);
  const flatToc = useRef<TocItem[]>([]);
  const commentRef = useRef<HTMLTextAreaElement>(null);
  const { id: articleId } = useParams<{ id: string }>(); // 根据路由获取文章id
  const navigate = useNavigate();
  const [articleDatail, setArticleDetail] = useState<ViewArticleDetailResult | null>(null); // 文章详细信息
  const [commentCount, setCommentCount] = useState<number>(0); // 文章浏览量
  const [isFavorite, setIsFavorite] = useState<boolean>(false); // 当前浏览文章收藏按钮是否高亮
  const [commentContent, setCommentContent] = useState<string>(''); // 发送评论的内容
  const [favoriteCount, setFavoriteCount] = useState<number>(0); // 文章收藏量
  const [open, setOpen] = useState(false); // 是否打开文章大纲
  const [tocTree, setTocTree] = useState<TocItem[]>([]); // 文章目录树

  // 获取文章内容
  useEffect(() => {
    api.articleApi.viewArticleDetail({ articleId: articleId as string, userId }).then((res) => {
      setCommentCount(res.data.commentCount);
      setFavoriteCount(res.data.favoriteCount);
      setArticleDetail(res.data);

      if (!userId) {
        setIsFavorite(false);
      } else {
        if (res.data.favorites.length) {
          setIsFavorite(true);
        } else {
          setIsFavorite(false);
        }
      }
    });
  }, [userId, articleId]);

  // 构建目录树
  useEffect(() => {
    if (!articleDatail) return;
    const tree = buildTocTree(flatToc.current);
    setTocTree(tree);
  }, [articleDatail]);

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
  const renderers = useMemo(
    () => ({
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
        return (
          <a href={href} target="_blank" rel="noreferrer">
            {children}
          </a>
        );
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
    }),
    []
  );

  // 生成标题锚点
  const rehypeCustomSlug = useMemo(
    () => () => {
      return (tree: Root) => {
        let counter = 0;
        visit(tree, 'element', (node: Element) => {
          if (/^h[1-6]$/.test(node.tagName)) {
            counter += 1;
            node.properties = node.properties || {};
            node.properties.id = `toc-${counter}`;
          }
        });
      };
    },
    []
  );

  // rehype 插件：收集平铺 TOC
  const rehypeCollectToc = useMemo(
    () => (option: { toc: TocItem[] }) => {
      return function transformer(tree: Root) {
        let counter = 0;
        visit(tree, 'element', (node: Element) => {
          if (/^h[1-6]$/.test(node.tagName)) {
            counter++;
            const depth = Number(node.tagName[1]);
            const id = `toc-${counter}`;

            // 确保 properties 有类型，使用 hast 的 Properties 类型
            const props: Properties = (node.properties ?? {}) as Properties;
            props.id = id;
            node.properties = props;

            const text = node.children
              .filter((c): c is { type: 'text'; value: string } => c.type === 'text')
              .map((c) => c.value)
              .join(' ');

            option.toc.push({ key: id, title: text, href: '#' + id, depth, children: [] });
          }
        });
      };
    },
    []
  );

  // 将平铺 TOC 转为嵌套树
  const buildTocTree = (flatToc: TocItem[]): TocItem[] => {
    const root: TocItem[] = [];
    const stack: TocItem[] = [];

    for (const item of flatToc) {
      while (stack.length && stack[stack.length - 1].depth >= item.depth) {
        stack.pop();
      }

      if (stack.length === 0) {
        root.push(item);
      } else {
        stack[stack.length - 1].children.push(item);
      }

      stack.push(item);
    }

    return root;
  };

  // 将一系列 rehype 插件组合成数组，用于处理 Markdown 内容，包括解析 HTML、渲染数学公式、语义化引用、收集目录等，并用 useMemo 缓存以提升渲染性能。
  const rehypePlugins = useMemo(
    () => [
      rehypeCustomSlug, // 给 Markdown 中的标题生成自定义的 id（锚点），方便跳转或生成目录
      rehypeRaw, // 允许解析 Markdown 中的原生 HTML 标签，否则默认会被转义
      rehypeKatex, // 解析 LaTeX 数学公式，渲染为 HTML 或 SVG 格式
      rehypeCallouts, // 处理 Markdown 中的警告、提示、注意类块（比如 > [!NOTE]），渲染成特定样式的提示块
      rehypeSemanticBlockquotes, // 对 Markdown 引用块（>）进行语义化处理，生成更可读或带样式的引用组件
      [rehypeCollectToc, { toc: flatToc.current }] as [typeof rehypeCollectToc, { toc: TocItem[] }] // 收集文章的目录（Table of Contents，TOC），把标题信息填充到 flatToc.current 中
    ],
    []
  );

  /**
   * @description: 发送评论（若未登录需登录后才可以评论）
   * @return {*}
   */
  const sendComment = async () => {
    const finalComment = commentContent.trim();
    if (finalComment) {
      if (userId) {
        console.log('发送评论');
      } else {
        document.getElementById('auth-button')?.click();
      }
    }

    setCommentContent(finalComment);
  };

  /**
   * @description: 点击收藏按钮事件
   * @return {*}
   */
  const handleFavorite = Utils.debounce(() => {
    if (userId) {
      api.articleApi
        .toggleArticleFavorite({
          articleIds: [articleDatail!.id],
          action: !isFavorite ? 'add' : 'remove'
        })
        .then(() => {
          if (!isFavorite) {
            setFavoriteCount(favoriteCount + 1);
          } else {
            setFavoriteCount(favoriteCount - 1);
          }

          setIsFavorite(!isFavorite);
        });
    } else {
      document.getElementById('auth-button')?.click();
    }
  }, 500);

  return (
    <>
      {articleDatail ? (
        <div className="article-container">
          <div className="article-main">
            <div className="article-header">
              <div className="article-title">{articleDatail.title}</div>
              <div className="article-mate">
                <div className="article-author">
                  <img src={authorSvg} title="文章作者" />
                  <span>{articleDatail.user ? articleDatail.user.username : '匿名用户'}</span>
                </div>

                <div className="release-time">
                  <img src={releaseTimeSvg} title="发布时间" />
                  <span>{dayjs(articleDatail.createdAt).format('YYYY-MM-DD')}</span>
                </div>

                <div className="article-category">
                  <img src={categorySvg} title="分类" />
                  <Tag color={articleDatail.category ? 'blue' : '#d6d6d6'}>
                    {articleDatail.category ? articleDatail.category.name : '未分类'}
                  </Tag>
                </div>

                {articleDatail.tags && articleDatail.tags.length ? (
                  <div className="article-tags">
                    <img src={tagSvg} title="标签" />
                    {articleDatail.tags.map((tag, index) => (
                      <Tag color={tagColor[index]} key={tag.id}>
                        {tag.name}
                      </Tag>
                    ))}
                  </div>
                ) : null}

                <div className="article-views">
                  <img src={viewsSvg} title="浏览量" />
                  <span>{articleDatail.viewCount}</span>
                </div>
              </div>
            </div>

            <article className="article-content">
              <PhotoProvider>
                <div className="content markdown-body">
                  <ReactMarkdown
                    components={renderers}
                    remarkPlugins={[[remarkGfm, { singleTilde: false }], remarkMath, remarkMark]}
                    rehypePlugins={rehypePlugins}
                  >
                    {articleDatail.content}
                  </ReactMarkdown>
                </div>
              </PhotoProvider>
            </article>
          </div>

          <div className="article-comment">
            <div className="comment-header">文章评论 {commentCount}</div>

            <div className="comment-box">
              <div className="comment-box__avatar">
                {articleDatail.user && articleDatail.user.avatar ? (
                  <img src={articleDatail.user.avatar} alt="作者头像" />
                ) : (
                  <Avatar size={44} icon={<UserOutlined />} />
                )}
              </div>

              <div className="comment-box__input">
                <TextArea
                  placeholder="平等表达，友善交流"
                  id="comment"
                  name="comment"
                  autoSize={{ minRows: 2 }}
                  showCount
                  maxLength={300}
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  ref={commentRef}
                />

                <div className="comment-box__actions">
                  <Button type="primary" onClick={sendComment}>
                    发送
                  </Button>
                </div>
              </div>
            </div>

            <div className="comment-list"></div>
          </div>

          <div className="article-catalogs-btn">
            <Button className="iconfont icon-catalogs" title="大纲" onClick={() => setOpen(true)} />
          </div>

          <div className="article-come-back-btn">
            <Button className="iconfont icon-come-back" title="返回" onClick={() => navigate(-1)} />
          </div>

          <div
            className={`article-favorite-btn ${isFavorite ? 'collected' : ''}`}
            onClick={handleFavorite}
          >
            <Badge count={favoriteCount} offset={[-3, 5]} color="#c2c8d1">
              <Button className="iconfont icon-favorite" title={isFavorite ? '取消收藏' : '收藏'} />
            </Badge>
          </div>

          <div
            className="article-comment-btn"
            onClick={() => {
              commentRef.current?.focus();
            }}
          >
            <Badge count={commentCount} offset={[-3, 5]} color="#c2c8d1">
              <Button className="iconfont icon-comment" title="评论" />
            </Badge>
          </div>

          <SidebarDrawer placement="right" open={open} handleClose={() => setOpen(false)}>
            <div className="article-outline-drawer">
              <div className="drawer-header">大纲</div>

              <div className="drawer-main">
                <Anchor affix={false} items={tocTree}></Anchor>
              </div>
            </div>
          </SidebarDrawer>
        </div>
      ) : (
        ''
      )}
    </>
  );
};

export default memo(ArticleDetail);
