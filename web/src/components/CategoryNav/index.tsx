import React, { memo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import type { RouteItem } from '@/types/app/common';
import { useAppSelector } from '@/store/hooks';

type ArticleCategoryNavProps = {
  direction?: 'horizontal' | 'vertical';
};

const CategoryNav: React.FC<ArticleCategoryNavProps> = ({ direction = 'vertical' }) => {
  const location = useLocation();
  const { categoryRoutes } = useAppSelector((state) => state.navigation);
  console.log('分类导航栏渲染');

  return (
    <>
      <div
        className={direction === 'vertical' ? 'vertical-category-nav' : 'horizontal-category-nav'}
      >
        {categoryRoutes.map((route: RouteItem) => {
          return (
            <Link
              to={route.path}
              className={location.pathname === '/' + route.path ? 'active-category' : ''}
              key={route.name}
            >
              {direction === 'vertical' && <i className={`iconfont ${route.meta.icon}`} />}
              <span>{route.meta.title}</span>
            </Link>
          );
        })}
      </div>
    </>
  );
};

export default memo(CategoryNav);
