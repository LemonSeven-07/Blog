/*
 * @Author: yolo
 * @Date: 2025-09-12 17:11:07
 * @LastEditors: yolo
 * @LastEditTime: 2025-09-17 22:54:04
 * @FilePath: /Blog/web/src/layout/client/ClientLayout.tsx
 * @Description: 前台页面布局
 */

import { useState, useEffect, useRef } from 'react';
import { Outlet } from 'react-router-dom';
import { useAutoCancelRequests } from '@/api/http';
import '@/assets/styles/client.scss';
import CategoryNav from '@/components/CategoryNav';
import ArticleRankingList from '@/components/ArticleRankingList';

import Header from './Header';

const ClientLayout = () => {
  console.count('ClientLayout 渲染');
  useAutoCancelRequests();

  const headerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // 监听 header 是否还在视口内
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => setVisible(entry.isIntersecting));
      },
      { threshold: [0] }
    );

    if (headerRef.current) {
      observer.observe(headerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  console.log(411, visible);

  return (
    <div className="app-container">
      <header className="app-header" ref={headerRef}>
        <Header />
      </header>

      <main className="app-main">
        <nav className={visible ? 'main-header' : 'main-header main-header-top'}>
          <CategoryNav direction={'horizontal'} />
        </nav>

        <div className="main-content">
          <nav
            className={
              visible ? 'category-sidebar-nav' : 'category-sidebar-nav category-sidebar-nav-top'
            }
          >
            <CategoryNav direction={'vertical'} />
          </nav>

          <article className="entry-list-content">
            <Outlet />
          </article>

          <aside className={visible ? 'hot-list' : 'hot-list hot-list-top'}>
            <ArticleRankingList />
          </aside>
        </div>
      </main>
    </div>
  );
};

export default ClientLayout;
