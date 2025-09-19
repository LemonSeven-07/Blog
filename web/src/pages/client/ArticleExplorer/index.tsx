/*
 * @Author: yolo
 * @Date: 2025-09-12 10:07:21
 * @LastEditors: yolo
 * @LastEditTime: 2025-09-18 16:35:33
 * @FilePath: /Blog/web/src/pages/client/ArticleExplorer/index.tsx
 * @Description: 文章分类查询页面
 */

import { memo } from 'react';
import FilterBar from './FilterBar';
import PreviewList from './PreviewList';

const Category = (props: { slug: string }) => {
  console.log('分类查询', props.slug);

  return (
    <>
      <FilterBar slug={props.slug} />
      <PreviewList />
    </>
  );
};

export default memo(Category);
