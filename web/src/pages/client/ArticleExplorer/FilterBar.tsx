/*
 * @Author: yolo
 * @Date: 2025-09-18 14:47:02
 * @LastEditors: yolo
 * @LastEditTime: 2025-12-15 04:22:21
 * @FilePath: /web/src/pages/client/ArticleExplorer/FilterBar.tsx
 * @Description: 文章列表筛选条件（排序 / 标签）。
 */

import { memo, useState, useEffect } from 'react';
import { Select } from 'antd';
import api from '@/api';

interface FilterBarProps {
  categoryId: number;
  sort: string;
  tagId: number;
  handleSort: (type: 'new' | 'hot') => void;
  handleTagChange: (tagId: number) => void;
}

const FilterBar = ({ categoryId, sort, tagId, handleSort, handleTagChange }: FilterBarProps) => {
  const [options, setOptions] = useState<{ value: number; label: string }[]>([]);

  useEffect(() => {
    console.log('categoryId 改变了', categoryId);
    if (categoryId) {
      api.categoryApi.getTagsByCategory({ categoryId }).then((res) => {
        const datas = res.data || [];
        const newOptions: typeof options = [];
        datas.forEach((item) => {
          newOptions.push({
            value: item.id,
            label: item.name
          });
        });
        setOptions([{ value: 0, label: '全部' }, ...newOptions]);
      });
    }
  }, [categoryId]);

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
      {categoryId ? (
        <Select
          showSearch
          className="sub-tags"
          classNames={{ popup: { root: 'sub-tags-popup' } }}
          defaultValue={0}
          value={tagId}
          optionFilterProp="label"
          onChange={handleTagChange}
          options={options}
        />
      ) : (
        ''
      )}
    </header>
  );
};

export default memo(FilterBar);
