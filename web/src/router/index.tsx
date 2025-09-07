import React, { lazy, type JSX } from 'react';
import { createBrowserRouter } from 'react-router-dom';

const Login = lazy(() => import('@/pages/Login'));
const App = lazy(() => import('@/App'));

const withLoadingComponent = (component: JSX.Element) => (
  <React.Suspense fallback={<div>Loading...</div>}>{component}</React.Suspense>
);

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '/login',
        element: withLoadingComponent(<Login />)
      }
    ]
  }
]);

export default router;
