/*
 * @Author: yolo
 * @Date: 2025-09-15 16:18:26
 * @LastEditors: yolo
 * @LastEditTime: 2026-01-03 06:32:50
 * @FilePath: /web/src/components/ArticleRankingList/index.tsx
 * @Description: 热门文章
 */

import { memo, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Empty } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import api from '@/api';
import type { ArticleSearchResult } from '@/types/app/common';

const ArticleRankingList = () => {
  console.log('文章榜渲染');
  const [pageNum, setPageNum] = useState(1);
  const [articles, setArticles] = useState<ArticleSearchResult['list']>([]);

  useEffect(() => {
    api.articleApi.getArticles({ pageNum, pageSize: 5, sort: 'hot' }).then((res) => {
      const list = res.data.list || [];
      setArticles(list);
    });
  }, [pageNum]);

  /**
   * @description: 获取热门文章
   * @return {*}
   */
  const getHotArticle = () => {
    console.log('获取热门文章');
    if (pageNum >= 2) {
      setPageNum(1);
    } else {
      setPageNum(pageNum + 1);
    }
  };
  return (
    <>
      <div className="hot-list">
        <div className="hot-item-header">
          <div className="hot-title">
            <i className="iconfont icon-hot-article" />
            <span title="热门文章" className="title-text">
              热门文章
            </span>
          </div>
          <div className="item-header-button" onClick={getHotArticle}>
            <ReloadOutlined />
            <span className="header-button-text">换一换</span>
          </div>
        </div>
        <div className="divider">
          <div className="content"></div>
        </div>
        <div className="hot-item-body">
          {articles.length ? (
            <ul>
              {articles.map((article, index) => (
                <li key={article.id}>
                  <div className="body-index">{pageNum * 5 - 5 + index + 1}</div>
                  <div className="hot-item-text">
                    <Link to={'/article/' + article.id} title={article.title}>
                      {article.title}
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <Empty
              description="暂无热门文章数据"
              className="no-article-empty"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default memo(ArticleRankingList);
