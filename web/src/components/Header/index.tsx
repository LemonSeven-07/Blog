/*
 * @Author: yolo
 * @Date: 2025-09-13 19:10:08
 * @LastEditors: yolo
 * @LastEditTime: 2025-11-09 04:18:11
 * @FilePath: /web/src/components/Header/index.tsx
 * @Description: Header 组件
 */

import { memo, useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { MenuProps } from 'antd';
import { config } from '@/config';
import type { RouteItem } from '@/types/app/common';
import { useAppSelector } from '@/store/hooks';
import Left from './Left';
import Navbar from './Navbar';
import Right from './Right';

type MenuItem = Required<MenuProps>['items'][number];

const Header = () => {
  console.log('header 组件渲染');
  const { headerRoutes } = useAppSelector((state) => state.navigation);

  // 动态生成菜单
  const menuItems = useMemo<MenuItem[]>(
    () => [
      { label: <Link to="/">首页</Link>, key: '/' },
      ...headerRoutes.map((route: RouteItem) => {
        return {
          label: <Link to={route.path}>{route.meta.title}</Link>,
          key: '/' + route.path
        };
      })
    ],
    [headerRoutes]
  );

  return (
    <div className="header-container">
      <Left systemName={config.CLIENT_SYSTEM_NAME} menuItems={menuItems} path="/" />
      <Navbar />
      <Right />
    </div>
  );
};

export default memo(Header);
