import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Skeleton } from 'antd';
import ErrorPage from '@/components/ErrorPage';
import ClientMainLayout from '@/layout/client/ClientMainLayout';
import ClientSimpleLayout from '@/layout/client/ClientSimpleLayout';
import AdminLayout from '@/layout/admin/AdminLayout';

// 前台页面
const Search = lazy(() => import('@/pages/client/Search'));
const Notify = lazy(() => import('@/pages/client/Notify'));
const ArticleExplorer = lazy(() => import('@/pages/client/ArticleExplorer'));
const ArticleDetail = lazy(() => import('@/pages/client/ArticleDetail'));

// 后台页面
const Dashboard = lazy(() => import('@/pages/admin/Dashboard'));
const Articles = lazy(() => import('@/pages/admin/Articles'));
const ArticleNew = lazy(() => import('@/pages/admin/Articles/New'));
const ArticleEdit = lazy(() => import('@/pages/admin/Articles/Edit'));
const Users = lazy(() => import('@/pages/admin/Users'));

// 权限校验组件
const RequireAuth = ({ children }: { children: JSX.Element }) => {
  const isAdmin = localStorage.getItem('role') || '';
  return isAdmin === '1' ? children : <Navigate to="/" replace />;
};

// 解决闪屏问题
const withLoadingComponent = (component: JSX.Element) => (
  <Suspense fallback={<Skeleton active />}>{component}</Suspense>
);

const router = createBrowserRouter([
  // 前台路由
  {
    path: '/',
    element: <ClientMainLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true, // 首页
        element: withLoadingComponent(<ArticleExplorer slug="" />)
      },
      {
        path: 'frontend', // 前端类文章查询
        element: withLoadingComponent(<ArticleExplorer slug="frontend" />)
      },
      {
        path: 'backend', // 后端类文章查询
        element: withLoadingComponent(<ArticleExplorer slug="backend" />)
      },
      {
        path: 'cloud-ops', //云计算与运维类文章查询
        element: withLoadingComponent(<ArticleExplorer slug="cloud-ops" />)
      },
      {
        path: 'ai', // 人工智能类文章查询
        element: withLoadingComponent(<ArticleExplorer slug="ai" />)
      },
      {
        path: 'cybersecurity', // 网络安全类文章查询
        element: withLoadingComponent(<ArticleExplorer slug="cybersecurity" />)
      },
      {
        path: 'android', // Android类文章查询
        element: withLoadingComponent(<ArticleExplorer slug="android" />)
      },
      {
        path: 'ios', // iOS类文章查询
        element: withLoadingComponent(<ArticleExplorer slug="ios" />)
      },
      {
        path: 'other', // 其他类文章查询
        element: withLoadingComponent(<ArticleExplorer slug="other" />)
      }
    ]
  },
  {
    path: '/',
    element: <ClientSimpleLayout />, // 文章详情用 ArticleLayout
    children: [
      { path: 'article/:id', element: withLoadingComponent(<ArticleDetail />) },
      {
        path: 'search', // 文章检索
        element: withLoadingComponent(<Search />)
      },
      {
        path: 'notify', // 站内通知
        element: withLoadingComponent(<Notify />)
      }
    ]
  },

  // 后台路由
  {
    path: '/admin', // 首页
    element: (
      <RequireAuth>
        <AdminLayout />
      </RequireAuth>
    ),
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: withLoadingComponent(<Dashboard />) },
      { path: 'articles', element: withLoadingComponent(<Articles />) }, // 文章列表
      { path: 'articles/new', element: withLoadingComponent(<ArticleNew />) }, // 新建文章
      { path: 'articles/:id/edit', element: withLoadingComponent(<ArticleEdit />) }, // 编辑文章
      { path: 'users', element: withLoadingComponent(<Users />) } // 用户管理
    ]
  },
  { path: '*', element: <Navigate to="/" replace /> }
]);

export default router;
