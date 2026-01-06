import type { ArticleSearchResult } from '@/types/app/common';

export interface GetFavoriteArticles {
  Request: {
    categoryId?: number; // 文章分类 ID
    lastId?: number; // 用于滚动分页的最后一条文章 ID
    lastSortValue?: number; // 用于滚动分页的最后一条文章的排序值
    limit?: number; // 本次请求获取的文章数量
  };
  Response: {
    list: { article: ArticleSearchResult['list'][number] }[];
    nextCursor: ArticleSearchResult['nextCursor'];
    hasMore: ArticleSearchResult['hasMore'];
  };
}

export interface GetCategoriesByFavorite {
  Response: {
    id: number;
    name: string;
  }[];
}
