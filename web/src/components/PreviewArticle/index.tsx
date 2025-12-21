/*
 * @Author: yolo
 * @Date: 2025-12-17 14:44:28
 * @LastEditors: yolo
 * @LastEditTime: 2025-12-20 04:44:24
 * @FilePath: /web/src/components/PreviewArticle/index.tsx
 * @Description: 预览文章
 */

import { memo } from 'react';
import { Link } from 'react-router-dom';
import type { ArticleSearchResult } from '@/types/app/common';
import { Tag } from 'antd';
import { EyeOutlined, StarOutlined } from '@ant-design/icons';

const PreviewArticle = ({ article }: { article: ArticleSearchResult['list'][number] }) => {
  return (
    <>
      <Link to={'/article/' + article.id} className="article-preview-list-item">
        <div className="article-preview-info">
          <div className="article-title">{article.title}</div>
          <div className="article-summary" title={article.summary}>
            {article.summary}
          </div>

          <div className="article-meta">
            <ul className="article-meta-info">
              <li className="article-author">{article.user.username}</li>

              <li className="vertical-line"></li>

              <li className="article-view-count">
                <EyeOutlined />
                {article.viewCount}
              </li>

              <li className="article-favorite-count">
                <StarOutlined />
                {article.favoriteCount}
              </li>
            </ul>

            <div className="article-tags">
              {article.tags.map((tag) => (
                <Tag className="article-tag-item" key={tag.id}>
                  {tag.name}
                </Tag>
              ))}
            </div>
          </div>
        </div>

        {article.coverImage ? (
          <div className="article-cover-image">
            <img src={article.coverImage} alt={article.title} />
          </div>
        ) : (
          ''
        )}
      </Link>
    </>
  );
};

export default memo(PreviewArticle);
