/*
 * @Author: yolo
 * @Date: 2025-09-15 16:18:26
 * @LastEditors: yolo
 * @LastEditTime: 2025-09-16 11:44:07
 * @FilePath: /Blog/web/src/components/ArticleRankingList/index.tsx
 * @Description: 热门文章
 */

import { memo } from 'react';
import { Link } from 'react-router-dom';
import { ReloadOutlined } from '@ant-design/icons';

const ArticleRankingList = () => {
  console.log('文章榜渲染');
  return (
    <>
      <div className="hot-list-item">
        <div className="hot-item-header">
          <div className="hot-title">
            <i className="iconfont icon-hot-article" />
            <span title="热门文章" className="title-text">
              热门文章
            </span>
          </div>
          <div className="item-header-button">
            <ReloadOutlined />
            <span className="header-button-text">换一换</span>
          </div>
        </div>
        <div className="divider">
          <div className="content"></div>
        </div>
        <div className="hot-item-body">
          <ul>
            <li>
              <div className="body-index">1</div>
              <div className="hot-item-text">
                <Link to="/" title="文章一文章一文章一文章一文章一文章一文章一文章一">
                  文章一文章一文章一文章一文章一文章一文章一文章一
                </Link>
              </div>
            </li>
            <li>
              <div className="body-index">2</div>
              <div className="hot-item-text">
                <Link to="/">文章二</Link>
              </div>
            </li>
            <li>
              <div className="body-index">3</div>
              <div className="hot-item-text">
                <Link to="/">文章三</Link>
              </div>
            </li>
            <li>
              <div className="body-index">4</div>
              <div className="hot-item-text">
                <Link to="/">文章四</Link>
              </div>
            </li>
            <li>
              <div className="body-index">5</div>
              <div className="hot-item-text">
                <Link to="/">文章5</Link>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default memo(ArticleRankingList);
