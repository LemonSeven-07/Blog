/*
 * @Author: yolo
 * @Date: 2025-09-18 14:47:02
 * @LastEditors: yolo
 * @LastEditTime: 2025-09-18 16:36:42
 * @FilePath: /Blog/web/src/pages/client/ArticleExplorer/FilterBar.tsx
 * @Description: 文章列表筛选条件（排序 / 标签）。
 */

import { memo, useState, useEffect } from 'react';
import { Select } from 'antd';

const FilterBar = (props: { slug: string }) => {
  const [sort, setSort] = useState<string>('new');

  useEffect(() => {
    setSort('new');
  }, [props.slug]);

  const handleSort = (type: string) => {
    setSort(type);
  };

  const handleTagChange = () => {};

  const handleTagSearch = () => {};

  return (
    <header className="list-header">
      <nav className="list-nav">
        <span
          className={sort === 'new' ? 'new-sort-btn active-sort' : 'new-sort-btn'}
          onClick={() => handleSort('new')}
        >
          最新
        </span>
        <span
          className={sort === 'hot' ? 'hot-sort-btn active-sort' : 'hot-sort-btn'}
          onClick={() => handleSort('hot')}
        >
          热度
        </span>
      </nav>
      {props.slug && (
        <Select
          showSearch
          className="sub-tags"
          classNames={{ popup: { root: 'sub-tags-popup' } }}
          defaultValue="lucy"
          optionFilterProp="label"
          onChange={handleTagChange}
          onSearch={handleTagSearch}
          options={[
            {
              value: 'jack',
              label: 'Jack'
            },
            {
              value: 'lucy',
              label: 'Lucy'
            },
            {
              value: 'tom',
              label: 'Tom'
            }
          ]}
        />
      )}
    </header>
  );
};

export default memo(FilterBar);
