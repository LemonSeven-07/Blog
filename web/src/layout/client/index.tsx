/*
 * @Author: yolo
 * @Date: 2025-09-12 17:11:07
 * @LastEditors: yolo
 * @LastEditTime: 2025-12-03 01:24:28
 * @FilePath: /web/src/layout/client/index.tsx
 * @Description: 前台页面布局
 */

import { Outlet, useLocation } from 'react-router-dom';
import { useHeaderScroll } from '@/hooks/useHeaderScroll';
import { useAutoCancelRequests } from '@/api/http';
import '@/assets/styles/client.scss';
import CategoryNav from '@/components/CategoryNav';
import AuthorCard from '@/components/AuthorCard';
import ArticleRankingList from '@/components/ArticleRankingList';
import { useAppSelector } from '@/store/hooks';

import Header from '@/components/Header';

const ClientLayout = () => {
  console.count('ClientMainLayout 渲染');
  useAutoCancelRequests();
  const hidden = useHeaderScroll();

  const { categoryRoutes } = useAppSelector((state) => state.navigation);
  const location = useLocation();
  // 判断当前路径，选择不同的布局
  const renderLayout = () => {
    if (
      location.pathname === '/' ||
      categoryRoutes.some((route) => `/${route.path}` === location.pathname)
    ) {
      return (
        <>
          <nav className={`main-header ${hidden ? 'sticky' : ''}`}>
            <CategoryNav direction={'horizontal'} />
          </nav>

          <div className="main-content">
            {categoryRoutes.length > 0 && (
              <nav className={`sidebar-left ${hidden ? 'sticky' : ''}`}>
                <CategoryNav direction={'vertical'} />
              </nav>
            )}

            <div className="entry-list-content">
              <Outlet />
            </div>

            <aside className={`sidebar-right ${hidden ? 'sticky' : ''}`}>
              <AuthorCard />
              <ArticleRankingList />
            </aside>
          </div>
        </>
      );
    }

    return (
      <>
        <div className="main-content" style={{ margin: '20px 20px 0' }}>
          <Outlet />
        </div>
      </>
    );
  };

  return (
    <div className="app-container">
      <header className={`app-header ${hidden ? 'header-hidden' : ''}`}>
        <Header />
      </header>

      <main className="app-main">{renderLayout()}</main>
    </div>
  );
};

export default ClientLayout;
