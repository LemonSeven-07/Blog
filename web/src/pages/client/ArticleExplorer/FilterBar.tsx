/*
 * @Author: yolo
 * @Date: 2025-09-18 14:47:02
 * @LastEditors: yolo
 * @LastEditTime: 2025-10-22 11:28:04
 * @FilePath: /web/src/pages/client/ArticleExplorer/FilterBar.tsx
 * @Description: 文章列表筛选条件（排序 / 标签）。
 */

import { memo, useState, useEffect } from 'react';
import { Select } from 'antd';
import { useAppSelector } from '@/store/hooks';
import api from '@/api';

const FilterBar = (props: { slug: string }) => {
  const [sort, setSort] = useState<string>('new');
  const [options, setOptions] = useState<{ value: number; label: string }[]>([]);
  const { categoryRoutes } = useAppSelector((state) => state.navigation);

  useEffect(() => {
    setSort('new');

    if (props.slug) {
      // 获取分类对应标签
      const { id } = categoryRoutes.filter((route) => route.name === props.slug)[0];
      api.tagApi.getTags({ categoryId: id }).then((res) => {
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
          defaultValue="全部"
          optionFilterProp="label"
          onChange={handleTagChange}
          onSearch={handleTagSearch}
          options={options}
        />
      )}
    </header>
  );
};

export default memo(FilterBar);
