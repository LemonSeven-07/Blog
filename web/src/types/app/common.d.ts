export type ComponentMap = {
  ArticleExplorer: (name: string) => JSX.Element;
  Notify: JSX.Element;
  LifeNotes: JSX.Element;
  Profile: JSX.Element;
  Favorites: JSX.Element;
  Dashboard: JSX.Element;
  Articles: JSX.Element;
  Users: JSX.Element;
};

export interface RouteItem {
  id: number;
  path: string;
  name: string;
  component: keyof ComponentMap;
  meta: {
    icon?: string;
    type: 'category' | 'header' | 'normal' | 'admin';
    title: string;
    categoryId?: number;
  };
  children?: RouteItem[];
}

export interface tagItem {
  id: number;
  name: string;
}

export interface ArticleSearchParams {
  keyword?: string; // 文章关键字搜索
  tagId?: number; // 文章标签ID字符串
  categoryId?: number; // 文章分类 ID
  sort?: 'new' | 'hot'; // 排序方式
  lastId?: number; // 用于滚动分页的最后一条文章 ID
  lastSortValue?: number; // 用于滚动分页的最后一条文章的排序值
  limit?: number; // 本次请求获取的文章数量
}

export interface ArticleSearchResult {
  list: {
    id: number; // 文章 ID
    title: string; // 文章标题
    summary: string; // 文章摘要
    coverImage: string; // 文章封面图片 URL
    viewCount: number; // 文章浏览量
    favoriteCount: number; // 文章收藏量
    tags: { id: number; name: string }[]; // 文章标签列表
    category: { id: number; name: string }; // 文章分类
    user: { id: number; username: string }; // 文章作者信息
    createdAt: string; // 文章发布时间
  }[];
  nextCursor: {
    lastId: number; // 用于下一次滚动分页的最后一条文章 ID
    lastSortValue: number; // 用于下一次滚动分页的最后一条文章的排序值
  } | null;
  hasMore: boolean; // 是否有更多文章可供加载
}

export interface ViewArticleDetailResult {
  id: number; // 文章id
  userId: number; // 用户id
  categoryId: number; // 分类id
  title: string; // 文章标题
  content: string; // 文章内容
  viewCount: number; // 文章浏览量
  favoriteCount: number; // 文章收藏量
  commentCount: number; // 文章评论量
  createdAt: string; // 文章发布时间
  tags: {
    id: number; // 文章标签id
    name: string; // 文章标签名
  }[];
  category: {
    id: number; // 文章分类id
    name: string; // 文章分类名
  };
  user: {
    id: number; // 文章作者id
    username: string; // 文章作者名称
    avatar: string;
  };
  favorites: { id: number }[]; // 文章收藏
}
