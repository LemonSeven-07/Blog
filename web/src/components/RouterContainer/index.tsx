import { useState, useEffect, memo } from 'react';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { ConfigProvider, message } from 'antd';
import locale from 'antd/locale/zh_CN';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import { routes, transformRoutes } from '@/router';
import { fetchAppInit } from '@/store/modules/user';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import FloatingBlock from '@/components/FloatingBlock';

dayjs.locale('zh-cn');

const RouterContainer = () => {
  const [router, setRouter] = useState(createBrowserRouter(routes));
  const { phase } = useAppSelector((state) => state.userInfo);
  const [loading, setLoading] = useState(true);
  const dispatch = useAppDispatch();

  useEffect(() => {
    console.log('路由 挂载', phase);
    if (phase !== 'initializing') return;

    getRoutes();
  }, [dispatch, phase]);

  useEffect(() => {
    const msg = sessionStorage.getItem('GLOBAL_MESSAGE');

    if (msg) {
      // 显示全局提示消息
      message.error(msg);
      // 显示后清除消息
      sessionStorage.removeItem('GLOBAL_MESSAGE');
    }
  }, []);

  const getRoutes = () => {
    dispatch(fetchAppInit()).then((res) => {
      setRouter(createBrowserRouter(transformRoutes(res.routes)));
      setLoading(false);
    });
  };

  if (loading) return;

  return (
    <ConfigProvider locale={locale}>
      <FloatingBlock />
      <RouterProvider router={router} />
    </ConfigProvider>
  );
};

export default memo(RouterContainer);
