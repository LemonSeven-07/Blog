/*
 * @Author: yolo
 * @Date: 2025-09-22 15:19:08
 * @LastEditors: yolo
 * @LastEditTime: 2025-09-25 16:37:58
 * @FilePath: /web/src/layout/client/ClientSimpleLayout.tsx
 * @Description: 通用布局
 */

import { Outlet, useLocation } from 'react-router-dom';
import { useAutoCancelRequests } from '@/api/http';
import { useHeaderScroll } from '@/hooks/useHeaderScroll';
import CategoryNav from '@/components/CategoryNav';

import Header from './Header';

const ClientSimpleLayout = () => {
  console.count('ClientSimpleLayout 渲染');
  useAutoCancelRequests();
  const hidden = useHeaderScroll();

  const location = useLocation();

  return (
    <div className="app-container">
      <header className={`app-header ${hidden ? 'header-hidden' : ''}`}>
        <Header />
      </header>

      <main className="app-main">
        {/^\/article\/\d+$/.test(location.pathname) && (
          <nav className={`main-header ${hidden ? 'sticky' : ''}`} style={{ display: 'block' }}>
            <CategoryNav direction={'horizontal'} />
          </nav>
        )}

        <div className="main-content" style={{ margin: '20px 20px 0' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default ClientSimpleLayout;
