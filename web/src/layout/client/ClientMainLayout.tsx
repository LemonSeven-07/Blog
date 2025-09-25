/*
 * @Author: yolo
 * @Date: 2025-09-12 17:11:07
 * @LastEditors: yolo
 * @LastEditTime: 2025-09-25 16:36:49
 * @FilePath: /web/src/layout/client/ClientMainLayout.tsx
 * @Description: 前台页面布局
 */

import { Outlet } from 'react-router-dom';
import { useAutoCancelRequests } from '@/api/http';
import { useHeaderScroll } from '@/hooks/useHeaderScroll';
import '@/assets/styles/client.scss';
import CategoryNav from '@/components/CategoryNav';
import AuthorCard from '@/components/AuthorCard';
import ArticleRankingList from '@/components/ArticleRankingList';

import Header from './Header';

const ClientMainLayout = () => {
  console.count('ClientMainLayout 渲染');
  useAutoCancelRequests();
  const hidden = useHeaderScroll();

  return (
    <div className="app-container">
      <header className={`app-header ${hidden ? 'header-hidden' : ''}`}>
        <Header />
      </header>

      <main className="app-main">
        <nav className={`main-header ${hidden ? 'sticky' : ''}`}>
          <CategoryNav direction={'horizontal'} />
        </nav>

        <div className="main-content">
          <nav className={`sidebar-left ${hidden ? 'sticky' : ''}`}>
            <CategoryNav direction={'vertical'} />
          </nav>

          <div className="entry-list-content">
            <Outlet />
          </div>

          <aside className={`sidebar-right ${hidden ? 'sticky' : ''}`}>
            <AuthorCard />
            <ArticleRankingList />
          </aside>
        </div>
      </main>
    </div>
  );
};

export default ClientMainLayout;
