/*
 * @Author: yolo
 * @Date: 2025-09-18 14:47:22
 * @LastEditors: yolo
 * @LastEditTime: 2026-01-05 06:04:20
 * @FilePath: /web/src/pages/client/ArticleExplorer/PreviewList.tsx
 * @Description: 文章列表
 */

import { memo } from 'react';
import { Empty } from 'antd';
import type { ArticleSearchParams, ArticleSearchResult } from '@/types/app/common';
import api from '@/api';
import PreviewArticle from '@/components/PreviewArticle';
import { useArticleInfiniteList } from '@/hooks/useArticleInfiniteList';

interface PreviewListProps {
  categoryId: number;
  sort: 'new' | 'hot';
  tagId: number;
}

const PreviewList = ({ categoryId, sort, tagId }: PreviewListProps) => {
  // queryKey：唯一标识查询
  const queryKey = `article:category:${categoryId}|sort:${sort}|tagId:${tagId}`;

  const query: ArticleSearchParams = {
    limit: 20,
    sort
  };
  if (categoryId) query['categoryId'] = categoryId;
  if (tagId) query['tagId'] = tagId;

  /**
   * @description: 查询文章
   * @param {*} params 请求报文
   * @return {*}
   */
  const getArticles = async (params: ArticleSearchParams) => {
    const res = await api.articleApi.getArticleList(params);
    const { list, nextCursor, hasMore } = res.data;
    return {
      list,
      nextCursor,
      hasMore
    };
  };

  const { list, sentinelRef } = useArticleInfiniteList<
    ArticleSearchParams,
    ArticleSearchResult['list'][number]
  >({
    queryKey,
    query, // 查询条件
    fetcher: getArticles // 使用category、tag、sort查询文章的 fetcher
  });

  return (
    <div className="article-preview-list">
      {list.length ? (
        list.map((article) => <PreviewArticle article={article} key={article.id} />)
      ) : (
        <Empty
          description="暂无文章内容"
          className="no-article-empty"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      )}

      <div ref={sentinelRef} style={{ height: 1 }} />
    </div>
  );
};

export default memo(PreviewList);
