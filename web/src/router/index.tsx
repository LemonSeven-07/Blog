import { lazy, Suspense } from 'react';
import { Navigate } from 'react-router-dom';
import { Skeleton } from 'antd';
import ErrorPage from '@/components/ErrorPage';
import type { ComponentMap, RouteItem } from '@/types/app/common';
import { useAppSelector } from '@/store/hooks';

import ClientLayout from '@/layout/client';
import AdminLayout from '@/layout/admin';

// 前台页面
const ArticleExplorer = lazy(() => import('@/pages/client/ArticleExplorer'));
const ArticleDetail = lazy(() => import('@/pages/client/ArticleDetail'));
const Notify = lazy(() => import('@/pages/client/Notify'));
const LifeNotes = lazy(() => import('@/pages/client/LifeNotes'));

// 后台页面
const Dashboard = lazy(() => import('@/pages/admin/Dashboard'));
const Articles = lazy(() => import('@/pages/admin/Articles'));
const Users = lazy(() => import('@/pages/admin/Users'));

// 解决闪屏问题
const withLoadingComponent = (component: JSX.Element) => (
  <Suspense fallback={<Skeleton active />}>{component}</Suspense>
);

// 权限校验组件
const RequireAuth = ({ children }: { children: JSX.Element }) => {
  const { username, role } = useAppSelector((state) => state.userInfo);
  return username && (role === 2 || role === 1) ? children : <Navigate to="/" replace />;
};

// 组件映射表
const componentMap: ComponentMap = {
  // 假设这是你的组件
  ArticleExplorer: (name: string) => withLoadingComponent(<ArticleExplorer slug={name} />),
  Notify: withLoadingComponent(<Notify />),
  LifeNotes: withLoadingComponent(<LifeNotes />),
  Dashboard: withLoadingComponent(<Dashboard />),
  Articles: withLoadingComponent(<Articles />),
  Users: withLoadingComponent(<Users />)
};

export const routes = [
  {
    path: '/',
    element: <ClientLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true, // 首页
        element: withLoadingComponent(<ArticleExplorer slug="" />)
      },
      {
        index: false,
        path: 'article/:id', // 文章详情
        element: withLoadingComponent(<ArticleDetail />)
      }
    ]
  },

  { path: '*', element: <Navigate to="/" replace /> }
];

export const transformRoutes = (AllRoutes: RouteItem[]) => {
  const adminRoute = {
    path: '/admin', // 后台首页
    element: (
      <RequireAuth>
        <AdminLayout />
      </RequireAuth>
    ),
    errorElement: <ErrorPage />,
    children: [{ index: true, element: <Navigate to="/admin/dashboard" /> }] as {
      index: boolean;
      element: JSX.Element;
      path: string;
    }[]
  };

  AllRoutes.forEach((route: RouteItem) => {
    const component = componentMap[route.component];
    if (route.meta.type === 'category' || route.meta.type === 'header') {
      routes[0].children?.push({
        index: false,
        path: route.path,
        element:
          typeof component === 'function'
            ? component(route.name) // 如果是函数，则调用
            : component
      });
    } else if (route.meta.type === 'admin') {
      adminRoute.children.push({
        index: route.path === 'dashboard' ? true : false,
        path: route.path,
        element:
          typeof component === 'function'
            ? component(route.name) // 如果是函数，则调用
            : component
      });
    }
  });

  if (adminRoute.children.length > 1) {
    adminRoute.children.push({
      index: false,
      path: '*',
      element: <Navigate to="/admin/dashboard" replace />
    });

    routes.splice(1, 0, adminRoute);
  }

  return routes;
};
