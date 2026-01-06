import type {
  ArticleSearchParams,
  ArticleSearchResult,
  ViewArticleDetailResult
} from '@/types/app/common';

export interface OutputArticle {
  Request: { ids: string };
  Config: { responseType: 'blob' };
  Response: Blob;
}

export interface UploadArticle {
  Request: FormData;
}

export interface GetArticleList {
  Request: ArticleSearchParams;
  Response: ArticleSearchResult;
}

export interface ViewArticleDetail {
  Request: {
    articleId: string; // 文章 id
    userId: number | null; // 用户 id
  };
  Response: ViewArticleDetailResult;
}

export interface ToggleArticleFavorite {
  Request: {
    articleIds: number[];
    action: 'add' | 'remove';
  };
}

export interface GetArticles {
  Request: {
    pageNum: number;
    pageSize: number;
    keyword?: string;
    tagId?: number;
    categoryId?: number;
    author?: string;
    sort?: 'new' | 'hot';
    publishTimeRange?: string;
  };
  Response: {
    list: ArticleSearchResult['list'];
    total: number;
  };
}
