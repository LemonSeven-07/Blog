/*
 * @Author: yolo
 * @Date: 2025-09-12 17:11:24
 * @LastEditors: yolo
 * @LastEditTime: 2025-09-13 17:18:54
 * @FilePath: /Blog/web/src/layout/admin/AdminLayout.tsx
 * @Description: 后台页面布局
 */

import { Outlet } from 'react-router-dom';
import { useAutoCancelRequests } from '@/api/http';

const AdminLayout = () => {
  useAutoCancelRequests();
  return (
    <div>
      <header>后台顶部导航栏</header>
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
