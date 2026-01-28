/*
 * @Author: yolo
 * @Date: 2025-09-12 10:07:21
 * @LastEditors: yolo
 * @LastEditTime: 2026-01-27 04:17:19
 * @FilePath: /web/src/pages/client/ArticleExplorer/index.tsx
 * @Description: 文章分类查询页面
 */

import { useState } from 'react';
import { useAppSelector } from '@/store/hooks';
import FilterBar from './FilterBar';
import PreviewList from './PreviewList';

const ArticleExplorer = ({ slug }: { slug: string }) => {
  console.log('分类查询', slug);
  const [sort, setSort] = useState<'new' | 'hot'>('new');
  const [tagId, setTagId] = useState<number>(0);
  const { categoryRoutes } = useAppSelector((state) => state.navigation);

  return (
    <>
      <FilterBar
        categoryId={
          slug ? categoryRoutes.filter((route) => route.name === slug)[0].meta.categoryId! : 0
        }
        sort={sort}
        tagId={tagId}
        handleSort={(type: 'new' | 'hot') => setSort(type)}
        handleTagChange={(tagId: number) => setTagId(tagId)}
      />
      <PreviewList
        categoryId={
          slug ? categoryRoutes.filter((route) => route.name === slug)[0].meta.categoryId! : 0
        }
        sort={sort}
        tagId={tagId}
      />
    </>
  );
};

export default ArticleExplorer;
