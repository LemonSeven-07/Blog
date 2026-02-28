/*
 * @Author: yolo
 * @Date: 2025-09-15 10:09:16
 * @LastEditors: yolo
 * @LastEditTime: 2026-02-28 19:28:41
 * @FilePath: /web/src/components/Header/Navbar.tsx
 * @Description: header 导航栏
 */

import { memo, useMemo } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Menu, type MenuProps } from 'antd';
import { useAppSelector } from '@/store/hooks';
// import type { RouteItem } from '@/types/app/common';

type MenuItem = Required<MenuProps>['items'][number];

const Navbar = () => {
  console.log('header 导航栏渲染');
  const location = useLocation();
  const { headerRoutes } = useAppSelector((state) => state.navigation);

  // 动态生成菜单
  const menuItems = useMemo<MenuItem[]>(
    () => [
      { label: <Link to="/">首页</Link>, key: 'home' }
      // ...headerRoutes.map((route: RouteItem) => {
      //   return {
      //     label: <Link to={route.path}>{route.meta.title}</Link>,
      //     key: route.name
      //   };
      // })
    ],
    [headerRoutes]
  );

  return (
    <nav className="header-nav">
      <Menu selectedKeys={[location.pathname]} mode="horizontal" items={menuItems} />
    </nav>
  );
};

export default memo(Navbar);
