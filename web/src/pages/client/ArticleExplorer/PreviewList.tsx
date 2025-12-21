/*
 * @Author: yolo
 * @Date: 2025-09-18 14:47:22
 * @LastEditors: yolo
 * @LastEditTime: 2025-12-17 15:46:20
 * @FilePath: /web/src/pages/client/ArticleExplorer/PreviewList.tsx
 * @Description: 文章列表
 */

import { memo, useState, useEffect } from 'react';
import { Empty } from 'antd';
import type { ArticleSearchParams, ArticleSearchResult } from '@/types/app/common';
import api from '@/api';
import PreviewArticle from '@/components/PreviewArticle';

interface PreviewListProps {
  categoryId: number;
  sort: 'new' | 'hot';
  tagId: number;
}

const PreviewList = ({ categoryId, sort, tagId }: PreviewListProps) => {
  const [nextCursor, setNextCursor] = useState<ArticleSearchResult['nextCursor']>(null); // 文章滚动加载下一次请求的游标
  const [hasMore, setHasMore] = useState<ArticleSearchResult['hasMore']>(false); // 文章滚动加载是否还有更多数据
  const [articleList, setArticleList] = useState<ArticleSearchResult['list']>([]); // 文章预览列表

  useEffect(() => {
    // 博客首页 只能根据文章浏览量和发布时间查询全部文章，默认初始化查询条件为 sort='new'
    const params: ArticleSearchParams = { sort };
    if (categoryId) params['categoryId'] = categoryId;
    if (tagId) params['tagIds'] = tagId + '';

    // 查询文章
    api.articleApi.getArticleList(params).then((res) => {
      if (res.data) {
        const { list, nextCursor, hasMore } = res.data;
        setArticleList(list);
        setHasMore(hasMore);
        setNextCursor(nextCursor);
      }
    });
  }, [categoryId, sort, tagId]);

  return (
    <div className="article-preview-list">
      {articleList.length ? (
        articleList.map((article) => <PreviewArticle article={article} key={article.id} />)
      ) : (
        <Empty
          description="暂无文章内容"
          className="no-article-empty"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      )}
    </div>
  );
};

export default memo(PreviewList);
